const express = require('express');
const jwt = require('jsonwebtoken');
const books = require('./booksdb');
const regd_users = express.Router();
const users = [];
const isValid = username => users.some(user => user.username === username);
const authenticatedUser = (username, password) => users.some(user => user.username === username && user.password === password);
regd_users.post('/login', (req, res) => {
  const {username, password} = req.body;
  if (!username || !password) return res.status(400).json({message: 'Username and password are required'});
  if (!authenticatedUser(username, password)) return res.status(401).json({message: 'Invalid username or password'});
  const accessToken = jwt.sign({username}, 'access', {expiresIn: '1h'});
  req.session.authorization = {accessToken, username};
  return res.status(200).json({message: 'User successfully logged in'});
});
regd_users.put('/auth/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  if (!book) return res.status(404).json({message: 'Book not found'});
  const review = req.query.review ?? req.body.review;
  if (typeof review !== 'string' || !review.trim()) return res.status(400).json({message: 'Review is required'});
  book.reviews[req.username] = review;
  return res.status(200).json({message: 'Review added or updated successfully', reviews: book.reviews});
});
regd_users.delete('/auth/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  if (!book) return res.status(404).json({message: 'Book not found'});
  if (!Object.hasOwn(book.reviews, req.username)) return res.status(404).json({message: 'Your review was not found'});
  delete book.reviews[req.username];
  return res.status(200).json({message: 'Review deleted successfully', reviews: book.reviews});
});
module.exports = {authenticated: regd_users, isValid, users};
