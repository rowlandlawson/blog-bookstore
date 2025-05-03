import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: 3,
    maxlength: 100
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    minlength: 50
  },
  image: {
    type: String,
    validate: {
      validator: (v) => /\.(jpg|jpeg|png|webp)$/i.test(v),
      message: props => `${props.value} is not a valid image URL!`
    }
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  },
  updatedAt: {
    type: Date
  }
}, {
  timestamps: true
});

PostSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Posts = mongoose.model('post', PostSchema);
export default Posts;