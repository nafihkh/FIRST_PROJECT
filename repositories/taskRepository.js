const Tasks = require("../models/Tasks");

const countAll = () => Tasks.countDocuments();
const countCompleted = () => Tasks.countDocuments({ status: "completed" });

const getAll = () =>
  Tasks.find().sort({ createdAt: -1 }).populate("user_id", "username profile_photo");

const getById = (id) => Tasks.findOne({ _id: id}) 
    .populate("worker_id", "username profile_photo")
    .populate("user_id", "username profile_photo");;

const create = (data) => new Tasks(data).save();

const updateById = (id, data) => Tasks.findByIdAndUpdate(id, data, { new: true });

const deleteById = (id) => Tasks.findByIdAndDelete(id);

const getInprogressTasksByWorker = (workerId) =>
  Tasks.find({ worker_id: workerId })
       .select("title location description duration amount progress status") 
       .populate("user_id", "username profile_photo");

       
const getProgressNonTaken = () =>
  Tasks.find({
    status: {$in: ["active"]},
    progress: { $in: ["Not Taken"] }, 
    helper_id: { $exists: false },              
  })
    .sort({ createdAt: -1 })
    .populate("user_id", "username profile_photo");




module.exports = { countAll, countCompleted, getAll, create, updateById, deleteById,  getProgressNonTaken, getById,  getInprogressTasksByWorker,};