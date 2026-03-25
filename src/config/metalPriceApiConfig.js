const metalPriceAPIConfiguration = {
    apiBase: 'https://api.metalpriceapi.com/v1',
    endPoints: {
        latest: '/latest',
        usage: '/usage',
        carat: '/carat',
    },
    defaultBaseCurrency: 'INR',
    supportedMetals: ['XAU-MADU', 'XAG-MADU'],
    defaultUnit: 'gram',
    resultMappings: {
        'gold_24k_price': 'INRXAU-MADU',
        'silver_price': 'INRXAG-MADU'
    },
    getAPIKey: () => {
        if (!process.env.METAL_PRICE_API_KEY) {
            throw new Error('METAL_PRICE_API_KEY is not set in the environment variables');
        }

        return process.env.METAL_PRICE_API_KEY;
    }
};

module.exports = metalPriceAPIConfiguration;
