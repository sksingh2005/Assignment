# Crypto Price Tracker API

This project provides a simple API to fetch cryptocurrency data (Bitcoin, Matic, Ethereum) and perform statistical calculations, including standard deviation of price values. The data is fetched from the CoinGecko API and stored in a MongoDB database.

## Features

1. **Fetch and Store Cryptocurrency Data**
   - Retrieve live cryptocurrency data from CoinGecko.
   - Store the data in MongoDB for further analysis.

2. **Endpoints**
   - `/stats`: Get the latest price, market cap, and 24-hour change for a cryptocurrency.
   - `/deviation`: Calculate the standard deviation of the last 100 price entries for a specific cryptocurrency.

3. **Automated Data Fetching**
   - A cron job is set up to fetch cryptocurrency data every few minutes.

---
## Task Breakdown
# Task 1: Fetch and Store Crypto Data
Description: Fetch live cryptocurrency data (Bitcoin, Matic, Ethereum) from CoinGecko using their public API.
Implementation:
Axios is used to fetch data from the CoinGecko API.
Data is processed and stored in MongoDB using a Mongoose schema.
Folder: src,models
File :app.js fetchData.js crypto.js


# Task 2: Set Up /stats Endpoint
Description: Expose an endpoint to fetch the latest data for a specific cryptocurrency.
Implementation:
The endpoint validates the coin parameter.
Fetches live data using the fetchCryptoData function.
File: server.js

# Task 3: Set Up /deviation Endpoint
Description: Expose an endpoint to calculate the standard deviation of the last 100 price records for a specific cryptocurrency.
Implementation:
Fetches the last 100 price records from MongoDB.
Calculates the standard deviation using a helper function.
File: server.js

## Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- [npm](https://www.npmjs.com/)

---

## Installation

1. Clone this repository:
   git clone https://github.com/sksingh2005/Assignment.git
   cd Assignment
2. Install the dependencies
   npm install
3. Set up environment variables:
   Create a .env file in the root directory.
   Create a variable name MONGO_URL and Add your MongoDB connection string
4. Run the application:
   node server.js
   node src/app.js
## Endpoints
# 1. GET /stats
Description: Fetch the latest cryptocurrency data from the CoinGecko API.

Query Parameters:
coin: Name of the cryptocurrency (e.g., bitcoin, matic-network, ethereum).

# Response example-
{
    "name": "Ethereum",
    "price_usd": 3269.24,
    "market_cap_usd": 394083114104.4443,
    "change_24h": 1.2800620070762916
}

# 2. GET /deviation
Description: Calculate the standard deviation of the last 100 price records for a cryptocurrency.

Query Parameters:
coin: Name of the cryptocurrency (e.g., bitcoin, matic-network, ethereum).
 # Response example-
 {
    "coin": "ethereum",
    "standard_deviation": 9.82,
    "total_records": 5
}

# Project Structure
Assignment/
├── models/
│   └── crypto.js        # Mongoose schema for cryptocurrency data
├──src/
│   └── app.js   
│   └── fetchData.js    # Logic to fetch data from CoinGecko API
├── server.js            # Main Express server
├── package.json         # Dependencies and scripts
├── README.md            # Project documentation


# Technologies Used
1. Node.js: Backend runtime.
2. Express.js: HTTP server.
3. MongoDB + Mongoose: Database for storing cryptocurrency data.
4. Axios: HTTP client for making API calls.
5. node-cron: For scheduling tasks.
6. CoinGecko API: Data source for cryptocurrency information.

