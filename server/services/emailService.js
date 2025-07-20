const nodemailer = require('nodemailer');
const moment = require('moment');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  // Send email notification
  async sendEmail(to, subject, html, attachments = []) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        html,
        attachments
      };

      const result = await this.transporter.sendMail(mailOptions);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Notify provider when request is submitted
  async notifyRequestSubmitted(request) {
    const subject = 'Schedule Blocking Request Submitted';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Schedule Blocking Request Submitted</h2>
        <p>Dear ${request.providerName},</p>
        <p>Your schedule blocking request has been successfully submitted and is under review.</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Request Details:</h3>
          <p><strong>Request Type:</strong> ${this.getRequestTypeDisplay(request.requestType)}</p>
          <p><strong>Date Range:</strong> ${request.getFormattedDateRange()}</p>
          <p><strong>Reason:</strong> ${request.reason}</p>
          <p><strong>Status:</strong> <span style="color: #f39c12;">Pending Review</span></p>
          ${request.ptoRequired ? '<p><strong>PTO Form Required:</strong> Yes</p>' : ''}
        </div>
        
        <p>You will receive an email notification once your request has been reviewed by the admin staff.</p>
        <p>If you have any questions, please contact the admin office.</p>
        
        <p>Best regards,<br>Clinic Administration</p>
      </div>
    `;

    return this.sendEmail(request.providerEmail, subject, html);
  }

  // Notify admin when new request is received
  async notifyAdminNewRequest(request) {
    const subject = 'New Schedule Blocking Request - Action Required';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #e74c3c;">New Schedule Blocking Request</h2>
        <p>A new schedule blocking request requires your attention.</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Request Details:</h3>
          <p><strong>Provider:</strong> ${request.providerName}</p>
          <p><strong>Email:</strong> ${request.providerEmail}</p>
          <p><strong>Request Type:</strong> ${this.getRequestTypeDisplay(request.requestType)}</p>
          <p><strong>Date Range:</strong> ${request.getFormattedDateRange()}</p>
          <p><strong>Reason:</strong> ${request.reason}</p>
          ${request.ptoRequired ? '<p><strong>PTO Form Required:</strong> Yes</p>' : ''}
        </div>
        
        <p>Please review the provider's schedule and take appropriate action:</p>
        <ul>
          <li>Check for conflicting appointments</li>
          <li>Reschedule appointments if necessary</li>
          <li>Block the schedule as requested</li>
          <li>Send clarification email if needed</li>
        </ul>
        
        <p>Access the admin dashboard to manage this request.</p>
      </div>
    `;

    // Send to admin email (you can configure multiple admin emails)
    const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',') : ['admin@clinic.com'];
    return this.sendEmail(adminEmails.join(','), subject, html);
  }

  // Notify provider when request is approved
  async notifyRequestApproved(request) {
    const subject = 'Schedule Blocking Request Approved';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #27ae60;">Schedule Blocking Request Approved</h2>
        <p>Dear ${request.providerName},</p>
        <p>Your schedule blocking request has been approved and your schedule has been blocked as requested.</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Approved Request Details:</h3>
          <p><strong>Request Type:</strong> ${this.getRequestTypeDisplay(request.requestType)}</p>
          <p><strong>Date Range:</strong> ${request.getFormattedDateRange()}</p>
          <p><strong>Reason:</strong> ${request.reason}</p>
          <p><strong>Status:</strong> <span style="color: #27ae60;">Approved</span></p>
          <p><strong>Approved By:</strong> ${request.approvedBy}</p>
          <p><strong>Approved At:</strong> ${moment(request.approvedAt).format('MMM DD, YYYY HH:mm')}</p>
        </div>
        
        ${request.conflictingAppointments.length > 0 ? `
          <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h4>Appointments Rescheduled:</h4>
            <p>The following appointments were rescheduled to accommodate your request:</p>
            <ul>
              ${request.rescheduledAppointments.map(apt => `<li>${apt.patientName} - ${moment(apt.originalDate).format('MMM DD, YYYY HH:mm')} → ${moment(apt.newDate).format('MMM DD, YYYY HH:mm')}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
        
        <p>Your schedule is now blocked for the requested period. No new appointments will be scheduled during this time.</p>
        
        <p>Best regards,<br>Clinic Administration</p>
      </div>
    `;

    return this.sendEmail(request.providerEmail, subject, html);
  }

  // Notify provider when request is rejected
  async notifyRequestRejected(request) {
    const subject = 'Schedule Blocking Request Rejected';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #e74c3c;">Schedule Blocking Request Rejected</h2>
        <p>Dear ${request.providerName},</p>
        <p>Your schedule blocking request has been rejected.</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Request Details:</h3>
          <p><strong>Request Type:</strong> ${this.getRequestTypeDisplay(request.requestType)}</p>
          <p><strong>Date Range:</strong> ${request.getFormattedDateRange()}</p>
          <p><strong>Reason:</strong> ${request.reason}</p>
          <p><strong>Status:</strong> <span style="color: #e74c3c;">Rejected</span></p>
          <p><strong>Rejected By:</strong> ${request.rejectedBy}</p>
          <p><strong>Rejected At:</strong> ${moment(request.rejectedAt).format('MMM DD, YYYY HH:mm')}</p>
          ${request.rejectionReason ? `<p><strong>Rejection Reason:</strong> ${request.rejectionReason}</p>` : ''}
        </div>
        
        <p>Please contact the admin office if you have any questions or would like to submit a new request.</p>
        
        <p>Best regards,<br>Clinic Administration</p>
      </div>
    `;

    return this.sendEmail(request.providerEmail, subject, html);
  }

  // Notify director when PTO form is uploaded
  async notifyDirectorPTOUpload(request) {
    const subject = 'PTO Form Uploaded - Director Approval Required';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3498db;">PTO Form Uploaded</h2>
        <p>A PTO form has been uploaded and requires your approval.</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Request Details:</h3>
          <p><strong>Provider:</strong> ${request.providerName}</p>
          <p><strong>Request Type:</strong> ${this.getRequestTypeDisplay(request.requestType)}</p>
          <p><strong>Date Range:</strong> ${request.getFormattedDateRange()}</p>
          <p><strong>Reason:</strong> ${request.reason}</p>
        </div>
        
        <p>Please review the PTO form and take appropriate action:</p>
        <ul>
          <li>Review the uploaded PTO form</li>
          <li>Sign the form if approved</li>
          <li>Return the signed form</li>
          <li>Update the request status</li>
        </ul>
        
        <p>Access the director dashboard to review this request.</p>
      </div>
    `;

    const directorEmails = process.env.DIRECTOR_EMAILS ? process.env.DIRECTOR_EMAILS.split(',') : ['director@clinic.com'];
    return this.sendEmail(directorEmails.join(','), subject, html);
  }

  // Send clarification email to provider
  async sendClarificationEmail(request, clarificationMessage, adminName) {
    const subject = 'Schedule Blocking Request - Clarification Needed';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f39c12;">Clarification Needed</h2>
        <p>Dear ${request.providerName},</p>
        <p>We need clarification regarding your schedule blocking request.</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Request Details:</h3>
          <p><strong>Request Type:</strong> ${this.getRequestTypeDisplay(request.requestType)}</p>
          <p><strong>Date Range:</strong> ${request.getFormattedDateRange()}</p>
          <p><strong>Reason:</strong> ${request.reason}</p>
        </div>
        
        <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h4>Clarification Request:</h4>
          <p>${clarificationMessage}</p>
          <p><strong>From:</strong> ${adminName}</p>
        </div>
        
        <p>Please respond to this email with the requested clarification, or contact the admin office directly.</p>
        
        <p>Best regards,<br>${adminName}<br>Clinic Administration</p>
      </div>
    `;

    return this.sendEmail(request.providerEmail, subject, html);
  }

  // Helper method to get display name for request type
  getRequestTypeDisplay(requestType) {
    const types = {
      'specific_time': 'Specific Time Period',
      'full_day': 'Full Day',
      'multiple_days': 'Multiple Days',
      'recurring': 'Recurring'
    };
    return types[requestType] || requestType;
  }
}

module.exports = new EmailService(); 