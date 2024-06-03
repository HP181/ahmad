const express = require("express");
const {
  createUser,
  getUsers,
  getUser,
  updateUser,
  uploadPhoto,
  deleteUser,
  activateSelf,
  activateUser,
  deactivateUser,
} = require("../controllers/User");
const User = require("../models/User");
const { protect, authorize } = require("../middleware/auth");
const advancedResults = require("../middleware/advancedResults");

const router = express.Router();

router.route("/").post(createUser);
router.route("/").get(advancedResults(User), getUsers);
router.route("/activate/:token").get(activateSelf);
router.route("/:id").get(getUser);
router.route("/:id").patch(updateUser);
router.route("/:id").delete(protect, deleteUser);
router.route("/:id/photo").post(uploadPhoto);
router.route("/:id/activate").patch(activateUser);
router.route("/:id/deactivate").patch(deactivateUser);

module.exports = router;
