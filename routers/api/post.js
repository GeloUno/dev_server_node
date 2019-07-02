const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');
const auth = require('../../middleware/auth');
const Post = require('../../models/post');
const User = require('../../models/users');
const Profile = require('../../models/profile');

router.post(
  '/',
  [
    auth,
    [
      check('text', 'text is valid')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return status(400).json({ error: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select('-password');

      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        user: user.id,
        email: user.email
      });

      const post = await newPost.save();
      res.json(post);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error });
    }
  }
);

router.get('/', async (req, res) => {
  try {
    const post = await Post.find().sort({ date: -1 }); //
    const countPost = await Post.count();
    res.json([post,{count: countPost}]);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err });
  }
});
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id); //
    if (!post) {
      return res.status(404).json({ messange: 'no post found catch !noPost' });// I think it will never hapen
    }

    res.json(post);
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ messange: 'no post found catch' });
    }
    console.log(err);
    res.status(500).json({ error: err });
  }
});
router.delete('/:id',auth, async (req, res) => {
  try {

    const userId = req.user.id;
    const postRemoved = await Post.findById(req.params.id); //
    if(userId!==postRemoved.user.toString()){
      return res.status(404).json({messange: 'No Access to Delete'})
    }
    const post = await postRemoved.remove(); //
    
    res.json({removed : postRemoved});
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ messange: 'no post found catch' });
    }
    console.log(err);
    res.status(500).json({ error: err });
  }
});

module.exports = router;
