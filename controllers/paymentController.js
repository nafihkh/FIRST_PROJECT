// controllers/paymentController.js
const {
  renderCreateInvoiceService,
  createInvoiceService,
  renderInvoicesService,
  deleteInvoiceService,
  renderInvoicesuserService,
  showInvoiceService,
  createOrderService,
  verifyPaymentService,
  renderPayPageService,
  getPaymentsService,
  getPaymentsworkerService,
  renderallInvoicesService,
  getPaymentsDashboardService,
} = require("../services/paymentService");

// KEEP NAME: exports.renderCreateInvoice
exports.renderCreateInvoice = async (req, res) => {
  try {
    const result = await renderCreateInvoiceService({ user: req.user });
    return res.render(result.view, result.data);
  } catch (error) {
    console.error(error);
    return res.send("Error loading tasks");
  }
};

// KEEP NAME: exports.createInvoice
exports.createInvoice = async (req, res) => {
  try {
    const { json, status } = await createInvoiceService({ user: req.user, body: req.body });
    return res.status(status).json(json);
  } catch (error) {
    console.log("Invoice Error:", error);
    return res.json({ success: false, message: "Server Error" });
  }
};

// KEEP NAME: exports.renderInvoices
exports.renderInvoices = async (req, res) => {
  try {
    const result = await renderInvoicesService({ user: req.user });
    return res.render(result.view, result.data);
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return res.send("Failed to load invoices");
  }
};

// KEEP NAME: exports.deleteInvoice
exports.deleteInvoice = async (req, res) => {
  try {
    const result = await deleteInvoiceService({ user: req.user, params: req.params });
    return res.redirect(result.redirectTo);
  } catch (error) {
    console.error("Delete Error:", error);
    return res.redirect("/worker/earnings/invoices?error=Failed to delete invoice");
  }
};

// KEEP NAME: exports.renderInvoicesuser
exports.renderInvoicesuser = async (req, res) => {
  try {
    const result = await renderInvoicesuserService({ user: req.user });
    return res.render(result.view, result.data);
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return res.send("Failed to load invoices");
  }
};

// KEEP NAME: exports.showInvoice
exports.showInvoice = async (req, res) => {
  try {
    const result = await showInvoiceService({ params: req.params });
    return res.render(result.view, result.data);
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).send(status === 404 ? "Invoice not found" : "Server Error: " + err.message);
  }
};

// KEEP NAME: exports.createOrder
exports.createOrder = async (req, res) => {
  try {
    const { json, status } = await createOrderService({ params: req.params });
    return res.status(status).json(json);
  } catch (err) {
    console.error("🔴 Order Creation Failed:", err);
    return res.status(500).json({ success: false, message: err.message || "Server Error" });
  }
};

// KEEP NAME: exports.verifyPayment
exports.verifyPayment = async (req, res) => {
  try {
    const { json, status } = await verifyPaymentService({ body: req.body });
    return res.status(status).json(json);
  } catch (error) {
    console.error("Payment verification error:", error);
    return res.status(500).json({ success: false, message: "Verification failed" });
  }
};

// KEEP NAME: exports.renderPayPage
exports.renderPayPage = async (req, res) => {
  try {
    const result = await renderPayPageService({ params: req.params });
    return res.render(result.view, result.data);
  } catch (err) {
    console.error("🔴 Error rendering pay page:", err);
    const status = err.status || 500;
    return res.status(status).send(status === 404 ? "Invoice not found" : "Server Error");
  }
};

// KEEP NAME: exports.getPayments
exports.getPayments = async (req, res) => {
  try {
    const result = await getPaymentsService({ user: req.user });
    return res.render(result.view, result.data);
  } catch (error) {
    console.log(error);
    return res.status(500).send("Server Error");
  }
};

// KEEP NAME: exports.getPaymentsworker
exports.getPaymentsworker = async (req, res) => {
  try {
    const result = await getPaymentsworkerService({ user: req.user });
    return res.render(result.view, result.data);
  } catch (error) {
    console.log(error);
    return res.status(500).send("Server Error");
  }
};

// KEEP NAME: exports.renderallInvoices
exports.renderallInvoices = async (req, res) => {
  try {
    const result = await renderallInvoicesService();
    return res.render(result.view, result.data);
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return res.send("Failed to load invoices");
  }
};

// KEEP NAME: exports.getPaymentsDashboard
exports.getPaymentsDashboard = async (req, res) => {
  try {
    const result = await getPaymentsDashboardService();
    return res.render(result.view, result.data);
  } catch (error) {
    console.log(error);
    return res.status(500).send("Server Error");
  }
};
