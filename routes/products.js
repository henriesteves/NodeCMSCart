const express = require('express');
const router = express.Router();
const fs = require('fs-extra');

// Get product model
const Product = require('../models/product');
const Category = require('../models/category');

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
 * Get product by category
 */
router.get('/:category', (req, res) => {

  const categorySlug = req.params.category;

  Category.findOne({ slug: categorySlug }, (err, category) => {
    Product.find({ category: categorySlug }, (err, products) => {
      if (err) {
        console.log(err);
      }

      res.render('catProducts', {
        title: category.title,
        products
      });
    });
  });

});

/*
 * Get product details
 */
router.get('/:category/:product', (req, res) => {

  let galleryImage = null;
  const loggedIn = (req.isAuthenticated()) ? true : false;

  Product.findOne({ slug: req.params.product }, (err, product) => {
    if (err) {
      console.log(err);
    } else {
      const galleryDir = 'public/product-images/' + product._id + '/gallery';

      fs.readdir(galleryDir, (err, files) => {
        if (err) {
          console.log(err);
        } else {
          galleryImage = files;

          res.render('product', {
            title: product.title,
            product: product,
            galleryImage: galleryImage,
            loggedIn: loggedIn
          });
        }
      });
    }

  });

});

// Exports
module.exports = router;
