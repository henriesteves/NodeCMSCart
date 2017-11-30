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
  const description = '';
  const price = '';

  Category.find((err, categories) => {
    res.render('admin/addProduct', {
      categories,
      title,
      description,
      price
    });
  });

});

/*
* Post add product
*/
router.post('/add-product', (req, res) => {

  const imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";

  req.checkBody('title', 'Title must have a value.').notEmpty();
  req.checkBody('description', 'Description must have a value.').notEmpty();
  req.checkBody('price', 'Price must have a value.').isDecimal();
  req.checkBody('image', 'You must upload an image').isImage(imageFile);

  const title = req.body.title;
  const slug = title.replace(/\s+/g, '-').toLowerCase();
  const description = req.body.description;
  const price = req.body.price;
  const category = req.body.category;

  const errors = req.validationErrors();

  console.log(errors)

  if (errors) {
    Category.find((err, categories) => {
      res.render('admin/addProduct', {
        errors,
        categories,
        title,
        description,
        price
      });
    });
  } else {
    Product.findOne({slug}, (err, product) => {
      if (product) {
        req.flash('danger', 'Product title exists, choose another.');
        Category.find((err, categories) => {
          res.render('admin/addProduct', {
            categories,
            title,
            description,
            price
          });
        });
      } else {
        const price2 = parseFloat(price).toFixed(2);
        const product = new Product({
          title,
          slug,
          description,
          price: price2,
          category: category,
          image: imageFile
        });

        product.save((err) => {
          if (err) {
            return console.log(err);
          }

          mkdirp('public/product-images/' + product._id, (err) => {
            return console.log(err);
          });

          mkdirp('public/product-images/' + product._id + '/gallery', (err) => {
            return console.log(err);
          });

          mkdirp('public/product-images/' + product._id + '/gallery/thumbs', (err) => {
            return console.log(err);
          });

          if (imageFile != '') {
            const productImage = req.files.image;
            const path = 'public/product-images/' + product._id + '/' + imageFile;

            productImage.mv(path, (err) => {
              return console.log((err))
            });

          }

          req.flash('success', 'Product added!');
          res.redirect('/admin/products');
        });
      }
    });
  }

});

/*
* Get edit product
*/
router.get('/edit-product/:id', (req, res) => {

  var errors;

  if (req.session.errors) errors = req.session.errors;
  req.session.errors = null;

  Category.find((err, categories) => {

    Product.findById(req.params.id, (err, product) => {
      if (err) {
        console.log(err);
        res.redirect('/admin/products');
      } else {
        const galleryDir = 'public/product-images/' + product.id + '/gallery';
        let galleryImages = null;

        fs.readdir(galleryDir, (err, files) => {
          if (err) {
            console.log(err);
          } else {
            galleryImages = files;

            res.render('admin/editProduct', {
              errors,
              id: product.id,
              categories,
              category: product.category.replace(/\s+/g, '-').toLowerCase(),
              title: product.title,
              description: product.description,
              price: parseFloat(product.price).toFixed(2),
              image: product.image,
              galleryImages
            });
          }
        });
      }

    });

  });

});

/*
* Post edit product
*/
router.post('/edit-product/:id', (req, res) => {

  

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