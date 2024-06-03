const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const slugify = require("slugify");
const crypto = require("crypto");

const User = new mongoose.Schema({
  fullname: {
    type: String,
    required: [true, "Please add Fullname"],
  },
  firstname: {
    type: String,
    // required: [true, "Please add Firstname"],
  },
  lastname: {
    type: String,
    // required: [true, "Please add Lastname"],
  },
  username: {
    type: String,
  },
  phone: {
    type: String,
  },
  email: {
    type: String,
    required: [true, "Please add Email"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please add a password"],
    minlength: 6,
    select: false,
  },
  photo: {
    type: String,
  },
  role: {
    type: String,
    enum: ["SuperAdmin", "User", "Instructor"],
    default: "User",
  },
  description: {
    type: String,
  },
  socialmedia: {
    type: {
      twitter: String,
      facebook: String,
      link: String,
      website: String,
      youtube: String,
    },
  },

  achievements: [{
    type: String
  }],
  wishlist: {
    courses: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    }],
    books: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
    }],
  },
  organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
    },

  activationToken: String,
  activationExpire: Date,

  resetPasswordToken: String,
  resetPasswordExpire: Date,

  isActive: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    // default: Date.now,
  },
});

//Encrypt password using bcrypt
User.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

//match user entered password to hashed password in db
User.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

//Sign JWT and return
User.methods.getSignedJwtToken = function () {
  return jwt.sign({ user: this }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

//Generate and hash password token
User.methods.getResetPasswordToken = function () {
  //Generate token
  const resetToken = crypto.randomBytes(20).toString("hex");
  //Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  //set expire
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

//Generate and hash password token
User.methods.getActivationToken = function () {
  //Generate token
  const activationToken = crypto.randomBytes(20).toString("hex");
  //Hash token and set to activationToken field
  this.activationToken = crypto
    .createHash("sha256")
    .update(activationToken)
    .digest("hex");

  //set expire
  this.activationExpire = Date.now() + 300 * 60 * 1000;
  return activationToken;
};

module.exports = mongoose.model("User", User);
