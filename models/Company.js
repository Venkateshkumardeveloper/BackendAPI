


const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['approved', 'unapproved'], default: 'unapproved' } // default to unapproved
});

module.exports = mongoose.models.Company || mongoose.model('Company', companySchema);
