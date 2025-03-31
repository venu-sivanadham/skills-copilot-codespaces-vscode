// Create web server
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const Comment = require('./models/comment');
const dotenv = require('dotenv');
dotenv.config();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/comments';
// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Connect to MongoDB
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });
// Routes
app.get('/', (req, res) => {
  res.send('Welcome to the Comments API');
});
app.get('/comments', async (req, res) => {
  try {
    const comments = await Comment.find();
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
app.post('/comments', async (req, res) => {
  const comment = new Comment({
    name: req.body.name,
    email: req.body.email,
    message: req.body.message,
  });
  try {
    const newComment = await comment.save();
    res.status(201).json(newComment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
app.get('/comments/:id', getComment, (req, res) => {
  res.json(res.comment);
});
app.put('/comments/:id', getComment, async (req, res) => {
  if (req.body.name != null) {
    res.comment.name = req.body.name;
  }
  if (req.body.email != null) {
    res.comment.email = req.body.email;
  }
  if (req.body.message != null) {
    res.comment.message = req.body.message;
  }
  try {
    const updatedComment = await res.comment.save();
    res.json(updatedComment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
app.delete('/comments/:id', getComment, async (req, res) => {
  try {
    await res.comment.remove();
    res.json({ message: 'Deleted Comment' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// Middleware to get comment by ID
async function getComment(req, res, next) {
  let comment;
  try {
    comment = await Comment.findById(req.params.id);
    if (comment == null) {
      return res.status(404).json({ message: 'Cannot find comment' });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
  res.comment = comment;
  next();
}
// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});