const path = require("path");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Feedback = require("../models/Feedback");
const { sendFeedbackMails } = require("../utils/feedbackUtils");


// @desc    Create Feedback
// @route   POST  /api/v1/Feedback
// @access   Public
exports.createFeedback = asyncHandler(async (req, res, next) => {
  // const data = await Feedback.create(req.body);
  // await sendFeedbackMails(data);
  const [mailres, data] = await Promise.all([
    await sendFeedbackMails(req.body),
    await Feedback.create(req.body)
  ]);
  // const data = req.body
  res.status(201).json({
    success: true,
    data,
  });
});


// @desc    Get All Feedback
// @route   GET /api/v1/Feedback
// @access   Private/Admin
exports.getFeedbacks = asyncHandler(async (req, res, next) => {
  // res.status(200).json(res.advancedResults);
  res.status(200).json({success: true, data: "coming soon!",});
});


// @desc    Get Single Feedback
// @route   POST  /api/v1/Feedback/:id
// @access   Private/Admin
exports.getFeedback = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const data = await Feedback.findById(id);
  res.status(200).json({
    success: true,
    data,
  });
});


// @desc    Update Feedback
// @route   PATCH /api/v1/Feedback/:id
// @access   Private
exports.updateFeedback = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const data = await Feedback.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    success: true,
    data,
  });
});


// @desc    Delete Feedback
// @route   DELTE /api/v1/Feedback/:id
// @access   Private/Admin
exports.deleteFeedback = asyncHandler(async (req, res, next) => {
  await Feedback.findByIdAndDelete(req.params.id);
  res.status(200).json({
    success: true,
    data: {},
  });
});
