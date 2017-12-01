const express = require('express');
const router = express.Router();

// Get product model
const Product = require('../models/product');

/*
 * Get add product to cart
 */
router.get('/add/:product', (req, res) => {

  const slug = req.params.product;

  Product.findOne({ slug }, (err, product) => {
    if (err) {
      console.log(err);
    }

    if (typeof req.session.cart == "undefined") {

      req.session.cart = [];
      req.session.cart.push({
        title: slug,
        qty: 1,
        price: parseFloat(product.price).toFixed(2),
        image: '/product_images/' + product._id + '/' + product.image
      });

      console.log(req.session.cart);
    } else {
      var cart = req.session.cart;
      var newItem = true;

      for (var i = 0; i < cart.length; i++) {
        if (cart[i].title == slug) {
          cart[i].qty++;
          newItem = false;
          break;
        }
      }

      if (newItem) {
        cart.push({
          title: slug,
          qty: 1,
          price: parseFloat(product.price).toFixed(2),
          image: '/product_images/' + product._id + '/' + product.image
        });
      }

    }

    console.log(req.session.cart);

    req.flash('success', 'Product added!');
    res.redirect('back');

  });

});

// Exports
module.exports = router;
