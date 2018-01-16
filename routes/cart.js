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
        title: product.title,
        qty: 1,
        price: parseFloat(product.price).toFixed(2),
        image: (product.image) ? '/product-images/' + product._id + '/' + product.image : '/images/noimage.png'
      });

      console.log(req.session.cart);
    } else {
      var cart = req.session.cart;
      var newItem = true;

      for (var i = 0; i < cart.length; i++) {
        if (cart[i].title == product.title) {
          cart[i].qty++;
          newItem = false;
          break;
        }
      }

      if (newItem) {
        cart.push({
          title: product.title,
          qty: 1,
          price: parseFloat(product.price).toFixed(2),
          image: (product.image) ? '/product-images/' + product._id + '/' + product.image : '/images/noimage.png'
        });
      }

    }

    console.log(req.session.cart);

    req.flash('success', 'Product added!');
    res.redirect('back');

  });

});

/*
 * Get checkout page
 */
router.get('/checkout', (req, res) => {

  if (req.session.cart && req.session.cart.length == 0) {
    delete req.session.cart;
    res.redirect('/cart/checkout');
  } else {
    res.render('checkout', {
      title: 'Ckeckout',
      cart: req.session.cart
    });
  }

});

/*
 * Get update product
 */
router.get('/update/:product', (req, res) => {

  const slug = req.params.product;
  const action = req.query.action;

  var cart = req.session.cart;
  
  for(let i = 0; i < cart.length; i++) {
    if (cart[i].title == slug) {
      switch (action) {
        case "add":
          cart[i].qty++;
          break;
        case "remove":
          cart[i].qty--;
          if (cart[i].qty < 1) cart.splice(i, 1);
          break;
        case "clear":
          cart.splice(i, 1);
          if (cart.length == 0) delete req.session.cart;
          break;
        default:
          console.log('Update problem')
          break;
      }
      break;
    }
  }

  req.flash('success', 'Cart updated!');
  res.redirect('/cart/checkout');

});

/*
 * Get clear cart
 */
router.get('/clear', (req, res) => {

  delete req.session.cart;

  req.flash('success', 'Cart cleared!');
  res.redirect('/cart/checkout');

});

/*
 * Get buy now
 */
router.get('/buynow', (req, res) => {

  delete req.session.cart;

  res.sendStatus(200);

});

// Exports
module.exports = router;
