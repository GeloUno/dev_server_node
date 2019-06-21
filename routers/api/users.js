const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');
const User = require('../../models/users');
const bcrypt = require('bcryptjs');
const config = require('config');
const jwt = require('jsonwebtoken');
const saltForBcrypt = config.get('saltForBcrypt');
const jwtSecret = config.get('jwtSecret');
const expiresTime = config.get('expiresTime');

router.post(
  '/',
  [
    check('name', 'Name is requaier')
      .not()
      .isEmpty(),
    check('email', 'Pleas enter a valid e-mail').isEmail(),
    check('password', 'InValid password').isLength({ min: 6 })
  ],
  async (require, response) => {
    const errors = validationResult(require);
    console.log(require.body);
    console.dir(errors.array());

    if (!errors.isEmpty()) {
      return response.status(400).json({ errors: errors.array() });
    }
    const { name, email, password } = require.body;
    try {
      let user = await User.findOne({ email });
      if (user) {
        return response
          .status(400)
          .json({ errors: [{ msg: 'User already exists' }] });
      }

      user = new User({
        name,
        email,
        password
      });

      const salt = await bcrypt.genSalt(saltForBcrypt);

      user.password = await bcrypt.hash(password, salt);

      user.save();

      const payload = {
        user: {
          id: user.id
        }
      };
   
      
      jwt.sign(payload, jwtSecret, {
        expiresIn: expiresTime
      },
      (err, token)=>{
        if(err) throw err;        
        response.json({token});
      }
      );
    } catch (error) {
      return response.status(500).json({ errors: error.me });
    }

    // response.send('User registered');
  }
);

module.exports = router;
