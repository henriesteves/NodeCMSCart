const express = require('express');
const router = express.Router();
const mkdirp = require('mkdirp');
const fs = require('fs-extra');
const resizeImg = require('resize-img');

// Get product model
const Product = require('../models/product');
const Category = require('../models/category');

/*
* Get product index
*/
router.get('/', (req, res) => {
  let count;

  Product.count((req, c) => {
    count = c;
  });

  Product.find((err, products) => {
    res.render('admin/products', {
      products,
      count
    });
  });

  // Product.find({}).sort({sorting: 1}).exec((err, products) => {
  //   res.render('admin/products', {
  //     products
  //   })
  // });
});

/*
* Get add product
*/
router.get('/add-product', (req, res) => {
  const title = '';
  const slug = '';
  const content = '';

  res.render('admin/addProduct', {
    title: title,
    slug: slug,
    content: content
  });

});

/*
* Post add product
*/
router.post('/add-product', (req, res) => {

  req.checkBody('title', 'Title must have a value.').notEmpty();
  req.checkBody('content', 'Content must have a value.').notEmpty();

  const title = req.body.title;
  let slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
  if (slug == '') slug = title.replace(/\s+/g, '-').toLowerCase();
  const content = req.body.content;

  const errors = req.validationErrors();

  if (errors) {
    res.render('admin/addProduct', {
      errors,
      title,
      slug,
      content
    });
  } else {
    Product.findOne({ slug }, (err, product) => {
      if (product) {
        req.flash('danger', 'Product slug exists, choose another.');
        res.render('admin/addProduct', {
          title,
          slug,
          content
        });
      } else {
        const product = new Product({
          title,
          slug,
          content,
          sorting: 100
        });

        product.save((err) =>{
          if (err) {
            return console.log(err);
          }

          req.flash('success', 'Product added!');
          res.redirect('/admin/products');
        });
      }
    });
  }
  
});

/*
* Post reorder product index
*/
router.post('/reorder-product', (req, res) => {
  var ids = req.body['id[]'];
  var count = 0;

  for (var i = 0; i < ids.length; i++) {
    var id = ids[i];
    count++;

    ((count) => {
      Product.findById(id, (err, product) => {
        product.sorting = count;
        product.save((err) => {
          if (err) return console.log(err)
        });
      });
    })(count)
    
  }
});

/*
* Get edit product
*/
router.get('/edit-product/:id', (req, res) => {
  
  Product.findById(req.params.id, (err, product) => {
    if (err) return console.log(err);

    res.render('admin/editProduct', {
      id: product._id,
      title: product.title,
      slug: product.slug,
      content: product.content
    });
  });

});

/*
* Post edit product
*/
router.post('/edit-product/:id', (req, res) => {

  req.checkBody('title', 'Title must have a value.').notEmpty();
  req.checkBody('content', 'Content must have a value.').notEmpty();

  const id = req.params.id;
  let title = req.body.title;
  let slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
  if (slug == '') slug = title.replace(/\s+/g, '-').toLowerCase();
  let content = req.body.content;

  const errors = req.validationErrors();

  if (errors) {
    res.render('admin/editProduct', {
      errors,
      id,
      title,
      slug,
      content
    });
  } else {
    Product.findOne({ slug, _id: {'$ne': id} }, (err, product) => {
      if (product) {
        req.flash('danger', 'Product slug exists, choose another.');
        res.render('admin/editProduct', {
          id,
          title,
          slug,
          content
        });
      } else {
        Product.findById(id, (err, product) => {
          if (err) console.log(err);

          product.title = title;
          product.slug = slug;
          product.content = content;

          console.log(product)

          product.save((err) => {
            if (err) {
              return console.log(err);
            }

            req.flash('success', 'Product edited!');
            res.redirect('/admin/products/edit-product/' + id);
          });
        });

      }
    });
  }

});

/*
* Get delete product
*/
router.get('/delete-product/:id', (req, res) => {
  Product.findByIdAndRemove(req.params.id, (err) => {
    if (err) console.log(err);

    req.flash('success', 'Product deleted');
    res.redirect('/admin/products')
  });
});

// Exports
module.exports = router;