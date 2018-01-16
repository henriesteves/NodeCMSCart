const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcryptjs');

// Get user model
const User = require('../models/user');

/*
 * Get register
 */
router.get('/register', (req, res) => {

  res.render('register', {
    title: 'Register'
  })

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
