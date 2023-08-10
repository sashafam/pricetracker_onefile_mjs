"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var dotenv_1 = require("dotenv");
var axios_1 = require("axios");
var cheerio_1 = require("cheerio");
var supabase_js_1 = require("@supabase/supabase-js");
(0, dotenv_1.config)(); // Load environment variables from .env file
var Product = /** @class */ (function () {
    function Product(name, price, productUrl2) {
        this.name = name;
        this.price = price;
        this.productUrl2 = productUrl2;
    }
    return Product;
}());
var Scraper = /** @class */ (function () {
    function Scraper() {
        var supabaseUrl = process.env.SUPABASE_URL; // Supabase URL from environment variables
        var supabaseKey = process.env.SUPABASE_KEY; // Supabase API key from environment variables
        this.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey, {
            persistSession: false, // Disable persistent sessions for Supabase client
        });
        this.TABLE_NAME = 'nutricore';
        this.startPage = 0;
        this.endPage = 10; // Replace this with the desired number of pages you want to scrape
    }
    Scraper.prototype.fetchData = function (url) {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, axios_1.default.get(url)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                    case 2:
                        error_1 = _a.sent();
                        console.error('Error fetching data:', error_1.message);
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    Scraper.prototype.extractProducts = function (html) {
        var productlist = [];
        var uniqueProducts = new Set();
        var $ = cheerio_1.default.load(html);
        $('.prodWrap').each(function (index, element) {
            var name = $(element).find('.prodDesc .title').text().trim();
            var price = $(element).find('.prodDesc .reg_price').text().trim();
            var numericPrice = parseFloat(price.split(',')[0].replace(/[^\d.]/g, ''));
            var productUrl2 = 'https://www.nutricore.com.co' +
                $(element).find('.prodDesc .viewMore').attr('href');
            var productKey = name + numericPrice + productUrl2;
            if (!uniqueProducts.has(productKey)) {
                var productObj = new Product(name, numericPrice, productUrl2);
                productlist.push(productObj);
                uniqueProducts.add(productKey);
            }
        });
        return productlist;
    };
    Scraper.prototype.delay = function (ms) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve) { return setTimeout(resolve, ms); })];
            });
        });
    };
    Scraper.prototype.scrapeAndSendData = function () {
        return __awaiter(this, void 0, void 0, function () {
            var productlist, i, url, html, products, _a, data, error, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        productlist = [];
                        i = this.startPage;
                        _b.label = 1;
                    case 1:
                        if (!(i <= this.endPage)) return [3 /*break*/, 5];
                        url = "https://www.nutricore.com.co/producto_busqueda?ct=all&sc=all&sq=&br=all&p=".concat(i, "&n=36&by=");
                        // Throttle the requests with a delay of 1 second between each page fetch
                        return [4 /*yield*/, this.delay(1000)];
                    case 2:
                        // Throttle the requests with a delay of 1 second between each page fetch
                        _b.sent();
                        return [4 /*yield*/, this.fetchData(url)];
                    case 3:
                        html = _b.sent();
                        if (html) {
                            products = this.extractProducts(html);
                            productlist.push.apply(productlist, products);
                        }
                        _b.label = 4;
                    case 4:
                        i++;
                        return [3 /*break*/, 1];
                    case 5:
                        console.log(productlist);
                        _b.label = 6;
                    case 6:
                        _b.trys.push([6, 8, , 9]);
                        return [4 /*yield*/, this.supabase.from(this.TABLE_NAME).insert(productlist)];
                    case 7:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            console.error('Error inserting data into Supabase:', error.message);
                        }
                        else {
                            console.log('Data successfully sent to Supabase!');
                        }
                        return [3 /*break*/, 9];
                    case 8:
                        error_2 = _b.sent();
                        console.error('Error inserting data into Supabase:', error_2.message);
                        return [3 /*break*/, 9];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    return Scraper;
}());
// Create an instance of the Scraper class and start scraping
var scraper = new Scraper();
function runEveryOneMinute() {
    // Call the scrapeAndSendData function to scrape and send data to Supabase
    scraper.scrapeAndSendData();
    // Set up the interval to run the function every 1 minute (60000 milliseconds)
    setInterval(scraper.scrapeAndSendData.bind(scraper), 4 * 60 * 60 * 1000);
}
// Call the function to start the process
runEveryOneMinute();
