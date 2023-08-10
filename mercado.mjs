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

async function fetchData(url) {
  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    // Select the element containing the price
    const priceElement = $('.andes-money-amount__fraction');
    const price = priceElement.text();
    const numericPrice = parseFloat(price.split('.')[0].replace(/[^\d.]/g, ''));

    // Select the element containing the name of the product (if available)
    const productNameElement = $('h1.ui-pdp-title');
    const productName = productNameElement.text().trim();

    // Extract the product URL
    const productUrl2 = url;

    // Create a unique key for the product based on its name, price, and URL
    const productKey = `${productName}-${price}-${productUrl2}`;

    if (!uniqueProducts.has(productKey)) {
      const productObj = {
        name: productName,
        price: numericPrice,
        productUrl2, // Add the product URL to the object
      };

      productlist.push(productObj); // Push the product object into the productlist array
      uniqueProducts.add(productKey); // Add the product key to the uniqueProducts set to track duplicates
    }
  } catch (error) {
    console.error('Error fetching data:', error.message);
    // Handle the error appropriately
  }
}

async function scrapeWebsite() {
  try {
    const urls = [
      // Add all the URLs you want to scrape here
      'https://articulo.mercadolibre.com.co/MCO-926907954-proteina-whey-nitrotech-4-l-_JM#position=1&search_layout=stack&type=item&tracking_id=20e94875-2d9a-40e7-bf42-32c9cf8410b7',
      'https://articulo.mercadolibre.com.co/MCO-653112693-creatina-en-polvo-met-rx-_JM#position=3&search_layout=stack&type=item&tracking_id=7a2f06c4-4daf-43a5-9d16-1f14f159d0f7',
      'https://articulo.mercadolibre.com.co/MCO-864711396-creatina-300grs-nutrex-envio-_JM#position=3&search_layout=stack&type=item&tracking_id=03df410c-df70-40b4-b7cc-a4737bf83f2b',
      'https://articulo.mercadolibre.com.co/MCO-452149516-animal-pak-universal-44packs-multivitaminico-envio-gratis-_JM#position=26&search_layout=stack&type=item&tracking_id=91f53337-7b0a-4683-bb41-00df1f88f222',
      'https://articulo.mercadolibre.com.co/MCO-532983403-nitro-tech-whey-gold-55-libras-muscletech-_JM#position=8&search_layout=stack&type=item&tracking_id=a4f23724-e8cf-42b4-b7e8-b3d67d07ede1',
      'https://articulo.mercadolibre.com.co/MCO-1309267723-lipo-6-black-hers-ultra-concentrate-pldoras-de-prdida-de-p-_JM#position=10&search_layout=stack&type=item&tracking_id=bafdcc14-bc5f-4083-b653-49f6ed2f42dc',
      'https://articulo.mercadolibre.com.co/MCO-1310477449-hydroxycut-elite-100caps-envio-_JM#position=6&search_layout=stack&type=item&tracking_id=5c02b047-fcb8-4ad0-9ce5-62c4d5248179',
      'https://articulo.mercadolibre.com.co/MCO-480968768-c4-pre-entreno-60-servicios-cellucor-mejor-que-no-xplode-_JM#position=30&search_layout=stack&type=item&tracking_id=e8bfe3bb-cdc1-4505-8bee-28aaf108a13c',
      'https://articulo.mercadolibre.com.co/MCO-1236014815-creatina-300grs-60ser-the-curse-_JM#position=1&search_layout=stack&type=item&tracking_id=8b76cbe9-81c4-4594-b55f-964f7d1170bc',
      'https://articulo.mercadolibre.com.co/MCO-1305021535-the-curse-50-servicios-_JM#position=3&search_layout=stack&type=item&tracking_id=158dfc1a-ed1e-4ce0-a241-777c90300c0c',
      'https://articulo.mercadolibre.com.co/MCO-589220696-cell-tech-6-libras-6lb-lb-muscletech-creatina-_JM#position=2&search_layout=stack&type=item&tracking_id=81249e1c-23e0-4f57-ac74-ddd88abdcdfc',
      'https://articulo.mercadolibre.com.co/MCO-1222754820-creatina-100-pura-platinum-_JM#position=11&search_layout=stack&type=item&tracking_id=2a876c46-9272-4463-86b6-0123709cc5bd',
    ];

    for (const url of urls) {
      await fetchData(url);
    }

    console.log('Unique Products:', [...uniqueProducts]); // Log the unique products to the console
    return productlist; // Return the array of extracted product information
  } catch (error) {
    console.error('Error while scraping website:', error.message);
    // Handle the error appropriately
    return null;
  }
}

async function sendDataToSupabase() {
  try {
    const data = await scrapeWebsite(); // Fetch data from the website

    // Modify the price to only include the integer part
    data.forEach((product) => {
      const priceAsString = product.price.toString();
      product.price = parseInt(priceAsString.split('.')[0]); // Extract the integer part of the price
    });

    const { data: insertedData, error } = await supabase
      .from('mercado')
      .insert(data); // Insert the data into the 'Price' table in Supabase

    if (error) {
      console.error('Error inserting data:', error);
    } else {
      console.log('Data inserted successfully:', insertedData);
    }
  } catch (error) {
    console.error('Error sending data to Supabase:', error);
  }
}

// Initialize productlist and uniqueProducts arrays before calling the functions
const productlist = []; // Array to store the extracted product information
const uniqueProducts = new Set(); // Set to store unique products (based on name, price, and productUrl2)

// Function to run the scraping and data sending every 4 hours
function runEveryFourHours() {
  // Call the sendDataToSupabase function to scrape and send data to Supabase
  sendDataToSupabase();

  // Set up the interval to run the function every 4 hours (4 * 60 * 60 * 1000 milliseconds)
  setInterval(sendDataToSupabase, 4 * 60 * 60 * 1000);
}

// Call the function to start the process
runEveryFourHours();