const express = require('express');
const router = express.Router();

/*
* Get page index
*/
router.get('/', (req, res) => {
  res.send('Admin Area');
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

// Exports
module.exports = router;