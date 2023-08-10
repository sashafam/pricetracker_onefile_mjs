"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var dotenv_1 = require("dotenv");
var supabase_js_1 = require("@supabase/supabase-js");
(0, dotenv_1.config)();
var supabaseUrl = process.env.SUPABASE_URL;
var supabaseKey = process.env.SUPABASE_KEY;
var supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey, {
    persistSession: false,
});
exports.default = supabase;
