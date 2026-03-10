const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  }
);

reviewSchema.index({ doctorId: 1 });
reviewSchema.index({ userId: 1 });

// After saving a review, update the doctor's rating
reviewSchema.post('save', async function () {
  const Review = this.constructor;
  const Doctor = require('./Doctor');

  const stats = await Review.aggregate([
    { $match: { doctorId: this.doctorId } },
    {
      $group: {
        _id: '$doctorId',
        avgRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await Doctor.findByIdAndUpdate(this.doctorId, {
      rating: Math.round(stats[0].avgRating * 10) / 10,
      totalReviews: stats[0].totalReviews,
    });
  }
});

module.exports = mongoose.model('Review', reviewSchema);
