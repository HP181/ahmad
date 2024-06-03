const path = require("path");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const SMS = require("../models/SMS");
const sendSMS = require("../utils/sendSMS");


// @desc    Create SMS
// @route   POST  /api/v1/SMS
// @access   Public
exports.createSMS = asyncHandler(async (req, res, next) => {
  const data = await SMS.create(req.body);
  try {
    await sendSMS(req.body.to, req.body.message);
  } catch (err) {
    console.log(err);
    throw new ErrorResponse(`Error Sending Generic Mail: ${err.message}`, 500);
  }
  res.status(201).json({
    success: true,
    data,
  });
});


// @desc    Get All SMS
// @route   GET /api/v1/SMS
// @access   Private/Admin
exports.getSMSs = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});


// @desc    Get Single SMS
// @route   POST  /api/v1/SMS/:id
// @access   Private/Admin
exports.getSMS = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const data = await SMS.findById(id);
  res.status(200).json({
    success: true,
    data,
  });
});


// @desc    Update SMS
// @route   PATCH /api/v1/SMS/:id
// @access   Private
exports.updateSMS = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const data = await SMS.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    success: true,
    data,
  });
});


// @desc    Delete SMS
// @route   DELTE /api/v1/SMS/:id
// @access   Private/Admin
exports.deleteSMS = asyncHandler(async (req, res, next) => {
  await SMS.findByIdAndDelete(req.params.id);
  res.status(200).json({
    success: true,
    data: {},
  });
});
