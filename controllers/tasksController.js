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
exports.getReports = async (req, res) => {
  try {
    const reports = await taskService.getReports();

    if (!reports) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }
     res.render("admin/taskreport", {
      title: "Task Reports",
      activePage: "Reports",
      reports,

    });
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
    
    res.json({ message: "User deleted successfully!" });
  } catch (err) {
    console.error(err);
    if (err.message === "Task not found") {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: "Server Error" });
  }
};

exports.deleteReport = async (req, res) => {
  try {
    const result = await taskService.deleteReport(req.params.id);
    res.json(result);
  } catch (err) {
    console.error(err);
    if (err.message === "Report not found") {
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
exports.createReport = async (req, res) => {
  try {
    // 1️⃣ Get the task by ID (from route param)
    const taskId = req.params.id;
    const task = await taskService.getTaskById(taskId);
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    // 2️⃣ Build report data from the request
    const reportData = {
      task_id: taskId,                          
      created_by: req.user._id,                
      summary: req.body.summary,                                   
      created_at: new Date()
    };

    const newReport = await taskService.createReport(reportData);

    return res.status(201).json({
      success: true,
      message: "Report created successfully",
      report: newReport
    });

  } catch (error) {
    console.error("Error creating report:", error);
    res.status(500).json({ success: false, message: "Server error" });
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
exports.taskprogress = async (req, res) => {
try {
    const taskId = req.params.task;
    const task = await taskService.updateProgress(taskId, "Submitted");

     if (!task) {
      return res.status(404).send("Task not found");
    }

    res.redirect(`/worker/activejobs/viewmore/${taskId}`);
} catch (err) {
    console.error("GET USER TASKS ERROR:", err);
    res.status(500).render("error", { message: "Server Error" });
}
};

exports.getSubmittedTasks = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log("USER ID:", userId);
    const tasks = await taskService.getTasksByProgress(userId);
    const history = await taskService.getTasksCompleted(userId);
    console.log("TASKS FOUND:", history.length);
      console.log("TASKS FOUND:", tasks.length);

    res.render("user/approvals", {
      title: "Approvals",
      activePage: "approvals",
      tasks,
      history,
    });
  } catch (err) {
    console.error("GET USER TASKS ERROR:", err);
    res.status(500).render("error", { message: "Server Error" });
  }
};

// changes in rateTask controller method:

exports.rateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Invalid rating value" });
    }

    await taskService.rateTask(id, Number(rating));

    res.json({ message: "Rating saved and worker updated successfully" });
  } catch (err) {
    console.error("Error rating task:", err);
    res.status(500).json({ error: err.message || "Error updating rating" });
  }
};
exports.taskapprove = async (req, res) => {
try {
    const taskId = req.params.task;
    const task = await taskService.updateProgress(taskId, "Completed");

     if (!task) {
      return res.status(404).send("Task not found");
    }

    res.redirect(`/user/approvals`);
} catch (err) {
    console.error("GET USER TASKS ERROR:", err);
    res.status(500).render("error", { message: "Server Error" });
}
};
exports.taskreject = async (req, res) => {
try {
    const taskId = req.params.task;
    const task = await taskService.updateProgress(taskId, "InProgress");

     if (!task) {
      return res.status(404).send("Task not found");
    }

    res.redirect(`/user/approvals`);
} catch (err) {
    console.error("GET USER TASKS ERROR:", err);
    res.status(500).render("error", { message: "Server Error" });
}
};
