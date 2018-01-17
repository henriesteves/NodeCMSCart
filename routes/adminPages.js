const express = require('express');
const router = express.Router();

const auth = require('../config/auth');
const isAdmin = auth.isAdmin;

// Get page model
const Page = require('../models/page');

/*
* Get page index
*/
router.get('/', isAdmin, (req, res) => {
  Page.find({}).sort({sorting: 1}).exec((err, pages) => {
    res.render('admin/pages', {
      pages
    })
  });
});

/*
* Get add page
*/
router.get('/add-page', isAdmin, (req, res) => {
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

          Page.find({}).sort({sorting: 1}).exec((err, pages) => {
            if (err) {
              console.log(err);
            } else {
              req.app.locals.pages = pages;
            }
          });

          req.flash('success', 'Page added!');
          res.redirect('/admin/pages');
        });
      }
    });
  }
  
});

// Sort pages function
var sortPages = (ids, callback) => {
  var count = 0;

  for (var i = 0; i < ids.length; i++) {
    var id = ids[i];
    count++;

    ((count) => {
      Page.findById(id, (err, page) => {
        page.sorting = count;
        page.save((err) => {
          if (err) return console.log(err)
          ++count;
          if (count >= ids.length) {
            callback();
          }
        });
      });
    })(count);
  }
}

/*
* Post reorder page index
*/
router.post('/reorder-page', (req, res) => {
  var ids = req.body['id[]'];

  sortPages(ids, () => {
    Page.find({}).sort({sorting: 1}).exec((err, pages) => {
      if (err) {
        console.log(err);
      } else {
        Page.find({}).sort({ sorting: 1 }).exec((err, pages) => {
          if (err) {
            console.log(err);
          } else {
            req.app.locals.pages = pages;
          }
        });
      }
    });
  });

});

/*
* Get edit page
*/
router.get('/edit-page/:id', isAdmin, (req, res) => {
  
  Page.findById(req.params.id, (err, page) => {
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
router.post('/edit-page/:id', (req, res) => {

  req.checkBody('title', 'Title must have a value.').notEmpty();
  req.checkBody('content', 'Content must have a value.').notEmpty();

  const id = req.params.id;
  let title = req.body.title;
  let slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
  if (slug == '') slug = title.replace(/\s+/g, '-').toLowerCase();
  let content = req.body.content;

  const errors = req.validationErrors();

  if (errors) {
    res.render('admin/editPage', {
      errors,
      id,
      title,
      slug,
      content
    });
  } else {
    Page.findOne({ slug, _id: {'$ne': id} }, (err, page) => {
      if (page) {
        req.flash('danger', 'Page slug exists, choose another.');
        res.render('admin/editPage', {
          id,
          title,
          slug,
          content
        });
      } else {
        Page.findById(id, (err, page) => {
          if (err) console.log(err);

          page.title = title;
          page.slug = slug;
          page.content = content;

          console.log(page)

          page.save((err) => {
            if (err) {
              return console.log(err);
            }

            Page.find({}).sort({sorting: 1}).exec((err, pages) => {
              if (err) {
                console.log(err);
              } else {
                req.app.locals.pages = pages;
              }
            });

            req.flash('success', 'Page edited!');
            res.redirect('/admin/pages/edit-page/' + id);
          });
        });

      }
    });
  }

});

/*
* Get delete page
*/
router.get('/delete-page/:id', isAdmin, (req, res) => {
  Page.findByIdAndRemove(req.params.id, (err) => {
    if (err) console.log(err);

    Page.find({}).sort({sorting: 1}).exec((err, pages) => {
      if (err) {
        console.log(err);
      } else {
        req.app.locals.pages = pages;
      }
    });

    req.flash('success', 'Page deleted');
    res.redirect('/admin/pages')
  });
});

// Exports
module.exports = router;