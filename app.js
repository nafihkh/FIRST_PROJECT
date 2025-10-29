const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const http = require("http");
const { Server } = require("socket.io");
const { setupChatSocket } = require("./sockets/chatSocket");
require("dotenv").config();

const PORT = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

if (process.env.NODE_ENV !== "production") {
  app.set("view cache", false);
}

app.use(morgan("dev"));
app.use(cookieParser());
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride("_method"));

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("DB Error:", err));

// Existing routes
const workerAuthRouter = require("./routes/workerAuthRoutes");
const userAuthRouter = require("./routes/userAuthRoutes");
const adminAuthRouter = require("./routes/adminAuthRoutes");
const userRoutes = require("./routes/userRoutes");
const workerRoutes = require("./routes/workerRoutes");
const adminRoutes = require("./routes/adminRoutes");

app.use("/auth/worker", workerAuthRouter);
app.use("/auth/user", userAuthRouter);
app.use("/auth/admin", adminAuthRouter);

app.use("/admin", adminRoutes);
app.use("/user", userRoutes);
app.use("/worker", workerRoutes);

app.get("/", (req, res) => {
  res.render("jobseek");
});

// Setup Socket.IO chat system
setupChatSocket(io);

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
