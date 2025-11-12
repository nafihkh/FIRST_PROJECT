// services/paymentService.js
const moment = require("moment");
const crypto = require("crypto");
const {
  findCompletedTasksByWorker,
  findTaskByIdWithUser,
  getById,
} = require("../repositories/taskRepository");
const {
  findInvoiceById,
  findInvoicesByWorker,
  findInvoicesByUser,
  findAllInvoices,
  findInvoicesByTaskIdsSelectOnlyTaskId,
  createInvoice,
  deleteInvoiceById,
  aggregatePaidBetweenForRevenue,
  aggregateSumByStatusField,
  aggregateSumPlatformFeePaid,
} = require("../repositories/invoicesRepository");
const {
  createPayment,
  countCompletedPaymentsByUser,
  sumCompletedPaymentsAmountByUser,
  findPaymentsByUser,
  countCompletedPaymentsByWorker,
  sumCompletedPaymentsAmountByWorker,
  findPaymentsByWorker,
} = require("../repositories/paymentRepository");
const { findWorkerByUserId } = require("../repositories/workerRepository");
const razor = require("../config/razorpay");

// Render worker create-invoice page
async function renderCreateInvoiceService({ user }) {
  const workerId = user._id;

  let tasks = await findCompletedTasksByWorker(workerId);
  const taskIds = tasks.map((t) => t._id);
  const invoiced = await findInvoicesByTaskIdsSelectOnlyTaskId(taskIds);
  const invoicedTaskIds = invoiced.map((inv) => inv.task_id.toString());
  tasks = tasks.filter((t) => !invoicedTaskIds.includes(t._id.toString()));

  return {
    view: "worker/createinvoice",
    data: {
      tasks,
      title: "Invoice",
      activePage: "earnings",
    },
  };
}

// Create invoice
async function createInvoiceService({ user, body }) {
  const { task_id, amount, platformfee, total } = body;
  if (!task_id) {
    return { json: { success: false, message: "Task ID missing" }, status: 200 };
  }

  const task = await findTaskByIdWithUser(task_id);
  if (!task) {
    return { json: { success: false, message: "Task not found" }, status: 200 };
  }

  const invoiceDoc = await createInvoice({
    task_id,
    worker_id: user._id,
    user_id: task.user_id._id,
    customer_name: task.user_id.username,
    amount,
    platform_fee: platformfee,
    total_amount: total,
  });

  return {
    json: { success: true, message: "Invoice Created Successfully" },
    status: 200,
  };
}

// Render worker invoices
async function renderInvoicesService({ user }) {
  const workerId = user._id;
  const invoices = await findInvoicesByWorker(workerId, { populateUser: true, sortDesc: true });

  return {
    view: "worker/payments-invoice",
    data: {
      invoices,
      title: "Invoice",
      activePage: "earnings",
    },
  };
}

// Delete invoice
async function deleteInvoiceService({ user, params }) {
  const invoiceId = params.id;
  const workerId = user._id;

  const invoice = await findInvoiceById(invoiceId, {
    ensureWorker: workerId,
  });
  if (!invoice) {
    return { redirectTo: "/worker/earnings/invoices?error=Unauthorized or Not Found" };
  }

  await deleteInvoiceById(invoiceId);
  return { redirectTo: "/worker/earnings/invoice" };
}

// Render user invoices
async function renderInvoicesuserService({ user }) {
  const userId = user._id;
  const invoices = await findInvoicesByUser(userId, { populateWorker: true, sortDesc: true });

  return {
    view: "user/payments-invoice",
    data: {
      invoices,
      title: "Invoice",
      activePage: "earnings",
    },
  };
}

// Show invoice details
async function showInvoiceService({ params }) {
  const invoice = await findInvoiceById(params.id, {
    populateUserFull: true,
    populateWorkerFull: true,
    populateTaskTitle: true,
  });
  if (!invoice) {
    const err = new Error("Invoice not found");
    err.status = 404;
    throw err;
  }

  return {
    view: "user/invoice-viewmore",
    data: {
      invoice,
      title: "Invoice",
      activePage: "earnings",
    },
  };
}

// Create Razorpay order with optional transfer
async function createOrderService({ params }) {
  const invoiceId = params.id;
  const invoice = await findInvoiceById(invoiceId, { populateWorkerRef: true });
  if (!invoice) {
    return { json: { success: false, message: "Invoice not found" }, status: 400 };
  }

  const worker = await findWorkerByUserId(invoice.worker_id._id);
  if (!worker) {
    return { json: { success: false, message: "Worker not found" }, status: 400 };
  }

  const amountPaisa = Math.round(invoice.total_amount * 100);
  const isTestMode =
    !worker.account_id ||
    worker.is_test ||
    (process.env.RAZORPAY_KEY_ID || "").includes("test");

  const orderData = {
    amount: amountPaisa,
    currency: "INR",
    receipt: isTestMode ? `test_inv_${invoiceId}` : `inv_${invoiceId}`,
  };

  if (!isTestMode) {
    orderData.transfers = [
      {
        account: worker.account_id,
        amount: amountPaisa,
        currency: "INR",
        notes: { worker: worker.username },
      },
    ];
  }

  const razorOrder = await razor.orders.create(orderData);

  return {
    json: {
      success: true,
      key: process.env.RAZORPAY_KEY_ID,
      order_id: razorOrder.id,
      amount: amountPaisa,
      test_mode: isTestMode,
    },
    status: 200,
  };
}

// Verify payment and record
async function verifyPaymentService({ body }) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, invoiceId } = body;
  const secret = process.env.RAZORPAY_KEY_SECRET;

  const invoice = await findInvoiceById(invoiceId);
  const task = await getById(invoice.task_id);
  if (!invoice) {
    return { json: { success: false, message: "Invoice not found" }, status: 404 };
  }

  const invoiceAmount = Math.round(invoice.total_amount * 100);
  const paymentDetails = await razor.payments.fetch(razorpay_payment_id);
  const paidAmount = paymentDetails.amount;

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update((razorpay_order_id + "|" + razorpay_payment_id).toString())
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return { json: { success: false, message: "Invalid payment signature" }, status: 400 };
  }

  if (paidAmount !== invoiceAmount) {
    return { json: { success: false, message: "Paid amount does not match invoice amount" }, status: 400 };
  }

  task.progress = "Completed";
  task.completed_at = new Date();
  invoice.status = "Paid";
  invoice.payment_id = razorpay_payment_id;
  await invoice.save();
  await task.save();

  await createPayment({
    task_id: invoice.task_id,
    worker_id: invoice.worker_id,
    user_id: invoice.user_id,
    amount: invoice.total_amount,
    invoice_id: invoice._id, 
    status: "completed",
  });

  return {
    json: { success: true, message: "Payment verified and invoice updated", invoice },
    status: 200,
  };
}

// Render pay page
async function renderPayPageService({ params }) {
  const invoice = await findInvoiceById(params.id, {
    populateWorkerRef: true,
    populateUserRef: true,
  });
  if (!invoice) {
    const err = new Error("Invoice not found");
    err.status = 404;
    throw err;
  }

  return {
    view: "user/checkout",
    data: {
      title: "Pay Invoice",
      invoice,
      activePage: "payments",
    },
  };
}

// User payments summary and list
async function getPaymentsService({ user }) {
  const userId = user._id;

  const totalPayments = await countCompletedPaymentsByUser(userId);
  const unpaidInvoices = await aggregateSumByStatusField({
    status: "Unpaid",
    match: { user_id: userId },
    field: "1", // using countDocuments-like default; but we need count not sum amount
  });

  // Aggregate unpaid count for user (countDocuments equivalent)
  const unpaidInvoicesCount = await require("../repositories/invoicesRepository").countInvoicesBy({
    user_id: userId,
    status: "Unpaid",
  });

  const totalSpent = await sumCompletedPaymentsAmountByUser(userId);
  const payments = await findPaymentsByUser(userId);

  return {
    view: "user/payments",
    data: {
      payments,
      title: "Payments",
      activePage: "payments",
      totalPayments,
      unpaidInvoices: unpaidInvoicesCount,
      totalSpent,
    },
  };
}

// Worker earnings summary and list
async function getPaymentsworkerService({ user }) {
  const workerId = user._id;

  const totalPayments = await countCompletedPaymentsByWorker(workerId);

  // Pending (sum of amount for Unpaid)
  const pendingAgg = await require("../repositories/invoicesRepository").aggregateSum({
    match: { worker_id: workerId, status: "Unpaid" },
    field: "amount",
  });
  const totalpending = pendingAgg || 0;

  const totalSpent = await sumCompletedPaymentsAmountByWorker(workerId);
  const payments = await findPaymentsByWorker(workerId);

  return {
    view: "worker/earnings",
    data: {
      payments,
      title: "Payments",
      activePage: "earnings",
      totalPayments,
      totalpending,
      totalSpent,
    },
  };
}

// Admin all invoices
async function renderallInvoicesService() {
  const invoices = await findAllInvoices({ populateUser: true, sortDesc: true });

  return {
    view: "admin/payments-invoice",
    data: {
      invoices,
      title: "Invoice",
      activePage: "earnings",
    },
  };
}

// Admin payments dashboard
async function getPaymentsDashboardService() {
  const today = moment().endOf("day");
  const last7Days = moment().subtract(6, "days").startOf("day");

  const weeklyData = await aggregatePaidBetweenForRevenue({
    start: last7Days.toDate(),
    end: today.toDate(),
  });

  const chartLabels = [];
  const chartData = [];
  for (let i = 0; i < 7; i++) {
    const day = moment(last7Days).add(i, "days");
    const dateStr = day.format("YYYY-MM-DD");
    const dayData = weeklyData.find((d) => d._id === dateStr);
    chartLabels.push(day.format("ddd"));
    chartData.push(dayData ? dayData.totalRevenue : 0);
  }

  const completed = await require("../repositories/invoicesRepository").aggregateSum({
    match: { status: "Paid" },
    field: "total_amount",
  });

  const totalRevenue = await aggregateSumPlatformFeePaid();

  const pending = await require("../repositories/invoicesRepository").aggregateSum({
    match: { status: "unpaid" },
    field: "total_amount",
  });

  const failed = await require("../repositories/invoicesRepository").aggregateSum({
    match: { status: "Cancelled" },
    field: "total_amount",
  });

  return {
    view: "admin/payments",
    data: {
      totalRevenue: totalRevenue || 0,
      completed: completed || 0,
      pending: pending || 0,
      failed: failed || 0,
      title: "Payments",
      activePage: "payments",
      chartLabels,
      chartData,
    },
  };
}

module.exports = {
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
};
