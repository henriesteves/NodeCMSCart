const express = require('express');
const router = express.Router();

// Get product model
const Page = require('../models/product');

/*
 * Get
 */
router.get('/', (req, res) => {

  Page.findOne({ slug: 'home' }, (err, page) => {
    if (err) {
      console.log(err);
    }

    res.render('index', {
      title: page.title,
      content: page.content
    });
  });

});

// Exports
module.exports = router;
