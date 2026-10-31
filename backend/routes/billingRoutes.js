
import express from "express";

import {
    runBillingController,
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

// All invoice routes require authentication
router.use(authenticate);

// Run billing: admin and staff only
router.post(
    "/run",
    allowRoles("admin", "staff"),
    runBillingController
);

// View invoices: admin, staff and customers
router.get("/", getInvoicesController);

// View individual invoice
router.get("/:id", getInvoiceController);

// Confirm invoice
router.patch(
    "/:id/confirm",
    allowRoles("admin", "staff"),
    confirmInvoiceController
);

// Cancel invoice
router.patch(
    "/:id/cancel",
    allowRoles("admin", "staff"),
    cancelInvoiceController
);

export default router;
