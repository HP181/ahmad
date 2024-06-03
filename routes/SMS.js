const express = require("express");
const {
  createSMS,
  getSMSs,
  getSMS,
  updateSMS,
  deleteSMS,
} = require("../controllers/SMS");
const SMS = require("../models/SMS");
const { protect, authorize } = require("../middleware/auth");
const advancedResults = require("../middleware/advancedResults");

const router = express.Router();

router.route("/").post(createSMS);
router.route("/").get(advancedResults(SMS), getSMSs);
router.route("/:id").get(getSMS);
router.route("/:id").patch(updateSMS);
router.route("/:id").delete(protect, deleteSMS);

module.exports = router;
