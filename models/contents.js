import mongoose from 'mongoose';

const ContentSchema = new mongoose.Schema({
  hero: {
    title: {
      type: String,
      required: true,
      trim: true
    },
    subtitle: {
      type: String,
      trim: true
    }
  },
  intro: {
    title: {
      type: String,
      trim: true
    },
    content: {
      type: String,
      trim: true
    }
  },
  about: {
    authorsName: {
      type: String,
      trim: true
    },
    content: {
      type: String,
      trim: true
    },
    stats: {
      booksPublished: {
        type: Number,
        default: 0,
        min: 0
      },
      blogsPosted: {
        type: Number,
        default: 0,
        min: 0
      },
    }
  }
}, {
  timestamps: true
});

const Contents = mongoose.model('Content', ContentSchema);
export default Contents;
