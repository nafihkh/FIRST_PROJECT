const Payment = require("../models/Payment");

const countAll = () => Payment.countDocuments();

module.exports = { countAll };