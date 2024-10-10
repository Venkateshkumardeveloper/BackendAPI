const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['IT_ADMIN', 'IT_USER_NORMAL'], default: 'IT_USER_NORMAL' },
  email: { type: String, required: true },
  mobile: { type: String, required: true }
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
