const express = require('express');
const router = express.Router();

router.get('/', (require, response) => {
  response.send('Profile router');
});

module.exports = router;