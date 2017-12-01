const express = require('express');
const router = express.Router();

// Get product model
const Product = require('../models/product');

/*
 * Get all products
 */
router.get('/', (req, res) => {

  Product.find((err, products) => {
    if (err) {
      console.log(err);
    }

    res.render('allProducts', {
      title: 'All Products',
      products
    });
  });

});

/*
 * Get a page
 */
router.get('/:slug', (req, res) => {

  const slug = req.params.slug;

  Page.findOne({ slug }, (err, page) => {
    if (err) {
      console.log(err);
    }

    if (!page) {
      res.redirect('/');
    } else {
      res.render('index', {
        title: page.title,
        content: page.content
      });
    }
  });

});

// Exports
module.exports = router;
