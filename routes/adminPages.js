const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.send('Admin Area');
});

// Exports
module.exports = router;