const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  website: {
    type: String,
    requred: true
  },
  company: {
    type: String,
    requred: true
  },
  status: {
    type: String,
    requred: true
  },
  skills: {
    type: [String],
    requred: true
  },
  social: {
    facebook: {
      type: String
    },
    githubname: {
      type: String
    },
    youtube: {
      type: String
    }
  },
  location: {
    type: String
  },
  bio: {
    type: String
  },
  education: [
    {
      school: {
        type: String,
        required: true
      },
      degree: {
        type: String,
        required: true
      },
      current: {
        type: Boolean,
        default: false
      },
      from: {
        type: Date,
        requred: true
      },

      to: {
        type: Date,
        requred: true
      }
    }
  ],
  experience: [
    {
      title: {
        type: String,
        required: true
      },
      company: {
        type: String,
        required: true
      },
      current: {
        type: Boolean,
        default: false
      },
      from: {
        type: String,
        requred: true
      },
      to: {
        type: String,
        requred: true
      }
    }
  ],
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = Profile = mongoose.model('profile', ProfileSchema);
