const data = [
  {
    id: 7,
    weight: "6.040",
    dust_weight: null,
    purity: 88,
    sales_payments: [],
    created_at: "2026-01-29T13:46:09.000Z",
    assign_customer_name: null,
    assign_customer_payment_type: null
  }
];

try {
  const tableRows = data.map((item) => {
    const weight = parseFloat(item.weight) || 0;
    const dustWeight = parseFloat(item.dust_weight) || 0;
    const purity = parseFloat(item.purity) || 100;
    const netWeight = (weight - dustWeight) * (purity / 100);
    const marginWeight = (netWeight * 3) / 100;
    const finalWeight = netWeight - marginWeight;
    
    const totalPaid = Array.isArray(item.sales_payments)
      ? item.sales_payments.reduce((sum, p) => sum + parseFloat(p.completed_payment || 0), 0)
      : 0;
    const roundOff = Array.isArray(item.sales_payments)
      ? item.sales_payments.reduce((sum, p) => sum + parseFloat(p.pending_payment || 0), 0)
      : 0;
    const finalAmount = totalPaid + roundOff;
    
    return [
      `#AMAMELT${item.id}`,
      item.assign_customer_name || 'N/A',
      item.created_at ? new Date(item.created_at).toISOString() : 'N/A',
      parseFloat(weight).toFixed(3),
      parseFloat(finalWeight).toFixed(3),
      `Rs.${finalAmount.toLocaleString('en-IN')}`,
      item.assign_customer_payment_type || 'N/A',
      'Assigned'
    ];
  });
  console.log("tableRows built successfully", tableRows);

  const totalAmount = data.reduce((sum, item) => {
    const totalPaid = Array.isArray(item.sales_payments) ? item.sales_payments.reduce((s, p) => s + parseFloat(p.completed_payment || 0), 0) : 0;
    const roundOff = Array.isArray(item.sales_payments) ? item.sales_payments.reduce((s, p) => s + parseFloat(p.pending_payment || 0), 0) : 0;
    return sum + (totalPaid + roundOff);
  }, 0);

  const totalPureWeight = data.reduce((sum, item) => {
    const weight = parseFloat(item.weight) || 0;
    const dustWeight = parseFloat(item.dust_weight) || 0;
    const purity = parseFloat(item.purity) || 100;
    const netWeight = (weight - dustWeight) * (purity / 100);
    return sum + (netWeight * 0.97); // 3% margin
  }, 0);
  
  console.log("totalAmount:", totalAmount);
  console.log("totalPureWeight:", totalPureWeight);
  console.log("SUCCESS");
} catch (e) {
  console.error("ERROR", e);
}
