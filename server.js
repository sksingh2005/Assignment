require('dotenv').config();
const express = require('express');
const axios = require('axios');
const Crypto = require('./models/crypto'); // Import the Crypto schema
const mongoose = require('mongoose');
const cron = require('node-cron');
const app = express();
const port = 3000;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('Error connecting to MongoDB:', error));

// Fetch cryptocurrency data
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

// Schedule the cron job to fetch data every 2 hours
cron.schedule('0 */2 * * *', async () => {
  console.log(`Cron job running at: ${new Date().toISOString()}`);
  try {
    const cryptoData = await fetchCryptoData('bitcoin');
    const newCrypto = new Crypto({
      name: 'Bitcoin',
      price_usd: cryptoData.bitcoin.usd,
      market_cap_usd: cryptoData.bitcoin.usd_market_cap,
      change_24h: cryptoData.bitcoin.usd_24h_change
    });
    await newCrypto.save();
    console.log('Bitcoin data saved');
  } catch (error) {
    console.error('Error in cron job:', error);
  }
});

// API to get stats for a specific coin
app.get('/stats', async (req, res) => {
  const { coin } = req.query;
  const supportedCoins = ['bitcoin', 'matic-network', 'ethereum'];

  if (!coin || !supportedCoins.includes(coin.toLowerCase())) {
    return res.status(400).json({
      error: 'Invalid or missing coin parameter. Supported coins: bitcoin, matic-network, ethereum.'
    });
  }

  try {
    const data = await fetchCryptoData(coin.toLowerCase());
    const result = {
      name: coin.charAt(0).toUpperCase() + coin.slice(1),
      price_usd: data[coin].usd,
      market_cap_usd: data[coin].usd_market_cap,
      change_24h: data[coin].usd_24h_change
    };
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching the data.' });
  }
});

// Calculate standard deviation for prices
const calculateStandardDeviation = (prices) => {
  const mean = prices.reduce((sum, price) => sum + price, 0) / prices.length;
  const variance = prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / prices.length;
  return Math.sqrt(variance);
};

// API to get the standard deviation of prices for a coin
app.get('/deviation', async (req, res) => {
  const { coin } = req.query;
  const capitalizedCoin = coin.charAt(0).toUpperCase() + coin.slice(1).toLowerCase();
  if (!coin) {
    console.log('Missing coin parameter');
    return res.status(400).json({ error: 'Coin parameter is required.' });
  }

  console.log(`Received request for coin: ${coin}`);

  try {
    const records = await Crypto.find({ name: capitalizedCoin }).sort({ _id: -1 }).limit(100);
    if (records.length === 0) {
      return res.status(404).json({ error: `No records found for coin: ${coin}` });
    }

    const prices = records.map(record => record.price_usd);
    const deviation = calculateStandardDeviation(prices);

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
