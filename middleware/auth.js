const jwt = require('jsonwebtoken');
const config = require('config');
const jwtSecret = config.get('jwtSecret');

module.exports = (req, res, next) => {
  const token = req.header('x-auth-token');

  if (!token) {
    return res.status(401).json({ msg: 'no token' });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded.user;
    next();
  } catch (err) {
    console.log(err);
    res.status(401).json({ mes: 'Token is not valid' });
  }
};
