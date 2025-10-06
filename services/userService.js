const userRepository = require("../repositories/userRepository");

const getUsers = async () => {
  return await userRepository.getAllByRole("user");
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

module.exports = {
  getUsers,
  deleteUser,
  updateUser,
  toggleBlock,
};
