const express = require('express');

const dotenv = require('dotenv');
const logger = require('./src/middlewares/loggerMiddleware');
const errorHandler = require('./src/middlewares/errorMiddleware');
const cors = require('cors')
const path = require('path');
const { createServer } = require("http")
const { Server } = require("socket.io");
const { exec } = require("child_process");
// const puppeteer=require("puppeteer")
const { getMetalPriceFromDatabase, fetchAndStoreMetalPrices, getMetalPriceFromDatabase2 } = require('./src/services/metalPricesApiService');


dotenv.config();
const app = express();

const httpServer = createServer(app);


// Middleware
app.use(express.json());
app.use(cors())
app.use(logger);

// setInterval(async () => {
//   await fetchAndStoreMetalPrices();
// }, 700000);

app.use((req, res, next) => {
  res.setTimeout(15000, () => {
    console.warn(`⏰ Timeout: ${req.method} ${req.originalUrl}`);
    res.status(504).json({ error: "Request timed out" });
  });
  next();
});
// await puppeteer.launch({
//   args: ['--no-sandbox', '--disable-setuid-sandbox']
// });

app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).json({ error: err.message });
});


// Additional middleware (move these before your routes)
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/users', require('./src/routes/userRoutes'));
app.use('/api/admin', require('./src/routes/adminRoutes'));
app.use('/api/companies', require('./src/routes/companyRoutes'));
app.use('/api/branches', require('./src/routes/branchRoutes'));
app.use('/api/roles', require('./src/routes/roleRoutes'));
app.use('/api/role-permissions', require('./src/routes/permissionRoutes'));
app.use('/api/metals', require('./src/routes/metalRoutes'));
app.use('/api/purities', require('./src/routes/purityRoutes'));
app.use('/api/categories', require('./src/routes/categoryRoutes'));
app.use('/api/products', require('./src/routes/productRoutes'));
app.use('/api/sub-products', require('./src/routes/subProductRoutes'));
app.use('/api/customers', require('./src/routes/customerRoutes'));
app.use('/api/cusBank/bank-accounts', require('./src/routes/customerBankRoutes'));
app.use('/api/quotations', require('./src/routes/quotationRoutes'));
app.use('/api/pledge_quotations', require('./src/routes/pledgeQuotationRoute'));
app.use('/api/purchases', require('./src/routes/purchaseRoutes'));
app.use('/api/pledge-item', require('./src/routes/pledgeItemRoutes'));
app.use('/api/metal-prices', require('./src/routes/metalPricesApiRoutes'));
app.use('/api/melting_purchase', require('./src/routes/MeltingRoute'));
app.use('/api/accounts', require('./src/routes/AccountsRoute'));
app.use('/api/live-rates', require('./src/routes/LiveRateRoutes'));
app.use('/api/margin-settings', require('./src/routes/MarginSettingsRoute'));

  

app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT,(req,res)=>{
  console.log(`Server running on port ${PORT}`);
})
