import mongoose from 'mongoose';

const BookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    index: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    minlength: 20
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative']
  },
  coverImage: {
    type: String,
    required: [true, 'Cover image is required']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Books = mongoose.model('Book', BookSchema);
export default Books;