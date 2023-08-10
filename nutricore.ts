import { config as dotenvConfig } from 'dotenv';
import axios from 'axios';
import cheerio from 'cheerio';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

dotenvConfig(); // Load environment variables from .env file

class Product {
  public name: string;
  public price: number;
  public productUrl2: string;

  constructor(name: string, price: number, productUrl2: string) {
    this.name = name;
    this.price = price;
    this.productUrl2 = productUrl2;
  }
}

class Scraper {
  private supabase: SupabaseClient;
  private TABLE_NAME: string;
  private startPage: number;
  private endPage: number;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL; // Supabase URL from environment variables
    const supabaseKey = process.env.SUPABASE_KEY; // Supabase API key from environment variables

    this.supabase = createClient(supabaseUrl, supabaseKey, {
      persistSession: false, // Disable persistent sessions for Supabase client
    });

    this.TABLE_NAME = 'nutricore';
    this.startPage = 0;
    this.endPage = 10; // Replace this with the desired number of pages you want to scrape
  }

  private async fetchData(url: string): Promise<string | null> {
    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching data:', error.message);
      return null;
    }
  }

  private extractProducts(html: string): Product[] {
    const productlist: Product[] = [];
    const uniqueProducts = new Set<string>();

    const $ = cheerio.load(html);

    $('.prodWrap').each((index, element) => {
      const name = $(element).find('.prodDesc .title').text().trim();
      const price = $(element).find('.prodDesc .reg_price').text().trim();
      const numericPrice = parseFloat(price.split(',')[0].replace(/[^\d.]/g, ''));

      const productUrl2 =
        'https://www.nutricore.com.co' +
        $(element).find('.prodDesc .viewMore').attr('href');
      const productKey = name + numericPrice + productUrl2;

      if (!uniqueProducts.has(productKey)) {
        const productObj = new Product(name, numericPrice, productUrl2);
        productlist.push(productObj);
        uniqueProducts.add(productKey);
      }
    });

    return productlist;
  }

  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  public async scrapeAndSendData(): Promise<void> {
    const productlist: Product[] = [];

    for (let i = this.startPage; i <= this.endPage; i++) {
      const url = `https://www.nutricore.com.co/producto_busqueda?ct=all&sc=all&sq=&br=all&p=${i}&n=36&by=`;

      // Throttle the requests with a delay of 1 second between each page fetch
      await this.delay(1000);

      const html = await this.fetchData(url);

      if (html) {
        const products = this.extractProducts(html);
        productlist.push(...products);
      }
    }

    console.log(productlist);

    // Now that you have the scraped data in 'productlist,' you can send it to Supabase.
    try {
      // Insert all the products in the 'products' table using a batch insert
      const { data, error } = await this.supabase.from(this.TABLE_NAME).insert(productlist);

      if (error) {
        console.error('Error inserting data into Supabase:', error.message);
      } else {
        console.log('Data successfully sent to Supabase!');
      }
    } catch (error) {
      console.error('Error inserting data into Supabase:', error.message);
    }
  }
}

// Create an instance of the Scraper class and start scraping
const scraper = new Scraper();
function runEveryOneMinute() {
  // Call the scrapeAndSendData function to scrape and send data to Supabase
  scraper.scrapeAndSendData();

  // Set up the interval to run the function every 1 minute (60000 milliseconds)
  setInterval(scraper.scrapeAndSendData.bind(scraper), 4 * 60 * 60 * 1000);
}

// Call the function to start the process
runEveryOneMinute();