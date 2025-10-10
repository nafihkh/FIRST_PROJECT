const userRepository = require("../repositories/userRepository");
const cloudinary = require("cloudinary").v2;
const bcrypt = require("bcryptjs");

const getUsers = async () => {
  return await userRepository.getAllByRole("user");
};

const findById = async (id) => {
  return await userRepository.findById(id);
};

const deleteUser = async (id) => {
  return await userRepository.deleteByIdAndRole(id, "user");
};

const updateUser = async (id, updates) => {
  return await userRepository.updateById(id, updates);
};

const toggleBlock = async (id) => {
  const user = await userRepository.findById(id);
  if (!user || user.role !== "user") return null;

  user.accessibility = !user.accessibility;
  await user.save();

  return user;
};

async function updateProfile(userId, data, file) {
  let updateData = { ...data };

  const existingUser = await userRepository.findById(userId);
  if (!existingUser) throw new Error("User not found");

  if (file && file.path) {
    const result = await cloudinary.uploader.upload(file.path, { folder: "profile_photos" });
    updateData.profile_photo = result.secure_url;
  }

  if (data.email && data.email !== existingUser.email) {
    updateData.mail_verified = false;
  }
  if (data.phone && data.phone !== existingUser.phone) {
    updateData.phone_verified = false;
  }

  return userRepository.updateById(userId, updateData);
  
}

async function updatePassword(userId, currentPassword, newPassword, confirmPassword) {
  const user = await userRepository.findById(userId);
  if (!user) throw new Error("User not found");

  if (newPassword !== confirmPassword) {
    throw new Error("Passwords do not match");
  }

  const isMatch = await bcrypt.compare(currentPassword + process.env.CUSTOM_SALT, user.password);
  if (!isMatch) throw new Error("Current password is incorrect");

  user.password = await bcrypt.hash(newPassword + process.env.CUSTOM_SALT, 10);
  await user.save();

  return true;
}

async function getSettings(userId) {
  return userRepository.findById(userId);
}

const requestWorker = async (identifier) => {
  const user = await userRepository.findByEmailOrPhone(identifier);
  if (!user) {
    return { success: false, message: "User not found" };
  }

  const updatedUser = await userRepository.updateWorkerStatus(user._id, false);

  return {
    success: true,
    message: "Wait for Admin approval to become a Worker",
    data: updatedUser,
  };
};


module.exports = {
  findById,
  getUsers,
  deleteUser,
  updateUser,
  toggleBlock,
  updateProfile,
  updatePassword,
  getSettings,
  requestWorker,
};
