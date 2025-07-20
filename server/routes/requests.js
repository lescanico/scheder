const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const Request = require('../models/Request');
const emailService = require('../services/emailService');

const router = express.Router();

// In-memory storage for demo (replace with database in production)
let requests = [
  {
    id: 'req_1',
    providerId: 'prov_1',
    providerName: 'Dr. John Provider',
    providerEmail: 'provider@clinic.com',
    requestType: 'full_day',
    startDate: '2025-01-15',
    reason: 'Personal day off',
    ptoRequired: true,
    status: 'pending',
    createdAt: '2025-01-10T10:00:00.000Z',
    updatedAt: '2025-01-10T10:00:00.000Z'
  },
  {
    id: 'req_2',
    providerId: 'prov_1',
    providerName: 'Dr. John Provider',
    providerEmail: 'provider@clinic.com',
    requestType: 'specific_time',
    startDate: '2025-01-20',
    startTime: '14:00',
    endTime: '16:00',
    reason: 'Medical appointment',
    ptoRequired: false,
    status: 'approved',
    approvedAt: '2025-01-11T09:00:00.000Z',
    approvedBy: 'Admin Staff',
    createdAt: '2025-01-09T14:30:00.000Z',
    updatedAt: '2025-01-11T09:00:00.000Z'
  }
];
let nextId = 3;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB default
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF and Word documents are allowed'));
    }
  }
});

// Validation middleware
const validateRequest = [
  body('providerId').notEmpty().withMessage('Provider ID is required'),
  body('providerName').notEmpty().withMessage('Provider name is required'),
  body('providerEmail').isEmail().withMessage('Valid email is required'),
  body('requestType').isIn(['specific_time', 'full_day', 'multiple_days', 'recurring']).withMessage('Valid request type is required'),
  body('startDate').notEmpty().withMessage('Start date is required'),
  body('reason').notEmpty().withMessage('Reason is required'),
  body('startTime').custom((value, { req }) => {
    if (req.body.requestType === 'specific_time' && !value) {
      throw new Error('Start time is required for specific time requests');
    }
    return true;
  }),
  body('endTime').custom((value, { req }) => {
    if (req.body.requestType === 'specific_time' && !value) {
      throw new Error('End time is required for specific time requests');
    }
    return true;
  }),
  body('endDate').custom((value, { req }) => {
    if (req.body.requestType === 'multiple_days' && !value) {
      throw new Error('End date is required for multiple day requests');
    }
    return true;
  })
];

// Get all requests
router.get('/', async (req, res) => {
  try {
    const { status, providerId, requestType } = req.query;
    
    let filteredRequests = [...requests];
    
    if (status) {
      filteredRequests = filteredRequests.filter(req => req.status === status);
    }
    
    if (providerId) {
      filteredRequests = filteredRequests.filter(req => req.providerId === providerId);
    }
    
    if (requestType) {
      filteredRequests = filteredRequests.filter(req => req.requestType === requestType);
    }
    
    // Sort by creation date (newest first)
    filteredRequests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json({
      success: true,
      data: filteredRequests,
      total: filteredRequests.length
    });
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch requests' });
  }
});

// Get single request
router.get('/:id', async (req, res) => {
  try {
    const request = requests.find(req => req.id === req.params.id);
    
    if (!request) {
      return res.status(404).json({ success: false, error: 'Request not found' });
    }
    
    res.json({ success: true, data: request });
  } catch (error) {
    console.error('Error fetching request:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch request' });
  }
});

// Create new request
router.post('/', validateRequest, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const requestData = {
      ...req.body,
      id: `req_${nextId++}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const request = new Request(requestData);
    const validation = request.validate();
    
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        errors: validation.errors
      });
    }

    requests.push(request);
    
    // Send email notifications
    await emailService.notifyRequestSubmitted(request);
    await emailService.notifyAdminNewRequest(request);

    res.status(201).json({
      success: true,
      data: request,
      message: 'Request created successfully'
    });
  } catch (error) {
    console.error('Error creating request:', error);
    res.status(500).json({ success: false, error: 'Failed to create request' });
  }
});

// Update request
router.put('/:id', validateRequest, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const requestIndex = requests.findIndex(req => req.id === req.params.id);
    if (requestIndex === -1) {
      return res.status(404).json({ success: false, error: 'Request not found' });
    }

    const request = requests[requestIndex];
    
    // Only allow editing pending requests
    if (request.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        error: 'Only pending requests can be edited' 
      });
    }

    // Update request data
    const updatedData = {
      ...req.body,
      id: request.id,
      status: request.status, // Keep original status
      createdAt: request.createdAt, // Keep original creation date
      updatedAt: new Date().toISOString()
    };

    const updatedRequest = new Request(updatedData);
    const validation = updatedRequest.validate();
    
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        errors: validation.errors
      });
    }

    requests[requestIndex] = updatedRequest;

    res.json({
      success: true,
      data: updatedRequest,
      message: 'Request updated successfully'
    });
  } catch (error) {
    console.error('Error updating request:', error);
    res.status(500).json({ success: false, error: 'Failed to update request' });
  }
});

// Update request status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, notes, updatedBy } = req.body;
    
    if (!['pending', 'approved', 'rejected', 'cancelled'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const request = requests.find(req => req.id === req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, error: 'Request not found' });
    }

    const oldStatus = request.status;
    request.updateStatus(status, updatedBy, notes);

    // Send appropriate email notifications
    if (status === 'approved' && oldStatus !== 'approved') {
      await emailService.notifyRequestApproved(request);
    } else if (status === 'rejected' && oldStatus !== 'rejected') {
      await emailService.notifyRequestRejected(request);
    }

    res.json({
      success: true,
      data: request,
      message: `Request ${status} successfully`
    });
  } catch (error) {
    console.error('Error updating request status:', error);
    res.status(500).json({ success: false, error: 'Failed to update request status' });
  }
});

// Add admin notes
router.patch('/:id/admin-notes', async (req, res) => {
  try {
    const { notes } = req.body;
    
    const request = requests.find(req => req.id === req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, error: 'Request not found' });
    }

    request.addAdminNotes(notes);

    res.json({
      success: true,
      data: request,
      message: 'Admin notes added successfully'
    });
  } catch (error) {
    console.error('Error adding admin notes:', error);
    res.status(500).json({ success: false, error: 'Failed to add admin notes' });
  }
});

// Add director notes
router.patch('/:id/director-notes', async (req, res) => {
  try {
    const { notes } = req.body;
    
    const request = requests.find(req => req.id === req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, error: 'Request not found' });
    }

    request.addDirectorNotes(notes);

    res.json({
      success: true,
      data: request,
      message: 'Director notes added successfully'
    });
  } catch (error) {
    console.error('Error adding director notes:', error);
    res.status(500).json({ success: false, error: 'Failed to add director notes' });
  }
});

// Upload PTO form
router.post('/:id/upload-pto', upload.single('ptoForm'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const request = requests.find(req => req.id === req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, error: 'Request not found' });
    }

    request.ptoFormPath = req.file.filename;
    request.ptoRequired = true;
    request.updatedAt = new Date().toISOString();

    // Notify director about PTO form upload
    await emailService.notifyDirectorPTOUpload(request);

    res.json({
      success: true,
      data: request,
      message: 'PTO form uploaded successfully'
    });
  } catch (error) {
    console.error('Error uploading PTO form:', error);
    res.status(500).json({ success: false, error: 'Failed to upload PTO form' });
  }
});

// Send clarification email
router.post('/:id/send-clarification', async (req, res) => {
  try {
    const { clarificationMessage, adminName } = req.body;
    
    if (!clarificationMessage || !adminName) {
      return res.status(400).json({ success: false, error: 'Clarification message and admin name are required' });
    }

    const request = requests.find(req => req.id === req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, error: 'Request not found' });
    }

    await emailService.sendClarificationEmail(request, clarificationMessage, adminName);

    res.json({
      success: true,
      message: 'Clarification email sent successfully'
    });
  } catch (error) {
    console.error('Error sending clarification email:', error);
    res.status(500).json({ success: false, error: 'Failed to send clarification email' });
  }
});

// Get conflicting appointments (mock data)
router.get('/:id/conflicts', async (req, res) => {
  try {
    const request = requests.find(req => req.id === req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, error: 'Request not found' });
    }

    // Mock conflicting appointments (replace with actual schedule check)
    const mockConflicts = [
      {
        id: 'apt_1',
        patientName: 'John Doe',
        startDate: '2025-01-15T09:00:00Z',
        endDate: '2025-01-15T10:00:00Z',
        status: 'scheduled'
      },
      {
        id: 'apt_2',
        patientName: 'Jane Smith',
        startDate: '2025-01-15T14:00:00Z',
        endDate: '2025-01-15T15:00:00Z',
        status: 'scheduled'
      }
    ];

    res.json({
      success: true,
      data: mockConflicts,
      total: mockConflicts.length
    });
  } catch (error) {
    console.error('Error fetching conflicts:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch conflicts' });
  }
});

// Delete request
router.delete('/:id', async (req, res) => {
  try {
    const requestIndex = requests.findIndex(req => req.id === req.params.id);
    
    if (requestIndex === -1) {
      return res.status(404).json({ success: false, error: 'Request not found' });
    }

    const deletedRequest = requests.splice(requestIndex, 1)[0];

    res.json({
      success: true,
      message: 'Request deleted successfully',
      data: deletedRequest
    });
  } catch (error) {
    console.error('Error deleting request:', error);
    res.status(500).json({ success: false, error: 'Failed to delete request' });
  }
});

module.exports = router; 