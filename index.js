import fs from 'fs';
import path from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import multer from 'multer';
import methodOverride from 'method-override';
import session from 'express-session';
import flash from 'express-flash';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

import Post from './models/posts.js';
import Content from './models/contents.js';
import Book from './models/books.js';
import Admin from './models/admin.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
}));

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(' MongoDB connected');
  } catch (error) {
    console.error(' MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

app.use((req, res, next) => {
  res.locals.userIsAuthorized = req.session.userIsAuthorized;
  next();
});

// Initialize default password
async function initializeAdmin() {
  const count = await Admin.countDocuments();
  if (count === 0) {
    const username = process.env.ADMIN_USERNAME || 'admin';
    const password = process.env.ADMIN_PASSWORD || 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);
    await Admin.create({ username, password: hashedPassword });
    console.log("✅ Admin account initialized");
  }
}

// Initialize default content
async function initializeContent() {
  const count = await Content.countDocuments();
  if (count === 0) {
    await Content.create({
      hero: {
        title: "Welcome to Our Blog",
        subtitle: "Stay updated with our latest posts"
      },
      intro: {
        content: "Egestas gravida erat enim ac morbi at malesuada arcu habitant blandit pulvinar tellus consectetur mi at suscipit sit sit pulvinar amet convallis imperdiet pretium..."
      },
      about: {
        authorsName: "Author's Name",
        content: "Diam, urna, ornare leo facilisis suspendisse eu rutrum...",
        stats: {
          booksPublished: 0,
          blogsPosted: 0
        }
      }
    });
  }
}

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(process.cwd(), 'views'));

// Middleware
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// Session configuration

// Flash messages middleware
app.use(flash());

// Update stats
async function updateStats() {
  const booksCount = await Book.countDocuments();
  const postsCount = await Post.countDocuments();

  await Content.findOneAndUpdate({}, {
    $set: {
      'about.stats.booksPublished': booksCount,
      'about.stats.blogsPosted': postsCount
    }
  });
}

// Password checker middleware
async function passwordChecker(req, res, next) {
  const { username, password } = req.body;
  const admin = await Admin.findOne({ username });
  if (admin && await bcrypt.compare(password, admin.password)) {
    req.session.userIsAuthorized = true;
  } else {
    req.session.userIsAuthorized = false;
  }
  
  next();
}

// Connect to DB and initialize content
connectDB().then(() => {
  initializeContent();
  initializeAdmin();
});

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: 'public/uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage: storage });

// Routes
app.get('/', async (req, res) => {
  try {
    const [posts, books, content] = await Promise.all([
      Post.find().sort({ createdAt: -1 }),
      Book.find().sort({ createdAt: -1 }),
      Content.findOne()
    ]);

    res.render("index", {
      posts,
      books,
      hero: content?.hero || {},
      quotes: content?.typewriterQuotes || [],
      intro: content?.intro || {},
      about: content?.about || {
        authorsName: "",
        content: "",
        stats: {
          booksPublished: 0,
          blogsPosted: 0,
          bestSellers: 0
        }
      }
    });
  } catch (err) {
    console.error('Error rendering index:', err);
    res.render('index', {
      posts: [],
      books: [],
      hero: {},
      intro: {},
      about: {},
      messages: req.flash('error', 'Failed to load page content')
    });
  }
});

app.get('/admin', (req, res) => {
  res.render('admin');
});

app.post('/login', passwordChecker, (req, res) => {
  if (req.session.userIsAuthorized) {
    res.redirect('/dashboard');
  } else {
    res.send('Invalid credentials. <a href="/admin">Try again</a>');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.redirect('/dashboard');
    }
    res.redirect('/admin');
  });
});

app.get('/reset-password', (req, res) => {
  if (!req.session.userIsAuthorized) return res.redirect('/admin');
  res.render('reset-password');
});

app.patch('/reset-password', async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const admin = await Admin.findOne({ username: process.env.ADMIN_USERNAME });

    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      req.flash('error', 'Current password is incorrect');
      return res.redirect('/reset-password');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    admin.password = hashedNewPassword;
    await admin.save();

    req.flash('success', 'Password updated successfully!');
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Password reset error:', error);
    req.flash('error', 'Failed to reset password');
    res.redirect('/reset-password');
  }
});

app.get('/dashboard', async (req, res) => {
  if (req.session.userIsAuthorized) {
    try {
      const [posts, books, content] = await Promise.all([
        Post.find().sort({ createdAt: -1 }),
        Book.find().sort({ createdAt: -1 }),
        Content.findOne()
      ]);
      
      res.render('dashboard', {
        posts: posts || [],
        books: books || [],
        hero: content?.hero || {},
        intro: content?.intro || {},
        about: content?.about || {},
        messages: req.flash()
      });
    } catch (err) {
      console.error('Dashboard loading error:', err);
      req.flash('error', 'Failed to load dashboard content');
      res.render('dashboard', {
        posts: [],
        books: [],
        hero: {},
        intro: {},
        about: {},
        messages: req.flash()
      });
    }
  } else {
    res.redirect('/admin');
  }
});

// Blog post routes
app.post('/posts', upload.single('image'), async (req, res) => {
  try {
    const { title, content } = req.body;
    const image = req.file ? '/uploads/' + req.file.filename : null;

    await Post.create({
      title,
      content,
      image,
      createdAt: new Date()
    });

    await updateStats();
    req.flash('success', 'Post created successfully!');
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Error uploading post:', error);
    req.flash('error', 'Failed to create post.');
    res.redirect('/dashboard');
  }
});

app.get('/blogs', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 }); // fetch all posts
    res.render('blogs', { posts }); // send posts (array) to the view
  } catch (err) {
    console.error('Error loading posts:', err);
    req.flash('error', 'Error loading blog posts');
    res.redirect('/');
  }
});



app.get('/edit/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      req.flash('error', 'Post not found');
      return res.redirect('/dashboard');
    }
    res.render('edit', { post });
  } catch (err) {
    console.error('Error finding post:', err);
    req.flash('error', 'Error loading post');
    res.redirect('/dashboard');
  }
});

app.patch('/posts/:id', upload.single('image'), async (req, res) => {
  try {
    const { title, content } = req.body;
    const updateData = { title, content, updatedAt: new Date() };

    if (req.file) {
      updateData.image = '/uploads/' + req.file.filename;
    }

    await Post.findByIdAndUpdate(req.params.id, updateData);
    req.flash('success', 'Post updated successfully!');
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Error updating post:', error);
    req.flash('error', 'Failed to update post.');
    res.redirect('/dashboard');
  }
});

app.delete('/posts/:id', async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    await updateStats();
    req.flash('success', 'Post deleted successfully!');
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Error deleting post:', error);
    req.flash('error', 'Failed to delete post.');
    res.redirect('/dashboard');
  }
});

// CONTENT MANAGEMENT

// Hero 
app.get('/edit-hero', async (req, res) => {
  if (req.session.userIsAuthorized) {
    const content = await Content.findOne();
    res.render('edit-hero', { hero: content.hero || {} });
  } else {
    res.redirect('/admin');
  }
});

// Save Hero
app.patch('/hero', async (req, res) => {
  try {
    const { title, subtitle } = req.body;
    await Content.findOneAndUpdate({}, { 'hero.title': title, 'hero.subtitle': subtitle });
    req.flash('success', 'Hero updated successfully!');
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Error updating hero:', error);
    req.flash('error', 'Failed to update hero');
    res.redirect('/edit-hero');
  }
});

// Intro Content
app.get('/edit-intro', async (req, res) => {
  if (req.session.userIsAuthorized) {
    const content = await Content.findOne();
    res.render('edit-intro', { intro: content.intro || {} });
  } else {
    res.redirect('/admin');
  }
});

// Save Intro
app.patch('/intro', async (req, res) => {
  try {
    const content  = req.body.introCont;
    await Content.findOneAndUpdate({}, { 'intro.content': content });
    req.flash('success', 'Intro updated successfully!');
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Error updating intro:', error);
    req.flash('error', 'Failed to update intro');
    res.redirect('/edit-intro');
  }
});

// About Content
app.get('/edit-about', async (req, res) => {
  if (req.session.userIsAuthorized) {
    const content = await Content.findOne();
    res.render('edit-about', { about: content.about || {} });
  } else {
    res.redirect('/admin');
  }
});

// Save About
// Save About (PATCH)
app.patch('/edit-about', async (req, res) => {
  try {
    const { authorsName, content, booksPublished, blogsPosted } = req.body;
    await Content.findOneAndUpdate({}, {
      'about.authorsName': authorsName,
      'about.content': content,
      'about.stats.booksPublished': booksPublished,
      'about.stats.blogsPosted': blogsPosted
    });
    req.flash('success', 'About updated successfully!');
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Error updating about:', error);
    req.flash('error', 'Failed to update about');
    res.redirect('/edit-about');
  }
});

// Books Management Section
app.get('/books', async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 }); // fetch all posts
    res.render('books', { books }); // send posts (array) to the view
  } catch (err) {
    console.error('Error loading books:', err);
    req.flash('error', 'Error loading book store');
    res.redirect('/');
  }
});

// Publish Books
app.post('/books', upload.single('coverImage'), async (req, res) => {
  try{
    const { title, description, price } = req.body;
    const coverImage =req.file? '/uploads/' + req.file.filename : null;

    if (!title || !description) {
      req.flash('error', 'Title and description are required');
      return res.redirect('/dashboard');
    }

    await Book.create({
      title,
      description,
      price,
      coverImage,
      createdAt: new Date()
    });

    await updateStats();
    req.flash('success', 'Book successfully published!');
    res.redirect('/dashboard');

  } catch (error) {
    console.error('Error uploading book:', error);
    req.flash('error', 'Failed to publish book.');
    res.redirect('/dashboard');
  }
});

// Display the Edit Book page
app.get('/edit-book/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      req.flash('error', 'Book not found');
      return res.redirect('/dashboard');
    }
    res.render('edit-book', { book });
  } catch (err) {
    console.error('Error loading book for editing:', err);
    req.flash('error', 'Failed to load book for editing');
    res.redirect('/dashboard');
  }
});

// Update a book (PATCH)
app.patch('/books/:id', upload.single('coverImage'), async (req, res) => {
  try {
    const { title, description, price } = req.body;
    const updateData = { title, description, price, updatedAt: new Date() };

  if (req.file) {
    updateData.coverImage = '/uploads/' + req.file.filename;
  }

  await Book.findByIdAndUpdate(req.params.id, updateData);
  req.flash('success', 'Book updated successfully!');
  res.redirect('/dashboard');

} catch (error){
  console.error('Error updating book:', error);
    req.flash('error', 'Failed to update book.');
    res.redirect('/dashboard');
}
});

// Delete a book (DELETE)
app.delete('/books/:id', async (req, res) => {
  try {
    await Book.findByIdAndDelete(req.params.id);
   await updateStats();
   req.flash('success', 'Book deleted successfully!');
   res.redirect('/dashboard');

  } catch (error) {
    console.error('Error deleting book:', error);
    req.flash('error', 'Failed to delete book');
    res.redirect('/dashboard');
  }
});



app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
