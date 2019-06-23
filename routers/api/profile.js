const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/profile');
const User = require('../../models/users');
const { check, validationResult } = require('express-validator/check');

//@route    GET api/profile/me
//@desc     get current profile user
//@access   Privet

router.get('/me', auth, async (request, response) => {
  try {
    const profile = await Profile.findOne({
      user: request.user.id
    });

    if (!profile) {
      return response.status(400).json({ msg: 'no profile user' });
    }
    response.json(profile);
  } catch (error) {
    console.log(error);
    response.status(500).send('Server error');
  }
});

//@route    POST api/profile
//@desc     Create or update
//@access   Privet

router.post(
  '/',
  [
    auth,
    [
      check('status', 'Status is requred')
        .not()
        .isEmpty(),
      check('skills', 'Skills is requred')
        .not()
        .isEmpty()
    ]
  ],
  async (request, response) => {
    const errors = validationResult(request);

    if (!errors.isEmpty()) {
      return response.status(400).json({ errors: errors.array() });
    }
    const {
      website,
      status,
      skills,
      social,
      facebook,
      githubname,
      youtube,
      location,
      bio
    } = request.body;

    //Build profile
    const profileFields = {};
    profileFields.user = request.user.id;
    if (website) profileFields.website = website;
    if (status) profileFields.status = status;
    if (skills) profileFields.skills = skills;
    if (social) profileFields.social = social;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;

    if (skills) {
      profileFields.skills = skills.split(',').map(skill => skill.trim());
    }

    // build social object

    profileFields.social = {};
    if (facebook) profileFields.social.facebook = facebook;
    if (githubname) profileFields.social.githubname = githubname;
    if (youtube) profileFields.social.youtube = youtube;
    // }
    try {
      let profile = await Profile.findOne({ user: request.user.id });

      // update profile
      if (profile) {
        profile = await Profile.findOneAndUpdate(
          { user: request.user.id },
          { $set: profileFields },
          { new: true }
        );
        return response.json(profile);
      }
      // create profile
      profile = new Profile(profileFields);
      await profile.save();
      response.json(profile);
    } catch (error) {
      console.log(error);
      response.status(500).send('Server error');
    }
  }
);

//@route    GET api/profile
//@desc     get all profile users
//@access   Public

router.get('/', async (request, response) => {
  try {
    const profileAll = await Profile.find().populate('user', ['name', 'email']);
    response.json(profileAll);
  } catch (error) {
    console.log(error);
    response
      .status(500)
      .json({ error: error })
      .send('Server error');
  }
});

//@route    GET api/profile/user/:user_id
//@desc     get  profile user by id
//@access   Public

router.get('/user/:user_id', async (request, response) => {
  try {
    const profileUserId = await Profile.findOne({
      user: request.params.user_id
    }).populate('user', ['name', 'email']);
    if (!profileUserId) {
      return response.status(400).json({ mes: 'Profile not found.' });
    }
    response.json(profileUserId);
  } catch (error) {
    if (error.kind == 'ObjectId') {
      return response.status(400).json({ mes: 'Profile not found ...' });
    }
    response
      .status(500)
      .json({ error: error })
      .send('Server error');
  }
});

//@route    DELETE api/profile
//@desc     delete profile and user
//@access   Privat

router.delete('/', auth, async (request, response) => {
  try {
    await Profile.findOneAndRemove({ user: request.user.id });
    await User.findOneAndRemove({ _id: request.user.id });
    response.json({ msg: 'User and Profile Delete' });
  } catch (error) {
    response.status(500).json({ error: error });
  }
});

module.exports = router;
