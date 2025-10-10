const taskService = require("../services/taskService");

exports.getTask = async (req, res) => {
  try {
    const tasks = await taskService.getTasks();
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
};

exports.createTask = async (req, res) => {
   console.log("📸 FILE:", req.file);
console.log("📦 BODY:", req.body);
  try {
    req.body.user_id = req.user._id;
    const task = await taskService.createTask(req.body, req.file);
   
    res.status(201).json({ message: "Task Created Successfully", task });
  } catch (err) {
      console.error("TASK CREATE ERROR:", err.message);
    res.status(500).json({ error: "Server Error" });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const task = await taskService.updateTask(req.params.id, req.body);
    res.json(task);
  } catch (err) {
    console.error(err);
    if (err.message === "Task not found") {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: "Server Error" });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const result = await taskService.deleteTask(req.params.id);
    res.json(result);
  } catch (err) {
    console.error(err);
    if (err.message === "Task not found") {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: "Server Error" });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const task = await taskService.updateStatus(req.params.id, req.body.status);
    res.json(task);
  } catch (err) {
    console.error(err);
    if (err.message === "Task not found") {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: "Server Error" });
  }
};

exports.getProgressNonTakenTasks = async (req, res) => {
  try {
    const tasks = await taskService.getProgressNonTakenTasks();
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
};

exports.getActiveTasks = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const workerId = req.user._id;
        const tasks = await taskService.fetchInprogressTasks(workerId);
        res.json(tasks);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
}

exports.viewMoreTask = async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const task = await taskService.getTaskById(taskId);

    if (!task) {
      return res.status(404).json({ massage: "Task not found" })
    }
    res.render("worker/task-details", {
      title: "Task Details",
      activePage: "activejobs",
      task,

    });

    // res.render("worker/activejobs/viewmore", { task });
  } catch (error) {
    console.error("Error loading task details:", error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getUserTasks = async (req, res) => {
  try {
    const userId = req.user._id;
    const tasks = await taskService.getTasksByUser(userId);

    res.render("user/createpost", {
      title: "Create Post",
      activePage: "createpost",
      tasks,
    });
  } catch (err) {
    console.error("GET USER TASKS ERROR:", err);
    res.status(500).render("error", { message: "Server Error" });
  }
};