const path = require("path");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");

const bcrypt = require("bcryptjs");


// @desc    Login User
// @route   POST/api/v1/auth/login
// @access   Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  //validate email & password
  if (!email || !password) {
    return next(new ErrorResponse("Please Provide an email and password", 400));
  }
  //check for user
  const user = await User.findOne({ email: email })
    .select("+password")
    .populate({
      path: "followers",
      select: "firstname lastname email bio rank photo gender",
    });

  if (!user) {
    return next(new ErrorResponse("Invalid credentials, User not found", 401));
  }

  // sample bcrypt hashing
  const salt = await bcrypt.genSalt(10);
  saltedPass = await bcrypt.hash(password, salt);

  //check if password match
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  sendTokenResponse(user, 200, res);
});


// @desc    Log user out / clear cookie
// @route  GET /api/v1/auth/logout
// @access   Private
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    data: {},
  });
});


// @desc    Reset Password
// @route   PUT/api/v1/auth/resetpassword/:token
// @access   Private
exports.resetPassword = asyncHandler(async (req, res, next) => {
  //get hashed token
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
    return next(new ErrorResponse("Invalid Token", 400));
  }
  // set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  // user.resetPasswordTokenExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});


// @desc    Forgot Password
// @route   POST/api/v1/auth/forgotpassword
// @access   Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorResponse("User not found", 404));
  }
  //Get reset token
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  //Create reset url
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/reset-password/${resetToken}`;

  const salutation = `Dear ${user.firstname ?? user.fullname}`;
  const content = `You are receiving this email because you (or someone else) has requested
the reset of a password, Please click on this button to complete your password reset \n\n <br /><br /> <a href="${resetUrl}" style="padding:1rem;color:black;background:#ff4e02;border-radius:5px;text-decoration:none;">Reset Password</a> \n\n <br /><br /> This link would expire in 10 minutes <br /><br/> Kindly ignore if you did not initate this request`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password reset token",
      salutation,
      content,
    });
    res.status(200).json({ success: true, data: user, message: "Email Sent" });
  } catch (err) {
    console.log(err);
    user.getResetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    // user.resetPasswordTokenExpire = undefined;

    await user.save({ validateBeforeSave: false });
    return next(new ErrorResponse("Email could not be sent", 500));
  }

  // res.status(200).json({
  //   success: true,
  //   data: user,
  // });
});


// @desc    Activate Account with Activation Token
// @route   PUT/api/v1/auth/activate/:token
// @access   Private
exports.activateAccount = asyncHandler(async (req, res, next) => {
  //get hashed token
  const activationToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    activationToken,
    activationExpire: { $gt: Date.now() },
  });
  if (!user) {
    return next(new ErrorResponse("Invalid Token", 400));
  }
  user.activationToken = undefined;
  user.activationExpire = undefined;
  user.isActive = true;
  // user.activationTokenExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});


// @desc    Request Account Activation
// @route   POST/api/v1/auth/requestActivation/:id
// @access   Public
exports.requestActivation = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse("User not found", 404));
  }
  //Get reset token
  const token = user.getActivationToken();
  await user.save({ validateBeforeSave: false });

  //Create reset url
  const url = `${req.protocol}://${req.get(
    "host"
  )}/verify-account?token=${token}`;

  const salutation = `Dear ${user.firstname ?? user.fullname}`;
  const content = `You are receiving this email because you have not activated your account
, Please click on this button to complete your password reset \n\n <br /><br /> <a href="${url}" style="padding:1rem;color:black;background:#ff4e02;border-radius:5px;text-decoration:none;">Reset Password</a> \n\n <br /><br /> This link would expire in 10 minutes <br /><br/> Kindly ignore if you did not initate this request`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Account Activation",
      salutation,
      content,
    });
    res.status(200).json({ success: true, data: user, message: "Email Sent" });
  } catch (err) {
    console.log(err);
    user.activationToken = undefined;
    user.activationExpire = undefined;
    // user.activationTokenExpire = undefined;

    await user.save({ validateBeforeSave: false });
    return next(new ErrorResponse("Email could not be sent", 500));
  }

  const activationToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  console.log({token, url, activationToken})

  // res.status(200).json({
  //   success: true,
  //   data: user,
  // });
});


//Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  //create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
    user,
  });
};
