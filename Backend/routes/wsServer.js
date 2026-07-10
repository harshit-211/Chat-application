
import { WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken';
import User from './models/User.js';
import Conversation from './models/Conversation.js';
import Message from './models/Message.js';

const clients = new Map(); 

export function setupWebSocketServer(server) {
  const wss = new WebSocketServer({ server });

  wss.on('connection', async (ws, req) => {
    let userId;
    try {
      const params = new URLSearchParams(req.url.split('?')[1]);
      const token = params.get('token');
      const decoded = jwt.verify(token, process.env.SECRET);
      userId = decoded.userId;
    } catch (err) {
      ws.close(4001, 'Unauthorized'); 
      return;
    }

    if (!clients.has(userId)) {
      clients.set(userId, new Set());
    }
    clients.get(userId).add(ws);

    await User.findByIdAndUpdate(userId, { isOnline: true });
    broadcastPresence(userId, true);

    const pendingMessages = await Message.find({
      status: 'sent',
    }).populate({
      path: 'conversationId',
      match: { participants: userId },
    });

    const relevantPending = pendingMessages.filter((m) => m.conversationId && m.sender.toString() !== userId);

    if (relevantPending.length > 0) {
      ws.send(JSON.stringify({ type: 'pending_messages', messages: relevantPending }));

      const ids = relevantPending.map((m) => m._id);
      await Message.updateMany({ _id: { $in: ids } }, { status: 'delivered' });
    }

    ws.on('message', async (data) => {
      let event;
      try {
        event = JSON.parse(data);
      } catch {
        return; 
      }

      switch (event.type) {
        case 'chat':
          await handleChatMessage(userId, event);
          break;

        case 'seen':
          await handleSeen(userId, event);
          break;

        case 'typing':
          handleTyping(userId, event);
          break;

        default:
          break;
      }
    });

    ws.on('close', async () => {
      const userSockets = clients.get(userId);
      userSockets?.delete(ws);

      if (!userSockets || userSockets.size === 0) {
        clients.delete(userId);
        await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen: new Date() });
        broadcastPresence(userId, false);
      }
    });

    ws.on('error', console.error);
  });

  return wss;
}

async function handleChatMessage(senderId, event) {
  const { conversationId, messageType = 'text', content, fileMeta } = event;
  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: senderId,
  });
  if (!conversation) return;

  const savedMessage = await Message.create({
    conversationId,
    sender: senderId,
    messageType,
    content,
    fileMeta,
    status: 'sent',
  });

  await Conversation.findByIdAndUpdate(conversationId, { lastMessage: savedMessage._id });

  const populatedMessage = await savedMessage.populate('sender', 'username avatar');

  const recipients = conversation.participants.filter((id) => id.toString() !== senderId);

  let deliveredToAnyone = false;
  for (const recipientId of recipients) {
    const sockets = clients.get(recipientId.toString());
    if (sockets && sockets.size > 0) {
      deliveredToAnyone = true;
      for (const socket of sockets) {
        if (socket.readyState === socket.OPEN) {
          socket.send(JSON.stringify({ type: 'chat', message: populatedMessage }));
        }
      }
    }
  }

  if (deliveredToAnyone) {
    savedMessage.status = 'delivered';
    await savedMessage.save();
  }

  const senderSockets = clients.get(senderId);
  if (senderSockets) {
    for (const socket of senderSockets) {
      socket.send(JSON.stringify({ type: 'chat_ack', message: populatedMessage }));
    }
  }
}

async function handleSeen(userId, event) {
  const { conversationId } = event;

  const updated = await Message.updateMany(
    { conversationId, sender: { $ne: userId }, status: { $ne: 'seen' } },
    { status: 'seen' }
  );

  const conversation = await Conversation.findById(conversationId);
  const others = conversation.participants.filter((id) => id.toString() !== userId);

  for (const otherId of others) {
    const sockets = clients.get(otherId.toString());
    if (sockets) {
      for (const socket of sockets) {
        socket.send(JSON.stringify({ type: 'seen', conversationId, seenBy: userId }));
      }
    }
  }
}

function handleTyping(userId, event) {
  const { conversationId, recipientId, isTyping } = event;
  const sockets = clients.get(recipientId);
  if (sockets) {
    for (const socket of sockets) {
      socket.send(JSON.stringify({ type: 'typing', conversationId, userId, isTyping }));
    }
  }
}

async function broadcastPresence(userId, isOnline) {
  const conversations = await Conversation.find({ participants: userId });
  const notifiedUsers = new Set();

  for (const convo of conversations) {
    for (const participantId of convo.participants) {
      const idStr = participantId.toString();
      if (idStr !== userId && !notifiedUsers.has(idStr)) {
        notifiedUsers.add(idStr);
        const sockets = clients.get(idStr);
        if (sockets) {
          for (const socket of sockets) {
            socket.send(JSON.stringify({ type: 'presence', userId, isOnline }));
          }
        }
      }
    }
  }
}