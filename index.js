const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// password - BhFNl7tGtEiDnomq
mongoose.connect('mongodb+srv://akhiranandanp89548:BhFNl7tGtEiDnomq@cluster0.c0kx4tz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', { useNewUrlParser: true,  useUnifiedTopology: true });

const postSchema = new mongoose.Schema({
    title: String,
    body: String,
    tags: [String],
    status: { type: String, enum: ['published', 'draft'], default: 'draft'},
    comments: [{ body: String, date: {type: Date, default: Date.now }}],
});

const Post = mongoose.model('Post', postSchema);

const app = express();
app.use(bodyParser.json());

//------------------ BLOG POST MANAGEMENT --------------------------

// to create a post 
app.post('/post', async(req, res) => {
    const { title, body, tags, status } = req.body;
    const post = new Post({ title, body, tags, status });
    await post.save();
    res.status(201).send(post);
});

// to edit a post
app.put('/post/:id', async(req, res) => {
    const {id} = req.params;
    const { title, body, tags, status } = req.body;
    const post = await Post.findByIdAndUpdate(id, { title, body, tags, status }, {new: true});
    res.send(post);
});

// to delete a post
app.delete('/post/:id', async(req, res) => {
    const {id} = req.params;
    await Post.findByIdAndDelete(id);
    res.status(204).send();
});

// to save draft
app.post('/post/draft', async(req, res) => {
    const { title, body, tags } = req.body;
    const post = new Post({ title, body, tags, status: 'draft' });
    await post.save();
    res.status(201).send(post);
});

//------------------ BLOG VIEWING --------------------------

// List Posts
app.get('/posts', async(req, res) => {
    const posts = await Post.find({ status: 'published' });
    res.send(posts);
});

// View Post
app.get('/post/:id', async(req, res) => {
    const { id } = req.params;
    const post = await Post.findById(id);
    res.send(post);
});

// to comment
app.post('/post/:id/comment', async(req, res) => {
    const { id } = req.params;
    const { body } = req.body;
    const post = await Post.findById(id);
    post.comments.push({ body });
    await post.save();
    res.status(201).send(post);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});