const express = require("express");
const {
  createFeedback,
  getFeedbacks,
  getFeedback,
  updateFeedback,
  deleteFeedback,
} = require("../controllers/Feedback");
const Feedback = require("../models/Feedback");
const { protect, authorize } = require("../middleware/auth");
const advancedResults = require("../middleware/advancedResults");

const router = express.Router();

router.route("/").post(createFeedback);
// router.route("/").get(advancedResults(Feedback), getFeedbacks);
router.route("/").get(getFeedbacks);
// router.route("/:id").get(getFeedback);
// router.route("/:id").patch(updateFeedback);
// router.route("/:id").delete(protect, deleteFeedback);

module.exports = router;
