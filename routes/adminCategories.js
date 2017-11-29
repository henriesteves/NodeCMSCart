const express = require('express');
const router = express.Router();

// Get category model
const Category = require('../models/category');

/*
* Get categories index
*/
router.get('/', (req, res) => {
  Category.find((err, categories) => {
    res.render('admin/categories', {
      categories
    });
  });
});

/*
* Get add category
*/
router.get('/add-category', (req, res) => {
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

          req.flash('success', 'Category added!');
          res.redirect('/admin/categories');
        });
      }
    });
  }
  
});

/*
* Post reorder page index
*/
router.post('/reorder-page', (req, res) => {
  var ids = req.body['id[]'];
  var count = 0;

  for (var i = 0; i < ids.length; i++) {
    var id = ids[i];
    count++;

    ((count) => {
      Category.findById(id, (err, page) => {
        page.sorting = count;
        page.save((err) => {
          if (err) return console.log(err)
        });
      });
    })(count)
    
  }
});

/*
* Get edit page
*/
router.get('/edit-page/:slug', (req, res) => {
  
  Category.findOne({ slug: req.params.slug }, (err, page) => {
    if (err) return console.log(err);

    res.render('admin/editPage', {
      id: page._id,
      title: page.title,
      slug: page.slug,
      content: page.content
    });
  });

});

/*
* Post edit page
*/
router.post('/edit-page/:slug', (req, res) => {

  req.checkBody('title', 'Title must have a value.').notEmpty();
  req.checkBody('content', 'Content must have a value.').notEmpty();

  const id = req.body.id;
  let title = req.body.title;
  let slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
  if (slug == '') slug = title.replace(/\s+/g, '-').toLowerCase();
  let content = req.body.content;

  const errors = req.validationErrors();

  if (errors) {
    res.render('admin/editCategory', {
      errors,
      id,
      title,
      slug,
      content
    });
  } else {
    Category.findOne({ slug, _id: {'$ne': id} }, (err, page) => {
      if (page) {
        req.flash('danger', 'Category slug exists, choose another.');
        res.render('admin/editCategory', {
          id,
          title,
          slug,
          content
        });
      } else {
        Category.findById(id, (err, page) => {
          if (err) console.log(err);

          page.title = title;
          page.slug = slug;
          page.content = content;

          console.log(page)

          page.save((err) => {
            if (err) {
              return console.log(err);
            }

            req.flash('success', 'Category edited!');
            res.redirect('/admin/pages/edit-page/' + page.slug);
          });
        });

      }
    });
  }

});

/*
* Get delete page
*/
router.get('/delete-page/:id', (req, res) => {
  Category.findByIdAndRemove(req.params.id, (err) => {
    if (err) console.log(err);

    req.flash('success', 'Category deleted');
    res.redirect('/admin/pages')
  });
});

// Exports
module.exports = router;