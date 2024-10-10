
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Company = require('../models/Company');
const { authenticateToken, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Register User
router.post('/register', async (req, res) => {
  const { name, username, password, role, email, mobile } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, username, password: hashedPassword, role, email, mobile });
    await newUser.save();
    res.json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login User
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get companies created by the logged-in user
// router.get('/user/companies', authenticateToken, async (req, res) => {
//   try {
//     const userId = req.user.userId; // Assuming userId is in the JWT payload
//     const companies = await Company.find({ created_by: userId });
//     res.json(companies);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to fetch companies' });
//   }
// });

router.get('/user/companies', authenticateToken, async (req, res) => {
    try {
      const companies = await Company.find(); // Fetch all companies
      res.json(companies);
    } catch (error) {
      console.error('Failed to fetch companies:', error);
      res.status(500).json({ message: 'Failed to fetch companies' });
    }
  });

// Create Company API
router.post('/company', authenticateToken, async (req, res) => {
    const { name, address } = req.body;
  
    // Determine the status based on user role
    const status = req.user.role === 'IT_ADMIN' ? 'approved' : 'unapproved';
  
    try {
      const newCompany = new Company({
        name,
        address,
        created_by: req.user.userId, // Use the user ID from the token
        status // Set the status based on user role
      });
  
      await newCompany.save();
      res.status(201).json({ message: 'Company created successfully', company: newCompany });
    } catch (error) {
      console.error('Failed to create company:', error);
      res.status(500).json({ message: 'Failed to create company' });
    }
  });
  
// Create Company (Protected)
// router.post('/company', authenticateToken, async (req, res) => {
//   const { name, address } = req.body;
//   try {
//     const user = req.user; // The user should be attached to the request by authenticateToken
//     const newCompany = new Company({
//       name,
//       address,
//       created_by: user.userId, // Ensure this is set correctly
//     });

//     await newCompany.save();
//     res.json({ message: 'Company created successfully' });
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to create company' });
//   }
// });

// Admin: Approve Company
router.put('/company/approve/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    await Company.findByIdAndUpdate(req.params.id, { status: 'approved' });
    res.json({ message: 'Company approved' });
  } catch (error) {
    res.status(500).json({ error: 'Approval failed' });
  }
});
// Get all companies (for admin)

router.get('/companies', authenticateToken, async (req, res) => {
    try {
      const companies = await Company.find(); // Fetch all companies
      res.json(companies);
    } catch (error) {
      console.error('Error fetching companies:', error);
      res.status(500).json({ error: 'Failed to fetch companies' });
    }
  });

  // Edit Company API
// router.put('/api/company/:id', authenticateToken, async (req, res) => {
//     try {
//       const companyId = req.params.id;
//       const updates = req.body;
  
//       // Check if the authenticated user is an admin
//       if (req.user.role !== 'ADMIN') {
//         return res.status(403).json({ message: 'Access denied' });
//       }
  
//       // Find the company by ID and update it
//       const updatedCompany = await Company.findByIdAndUpdate(companyId, updates, { new: true });
  
//       if (!updatedCompany) {
//         return res.status(404).json({ message: 'Company not found' });
//       }
  
//       res.status(200).json(updatedCompany);
//     } catch (error) {
//       res.status(500).json({ message: 'Error updating company', error });
//     }
//   });
// Delete Company API
// router.delete('/api/company/:id', authenticateToken, async (req, res) => {
//     try {
//       const companyId = req.params.id;
  
//       // Check if the authenticated user is an admin
//       if (req.user.role !== 'ADMIN') {
//         return res.status(403).json({ message: 'Access denied' });
//       }
  
//       // Find the company by ID and delete it
//       const deletedCompany = await Company.findByIdAndDelete(companyId);
  
//       if (!deletedCompany) {
//         return res.status(404).json({ message: 'Company not found' });
//       }
  
//       res.status(200).json({ message: 'Company deleted successfully' });
//     } catch (error) {
//       res.status(500).json({ message: 'Error deleting company', error });
//     }
//   });
    
// Get a company by ID
router.get('/company/:id', authenticateToken, async (req, res) => {
  try {
    const companyId = req.params.id; // Get the ID from the URL
    const company = await Company.findById(companyId); // Fetch the company by ID

    if (!company) {
      return res.status(404).json({ message: 'Company not found' }); // Return a 404 if not found
    }

    res.json(company); // Return the company data
  } catch (error) {
    console.error('Error fetching company:', error);
    res.status(500).json({ message: 'Failed to fetch company data' }); // Return a 500 error if there's an issue
  }
});

// Edit Company API
router.put('/company/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
      const companyId = req.params.id;
      const updates = req.body;
  
      // Find the company by ID and update it
      const updatedCompany = await Company.findByIdAndUpdate(companyId, updates, { new: true });
  
      if (!updatedCompany) {
        return res.status(404).json({ message: 'Company not found' });
      }
  
      res.status(200).json(updatedCompany);
    } catch (error) {
      res.status(500).json({ message: 'Error updating company', error });
    }
  });
  
  // Delete Company API
  router.delete('/company/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
      const companyId = req.params.id;
  
      // Find the company by ID and delete it
      const deletedCompany = await Company.findByIdAndDelete(companyId);
  
      if (!deletedCompany) {
        return res.status(404).json({ message: 'Company not found' });
      }
  
      res.status(200).json({ message: 'Company deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting company', error });
    }
  });
  

module.exports = router;
