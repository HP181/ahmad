const express = require("express");
const {
  createAppointment,
  getAppointments,
  getAppointment,
  updateAppointment,
  deleteAppointment,
} = require("../controllers/Appointment");
const Appointment = require("../models/Appointment");
const { protect, authorize } = require("../middleware/auth");
const advancedResults = require("../middleware/advancedResults");

const router = express.Router();

router.route("/").post(createAppointment);
// router.route("/").get(advancedResults(Appointment), getAppointments);
router.route("/").get(getAppointments);
// router.route("/:id").get(getAppointment);
// router.route("/:id").patch(updateAppointment);
// router.route("/:id").delete(protect, deleteAppointment);

module.exports = router;
