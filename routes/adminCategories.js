const express = require('express');
const router = express.Router();

const auth = require('../config/auth');
const isAdmin = auth.isAdmin;

// Get category model
const Category = require('../models/category');

/*
* Get categories index
*/
router.get('/', isAdmin, (req, res) => {
  Category.find((err, categories) => {
    res.render('admin/categories', {
      categories
    });
  });
});

/*
* Get add category
*/
router.get('/add-category', isAdmin, (req, res) => {
  const title = '';

  res.render('admin/addCategory', {
    title: title
  });

});

/*
* Post add category
*/
router.post('/add-category', (req, res) => {

  req.checkBody('title', 'Title must have a value.').notEmpty();

  const title = req.body.title;
  const slug = title.replace(/\s+/g, '-').toLowerCase();

  const errors = req.validationErrors();

  if (errors) {
    res.render('admin/addCategory', {
      errors,
      title
    });
  } else {
    Category.findOne({ slug }, (err, category) => {
      if (category) {
        req.flash('danger', 'Category title exists, choose another.');
        res.render('admin/addCategory', {
          title
        });
      } else {
        const category = new Category({
          title,
          slug
        });

        category.save((err) =>{
          if (err) {
            return console.log(err);
          }

          Category.find((err, categories) => {
            if (err) {
              console.log(err);
            } else {
              req.app.locals.categories = categories;
            }
          });

          req.flash('success', 'Category added!');
          res.redirect('/admin/categories');
        });
      }
    });
  }
  
});

/*
* Get edit category
*/
router.get('/edit-category/:id', isAdmin, (req, res) => {
  
  Category.findById(req.params.id, (err, category) => {
    if (err) return console.log(err);

    res.render('admin/editCategory', {
      id: category._id,
      title: category.title
    });
  });

});

/*
* Post edit category
*/
router.post('/edit-category/:id', (req, res) => {

  req.checkBody('title', 'Title must have a value.').notEmpty();

  const id = req.params.id;
  let title = req.body.title;
  let slug = title.replace(/\s+/g, '-').toLowerCase();

  const errors = req.validationErrors();

  if (errors) {
    res.render('admin/editCategory', {
      errors,
      id,
      title
    });
  } else {
    Category.findOne({ slug, _id: {'$ne': id} }, (err, category) => {
      if (category) {
        req.flash('danger', 'Category title exists, choose another.');
        res.render('admin/editCategory', {
          id,
          title
        });
      } else {
        Category.findById(id, (err, category) => {
          if (err) console.log(err);

          category.title = title;
          category.slug = slug;

          category.save((err) => {
            if (err) {
              return console.log(err);
            }

            Category.find((err, categories) => {
              if (err) {
                console.log(err);
              } else {
                req.app.locals.categories = categories;
              }
            });

            req.flash('success', 'Category edited!');
            res.redirect('/admin/categories/edit-category/' + id);
          });
        });

      }
    });
  }

});

/*
* Get delete page
*/
router.get('/delete-category/:id', isAdmin, (req, res) => {
  Category.findByIdAndRemove(req.params.id, (err) => {
    if (err) console.log(err);

    Category.find((err, categories) => {
      if (err) {
        console.log(err);
      } else {
        req.app.locals.categories = categories;
      }
    });

    req.flash('success', 'Category deleted');
    res.redirect('/admin/pages')
  });
});

// Exports
module.exports = router;