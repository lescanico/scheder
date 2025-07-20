const express = require('express');
const emailService = require('../services/emailService');

const router = express.Router();

// Mock notification history (replace with database in production)
let notificationHistory = [];

// Get notification history
router.get('/history', async (req, res) => {
  try {
    const { type, recipient, limit = 50 } = req.query;
    
    let filteredHistory = [...notificationHistory];
    
    if (type) {
      filteredHistory = filteredHistory.filter(n => n.type === type);
    }
    
    if (recipient) {
      filteredHistory = filteredHistory.filter(n => n.recipient === recipient);
    }
    
    // Sort by date (newest first)
    filteredHistory.sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));
    
    // Limit results
    filteredHistory = filteredHistory.slice(0, parseInt(limit));
    
    res.json({
      success: true,
      data: filteredHistory,
      total: filteredHistory.length
    });
  } catch (error) {
    console.error('Error fetching notification history:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch notification history' });
  }
});

// Send test notification
router.post('/send-test', async (req, res) => {
  try {
    const { recipient, subject, message } = req.body;
    
    if (!recipient || !subject || !message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Recipient, subject, and message are required' 
      });
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Test Notification</h2>
        <p>${message}</p>
        <p><small>This is a test notification sent at ${new Date().toLocaleString()}</small></p>
      </div>
    `;

    const result = await emailService.sendEmail(recipient, subject, html);
    
    if (result.success) {
      // Add to history
      notificationHistory.push({
        id: `notif_${Date.now()}`,
        type: 'test',
        recipient,
        subject,
        message,
        sentAt: new Date().toISOString(),
        status: 'sent',
        messageId: result.messageId
      });
    }

    res.json({
      success: result.success,
      message: result.success ? 'Test notification sent successfully' : 'Failed to send test notification',
      data: result
    });
  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({ success: false, error: 'Failed to send test notification' });
  }
});

// Get notification statistics
router.get('/stats', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let filteredHistory = [...notificationHistory];
    
    if (startDate) {
      filteredHistory = filteredHistory.filter(n => new Date(n.sentAt) >= new Date(startDate));
    }
    
    if (endDate) {
      filteredHistory = filteredHistory.filter(n => new Date(n.sentAt) <= new Date(endDate));
    }
    
    const stats = {
      total: filteredHistory.length,
      byType: {},
      byStatus: {},
      byRecipient: {},
      recentActivity: filteredHistory.slice(0, 10)
    };
    
    filteredHistory.forEach(notification => {
      // Count by type
      stats.byType[notification.type] = (stats.byType[notification.type] || 0) + 1;
      
      // Count by status
      stats.byStatus[notification.status] = (stats.byStatus[notification.status] || 0) + 1;
      
      // Count by recipient
      stats.byRecipient[notification.recipient] = (stats.byRecipient[notification.recipient] || 0) + 1;
    });
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch notification stats' });
  }
});

// Get email templates
router.get('/templates', async (req, res) => {
  try {
    const templates = [
      {
        id: 'request_submitted',
        name: 'Request Submitted',
        subject: 'Schedule Blocking Request Submitted',
        description: 'Sent to provider when request is submitted'
      },
      {
        id: 'request_approved',
        name: 'Request Approved',
        subject: 'Schedule Blocking Request Approved',
        description: 'Sent to provider when request is approved'
      },
      {
        id: 'request_rejected',
        name: 'Request Rejected',
        subject: 'Schedule Blocking Request Rejected',
        description: 'Sent to provider when request is rejected'
      },
      {
        id: 'admin_notification',
        name: 'Admin Notification',
        subject: 'New Schedule Blocking Request - Action Required',
        description: 'Sent to admin when new request is received'
      },
      {
        id: 'director_pto',
        name: 'Director PTO Notification',
        subject: 'PTO Form Uploaded - Director Approval Required',
        description: 'Sent to director when PTO form is uploaded'
      },
      {
        id: 'clarification',
        name: 'Clarification Request',
        subject: 'Schedule Blocking Request - Clarification Needed',
        description: 'Sent to provider when clarification is needed'
      }
    ];
    
    res.json({
      success: true,
      data: templates
    });
  } catch (error) {
    console.error('Error fetching email templates:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch email templates' });
  }
});

// Update notification history (for tracking purposes)
router.post('/track', async (req, res) => {
  try {
    const { type, recipient, subject, message, status = 'sent', messageId } = req.body;
    
    const notification = {
      id: `notif_${Date.now()}`,
      type,
      recipient,
      subject,
      message,
      sentAt: new Date().toISOString(),
      status,
      messageId
    };
    
    notificationHistory.push(notification);
    
    res.json({
      success: true,
      message: 'Notification tracked successfully',
      data: notification
    });
  } catch (error) {
    console.error('Error tracking notification:', error);
    res.status(500).json({ success: false, error: 'Failed to track notification' });
  }
});

module.exports = router; 