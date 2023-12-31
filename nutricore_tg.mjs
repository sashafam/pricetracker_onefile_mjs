import axios from 'axios';
import cheerio from 'cheerio';
import { createClient } from '@supabase/supabase-js';
import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';

dotenv.config();

const url = 'https://www.suplementoscolombia.co/'; // URL of the website to be scraped
const supabaseUrl = process.env.SUPABASE_URL; // Supabase URL from environment variables
const supabaseKey = process.env.SUPABASE_KEY; // Supabase API key from environment variables
const chatId = process.env.TELEGRAM_CHAT_ID;
const telegramToken = process.env.TELEGRAM_TOKEN; // Telegram Bot Token from environment variables

const supabase = createClient(supabaseUrl, supabaseKey, {
  persistSession: false, // Disable persistent sessions for Supabase client
});
const bot = new TelegramBot(telegramToken, { polling: false });

let previousResults = []; // Store the previous results

(async () => {
  async function sendDataToSupabase2() {
    try {
      const { data: prices, error } = await supabase
        .from('nutricore')
        .select('name, price, id, productUrl2')
        .order('id', { ascending: false });

      if (error) {
        console.error('Error fetching data:', error);
        return;
      }

      if (!prices || prices.length < 2) {
        console.error('Not enough data to calculate difference');
        return;
      }

      const productMap = new Map();

      for (const product of prices) {
        if (!productMap.has(product.name)) {
          // If product name doesn't exist in the map, add it as the latest product
          productMap.set(product.name, { latest: product, previous: null });
        } else {
          // If product name exists in the map, compare the id to determine the latest and previous products
          const existingProduct = productMap.get(product.name);
          if (!existingProduct.latest || product.id > existingProduct.latest.id) {
            existingProduct.previous = existingProduct.latest;
            existingProduct.latest = product;
          } else if (!existingProduct.previous || product.id > existingProduct.previous.id) {
            existingProduct.previous = product;
          }
          productMap.set(product.name, existingProduct);
        }
      }
      
      const results = [];
      
      for (const [name, { latest, previous }] of productMap.entries()) {
        if (latest && previous) {
          const priceDifference = latest.price - previous.price;
          if (priceDifference !== 0) {
            const productUrl2 = latest.productUrl2; // Extract the productUrl2 from the latest product object
            results.push({ name, priceDifference, productUrl2 }); // Include the productUrl2 property in the results
          }
        }
      }

      // Sort the results by price difference in ascending order
      results.sort((a, b) => a.priceDifference - b.priceDifference);

      // Check if the results are the same as the previous ones
      const isSameResults = JSON.stringify(results) === JSON.stringify(previousResults);
      previousResults = results; // Update the previous results with the current results

      // Send the sorted results as a message to the Telegram chat if they are different from the previous ones
      if (!isSameResults) {
        let message = '';
        for (const { name, priceDifference, productUrl2 } of results) {
          const priceDescription = priceDifference > 0 ? 'higher price' : 'lower price';
          message += `Product: ${name}, Price Difference: ${priceDifference > 0 ? '+' : ''}${priceDifference} (${priceDescription}), Product URL: ${productUrl2}\n`;
      }
        if (message !== '') {
          await bot.sendMessage(chatId, message); // Wait for the message to be sent before continuing
        }
      }
    } catch (error) {
      console.error('Error calculating price difference:', error);
    }
  }

  // Function to send message and schedule the next execution after 30 seconds
  async function sendAndSchedule() {
    try {
      await sendDataToSupabase2();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setTimeout(sendAndSchedule, 30000); // Schedule the next execution after 30 seconds
    }
  }

  // Start the first execution
  sendAndSchedule();
})();