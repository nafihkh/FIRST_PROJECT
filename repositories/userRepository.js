const User = require("../models/User");

const countByRole = (role) => User.countDocuments({ role });

const findById = (id) => User.findById(id);


const updateById = (id, updateData) => 
  User.findByIdAndUpdate(id, updateData, { new: true });


const findByEmail = (email) => User.findOne({ email });
const findByPhone = (phone) => User.findOne({ phone });

const findByEmailAndRole = (email, role) => User.findOne({ email, role });


const createUser = (data) => new User(data).save();

const updateUser = (id, data) => 
  User.findByIdAndUpdate(id, data, { new: true });


const deleteByIdAndRole = (id, role) => 
  User.findOneAndDelete({ _id: id, role });

const findByEmailOrPhone = async (identifier) => {
  return await User.findOne({
    $or: [{ email: identifier }, { phone: identifier }],
  });
};

const updateWorkerStatus = async (userId, status) => {
  return await User.findByIdAndUpdate(
    userId,
    { worker_status: status },
    { new: true }
  );
};

const getAllByRole = (role) => 
  User.find({ role })
    .select("username profile_photo status accessibility last_active")
    .sort({ created_at: -1 });

module.exports = {
  countByRole,
  findById,
  updateById,
  findByEmail,
  findByEmailAndRole,
  createUser,
  updateUser,
  deleteByIdAndRole,
  getAllByRole,
  findByPhone,
  findByEmailOrPhone,
  updateWorkerStatus,
};