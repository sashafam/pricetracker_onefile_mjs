import axios from 'axios';
import cheerio from 'cheerio';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL; // Supabase URL from environment variables
const supabaseKey = process.env.SUPABASE_KEY; // Supabase API key from environment variables
const supabase = createClient(supabaseUrl, supabaseKey, {
  persistSession: false, // Disable persistent sessions for Supabase client
});

const urls = [
  'https://fitplus.com.co/shop/',
  'https://fitplus.com.co/shop/page/2/',
  'https://fitplus.com.co/shop/page/3/',
  'https://fitplus.com.co/shop/page/4/',
  'https://fitplus.com.co/shop/page/5/',
  'https://fitplus.com.co/shop/page/6/',
];

// List of product names to filter
const filterList = [''];

async function fetchDataFromURL(urlArray) {
  try {
    const productlist = []; // Initialize the array to store products
    const uniqueProducts = new Set();

    for (const url of urlArray) {
      const response = await axios.get(url);
      const html = response.data;
      const $ = cheerio.load(html);

      // Select all the product cards
      const productCards = $('.eltd-pl-main-holder li.product');

      // Loop through each product card and extract relevant information
      productCards.each((index, element) => {
        const productName = $(element).find('h4.eltd-product-list-title a').text().trim();
        const productURL = $(element).find('h4.eltd-product-list-title a').attr('href');
        const productPriceText = $(element).find('span.price .woocommerce-Price-amount bdi').text().trim();
        const productPrice = Number(productPriceText.match(/\d+/)[0]);


        const productKey = productName + productPrice + productURL;

        if (!uniqueProducts.has(productKey)) {
          // Concatenate the relative URL with the base URL to get the absolute URL
          const completeURL = new URL(productURL, url).href;

          const productObj = {
            name: productName,
            price: productPrice,
            productUrl2: completeURL,
          };

          // Filter by product names in the filterList
          if (filterList.some((filterName) => productName.toLowerCase().includes(filterName.toLowerCase()))) {
            productlist.push(productObj);
            uniqueProducts.add(productKey);
          }
        }
      });

      // Now you have the products data in the 'productlist' array for each URL
      console.log(productlist);
    }

    console.log('Unique Products:', [...uniqueProducts]); // Log the unique products to the console
    return productlist; // Return the 'productlist' array from the function
  } catch (error) {
    console.error(`Error fetching data from URL:`, error.message);
    // Handle the error appropriately
  }
}

async function sendDataToSupabase() {
  try {
    const data = await fetchDataFromURL(urls);

    const { data: insertedData, error } = await supabase.from('fitplus').insert(data);

    if (error) {
      console.error('Error inserting data:', error);
    } else {
      console.log('Data inserted successfully:', insertedData);
    }
  } catch (error) {
    console.error('Error sending data to Supabase:', error);
  }
}

// Function to run the scraping and data sending every 4 hours
function runEveryFourHours() {
  // Call the sendDataToSupabase function to scrape and send data to Supabase
  sendDataToSupabase();

  // Set up the interval to run the function every 4 hours (4 * 60 * 60 * 1000 milliseconds)
  setInterval(sendDataToSupabase, 4 * 60 * 60 * 1000);
}

// Call the function to start the process
runEveryFourHours();