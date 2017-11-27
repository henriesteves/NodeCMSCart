const express = require('express');
const router = express.Router();

// Get page model
const Page = require('../models/page');

/*
* Get page index
*/
router.get('/', (req, res) => {
  Page.find({}).sort({sorting: 1}).exec((err, pages) => {
    res.render('admin/pages', {
      pages
    })
  });
});

/*
* Get add page
*/
router.get('/add-page', (req, res) => {
  const title = '';
  const slug = '';
  const content = '';

  res.render('admin/addPage', {
    title: title,
    slug: slug,
    content: content
  });

});

/*
* Post add page
*/
router.post('/add-page', (req, res) => {

  req.checkBody('title', 'Title must have a value.').notEmpty();
  req.checkBody('content', 'Content must have a value.').notEmpty();

  const title = req.body.title;
  let slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
  if (slug == '') slug = title.replace(/\s+/g, '-').toLowerCase();
  const content = req.body.content;

  const errors = req.validationErrors();

  if (errors) {
    res.render('admin/addPage', {
      errors,
      title,
      slug,
      content
    });
  } else {
    Page.findOne({ slug }, (err, page) => {
      if (page) {
        req.flash('danger', 'Page slug exists, choose another.');
        res.render('admin/addPage', {
          title,
          slug,
          content
        });
      } else {
        const page = new Page({
          title,
          slug,
          content,
          sorting: 100
        });

        page.save((err) =>{
          if (err) {
            return console.log(err);
          }

          req.flash('success', 'Page added!');
          res.redirect('/admin/pages');
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
      Page.findById(id, (err, page) => {
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
  
  Page.findOne({ slug: req.params.slug }, (err, page) => {
    if (err) return console.log(err);

    res.render('admin/editPage', {
      id: page._id,
      title: page.title,
      slug: page.slug,
      content: page.content
    });
  });

});

// Exports
module.exports = router;