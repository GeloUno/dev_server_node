const express = require('express');
const router = express.Router();

router.get('/', (request, response) => {
  response.send('Post router');
});

module.exports = router;