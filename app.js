const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const http = require("http");
const { Server } = require("socket.io");
const { setupChatSocket } = require("./sockets/chatSocket");
const cors = require("cors");
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

mongoose.connection.on("connected", () => console.log("MongoDB connected"));
mongoose.connection.on("error", err => console.error("MongoDB error:", err));
mongoose.connection.on("disconnected", () => console.warn("MongoDB disconnected"));

const connectWithRetry = () => {
  mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
  }).catch(() => {
    console.log("Retrying MongoDB connection in 5s...");
    setTimeout(connectWithRetry, 5000);
  });
};

connectWithRetry();
app.use(cors({
  origin: "http://3.27.49.132:5000", // or your frontend URL
  credentials: true
}));

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

app.use((req, res, next) => {
  res.status(404).render("404");
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
