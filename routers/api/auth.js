const express = require('express');
const router = express.Router();

router.get('/', (require, response) => {
  response.send('Auth router');
});

module.exports = router;