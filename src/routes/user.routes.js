import { Router } from "express";
import {
  changePassword,
  getCurrentUser,
  getUserProfile,
  getWatchHistory,
  loginUser,
  logOutUser,
  refreshAccessToken,
  registerUser,
  updateUserAvatar,
  updateUserCoverImage,
  updateUserDetail,
} from "../controllers/user.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser);

//secured routes
router.route("/logout").post(verifyJWT, logOutUser);

router.route("/refresh-token").post(verifyJWT, refreshAccessToken);

router.route("/change-password").post(verifyJWT, changePassword);

router.route("/get-user").get(verifyJWT, getCurrentUser);

router.route("/update-account").patch(verifyJWT, updateUserDetail);
router
  .route("/update-avatar")
  .patch(verifyJWT, upload.single("avatar"), updateUserAvatar);

router
  .route("/update-cover-image")
  .patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage);

router.route("/c/:username").get(verifyJWT, getUserProfile);

router.route("/watch-history").get(verifyJWT, getWatchHistory);

export default router;
