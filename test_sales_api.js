const { getAllMeltReceiptProducts } = require('./src/services/MeltingService');
(async () => {
  try {
    const result = await getAllMeltReceiptProducts({ page: 1, limit: 10 });
    console.log(JSON.stringify(result, null, 2));
  } catch (e) {
    console.error(e);
  }
  process.exit();
})();
