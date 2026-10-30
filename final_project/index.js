const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customerRoutes = require('./router/auth_users').authenticated;
const generalRoutes = require('./router/general').general;
const app = express();
app.use(express.json());
app.use('/customer', session({ secret: 'fingerprint_customer', resave: false, saveUninitialized: false }));
app.use('/customer/auth', (req, res, next) => {
  const token = req.session.authorization && req.session.authorization.accessToken;
  if (!token) return res.status(401).json({message: 'Please log in first'});
  jwt.verify(token, 'access', (err, decoded) => {
    if (err) return res.status(401).json({message: 'Invalid or expired token'});
    req.username = decoded.username;
    next();
  });
});
app.use('/customer', customerRoutes);
app.use('/', generalRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log('Server is running on port ' + PORT));
