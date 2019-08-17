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
    const countPost = await Post.estimatedDocumentCount();
    res.json([post, { count: countPost }]);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err });
  }
});
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id); //
    if (!post) {
      return res.status(404).json({ messange: 'no post found catch !noPost' }); // I think it will never hapen
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
router.delete('/:id', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const postRemoved = await Post.findById(req.params.id); //
    if (userId !== postRemoved.user.toString()) {
      return res.status(404).json({ messange: 'No Access to Delete' });
    }
    const post = await postRemoved.remove(); //

    res.json({ removed: postRemoved });
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ messange: 'no post found catch' });
    }
    console.log(err);
    res.status(500).json({ error: err });
  }
});

router.put('/like/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (
      post.likes.filter(lik => lik.user.toString() === req.user.id).length > 0
    ) {
      return res.status(400).json({ messange: 'post already' });
    }
    post.likes.unshift({ user: req.user.id });
    await post.save();
    res.json(post);
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ messange: 'no post found' });
    }
    console.log(err);
    res.status(500).json({ error: 'err' });
  }
});
router.put('/unlike/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (
      post.likes.filter(lik => lik.user.toString() === req.user.id).length === 0
    ) {
      return res.status(400).json({ messange: 'post is not liked' });
    }

    const removeIndex = post.likes
      .map(lik => lik.user.toString())
      .indexOf(req.user.id);

    post.likes.splice(removeIndex, 1);
    await post.save();
    res.json(post);
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ messange: 'no post found' });
    }
    console.log(err);
    res.status(500).json({ error: 'err' });
  }
});

router.post(
  '/comments/:id',
  [
    auth,
    [
      check('text', 'text is reqired')
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
      const post = await Post.findById(req.params.id);
      const newComments = {
        text: req.body.text,
        name: user.name,
        user: user.id,
        email: user.email
      };
      post.comments.unshift(newComments);
      await post.save();
      res.json(post);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error });
    }
  }
);
router.delete('/comments/:id/:comment_id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    const post = await Post.findById(req.params.id);
    const commentDelete = post.comments.find(
      com => com.id === req.params.comment_id
    );
    if (!commentDelete) {
      return res.status(404).json({ messange: 'no Comment found' });
    }

    console.log(commentDelete.user.toString());
    console.log(user.id.toString());
    if (user.id.toString() !== commentDelete.user.toString()) {
      return res.status(401).json({ messange: 'no Access to delete' });
    }
    // post.comments.unshift(newComments);
    // await post.save();

    // const removeIndex = post.comments
    //   .map(com => com.user.toString())
    //   .indexOf(req.user.id);

    post.comments.remove({ _id: req.params.comment_id.toString() });
    await post.save();
    res.json(commentDelete);
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ messange: 'no comment found' });
    }
    console.log(error);
    res.status(500).json({ error: error });
  }
});

module.exports = router;
