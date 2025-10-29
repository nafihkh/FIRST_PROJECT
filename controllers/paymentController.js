const Task = require("../models/Tasks");
const Invoice = require("../models/Invoice");
const crypto = require("crypto");
const Payment = require("../models/Payment");
const moment = require("moment");

exports.renderCreateInvoice = async (req, res) => {
  try {
    const workerId = req.user._id;

    let tasks = await Task.find({
      worker_id: workerId,
      progress: "Completed",
    }).populate("user_id", "username");

    const taskIds = tasks.map((t) => t._id);
    const invoicedTasks = await Invoice.find({
      task_id: { $in: taskIds },
    }).select("task_id");

    const invoicedTaskIds = invoicedTasks.map((inv) => inv.task_id.toString());

    tasks = tasks.filter(
      (task) => !invoicedTaskIds.includes(task._id.toString())
    );

    res.render("worker/createinvoice", {
      tasks,
      title: "Invoice",
      activePage: "earnings",
    });
  } catch (error) {
    console.error(error);
    res.send("Error loading tasks");
  }
};

exports.createInvoice = async (req, res) => {
  try {
    const { task_id, amount, platformfee, total } = req.body;
    if (!task_id)
      return res.json({ success: false, message: "Task ID missing" });
    const task = await Task.findById(task_id).populate("user_id");
    if (!task) return res.json({ success: false, message: "Task not found" });
    const invoice = new Invoice({
      task_id,
      worker_id: req.user._id,
      user_id: task.user_id._id,
      customer_name: task.user_id.username,
      amount,
      platform_fee: platformfee,
      total_amount: total,
    });
    await invoice.save();
    return res.json({ success: true, message: "Invoice Created Successfully" });
  } catch (error) {
    console.log("Invoice Error:", error);
    return res.json({ success: false, message: "Server Error" });
  }
};

exports.renderInvoices = async (req, res) => {
  try {
    const workerId = req.user._id;

    const invoices = await Invoice.find({ worker_id: workerId })
      .populate("user_id", "username")
      .sort({ createdAt: -1 });

    res.render("worker/payments-invoice", {
      invoices,
      title: "Invoice",
      activePage: "earnings",
    });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    res.send("Failed to load invoices");
  }
};

exports.deleteInvoice = async (req, res) => {
  try {
    const invoiceId = req.params.id;
    const workerId = req.user._id;

    const invoice = await Invoice.findOne({
      _id: invoiceId,
      worker_id: workerId,
    });

    if (!invoice) {
      return res.redirect(
        "/worker/earnings/invoices?error=Unauthorized or Not Found"
      );
    }

    await Invoice.deleteOne({ _id: invoiceId });
    res.redirect("/worker/earnings/invoice");
  } catch (error) {
    console.error("Delete Error:", error);
    res.redirect("/worker/earnings/invoices?error=Failed to delete invoice");
  }
};

exports.renderInvoicesuser = async (req, res) => {
  try {
    const userId = req.user._id;

    const invoices = await Invoice.find({ user_id: userId })
      .populate("worker_id", "username")
      .sort({ createdAt: -1 });

    res.render("user/payments-invoice", {
      invoices,
      title: "Invoice",
      activePage: "earnings",
    });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    res.send("Failed to load invoices");
  }
};

exports.showInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate("user_id", "username email phone") // Fetch User details
      .populate("worker_id", "username email phone jobtittle")
      .populate("task_id", "title");

    if (!invoice) {
      return res.status(404).send("Invoice not found");
    }

    res.render("user/invoice-viewmore", {
      invoice,
      title: "Invoice",
      activePage: "earnings",
    });
  } catch (err) {
    res.status(500).send("Server Error: " + err.message);
  }
};

// Create order with transfers (90% worker, 10% platform)
const Razorpay = require("razorpay");
const Worker = require("../models/Worker");

const razor = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createOrder = async (req, res) => {
  try {
    const invoiceId = req.params.id; // ✅ correct
    const invoice = await Invoice.findById(invoiceId).populate("worker_id");
    if (!invoice)
      return res
        .status(400)
        .json({ success: false, message: "Invoice not found" });

    const worker = await Worker.findOne({ user_id: invoice.worker_id._id });
    if (!worker)
      return res
        .status(400)
        .json({ success: false, message: "Worker not found" });

    const amountPaisa = Math.round(invoice.total_amount * 100);

    const isTestMode =
      !worker.account_id ||
      worker.is_test ||
      process.env.RAZORPAY_KEY_ID.includes("test");

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

    return res.json({
      success: true,
      key: process.env.RAZORPAY_KEY_ID,
      order_id: razorOrder.id,
      amount: amountPaisa,
      test_mode: isTestMode,
    });
  } catch (err) {
    console.error("🔴 Order Creation Failed:", err);
    return res
      .status(500)
      .json({ success: false, message: err.message || "Server Error" });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, invoiceId } = req.body;
    const secret = process.env.RAZORPAY_KEY_SECRET;
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    // 1. Fetch invoice from DB early to get expected amount
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return res.status(404).json({ success: false, message: "Invoice not found" });
    }
    const invoiceAmount = Math.round(invoice.total_amount * 100);

    // 2. Fetch payment details from Razorpay API
    const paymentDetails = await razor.payments.fetch(razorpay_payment_id);
    const paidAmount = paymentDetails.amount; // in paisa

    // 3. Verify payment signature for authenticity
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }

    
    if (paidAmount !== invoiceAmount) {
      return res.status(400).json({ success: false, message: "Paid amount does not match invoice amount" });
    }

    
    invoice.status = "Paid";
    invoice.payment_id = razorpay_payment_id;
    await invoice.save();

    const payment = new Payment({
      task_id: invoice.task_id,
      worker_id: invoice.worker_id,
      user_id: invoice.user_id,
      amount: invoice.total_amount,
      status: 'completed',
    });
    await payment.save();

    return res.json({ success: true, message: "Payment verified and invoice updated", invoice });
  } catch (error) {
    console.error("Payment verification error:", error);
    return res.status(500).json({ success: false, message: "Verification failed" });
  }
};

exports.renderPayPage = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate("worker_id")
      .populate("user_id");

    if (!invoice) return res.status(404).send("Invoice not found");

    res.render("user/checkout", {
      title: "Pay Invoice",
      invoice ,
       activePage: "payments"// pass invoice to EJS
    });
  } catch (err) {
    console.error("🔴 Error rendering pay page:", err);
    res.status(500).send("Server Error");
  }
};
exports.getPayments = async (req, res) => {
  try {
    const userId = req.user._id;  // Logged-in user

    const totalPayments = await Payment.countDocuments({ user_id: userId, status: 'completed' });

    // ✅ Total Unpaid Invoices
    const unpaidInvoices = await Invoice.countDocuments({ user_id: userId, status: 'Unpaid' });
    const paymentSumData = await Payment.aggregate([
          { $match: { user_id: userId, status: 'completed' } },
          { $group: { _id: null, totalAmount: { $sum: "$amount" } } }
        ]);
    const totalSpent = paymentSumData.length ? paymentSumData[0].totalAmount : 0;
    // Get all payments for this user
    const payments = await Payment.find({ user_id: userId })
      .populate("task_id")  // if you want task name
      .sort({ createdAt: -1 });  // latest first

    res.render("user/payments", { 
      payments , 
      title: "Payments", 
      activePage: "payments",
      totalPayments,
      unpaidInvoices,
      totalSpent
     });
  } catch (error) {
    console.log(error);
    res.status(500).send("Server Error");
  }
};
exports.getPaymentsworker = async (req, res) => {
  try {
    const userId = req.user._id;  // Logged-in user

    const totalPayments = await Payment.countDocuments({ worker_id: userId, status: 'completed' });

    // ✅ Total Unpaid Invoices
    const unpaidInvoices = await Invoice.aggregate([
          { $match: { worker_id: userId, status: 'Unpaid' } },
          { $group: { _id: null, totalAmount: { $sum: "$amount" } } }
    ]);
     const totalpending = unpaidInvoices.length ? unpaidInvoices[0].totalAmount : 0;
    const paymentSumData = await Payment.aggregate([
          { $match: { worker_id: userId, status: 'completed' } },
          { $group: { _id: null, totalAmount: { $sum: "$amount" } } }
        ]);
    const totalSpent = paymentSumData.length ? paymentSumData[0].totalAmount : 0;
    // Get all payments for this user
    const payments = await Payment.find({ worker_id: userId })
      .populate("task_id")  // if you want task name
      .sort({ createdAt: -1 });  // latest first

    res.render("worker/earnings", { 
      payments , 
      title: "Payments", 
      activePage: "payments",
      totalPayments,
      totalpending,
      totalSpent
     });
  } catch (error) {
    console.log(error);
    res.status(500).send("Server Error");
  }
};

exports.renderallInvoices = async (req, res) => {
  try {
   

    const invoices = await Invoice.find().populate("user_id", "username").sort({ createdAt: -1 });

    res.render("admin/payments-invoice", {
      invoices,
      title: "Invoice",
      activePage: "earnings",
    });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    res.send("Failed to load invoices");
  }
};


exports.getPaymentsDashboard = async (req, res) => {
  try {


    const today = moment().endOf("day");
    const last7Days = moment().subtract(6, "days").startOf("day");

    // 🔍 Weekly Revenue (Only Paid invoices)
    const weeklyData = await Invoice.aggregate([
      {
        $match: {
          status: "Paid",
          createdAt: { $gte: last7Days.toDate(), $lte: today.toDate() }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          totalRevenue: { $sum: "$total_amount" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    
    let chartLabels = [];
    let chartData = [];

    for (let i = 0; i < 7; i++) {
      let day = moment(last7Days).add(i, "days");
      let dateStr = day.format("YYYY-MM-DD");

      let dayData = weeklyData.find(d => d._id === dateStr);
      chartLabels.push(day.format("ddd")); 
      chartData.push(dayData ? dayData.totalRevenue : 0);
    }


    const completed = await Invoice.aggregate([
      { $match: { status: "Paid" } },
      { $group: { _id: null, total: { $sum: "$total_amount" } } }
    ]);

   
    const totalRevenue = await Invoice.aggregate([
      { $match: { status: "Paid" } },
      { $group: { _id: null, total: { $sum: "$platform_fee" } } }
    ]);

    // ✅ Pending Payments
    const pending = await Invoice.aggregate([
      { $match: { status: "unpaid" } },
      { $group: { _id: null, total: { $sum: "$total_amount" } } }
    ]);

    // ✅ Failed/Cancelled Payments
    const failed = await Invoice.aggregate([
      { $match: {status: "Cancelled" } },
      { $group: { _id: null, total: { $sum: "$total_amount" } } }
    ]);
    console.log("Chart Data:", { chartLabels, chartData });
    res.render("admin/payments", {
      totalRevenue: totalRevenue[0]?.total || 0,
      completed: completed[0]?.total || 0,
      pending: pending[0]?.total || 0,
      failed: failed[0]?.total || 0,
      title: "Payments", 
      activePage: "payments",
       chartLabels,
      chartData
    });

  } catch (error) {
    console.log(error);
    res.status(500).send("Server Error");
  }
};