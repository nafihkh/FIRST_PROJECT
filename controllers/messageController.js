const Conversation = require("../models/Conversation");
const Message = require("../models/message");
const jwt = require("jsonwebtoken");

exports.getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });
    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// 📃 Get all user’s conversations
exports.getUserChats = async (req, res) => {
  try {
    const { userId } = req.params;
    const chats = await Conversation.find({
      "participants.participantId": userId,
    })
      .populate("lastMessage")
      .sort({ updatedAt: -1 });

    res.json({ success: true, chats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.createConversation = async (req, res) => {
  try {
    // 1️⃣ Get Token from Cookie
    const token = req.cookies.token; // Make sure your cookie name is 'token'
    if (!token) return res.status(401).send("Not logged in");

    // 2️⃣ Decode Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const loggedUserId = decoded.userId;
    const loggedUserType = decoded.role; // "worker" or "user"

    // 3️⃣ Get target user from URL
    const targetUserId = req.params.userId;
    const targetUserType = req.params.type;
    const tasktitle = req.params.title; // Add type in your URL

    console.log("Logged In:", loggedUserId, loggedUserType);
    console.log("Target:", targetUserId, targetUserType);

    // 4️⃣ Check if conversation already exists
    const existingConversation = await Conversation.findOne({
      "participants.participantId": { $all: [loggedUserId, targetUserId] }
    });

    if (existingConversation) {
      return res.redirect(`/${loggedUserType}/messages/${existingConversation._id}`);
    }

    // 5️⃣ Create new conversation
    const newConversation = new Conversation({
      title: tasktitle,
      participants: [
        { participantId: loggedUserId, participantType: loggedUserType },
        { participantId: targetUserId, participantType: targetUserType }
      ]
    });
    

    await newConversation.save();
    res.redirect(`/${loggedUserType}/messages/${newConversation._id}`);

  } catch (error) {
    console.error("Error creating conversation:", error);
    res.status(500).send("Server Error");
  }
};

exports.getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });
    const conversation = await Conversation.findById(conversationId);
    console.log(conversation);
    res.render("worker/messages", { messages, conversation });
  } catch (err) {
    res.status(500).send(err.message);
  }
};
exports.sendMessage = async (req, res) => {
  try {
    const { conversationId, message } = req.body;

    // 1️⃣ Get user from Token (Sender)
    const token = req.cookies.token;
    if (!token) return res.status(401).send("Not logged in");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const senderId = decoded.userId;
    const senderType = decoded.role; // "worker" or "user"

    // 2️⃣ Find Conversation to Detect Receiver
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return res.status(404).send("Conversation not found");

    // Find the participant that is NOT the sender
    const receiver = conversation.participants.find(
      (p) => p.participantId.toString() !== senderId
    );

    if (!receiver) return res.status(400).send("Receiver not found");

    const receiverId = receiver.participantId;
    const receiverType = receiver.participantType;

    // 3️⃣ Create Message in DB
    await Message.create({
      conversationId,
      senderId,
      senderType,
      receiverId,
      receiverType,
      message,
    });

    // 4️⃣ Redirect back to chat page
    res.redirect(`/${senderType}/messages/${conversationId}`);

  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).send("Server Error");
  }
};

exports.getUserConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    const conversations = await Conversation.find({
      "participants.participantId": userId
    });

    res.render("user/messages", {
      conversations,     // LEFT
      messages: [],      // RIGHT EMPTY
      currentConv: null,
      title: "Messages",
      activePage: "messages"
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error loading conversations");
  }
};
exports.getMessagesByConversationUser = async (req, res) => {
  try {
    const conversationId = req.params.conversationId;

    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 });

    const conversations = await Conversation.find({
      "participants.participantId": req.user._id
    });

    const currentConv = await Conversation.findById(conversationId);

    res.render("user/messages", {
      conversations,      // LEFT
      messages,           // RIGHT
      currentConv,
      title: "Messages",
      activePage: "messages"
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

exports.getUserConversationsworker = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    const conversations = await Conversation.find({
      "participants.participantId": userId
    });

    res.render("worker/messages", {
      conversations,     // LEFT
      messages: [],      // RIGHT EMPTY
      currentConv: null,
      title: "Messages",
      activePage: "messages"
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error loading conversations");
  }
};
exports.getMessagesByConversationworker = async (req, res) => {
  try {
    const conversationId = req.params.conversationId;

    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 });

    const conversations = await Conversation.find({
      "participants.participantId": req.user._id
    });

    const currentConv = await Conversation.findById(conversationId);

    res.render("worker/messages", {
      conversations,      // LEFT
      messages,           // RIGHT
      currentConv,
      title: "Messages",
      activePage: "messages"
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};
