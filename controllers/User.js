const path = require("path");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const User = require("../models/User");
const crypto = require("crypto");
const { activateAccountEmail } = require("../utils/emailUtils");
const { ErrorResponseJSON } = require("../utils/responseJSON");
const { updateMetaData } = require("../utils/utils");
const verifyEmailServer = require("../utils/verifyEmailServer");

// @desc    Create User/
// @route   POST/api/v1/user/
// @access   Public
exports.createUser = asyncHandler(async (req, res, next) => {
  // const isServerAvailable = await verifyEmailServer();
  // if (!isServerAvailable)  return next(new ErrorResponse("EAUTH: Invalid response from email server", 500));

  let message;
  req.body.isActive = false;
  if (req?.user) updateMetaData(req.body, req?.user?._id);
  const data = await User.create(req.body);

  const isEmailSent = await activateAccountEmail(req, res, data);
  if (!isEmailSent) message = "Email could not be sent"
  // if (!isEmailSent) return next(new ErrorResponse("Email could not be sent", 500));

  // try {
  //   await activateAccountEmail(req, res, data);
  //   // res.status(200).json({ success: true, data, message: "Email Sent" });
  // } catch (err) {
  //   console.log(err);
  //   return next(new ErrorResponse("Email could not be sent", 500));
  // }
  res.status(201).json({
    success: true,
    data,
    message,
  });
});

// @desc    Get All User
// @route   POST/api/v1/user/
// @access   Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
  // await verifyEmailServer(); 
  res.status(200).json(res.advancedResults);
});

// @desc    Get Single User
// @route   POST/api/v1/user/:id
// @access   Private/Admin
exports.getUser = asyncHandler(async (req, res, next) => {
  const userId = req.params.id ?? req.user.id;
  if (!userId) return next(new ErrorResponse(`User Id not provided`, 401));

  const data = await User.findById(userId);
  res.status(200).json({
    success: true,
    data,
  });
});

// @desc    Update User
// @route   PUT/api/v1/user/:id
// @access   Private
exports.updateUser = asyncHandler(async (req, res, next) => {
  const userId = req.params.id ?? req.user.id;
  if (!userId) return next(new ErrorResponse(`User Id not provided`, 401));

  const data = await User.findByIdAndUpdate(userId, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    success: true,
    data,
  });
});

// @desc    Update User Photo
// @route   PATCH /api/v1/user/:id/photo
// @access   Private
exports.uploadPhoto = asyncHandler(async (req, res, next) => {
  const userId = req.params.id ?? req.user.id;
  if (!userId) return next(new ErrorResponse(`User Id not provided`, 401));

  const data = await User.findById(userId);

  if (!req.files) {
    return next(new ErrorResponse(`Please Upload a picture`, 400));
  }

  const file = req.files.photo;

  //Make sure the image is a photo
  if (!file.mimetype.startsWith("image")) {
    return next(new ErrorResponse(`Please Upload an image file`, 400));
  }

  // Check filesize
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please Upload an image less than ${process.env.MAX_FILE_UPLOAD}`,
        400
      )
    );
  }

  //crete custom filename
  file.name = `photo_${data._id}${path.parse(file.name).ext}`;

  file.mv(
    `${process.env.FILE_UPLOAD_PATH}/profile/${file.name}`,
    async (err) => {
      if (err) {
        console.error(err);
        return next(new ErrorResponse(`An error occured while uploading`, 500));
      }
    }
  );
  await User.findByIdAndUpdate(userId, {
    photo: `${process.env.FILE_UPLOAD_PATH}/profile/${file.name}`,
  });
  res.status(200).json({
    success: true,
    data: file.name,
  });
});

// @desc    Delete User
// @route   DELTE/api/v1/user/:id
// @access   Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  await User.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Activate User
// @route   GET /api/v1/user/activate/:token
// @access   Private
// exports.activateUser = asyncHandler(async (req, res, next) => {
exports.activateSelf = asyncHandler(async (req, res, next) => {
  console.log("Activation Started");
  if (!req.params.token)
    return next(new ErrorResponse(`Activation token not provided`, 401));

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
  // set is active
  user.isActive = true;
  user.activationToken = undefined;
  user.activationExpire = undefined;
  await user.save();

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Activate User
// @route   GET /api/v1/user/:id/activate
// @access   Private
exports.activateUser = asyncHandler(async (req, res, next) => {
  const userId = req.params.id ?? req.user.id;
  if (!userId) return next(new ErrorResponse(`User Id not provided`, 401));

  if (req.user.role !== "SuperAdmin" || req.params.id !== req.user.id) {
    return new ErrorResponseJSON(
      res,
      "You are not authorized to activate this user",
      401
    );
  }

  const data = await User.findByIdAndUpdate(
    userId,
    { isActive: true },
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(200).json({
    success: true,
    data,
  });
});

// @desc    Deactivate User
// @route   GET /api/v1/user/:id/deactivate
// @access   Private
exports.deactivateUser = asyncHandler(async (req, res, next) => {
  const userId = req.params.id ?? req.user.id;
  if (!userId) return next(new ErrorResponse(`User Id not provided`, 401));

  if (req.user.role !== "SuperAdmin" || req.params.id !== req.user.id) {
    return new ErrorResponseJSON(
      res,
      "You are not authorized to deactivate this user",
      401
    );
  }

  const data = await User.findByIdAndUpdate(
    userId,
    { isActive: false },
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(200).json({
    success: true,
    data,
  });
});
