const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/users');
const { check, validationResult } = require('express-validator/check');
const bcrypt = require('bcryptjs');
const config = require('config');
const jwt = require('jsonwebtoken');
const saltForBcrypt = config.get('saltForBcrypt');
const jwtSecret = config.get('jwtSecret');
const expiresTime = config.get('expiresTime');

router.get('/', auth, async (require, response) => {
  try {
  //  console.log(require.user.id);

    const user = await User.findById(require.user.id)
      .select('-password')
      .select('-data');
    response.json(user);
  } catch (error) {
    console.log(error.messange);
    response.status(500).send('Server error');
  }
});

router.post(
  '/',
  [
    check('email', 'Pleas enter a valid e-mail').isEmail(),
    check('password', 'InValid password')
      .exists()
      .isLength({ min: 6 })
  ],
  async (require, response) => {
    const errors = validationResult(require);

    if (!errors.isEmpty()) {
      return response.status(400).json({ errors: errors.array() });
    }
    const { email, password } = require.body;
    try {
      let user = await User.findOne({ email });
      if (!user) {
        return response
          .status(400)
          .json({ errors: [{ msg: 'Invalid Dredentials' }] });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return response
          .status(400)
          .json({ errors: [{ msg: 'Invalid Dredentials' }] });
      }

      const payload = {
        user: {
          id: user.id
        }
      };

      jwt.sign(
        payload,
        jwtSecret,
        {
          expiresIn: expiresTime
        },
        (err, token) => {
          if (err) throw err;
          response.json({ token });
        }
      );
    } catch (error) {
      return response.status(500).json({ errors: error.me });
    }
  }
);

module.exports = router;
