const mongoose = require('mongoose');

// Category Schema
const CategorySchema = mongoose.Schema({
  title: {
    type: String,
    require: true
  },
  slug: {
    type: String
  }
});

const Category = module.exports = mongoose.model('Category', CategorySchema);