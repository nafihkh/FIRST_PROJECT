const Conversation = require("../models/Conversation");
const Message = require("../models/message");
const jwt = require("jsonwebtoken");

// 📤 Send message
// exports.sendMessage = async (req, res) => {
//   try {
//     const { senderId, receiverId, senderType, receiverType, message } = req.body;

//     if (!senderId || !receiverId || !senderType || !receiverType || !message)
//       return res.status(400).json({ success: false, message: "All fields required" });

//     // 1️⃣ Find or create conversation
//     let conversation = await Conversation.findOne({
//       participants: {
//         $all: [
//           { $elemMatch: { participantId: senderId } },
//           { $elemMatch: { participantId: receiverId } },
//         ],
//       },
//     });

//     if (!conversation) {
//       conversation = await Conversation.create({
//         participants: [
//           { participantId: senderId, participantType: senderType },
//           { participantId: receiverId, participantType: receiverType },
//         ],
//       });
//     }

//     // 2️⃣ Create message
//     const newMessage = await Message.create({
//       conversationId: conversation._id,
//       senderId,
//       receiverId,
//       senderType,
//       receiverType,
//       message,
//     });

//     // 3️⃣ Update conversation last message
//     conversation.lastMessage = newMessage._id;
//     await conversation.save();

//     res.status(201).json({
//       success: true,
//       message: "Message sent successfully",
//       data: newMessage,
//     });
//   } catch (err) {
//     console.error("Error sending message:", err);
//     res.status(500).json({ success: false, error: err.message });
//   }
// };

// 💬 Get all messages between two participants
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
    const targetUserType = req.params.type; // Add type in your URL

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
    res.render("worker/messages", { messages });
  } catch (err) {
    res.status(500).send(err.message);
  }
};
exports.getConversationMessagesuser = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });
    res.render("user/messages", { messages });
  } catch (err) {
    res.status(500).send(err.message);
  }
};
// ✉️ Send Message (Automatic Sender & Receiver)
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

const Conversation = require("../models/Conversation");
const Message = require("../models/message");
const jwt = require("jsonwebtoken");

// 📤 Send message
// exports.sendMessage = async (req, res) => {
//   try {
//     const { senderId, receiverId, senderType, receiverType, message } = req.body;

//     if (!senderId || !receiverId || !senderType || !receiverType || !message)
//       return res.status(400).json({ success: false, message: "All fields required" });

//     // 1️⃣ Find or create conversation
//     let conversation = await Conversation.findOne({
//       participants: {
//         $all: [
//           { $elemMatch: { participantId: senderId } },
//           { $elemMatch: { participantId: receiverId } },
//         ],
//       },
//     });

//     if (!conversation) {
//       conversation = await Conversation.create({
//         participants: [
//           { participantId: senderId, participantType: senderType },
//           { participantId: receiverId, participantType: receiverType },
//         ],
//       });
//     }

//     // 2️⃣ Create message
//     const newMessage = await Message.create({
//       conversationId: conversation._id,
//       senderId,
//       receiverId,
//       senderType,
//       receiverType,
//       message,
//     });

//     // 3️⃣ Update conversation last message
//     conversation.lastMessage = newMessage._id;
//     await conversation.save();

//     res.status(201).json({
//       success: true,
//       message: "Message sent successfully",
//       data: newMessage,
//     });
//   } catch (err) {
//     console.error("Error sending message:", err);
//     res.status(500).json({ success: false, error: err.message });
//   }
// };

// 💬 Get all messages between two participants
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
// exports.getConversationMessagesuser = async (req, res) => {
//   try {
//     const { conversationId } = req.params;
//     const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });
//      const conversation = await Conversation.findById(conversationId);
//     res.render("user/messages", { messages, conversation });
//   } catch (err) {
//     res.status(500).send(err.message);
//   }
// };
// ✉️ Send Message (Automatic Sender & Receiver)
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

// exports.getUserConversations = async (req, res) => {
//   try {
//     const userId = req.user.id;        // From token middleware
//     const userRole = req.user.role;

//      const { conversationId } = req.params;
//     const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });
//     const currentConv = await Conversation.findById(conversationId);    // "user" or "worker"
//     const conversations = await Conversation.find({
//       participants: {
//         $elemMatch: {
//           participantId: userId,
//           participantType: userRole
//         }
//       }
//     }).populate("participants.participantId", "name");


//     res.render("user/messages-copy", { conversations,messages,conversationId ,currentConv,title: "Messages", activePage: "messages"});

//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Error loading conversations");
//   }
// };

exports.getUserConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    const conversations = await Conversation.find({
      "participants.participantId": userId
    });

    res.render("user/messages-copy", {
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

    res.render("user/messages-copy", {
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


