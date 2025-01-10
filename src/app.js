require('dotenv').config()
const mongoose = require('mongoose');
const cron = require('node-cron');
const fetchCryptoData = require('./fetchData');

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('Error connecting to MongoDB:', error));

cron.schedule('0 */2 * * *', () => {
  console.log(`Cron job running at: ${new Date().toISOString()}`);
  fetchCryptoData();
});
