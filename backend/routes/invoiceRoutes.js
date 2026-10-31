import express from "express";

import {
    getInvoicesController,
    getInvoiceController,
    confirmInvoiceController,
    cancelInvoiceController
} from "../controllers/billingController.js";

import {
    authenticate,
    allowRoles
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authenticate);

router.get("/", getInvoicesController);
router.get("/:id", getInvoiceController);

router.patch(
    "/:id/confirm",
    allowRoles("admin", "staff"),
    confirmInvoiceController
);

router.patch(
    "/:id/cancel",
    allowRoles("admin", "staff"),
    cancelInvoiceController
);

export default router;