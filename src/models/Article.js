const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Article title is required'],
      maxlength: 200,
    },
    content: {
      type: String,
      required: [true, 'Article content is required'],
    },
    summary: {
      type: String,
      maxlength: 500,
    },
    author: {
      type: String,
      default: 'Mind Haven Team',
    },
    category: {
      type: String,
      enum: ['anxiety', 'depression', 'stress', 'relationships', 'self-care', 'mindfulness', 'general'],
      default: 'general',
    },
    tags: [String],
    imageUrl: {
      type: String,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    readTime: {
      type: Number,
      default: 5,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

articleSchema.index({ category: 1 });
articleSchema.index({ isPublished: 1 });

module.exports = mongoose.model('Article', articleSchema);
