
import * as billingService from "../services/billingService.js";

// Run automatic billing
export const runBillingController = async (req, res) => {
    try {
        const result = await billingService.runBilling();

        res.json({
            status: "success",
            message: "Billing process completed",
            data: result
        });

    } catch (error) {
        console.error("Billing error:", error);

        res.status(500).json({
            status: "error",
            message: error.message
        });
    }
};

// Get invoices
export const getInvoicesController = async (req, res) => {
    try {
        const customerId =
            req.user.role === "customer" ? req.user.id : null;

        const invoices = await billingService.getAllInvoices(customerId);

        res.json({
            status: "success",
            count: invoices.length,
            data: invoices
        });

    } catch (error) {
        console.error("Invoice retrieval error:", error);

        res.status(500).json({
            status: "error",
            message: error.message
        });
    }
};

// Get invoice details
export const getInvoiceController = async (req, res) => {
    try {
        const customerId =
            req.user.role === "customer" ? req.user.id : null;

        const invoice = await billingService.getInvoiceById(
            req.params.id,
            customerId
        );

        if (!invoice) {
            return res.status(404).json({
                status: "error",
                message: "Invoice not found"
            });
        }

        res.json({
            status: "success",
            data: invoice
        });

    } catch (error) {
        console.error("Invoice details error:", error);

        res.status(500).json({
            status: "error",
            message: error.message
        });
    }
};

// Confirm invoice
export const confirmInvoiceController = async (req, res) => {
    try {
        const invoice = await billingService.confirmInvoice(req.params.id);

        if (!invoice) {
            return res.status(409).json({
                status: "error",
                message: "Invoice not found or cannot be confirmed"
            });
        }

        res.json({
            status: "success",
            message: "Invoice confirmed successfully",
            data: invoice
        });

    } catch (error) {
        console.error("Confirm invoice error:", error);

        res.status(500).json({
            status: "error",
            message: error.message
        });
    }
};

// Cancel invoice
export const cancelInvoiceController = async (req, res) => {
    try {
        const invoice = await billingService.cancelInvoice(req.params.id);

        if (!invoice) {
            return res.status(409).json({
                status: "error",
                message: "Invoice not found or cannot be cancelled"
            });
        }

        res.json({
            status: "success",
            message: "Invoice cancelled successfully",
            data: invoice
        });

    } catch (error) {
        console.error("Cancel invoice error:", error);

        res.status(500).json({
            status: "error",
            message: error.message
        });
    }
};
