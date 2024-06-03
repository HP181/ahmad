const path = require("path");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Mail = require("../models/Mail");
const sendEmail = require("../utils/sendEmail");


// @desc    Create Mail
// @route   POST  /api/v1/Mail
// @access   Public
exports.createMail = asyncHandler(async (req, res, next) => {
  const data = await Mail.create(req.body);
  try {
    await sendEmail({ 
      email, 
      subject, 
      salutation, 
      content,
    });
  } catch (err) {
    console.log(err);
    throw new ErrorResponse(`Error Sending Generic Mail: ${err.message}`, 500);
  }
  res.status(201).json({
    success: true,
    data,
  });
});


// @desc    Get All Mail
// @route   GET /api/v1/Mail
// @access   Private/Admin
exports.getMails = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});


// @desc    Get Single Mail
// @route   POST  /api/v1/Mail/:id
// @access   Private/Admin
exports.getMail = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const data = await Mail.findById(id);
  res.status(200).json({
    success: true,
    data,
  });
});


// @desc    Update Mail
// @route   PATCH /api/v1/Mail/:id
// @access   Private
exports.updateMail = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const data = await Mail.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    success: true,
    data,
  });
});


// @desc    Delete Mail
// @route   DELTE /api/v1/Mail/:id
// @access   Private/Admin
exports.deleteMail = asyncHandler(async (req, res, next) => {
  await Mail.findByIdAndDelete(req.params.id);
  res.status(200).json({
    success: true,
    data: {},
  });
});
