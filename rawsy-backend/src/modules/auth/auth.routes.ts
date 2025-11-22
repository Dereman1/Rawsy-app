import { Router } from "express";
import { register, login } from "./auth.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { requireAdmin } from "../../middlewares/admin.middleware";
import { listManufacturers, suspendManufacturer, deleteManufacturer, unsuspendManufacturer } from "./auth.controller"; 
import User from "./auth.model";
import { uploadSingle } from "../../middlewares/upload.middleware";
import { uploadProfileImage } from "./uploadProfile.controller";
import { getPublicUserProfile } from "./user.profile.controller";
import { uploadVerificationDoc } from "./verification.controller";
import { updateFactoryOrBusinessLocation } from "./location.controller";
import { changePassword } from "./password.controller";
import { logout } from "./logout.controller";

const router = Router();

router.post("/register", register);
router.post("/login", login);
// Admin: List all manufacturers
router.get(
  "/manufacturers",
  authenticate,
  requireAdmin,
  listManufacturers
);

// Admin: Suspend a manufacturer
router.put(
  "/manufacturer/:id/suspend",
  authenticate,
  requireAdmin,
  suspendManufacturer
);
//un-suspend a manufacturer
router.put(
  "/manufacturer/:id/unsuspend",
  authenticate,
  requireAdmin,
  unsuspendManufacturer
);
// Admin: Delete a manufacturer
router.delete(
  "/manufacturer/:id",
  authenticate,
  requireAdmin,
  deleteManufacturer
);
// =============================
// 👤 USER PROFILE ROUTES
// =============================
router.get(
  "/me",
  authenticate,
  async (req: any, res) => {
    try {
      const user = await User.findById(req.user.id).select("-password");
      return res.json({ profile: user });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
);

router.put(
  "/me",
  authenticate,
  async (req: any, res) => {
    try {
      const allowed = ["name", "phone", "companyName", "tinNumber"];
      const updates: any = {};

      allowed.forEach((field) => {
        if (req.body[field] !== undefined) updates[field] = req.body[field];
      });

      const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        updates,
        { new: true }
      ).select("-password");

      return res.json({ message: "Profile updated", profile: updatedUser });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
);
router.post(
  "/me/upload-image",
  authenticate,
  (req, res, next) =>
    uploadSingle("image")(req, res, (err) => {
      if (err) return res.status(400).json({ error: err.message });
      next();
    }),
  uploadProfileImage
);
router.get("/profile/:id", authenticate, getPublicUserProfile);
// =============================
// 📌 UPDATE Factory ADDRESS
// =============================
router.put("/me/location", authenticate, updateFactoryOrBusinessLocation);
// Upload verification doc (image/pdf)
router.post(
  "/me/upload-doc",
  authenticate,
  (req, res, next) => uploadSingle("file")(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    next();
  }),
  uploadVerificationDoc
);

// Change password
router.put("/me/change-password", authenticate, changePassword);

// Logout (invalidate current token)
router.post("/logout", authenticate, logout);


export default router;
