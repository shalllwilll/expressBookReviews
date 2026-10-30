const express = require('express');
const axios = require('axios');
const books = require('./booksdb');
const {isValid, users} = require('./auth_users');
const public_users = express.Router();
public_users.get('/', (req, res) => res.status(200).json(books));
public_users.get('/isbn/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  return book ? res.status(200).json(book) : res.status(404).json({message: 'Book not found'});
});
public_users.get('/author/:author', (req, res) => {
  const matches = Object.fromEntries(Object.entries(books).filter(([, book]) => book.author.toLowerCase() === req.params.author.toLowerCase()));
  return res.status(200).json(matches);
});
public_users.get('/title/:title', (req, res) => {
  const matches = Object.fromEntries(Object.entries(books).filter(([, book]) => book.title.toLowerCase() === req.params.title.toLowerCase()));
  return res.status(200).json(matches);
});
public_users.get('/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  return book ? res.status(200).json(book.reviews) : res.status(404).json({message: 'Book not found'});
});
public_users.post('/register', (req, res) => {
  const {username, password} = req.body;
  if (typeof username !== 'string' || !username.trim() || typeof password !== 'string' || !password) return res.status(400).json({message: 'Username and password are required'});
  if (isValid(username)) return res.status(409).json({message: 'User already exists'});
  users.push({username, password});
  return res.status(201).json({message: 'User successfully registered'});
});
// Tasks 10-13: Axios clients using promises and async/await.
const api = axios.create({baseURL: 'http://localhost:5000'});
const getAllBooks = () => api.get('/').then(response => response.data);
const getBookByISBN = async isbn => (await api.get('/isbn/' + encodeURIComponent(isbn))).data;
const getBooksByAuthor = author => api.get('/author/' + encodeURIComponent(author)).then(response => response.data);
const getBooksByTitle = async title => (await api.get('/title/' + encodeURIComponent(title))).data;
module.exports = {general: public_users, getAllBooks, getBookByISBN, getBooksByAuthor, getBooksByTitle};
