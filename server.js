const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());

// In-memory storage for OTPs (key: phone, value: otp)
const otpStore = {};

// Sample users for login
const users = [
  {
    id: 1,
    name: 'Farmer John',
    email: 'john@example.com',
    phone: '9876543210',
    role: 'Farmer'
  },
  {
    id: 2,
    name: 'Consumer Jane',
    email: 'jane@example.com',
    phone: '9876543211',
    role: 'Consumer'
  }
];

// Endpoint to send OTP
app.post('/api/login/send-otp', (req, res) => {
  const { phone } = req.body;
  if (!phone || !/^\d{10}$/.test(phone)) {
    return res.status(400).json({ error: 'Invalid phone number' });
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[phone] = otp;

  console.log(`OTP for ${phone}: ${otp}`); // For testing purposes

  res.json({ message: 'OTP sent successfully' });
});

// Endpoint to login with OTP
app.post('/api/login', (req, res) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) {
    return res.status(400).json({ error: 'Phone and OTP are required' });
  }

  const storedOtp = otpStore[phone];
  if (!storedOtp || storedOtp !== otp) {
    return res.status(401).json({ error: 'Invalid OTP' });
  }

  // Find user by phone
  const user = users.find(u => u.phone === phone);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Clear OTP after successful login
  delete otpStore[phone];

  res.json({ message: 'Login successful', user });
});

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
