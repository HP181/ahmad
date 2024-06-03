const path = require("path");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Appointment = require("../models/Appointment");
const {
  sendAppointmentMails,
  sendAppointmentSMS,
} = require("../utils/appointmentUtils");

// @desc    Create Appointment
// @route   POST  /api/v1/Appointment
// @access   Public
exports.createAppointment = asyncHandler(async (req, res, next) => {
  // const data = await Appointment.create(req.body);
  // await sendAppointmentMails(data);
  const [
    mailres,
    data,
    smsres,
  ] = await Promise.all([
    await sendAppointmentMails(req.body),
    await Appointment.create(req.body),
    await sendAppointmentSMS(req.body),
  ]);
  console.log({
    // reqBody: req.body,
    mailres,
    data,
    smsres,
  });
  // const data = req.body;
  res.status(201).json({
    success: true,
    data,
  });
});

// @desc    Get All Appointment
// @route   GET /api/v1/Appointment
// @access   Private/Admin
exports.getAppointments = asyncHandler(async (req, res, next) => {
  // res.status(200).json(res.advancedResults);
  res.status(200).json({ success: true, data: "coming soon!" });
});

// @desc    Get Single Appointment
// @route   POST  /api/v1/Appointment/:id
// @access   Private/Admin
exports.getAppointment = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const data = await Appointment.findById(id);
  res.status(200).json({
    success: true,
    data,
  });
});

// @desc    Update Appointment
// @route   PATCH /api/v1/Appointment/:id
// @access   Private
exports.updateAppointment = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const data = await Appointment.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    success: true,
    data,
  });
});

// @desc    Delete Appointment
// @route   DELTE /api/v1/Appointment/:id
// @access   Private/Admin
exports.deleteAppointment = asyncHandler(async (req, res, next) => {
  await Appointment.findByIdAndDelete(req.params.id);
  res.status(200).json({
    success: true,
    data: {},
  });
});
