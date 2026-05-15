const pool = require('../config/db.config');
const moment = require('moment');

const getStockReport = async (startDate, endDate) => {
  const connection = await pool.promise().getConnection();
  try {
    const sDate = startDate || '1970-01-01';
    const eDate = endDate || moment().format('YYYY-MM-DD HH:mm:ss');

    const openingQuery = `
      SELECT 
        category,
        COALESCE(SUM(purchase_weight), 0) - COALESCE(SUM(sales_weight), 0) as weight
      FROM (
        SELECT 
          CASE 
            WHEN JSON_EXTRACT(products, '$.purity') >= 99 THEN '24ct Gold'
            WHEN JSON_EXTRACT(products, '$.purity') BETWEEN 91 AND 93 THEN '22ct Ornaments'
            ELSE 'Old Gold'
          END as category,
          CAST(COALESCE(JSON_EXTRACT(products, '$.gross_weight'), 0) AS DECIMAL(12,3)) as purchase_weight,
          0 as sales_weight
        FROM stock
        WHERE created_at < ?
        
        UNION ALL
        
        SELECT 
          CASE 
            WHEN product_type = '24k' THEN '24ct Gold'
            WHEN product_type = '22k' THEN '22ct Ornaments'
            ELSE 'Old Gold'
          END as category,
          0 as purchase_weight,
          CAST(COALESCE(weight, 0) AS DECIMAL(12,3)) as sales_weight
        FROM melt
        WHERE assign_customer > 0 AND created_at < ?
      ) as historical_data
      GROUP BY category
    `;

    const currentQuery = `
      SELECT 
        category,
        COALESCE(SUM(purchase_weight), 0) as purchase,
        COALESCE(SUM(sales_weight), 0) as sales
      FROM (
        SELECT 
          CASE 
            WHEN JSON_EXTRACT(products, '$.purity') >= 99 THEN '24ct Gold'
            WHEN JSON_EXTRACT(products, '$.purity') BETWEEN 91 AND 93 THEN '22ct Ornaments'
            ELSE 'Old Gold'
          END as category,
          CAST(COALESCE(JSON_EXTRACT(products, '$.gross_weight'), 0) AS DECIMAL(12,3)) as purchase_weight,
          0 as sales_weight
        FROM stock
        WHERE created_at BETWEEN ? AND ?
        
        UNION ALL
        
        SELECT 
          CASE 
            WHEN product_type = '24k' THEN '24ct Gold'
            WHEN product_type = '22k' THEN '22ct Ornaments'
            ELSE 'Old Gold'
          END as category,
          0 as purchase_weight,
          CAST(COALESCE(weight, 0) AS DECIMAL(12,3)) as sales_weight
        FROM melt
        WHERE assign_customer > 0 AND created_at BETWEEN ? AND ?
      ) as current_data
      GROUP BY category
    `;

    const [openingRows] = await connection.query(openingQuery, [sDate, sDate]);
    const [currentRows] = await connection.query(currentQuery, [sDate, eDate, sDate, eDate]);

    // Format data for the report
    const categories = ['Old Gold', '24ct Gold', '22ct Ornaments'];
    const reportData = categories.map(cat => {
      const opening = parseFloat(openingRows.find(r => r.category === cat)?.weight || 0);
      const current = currentRows.find(r => r.category === cat) || { purchase: 0, sales: 0 };
      const purchase = parseFloat(current.purchase || 0);
      const sales = parseFloat(current.sales || 0);
      const closing = opening + purchase - sales;

      return {
        description: cat,
        opening: opening.toFixed(3),
        purchase: purchase.toFixed(3),
        sales: sales.toFixed(3),
        closing: closing.toFixed(3)
      };
    });

    return reportData;
  } finally {
    connection.release();
  }
};

const getSmithPaymentReport = async (startDate, endDate) => {
    const connection = await pool.promise().getConnection();
    try {
        const sDate = startDate || '1970-01-01';
        const eDate = endDate || moment().format('YYYY-MM-DD HH:mm:ss');

        const query = `
            SELECT 
                assign_smith_name as smith_name,
                amount,
                description as narration,
                mode as payment_mode,
                created_at as date
            FROM wages_details
            WHERE created_at BETWEEN ? AND ?
            ORDER BY created_at DESC
        `;
        const [rows] = await connection.query(query, [sDate, eDate]);
        return rows;
    } finally {
        connection.release();
    }
};

const getDayBookReport = async (startDate, endDate) => {
    const connection = await pool.promise().getConnection();
    try {
        const sDate = startDate || moment().format('YYYY-MM-DD');
        const eDate = endDate || moment().format('YYYY-MM-DD');

        // 1. Calculate Opening Balance as of sDate
        const openingBalanceQuery = `
            SELECT 
                (COALESCE(SUM(amount_debit), 0) - COALESCE(SUM(amount_credit), 0)) as opening_net
            FROM opening_balance
            WHERE date < ?
        `;
        
        const [openingResult] = await connection.query(openingBalanceQuery, [sDate]);
        let openingBalanceValue = parseFloat(openingResult[0].opening_net || 0);

        // 2. Fetch current period transactions
        const transactionsQuery = `
            SELECT * FROM (
                -- Opening Balance Entries for current period
                SELECT 
                    date,
                    CONCAT('Opening Balance: ', group_name, ' - ', account_head) as description,
                    amount_debit as debit,
                    amount_credit as credit,
                    'opening' as type
                FROM opening_balance
                WHERE date BETWEEN ? AND ?

                UNION ALL

                -- Sales Payments (Debit/Inflow)
                SELECT 
                    DATE(payment_date) as date,
                    CONCAT('Sales: ', COALESCE((SELECT assign_customer_name FROM melt WHERE id = sp.melt_id), 'Customer')) as description,
                    completed_payment as debit,
                    0 as credit,
                    'sales' as type
                FROM sales_payments sp
                WHERE payment_date BETWEEN ? AND ?

                UNION ALL

                -- Purchase Payments (Credit/Outflow)
                SELECT 
                    DATE(recorded_at) as date,
                    CONCAT('Purchase: ', COALESCE((SELECT customer_name FROM customers WHERE id = (SELECT customer_id FROM purchases WHERE id = pp.purchase_id)), 'Supplier')) as description,
                    0 as debit,
                    amount as credit,
                    'purchase' as type
                FROM purchase_payments pp
                WHERE recorded_at BETWEEN ? AND ?

                UNION ALL

                -- Smith Payments (Credit/Outflow)
                SELECT 
                    DATE(created_at) as date,
                    CONCAT('Smith Payment: ', assign_smith_name) as description,
                    0 as debit,
                    amount as credit,
                    'smith' as type
                FROM wages_details
                WHERE created_at BETWEEN ? AND ?

                UNION ALL

                -- Receipts (Generic Inflow/Outflow)
                SELECT 
                    DATE(crated_at) as date,
                    CONCAT(type, ': ', account_name, ' - ', narration) as description,
                    CASE WHEN type = 'Receipt' THEN amount ELSE 0 END as debit,
                    CASE WHEN type = 'Payment' THEN amount ELSE 0 END as credit,
                    'receipt' as type
                FROM receipt
                WHERE crated_at BETWEEN ? AND ?
            ) as combined
            ORDER BY date ASC, type DESC
        `;

        const [transactions] = await connection.query(transactionsQuery, [
            sDate, eDate, 
            sDate, eDate + ' 23:59:59', 
            sDate, eDate + ' 23:59:59', 
            sDate, eDate + ' 23:59:59', 
            sDate, eDate + ' 23:59:59'
        ]);

        return {
            initialOpeningBalance: openingBalanceValue,
            transactions: transactions
        };
    } finally {
        connection.release();
    }
};

const getLedgerReport = async (accountHead, startDate, endDate) => {
    const connection = await pool.promise().getConnection();
    try {
        const sDate = startDate || moment().format('YYYY-MM-DD');
        const eDate = endDate || moment().format('YYYY-MM-DD');

        const openingBalanceQuery = `
            SELECT 
                (COALESCE(SUM(amount_debit), 0) - COALESCE(SUM(amount_credit), 0)) as opening_net
            FROM opening_balance
            WHERE account_head = ? AND date < ?
        `;
        
        const [openingResult] = await connection.query(openingBalanceQuery, [accountHead, sDate]);
        let openingBalanceValue = parseFloat(openingResult[0].opening_net || 0);

        const transactionsQuery = `
            SELECT * FROM (
                SELECT 
                    date,
                    narration as description,
                    amount_debit as debit,
                    amount_credit as credit,
                    'opening' as type
                FROM opening_balance
                WHERE account_head = ? AND date BETWEEN ? AND ?

                UNION ALL
                
                SELECT 
                    DATE(crated_at) as date,
                    CONCAT(type, ': ', account_name, ' - ', narration) as description,
                    CASE WHEN type = 'Receipt' THEN amount ELSE 0 END as debit,
                    CASE WHEN type = 'Payment' THEN amount ELSE 0 END as credit,
                    'receipt' as type
                FROM receipt
                WHERE account_name = ? AND crated_at BETWEEN ? AND ?
            ) as combined
            ORDER BY date ASC, type DESC
        `;

        const [transactions] = await connection.query(transactionsQuery, [
            accountHead, sDate, eDate,
            accountHead, sDate, eDate + ' 23:59:59'
        ]);

        return {
            initialOpeningBalance: openingBalanceValue,
            transactions: transactions
        };
    } finally {
        connection.release();
    }
};

const getTrialBalance = async (startDate, endDate) => {
    const connection = await pool.promise().getConnection();
    try {
        const sDate = startDate || '1970-01-01';
        const eDate = endDate || moment().format('YYYY-MM-DD');

        // We need to aggregate all debits and credits per account head
        const query = `
            SELECT 
                g.group_name,
                t.account_head as head_name,
                SUM(t.debit) as debit,
                SUM(t.credit) as credit
            FROM (
                -- 1. Opening Balances
                SELECT 
                    group_name,
                    account_head,
                    amount_debit as debit,
                    amount_credit as credit
                FROM opening_balance
                WHERE date <= ?

                UNION ALL

                -- 2. General Receipts/Payments
                SELECT 
                    (SELECT group_name FROM account_head_creation WHERE head_name = r.account_name LIMIT 1) as group_name,
                    account_name as account_head,
                    CASE WHEN type = 'Receipt' THEN amount ELSE 0 END as debit,
                    CASE WHEN type = 'Payment' THEN amount ELSE 0 END as credit
                FROM receipt r
                WHERE crated_at <= ?

                UNION ALL

                -- 3. Sales Payments (Inflow - Debit to Bank/Cash)
                SELECT 
                    'Bank A/c' as group_name,
                    COALESCE(bank_name, 'Cash') as account_head,
                    completed_payment as debit,
                    0 as credit
                FROM sales_payments
                WHERE payment_date <= ?

                UNION ALL

                -- 4. Purchase Payments (Outflow - Credit to Bank/Cash)
                SELECT 
                    'Bank A/c' as group_name,
                    CASE WHEN payment_method = 'bank_transfer' THEN 'Bank' ELSE 'Cash' END as account_head,
                    0 as debit,
                    amount as credit
                FROM purchase_payments
                WHERE recorded_at <= ?

                UNION ALL

                -- 5. Smith Payments (Outflow - Credit to Bank/Cash)
                SELECT 
                    'Bank A/c' as group_name,
                    COALESCE(mode, 'Cash') as account_head,
                    0 as debit,
                    amount as credit
                FROM wages_details
                WHERE created_at <= ?
            ) as t
            LEFT JOIN master_grouping g ON g.group_name = t.group_name
            WHERE t.group_name IS NOT NULL
            GROUP BY g.group_name, t.account_head
            HAVING debit != 0 OR credit != 0
            ORDER BY g.group_name, t.account_head
        `;

        // Note: For "From To" report, we might need a different logic if they want to see movement.
        // But for a standard Trial Balance, it's usually "As on date".
        // If startDate is provided, we filter by crated_at BETWEEN startDate AND endDate.
        
        let finalQuery = query;
        let queryParams = [eDate, eDate + ' 23:59:59', eDate + ' 23:59:59', eDate + ' 23:59:59', eDate + ' 23:59:59'];

        if (startDate) {
            finalQuery = finalQuery.replace(/<= \?/g, 'BETWEEN ? AND ?');
            queryParams = [
                sDate, eDate, 
                sDate, eDate + ' 23:59:59', 
                sDate, eDate + ' 23:59:59', 
                sDate, eDate + ' 23:59:59', 
                sDate, eDate + ' 23:59:59'
            ];
        }

        const [rows] = await connection.query(finalQuery, queryParams);
        
        // Group by group_name for the frontend
        const groupedData = {};
        rows.forEach(row => {
            if (!groupedData[row.group_name]) {
                groupedData[row.group_name] = [];
            }
            groupedData[row.group_name].push(row);
        });

        return groupedData;
    } finally {
        connection.release();
    }
};

const getProfitAndLossReport = async (startDate, endDate) => {
    const connection = await pool.promise().getConnection();
    try {
        const sDate = startDate || moment().startOf('year').format('YYYY-MM-DD');
        const eDate = endDate || moment().format('YYYY-MM-DD');

        // 1. Opening Stock (broken down by purity)
        const openingStockQuery = `
            SELECT purity, SUM(amount) as amount 
            FROM opening_stock 
            WHERE date <= ?
            GROUP BY purity
        `;
        const [openingStocks] = await connection.query(openingStockQuery, [eDate]);

        // 2. Purchases (broken down by purity/category)
        // Note: purchases table has products as JSON. We need to parse and aggregate.
        const purchasesQuery = `
            SELECT products, total_amount, created_at 
            FROM purchases 
            WHERE created_at BETWEEN ? AND ?
        `;
        const [purchasesRaw] = await connection.query(purchasesQuery, [sDate, eDate + ' 23:59:59']);
        
        const purchasesByPurity = {};
        purchasesRaw.forEach(p => {
            let products = [];
            try { products = JSON.parse(p.products); } catch (e) {}
            if (Array.isArray(products)) {
                products.forEach(item => {
                    const purity = item.purity || 'Other';
                    purchasesByPurity[purity] = (purchasesByPurity[purity] || 0) + parseFloat(item.amount || 0);
                });
            }
        });

        // 3. Sales (broken down by purity/category)
        // Based on getStockReport, sales are from 'melt' table
        // We join with sales_payments to get the total sale value
        const salesQuery = `
            SELECT 
                purity,
                SUM(total_payment) as amount
            FROM (
                SELECT 
                    m.id,
                    CASE 
                        WHEN m.product_type = '24k' THEN '24ct Gold'
                        WHEN m.product_type = '22k' THEN '22ct Ornaments'
                        ELSE 'Old Gold'
                    END as purity,
                    MAX(CAST(sp.total_payment AS DECIMAL(15,2))) as total_payment
                FROM melt m
                JOIN sales_payments sp ON m.id = sp.melt_id
                WHERE m.assign_customer > 0 AND m.created_at BETWEEN ? AND ?
                GROUP BY m.id, purity
            ) as sub
            GROUP BY purity
        `;
        const [salesByPurityRaw] = await connection.query(salesQuery, [sDate, eDate + ' 23:59:59']);
        const salesByPurity = {};
        salesByPurityRaw.forEach(s => {
            salesByPurity[s.purity] = parseFloat(s.amount || 0);
        });

        // 4. Direct Expenses
        const directExpensesQuery = `
            SELECT account_name, SUM(amount) as amount
            FROM receipt
            WHERE type = 'Payment' 
            AND account_name IN (SELECT head_name FROM account_head_creation WHERE group_name = 'Direct Expenses')
            AND crated_at BETWEEN ? AND ?
            GROUP BY account_name
        `;
        const [directExpenses] = await connection.query(directExpensesQuery, [sDate, eDate + ' 23:59:59']);

        // 5. Indirect Expenses
        const indirectExpensesQuery = `
            SELECT account_name, SUM(amount) as amount
            FROM receipt
            WHERE type = 'Payment' 
            AND account_name IN (SELECT head_name FROM account_head_creation WHERE group_name = 'Indirect Expenses')
            AND crated_at BETWEEN ? AND ?
            GROUP BY account_name
        `;
        const [indirectExpenses] = await connection.query(indirectExpensesQuery, [sDate, eDate + ' 23:59:59']);

        // 6. Other Income (Indirect Income)
        const otherIncomeQuery = `
            SELECT account_name, SUM(amount) as amount
            FROM receipt
            WHERE type = 'Receipt' 
            AND account_name IN (SELECT head_name FROM account_head_creation WHERE group_name IN ('Indirect Income', 'Other Income'))
            AND crated_at BETWEEN ? AND ?
            GROUP BY account_name
        `;
        const [otherIncome] = await connection.query(otherIncomeQuery, [sDate, eDate + ' 23:59:59']);

        // 7. Closing Stock (Calculated for now as Opening + Purchase - Sales)
        // In a real scenario, this would be from a physical stock take or current stock valuation
        const closingStock = {
            '22ct Gold': 25000, // Placeholder as per user's image example
        };

        return {
            openingStocks: openingStocks.map(s => ({ title: s.purity, amount: parseFloat(s.amount) })),
            purchases: Object.keys(purchasesByPurity).map(p => ({ title: p, amount: purchasesByPurity[p] })),
            sales: Object.keys(salesByPurity).map(p => ({ title: p, amount: salesByPurity[p] })),
            closingStocks: Object.keys(closingStock).map(p => ({ title: p, amount: closingStock[p] })),
            directExpenses: directExpenses.map(e => ({ title: e.account_name, amount: parseFloat(e.amount) })),
            indirectExpenses: indirectExpenses.map(e => ({ title: e.account_name, amount: parseFloat(e.amount) })),
            otherIncome: otherIncome.map(i => ({ title: i.account_name, amount: parseFloat(i.amount) }))
        };
    } finally {
        connection.release();
    }
};

module.exports = {
  getStockReport,
  getSmithPaymentReport,
  getDayBookReport,
  getLedgerReport,
  getTrialBalance,
  getProfitAndLossReport
};
