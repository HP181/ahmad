const express = require("express");
const {
  createMail,
  getMails,
  getMail,
  updateMail,
  deleteMail,
} = require("../controllers/Mail");
const Mail = require("../models/Mail");
const { protect, authorize } = require("../middleware/auth");
const advancedResults = require("../middleware/advancedResults");

const router = express.Router();

router.route("/").post(createMail);
router.route("/").get(advancedResults(Mail), getMails);
router.route("/:id").get(getMail);
router.route("/:id").patch(updateMail);
router.route("/:id").delete(protect, deleteMail);

module.exports = router;
