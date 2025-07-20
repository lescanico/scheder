const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

class Request {
  constructor(data = {}) {
    this.id = data.id || uuidv4();
    this.providerId = data.providerId;
    this.providerName = data.providerName;
    this.providerEmail = data.providerEmail;
    this.requestType = data.requestType; // 'specific_time', 'full_day', 'multiple_days', 'recurring'
    this.startDate = data.startDate;
    this.endDate = data.endDate;
    this.startTime = data.startTime; // For specific time periods
    this.endTime = data.endTime; // For specific time periods
    this.recurringPattern = data.recurringPattern; // For recurring requests
    this.recurringDays = data.recurringDays; // Array of days for recurring
    this.recurringMonths = data.recurringMonths; // Array of months for recurring
    this.reason = data.reason;
    this.ptoRequired = data.ptoRequired || false;
    this.ptoFormPath = data.ptoFormPath;
    this.status = data.status || 'pending'; // 'pending', 'approved', 'rejected', 'cancelled'
    this.adminNotes = data.adminNotes;
    this.directorNotes = data.directorNotes;
    this.conflictingAppointments = data.conflictingAppointments || [];
    this.rescheduledAppointments = data.rescheduledAppointments || [];
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.approvedAt = data.approvedAt;
    this.approvedBy = data.approvedBy;
    this.rejectedAt = data.rejectedAt;
    this.rejectedBy = data.rejectedBy;
    this.rejectionReason = data.rejectionReason;
  }

  // Validate request data
  validate() {
    const errors = [];

    if (!this.providerId || !this.providerName || !this.providerEmail) {
      errors.push('Provider information is required');
    }

    if (!this.requestType) {
      errors.push('Request type is required');
    }

    if (!this.startDate) {
      errors.push('Start date is required');
    }

    if (this.requestType === 'specific_time') {
      if (!this.startTime || !this.endTime) {
        errors.push('Start and end times are required for specific time requests');
      }
      if (this.startTime && this.endTime && this.startTime >= this.endTime) {
        errors.push('End time must be after start time');
      }
    }

    if (this.requestType === 'multiple_days' && !this.endDate) {
      errors.push('End date is required for multiple day requests');
    }

    if (this.requestType === 'recurring') {
      if (!this.recurringPattern) {
        errors.push('Recurring pattern is required for recurring requests');
      }
    }

    if (!this.reason) {
      errors.push('Reason is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Check if request conflicts with existing appointments
  checkConflicts(existingAppointments) {
    const conflicts = [];
    const requestStart = moment(this.startDate);
    const requestEnd = this.endDate ? moment(this.endDate) : moment(this.startDate);

    existingAppointments.forEach(appointment => {
      const appointmentStart = moment(appointment.startDate);
      const appointmentEnd = moment(appointment.endDate);

      // Check for overlap
      if (requestStart.isBefore(appointmentEnd) && requestEnd.isAfter(appointmentStart)) {
        conflicts.push(appointment);
      }
    });

    return conflicts;
  }

  // Get formatted date range for display
  getFormattedDateRange() {
    if (this.requestType === 'specific_time') {
      return `${moment(this.startDate).format('MMM DD, YYYY')} ${this.startTime} - ${this.endTime}`;
    } else if (this.requestType === 'full_day') {
      return moment(this.startDate).format('MMM DD, YYYY');
    } else if (this.requestType === 'multiple_days') {
      return `${moment(this.startDate).format('MMM DD, YYYY')} - ${moment(this.endDate).format('MMM DD, YYYY')}`;
    } else if (this.requestType === 'recurring') {
      return `Recurring: ${this.recurringPattern}`;
    }
    return 'Unknown';
  }

  // Update status
  updateStatus(newStatus, updatedBy, notes = '') {
    this.status = newStatus;
    this.updatedAt = new Date().toISOString();

    if (newStatus === 'approved') {
      this.approvedAt = new Date().toISOString();
      this.approvedBy = updatedBy;
    } else if (newStatus === 'rejected') {
      this.rejectedAt = new Date().toISOString();
      this.rejectedBy = updatedBy;
      this.rejectionReason = notes;
    }
  }

  // Add admin notes
  addAdminNotes(notes) {
    this.adminNotes = notes;
    this.updatedAt = new Date().toISOString();
  }

  // Add director notes
  addDirectorNotes(notes) {
    this.directorNotes = notes;
    this.updatedAt = new Date().toISOString();
  }

  // Convert to plain object
  toJSON() {
    return {
      id: this.id,
      providerId: this.providerId,
      providerName: this.providerName,
      providerEmail: this.providerEmail,
      requestType: this.requestType,
      startDate: this.startDate,
      endDate: this.endDate,
      startTime: this.startTime,
      endTime: this.endTime,
      recurringPattern: this.recurringPattern,
      recurringDays: this.recurringDays,
      recurringMonths: this.recurringMonths,
      reason: this.reason,
      ptoRequired: this.ptoRequired,
      ptoFormPath: this.ptoFormPath,
      status: this.status,
      adminNotes: this.adminNotes,
      directorNotes: this.directorNotes,
      conflictingAppointments: this.conflictingAppointments,
      rescheduledAppointments: this.rescheduledAppointments,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      approvedAt: this.approvedAt,
      approvedBy: this.approvedBy,
      rejectedAt: this.rejectedAt,
      rejectedBy: this.rejectedBy,
      rejectionReason: this.rejectionReason
    };
  }
}

module.exports = Request; 