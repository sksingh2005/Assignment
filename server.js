require('dotenv').config()
const express = require('express');
const axios = require('axios');
const Crypto = require('./models/crypto'); // Import the Crypto schema
const mongoose = require('mongoose');

const app = express();
const port = 3000;

// Connect to MongoDB (optional if you want to store data)
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.error('Error connecting to MongoDB:', error);
});

const fetchCryptoData = async (cryptoId) => {
  try {
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoId}&vs_currencies=usd&include_market_cap=true&include_24hr_change=true`
    );
    return response.data;
  } catch (error) {
    throw new Error('Error fetching data from CoinGecko API');
  }
};

app.get('/stats', async (req, res) => {
  const { coin } = req.query;
  const supportedCoins = ['bitcoin', 'matic-network', 'ethereum'];

  if (!coin || !supportedCoins.includes(coin.toLowerCase())) {
    return res.status(400).json({
      error: 'Invalid or missing coin parameter. Supported coins: bitcoin, matic-network, ethereum.'
    });
  }

  try {
    // Fetch the latest data for the requested coin
    const data = await fetchCryptoData(coin.toLowerCase());

    // Format the response data
    const result = {
      name: coin.charAt(0).toUpperCase() + coin.slice(1), // Capitalize first letter
      price_usd: data[coin].usd,
      market_cap_usd: data[coin].usd_market_cap,
      change_24h: data[coin].usd_24h_change
    };

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching the data.' });
  }
});

const calculateStandardDeviation = (prices) => {
    const mean = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const variance = prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / prices.length;
    return Math.sqrt(variance);
  };
  
// /deviation endpoint
app.get('/deviation', async (req, res) => {
    const { coin } = req.query;
    const capitalizedCoin = coin.charAt(0).toUpperCase() + coin.slice(1).toLowerCase();
    if (!coin) {
      console.log('Missing coin parameter');
      return res.status(400).json({ error: 'Coin parameter is required.' });
    }
  
    console.log(`Received request for coin: ${coin}`);
  
    try {
      const records = await Crypto.find({ name: capitalizedCoin })
        .sort({ _id: -1 })
        .limit(100);
  
      console.log(`Records found: ${records.length}`);
      if (records.length === 0) {
        return res.status(404).json({ error: `No records found for coin: ${coin}` });
      }
  
      const prices = records.map(record => record.price_usd);
      console.log('Prices:', prices);
  
      const deviation = calculateStandardDeviation(prices);
      console.log('Standard deviation:', deviation);
  
      res.json({
        coin,
        standard_deviation: parseFloat(deviation.toFixed(2)),
        total_records: records.length,
      });
    } catch (error) {
      console.error('Error in /deviation endpoint:', error);
      res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
  });
  

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
