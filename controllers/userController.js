const userService = require("../services/userService");

exports.getUsers = async (req, res) => {
  try {
    const users = await userService.getUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await userService.deleteUser(req.params.id);
    if (!user) return res.status(400).json({ error: "User not found" });

    res.json({ message: "User deleted successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.toggleBlock = async (req, res) => {
  try {
    const user = await userService.toggleBlock(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({
      message: `User ${user.accessibility ? "unblocked" : "blocked"}`,
      accessibility: user.accessibility,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
