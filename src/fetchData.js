const axios = require('axios');
const Crypto = require('../models/crypto');

const fetchCryptoData = async () => {
  try {
    const response = await axios.get(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,matic-network,ethereum&vs_currencies=usd&include_market_cap=true&include_24hr_change=true'
    );

    const cryptoData = response.data;
    console.log('API Response:', cryptoData);

    const cryptoList = [
      {
        name: 'Bitcoin',
        price_usd: cryptoData.bitcoin?.usd,
        market_cap_usd: cryptoData.bitcoin?.usd_market_cap,
        change_24h: cryptoData.bitcoin?.usd_24h_change,
      },
      {
        name: 'Matic',
        price_usd: cryptoData['matic-network']?.usd,
        market_cap_usd: cryptoData['matic-network']?.usd_market_cap,
        change_24h: cryptoData['matic-network']?.usd_24h_change,
      },
      {
        name: 'Ethereum',
        price_usd: cryptoData.ethereum?.usd,
        market_cap_usd: cryptoData.ethereum?.usd_market_cap,
        change_24h: cryptoData.ethereum?.usd_24h_change,
      },
    ];

    for (const crypto of cryptoList) {
      try {
        const newCrypto = new Crypto(crypto);
        await newCrypto.save();
        console.log(`Saved: ${crypto.name}`);
      } catch (error) {
        console.error(`Error saving ${crypto.name}:`, error);
      }
    }

    console.log('Crypto data fetched and saved successfully!');
  } catch (error) {
    console.error('Error fetching or saving crypto data:', error);
  }
};

module.exports = fetchCryptoData;
