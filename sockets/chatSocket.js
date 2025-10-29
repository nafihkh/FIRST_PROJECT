const Message = require("../models/message");

const setupChatSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

   
    socket.on("join", (userId) => {
      socket.join(userId);
      console.log(`User joined room: ${userId}`);
    });

   
    socket.on("sendMessage", async (data) => {
      const { senderId, receiverId, senderType, receiverType, message } = data;

      const newMessage = await Message.create({
        senderId,
        receiverId,
        senderType,
        receiverType,
        message,
      });

    
      io.to(receiverId).emit("receiveMessage", newMessage);
    
      io.to(senderId).emit("messageSent", newMessage);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });
};

module.exports = { setupChatSocket };
