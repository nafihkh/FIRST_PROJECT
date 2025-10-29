const Conversation = require("../models/Conversation");
const Message = require("../models/message");
const jwt = require("jsonwebtoken");

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
    const tasktitle = req.params.title;
    const taskId = req.params.taskId; // Add type in your URL
    console.log("Logged In:", loggedUserId, loggedUserType);
    console.log("Target:", targetUserId, targetUserType);

    // 4️⃣ Check if conversation already exists
   const existingConversation = await Conversation.findOne({task_id: taskId});

    if (existingConversation) {
      return res.redirect(`/${loggedUserType}/messages/${existingConversation._id}`);
    }

    // 5️⃣ Create new conversation
    const newConversation = new Conversation({
      title: tasktitle,
      task_id: taskId,
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

   
    const token = req.cookies.token;
    if (!token) return res.status(401).send("Not logged in");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const senderId = decoded.userId;
    const senderType = decoded.role; 

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return res.status(404).send("Conversation not found");

   
    const receiver = conversation.participants.find(
      (p) => p.participantId.toString() !== senderId
    );

    if (!receiver) return res.status(400).send("Receiver not found");

    const receiverId = receiver.participantId;
    const receiverType = receiver.participantType;

   
    await Message.create({
      conversationId,
      senderId,
      senderType,
      receiverId,
      receiverType,
      message,
    });

    
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
      conversations,   
      messages: [],     
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
      conversations,    
      messages,           
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
      conversations,   
      messages: [],     
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
      conversations,      
      messages,           
      currentConv,
      title: "Messages",
      activePage: "messages"
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};
