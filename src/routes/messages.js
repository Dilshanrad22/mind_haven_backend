const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

// @route   POST /api/messages
// @desc    Send a message
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { receiverId, content, appointmentId } = req.body;

    if (!receiverId || !content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide receiverId and content',
      });
    }

    const message = await Message.create({
      senderId: req.user._id,
      receiverId,
      content,
      appointmentId,
    });

    // Create notification for receiver
    await Notification.create({
      userId: receiverId,
      title: 'New Message',
      message: `${req.user.name} sent you a message.`,
      type: 'message',
      relatedId: message._id,
    });

    const populated = await Message.findById(message._id)
      .populate('senderId', 'name profileImage')
      .populate('receiverId', 'name profileImage');

    res.status(201).json({
      success: true,
      data: populated,
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

// @route   GET /api/messages/conversations
// @desc    Get list of conversations
// @access  Private
router.get('/conversations', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ senderId: userId }, { receiverId: userId }],
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            $cond: [{ $eq: ['$senderId', userId] }, '$receiverId', '$senderId'],
          },
          lastMessage: { $first: '$content' },
          lastMessageDate: { $first: '$createdAt' },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$receiverId', userId] }, { $eq: ['$isRead', false] }] },
                1,
                0,
              ],
            },
          },
        },
      },
      { $sort: { lastMessageDate: -1 } },
    ]);

    // Populate user details
    const User = require('../models/User');
    const populatedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const user = await User.findById(conv._id).select('name email profileImage userType');
        return {
          userId: conv._id,
          user,
          lastMessage: conv.lastMessage,
          lastMessageDate: conv.lastMessageDate,
          unreadCount: conv.unreadCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: populatedConversations,
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

// @route   GET /api/messages/conversation/:userId
// @desc    Get messages with a specific user
// @access  Private
router.get('/conversation/:userId', protect, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const otherUserId = req.params.userId;
    const currentUserId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: currentUserId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: currentUserId },
      ],
    })
      .populate('senderId', 'name profileImage')
      .populate('receiverId', 'name profileImage')
      .sort({ createdAt: 1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    // Mark messages from other user as read
    await Message.updateMany(
      { senderId: otherUserId, receiverId: currentUserId, isRead: false },
      { isRead: true }
    );

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

// @route   PUT /api/messages/read/:userId
// @desc    Mark all messages from a user as read
// @access  Private
router.put('/read/:userId', protect, async (req, res) => {
  try {
    await Message.updateMany(
      { senderId: req.params.userId, receiverId: req.user._id, isRead: false },
      { isRead: true }
    );

    res.status(200).json({
      success: true,
      message: 'Messages marked as read',
    });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

module.exports = router;
