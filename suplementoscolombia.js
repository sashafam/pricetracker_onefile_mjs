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
var axios_1 = require("axios");
var cheerio_1 = require("cheerio");
var config_1 = require("./config");
var Product = /** @class */ (function () {
    function Product(name, price, productUrl2) {
        this.name = name;
        this.price = price;
        this.productUrl2 = productUrl2;
    }
    return Product;
}());
var ProductScrapper = /** @class */ (function () {
    function ProductScrapper(url) {
        this.url = url;
    }
    ProductScrapper.prototype.fetchData = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response, html, $, linksList, products, _loop_1, _i, linksList_1, link;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, axios_1.default.get(this.url)];
                    case 1:
                        response = _a.sent();
                        html = response.data;
                        $ = cheerio_1.default.load(html);
                        linksList = [];
                        $('.submenu li a').each(function () {
                            var link = $(this).attr('href');
                            linksList.push({ link: link });
                        });
                        products = [];
                        _loop_1 = function (link) {
                            var response_1, html_1, $_1;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0: return [4 /*yield*/, axios_1.default.get(link)];
                                    case 1:
                                        response_1 = _b.sent();
                                        html_1 = response_1.data;
                                        $_1 = cheerio_1.default.load(html_1);
                                        $_1('.grid_item').each(function () {
                                            var productUrl2 = $_1(this).find('a').attr('href');
                                            var name = $_1(this).find('h3').text();
                                            var price = parseFloat($_1(this).find('span.new_price').text().replace('$', ''));
                                            products.push(new Product(name, price, productUrl2));
                                        });
                                        return [2 /*return*/];
                                }
                            });
                        };
                        _i = 0, linksList_1 = linksList;
                        _a.label = 2;
                    case 2:
                        if (!(_i < linksList_1.length)) return [3 /*break*/, 5];
                        link = linksList_1[_i].link;
                        return [5 /*yield**/, _loop_1(link)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/, products];
                }
            });
        });
    };
    ProductScrapper.prototype.sendDataToSupabase = function () {
        return __awaiter(this, void 0, void 0, function () {
            var products, _i, products_1, product, _a, data, error, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, this.fetchData()];
                    case 1:
                        products = _b.sent();
                        _i = 0, products_1 = products;
                        _b.label = 2;
                    case 2:
                        if (!(_i < products_1.length)) return [3 /*break*/, 5];
                        product = products_1[_i];
                        return [4 /*yield*/, config_1.default
                                .from('Price')
                                .insert([{
                                    name: product.name,
                                    price: product.price,
                                    productUrl2: product.productUrl2
                                }])];
                    case 3:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            console.error('Error inserting data:', error);
                        }
                        _b.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        error_1 = _b.sent();
                        console.error('Error sending data to Supabase:', error_1);
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    return ProductScrapper;
}());
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var fetchDataAndSendToSupabase, intervalInMilliseconds;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                fetchDataAndSendToSupabase = function () { return __awaiter(void 0, void 0, void 0, function () {
                    var url, scrapper, error_2;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 2, , 3]);
                                url = 'https://www.suplementoscolombia.co/';
                                scrapper = new ProductScrapper(url);
                                return [4 /*yield*/, scrapper.sendDataToSupabase()];
                            case 1:
                                _a.sent();
                                console.log('Data sent to Supabase.');
                                return [3 /*break*/, 3];
                            case 2:
                                error_2 = _a.sent();
                                console.error('Error sending data to Supabase:', error_2);
                                return [3 /*break*/, 3];
                            case 3: return [2 /*return*/];
                        }
                    });
                }); };
                // Initial execution
                return [4 /*yield*/, fetchDataAndSendToSupabase()];
            case 1:
                // Initial execution
                _a.sent();
                intervalInMilliseconds = 4 * 60 * 60 * 1000;
                setInterval(fetchDataAndSendToSupabase, intervalInMilliseconds);
                return [2 /*return*/];
        }
    });
}); })();
