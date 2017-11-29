const mongoose = require('mongoose');

// Product Schema
const ProductSchema = mongoose.Schema({
  category: {
    type: String,
    require: true
  },
  title: {
    type: String,
    require: true
  },
  slug: {
    type: String
  },
  description: {
    type: String,
    require: true
  },
  price: {
    type: Number,
    require: true
  },
  image: {
    type: String
  }
});

const Product = module.exports = mongoose.model('Product', ProductSchema);