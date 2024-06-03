const express = require("express");
const {
  login,
  logout,
  forgotPassword,
  resetPassword,
  requestActivation,
  activateAccount,
  // getMe,
  // updateProfile,
  // uploadPhoto,
} = require("../controllers/Auth");
const {
  createUser,
  getUser,
  updateUser,
  uploadPhoto,
} = require("../controllers/User");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.route("/login").post(login);
router.route("/logout").post(logout);
router.route("/signup").post(createUser);
router.route("/forgotPassword").post(forgotPassword);
router.route("/resetPassword/:token").post(resetPassword);
router.route("/activate/:token").post(activateAccount);
router.route("/requestActivation/:id").post(requestActivation);
// router.route("/me").get(protect, getMe);
// router.route("/me").patch(protect, updateProfile);
// router.route("/me/photo").patch(protect, uploadPhoto);
router.route("/me").get(protect, getUser);
router.route("/me").patch(protect, updateUser);
router.route("/me/photo").patch(protect, uploadPhoto);

module.exports = router;
