import axios from 'axios';
import cheerio from 'cheerio';
import supabase from './config';

class Product {
  name: string;
  price: number;
  productUrl2: string;

  constructor(name: string, price: number, productUrl2: string) {
    this.name = name;
    this.price = price;
    this.productUrl2 = productUrl2;
  }
}

class ProductScrapper {
  url: string;

  constructor(url: string) {
    this.url = url;
  }

  async fetchData(): Promise<Product[]> {
    const response = await axios.get(this.url);
    const html = response.data;
    const $ = cheerio.load(html);

    let linksList = [];
    $('.submenu li a').each(function () {
      const link = $(this).attr('href')!;
      linksList.push({ link: link });
    });

    let products: Product[] = [];

    for (const { link } of linksList) {
      const response = await axios.get(link);
      const html = response.data;
      const $ = cheerio.load(html);

      $('.grid_item').each(function () {
        const productUrl2 = $(this).find('a').attr('href')!;
        const name = $(this).find('h3').text();
        const price = parseFloat($(this).find('span.new_price').text().replace('$', ''));
        products.push(new Product(name, price, productUrl2));
      });
    }

    return products;
  }

  async sendDataToSupabase(): Promise<void> {
    try {
      const products = await this.fetchData();

      for (const product of products) {
        const { data, error } = await supabase
          .from('Price')
          .insert([{
            name: product.name,
            price: product.price,
            productUrl2: product.productUrl2
          }]);

        if (error) {
          console.error('Error inserting data:', error);
        }
      }
    } catch (error) {
      console.error('Error sending data to Supabase:', error);
    }
  }
}

(async () => {
  // Function to fetch and send data to Supabase
  const fetchDataAndSendToSupabase = async () => {
    try {
      const url = 'https://www.suplementoscolombia.co/';
      const scrapper = new ProductScrapper(url);
      await scrapper.sendDataToSupabase();
      console.log('Data sent to Supabase.');
    } catch (error) {
      console.error('Error sending data to Supabase:', error);
    }
  };

  // Initial execution
  await fetchDataAndSendToSupabase();

  // Interval for running every 4 hours (4 hours = 4 * 60 * 60 * 1000 milliseconds)
  const intervalInMilliseconds = 4 * 60 * 60 * 1000;
  setInterval(fetchDataAndSendToSupabase, intervalInMilliseconds);
})();
