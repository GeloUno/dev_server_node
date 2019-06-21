const express = require('express');
const router = express.Router();

router.get('/', (require, response) => {
  response.send('Post router');
});

module.exports = router;