const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

class REDCapAPI {
  constructor(apiUrl, apiToken) {
    this.apiUrl = apiUrl;
    this.apiToken = apiToken;
  }

  // Generic API request method
  async makeRequest(data) {
    const form = new FormData();
    
    // Add API token
    form.append('token', this.apiToken);
    
    // Add all data fields
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined && data[key] !== null) {
        form.append(key, data[key]);
      }
    });

    try {
      const response = await axios.post(this.apiUrl, form, {
        headers: {
          ...form.getHeaders(),
        },
      });
      return response.data;
    } catch (error) {
      console.error('REDCap API Error:', error.response?.data || error.message);
      throw error;
    }
  }

  // Import a new schedule request
  async createScheduleRequest(requestData) {
    const redCapRecord = this.transformToREDCapFormat(requestData);
    
    const data = {
      content: 'record',
      format: 'json',
      type: 'flat',
      overwriteBehavior: 'normal',
      forceAutoNumber: 'false',
      data: JSON.stringify([redCapRecord]),
      returnContent: 'count',
      returnFormat: 'json'
    };

    return await this.makeRequest(data);
  }

  // Update request status
  async updateRequestStatus(recordId, status, updatedBy, notes = '') {
    const updateData = {
      record_id: recordId,
      request_status: status,
      updated_timestamp: new Date().toISOString(),
    };

    if (status === '3') { // Approved
      updateData.approved_timestamp = new Date().toISOString();
      updateData.approved_by = updatedBy;
    } else if (status === '4') { // Rejected
      updateData.rejected_timestamp = new Date().toISOString();
      updateData.rejected_by = updatedBy;
      updateData.rejection_reason = notes;
    }

    const data = {
      content: 'record',
      format: 'json',
      type: 'flat',
      overwriteBehavior: 'overwrite',
      data: JSON.stringify([updateData]),
      returnContent: 'count',
      returnFormat: 'json'
    };

    return await this.makeRequest(data);
  }

  // Get all records with optional filters
  async getRecords(filters = {}) {
    const data = {
      content: 'record',
      format: 'json',
      type: 'flat',
      csvDelimiter: '',
      rawOrLabel: 'raw',
      rawOrLabelHeaders: 'raw',
      exportCheckboxLabel: 'false',
      exportSurveyFields: 'false',
      exportDataAccessGroups: 'false',
      returnFormat: 'json'
    };

    // Add filters if provided
    if (filters.records) {
      data.records = filters.records;
    }
    if (filters.fields) {
      data.fields = filters.fields;
    }
    if (filters.events) {
      data.events = filters.events;
    }

    return await this.makeRequest(data);
  }

  // Upload file (PTO form)
  async uploadFile(recordId, fieldName, filePath, fileName) {
    const form = new FormData();
    form.append('token', this.apiToken);
    form.append('content', 'file');
    form.append('action', 'import');
    form.append('record', recordId);
    form.append('field', fieldName);
    form.append('file', fs.createReadStream(filePath), fileName);
    form.append('returnFormat', 'json');

    try {
      const response = await axios.post(this.apiUrl, form, {
        headers: {
          ...form.getHeaders(),
        },
      });
      return response.data;
    } catch (error) {
      console.error('File upload error:', error.response?.data || error.message);
      throw error;
    }
  }

  // Transform Scheder request data to REDCap format
  transformToREDCapFormat(requestData) {
    const redCapRecord = {
      provider_id: requestData.providerId,
      provider_name: requestData.providerName,
      provider_email: requestData.providerEmail,
      request_type: this.mapRequestType(requestData.requestType),
      start_date: requestData.startDate,
      reason: requestData.reason,
      pto_required: requestData.ptoRequired ? '1' : '0',
      request_status: this.mapStatus(requestData.status),
      created_timestamp: requestData.createdAt,
      updated_timestamp: requestData.updatedAt
    };

    // Add conditional fields based on request type
    if (requestData.endDate) {
      redCapRecord.end_date = requestData.endDate;
    }
    
    if (requestData.startTime) {
      redCapRecord.start_time = requestData.startTime;
    }
    
    if (requestData.endTime) {
      redCapRecord.end_time = requestData.endTime;
    }

    if (requestData.recurringPattern) {
      redCapRecord.recurring_pattern = this.mapRecurringPattern(requestData.recurringPattern);
    }

    if (requestData.recurringDays && requestData.recurringDays.length > 0) {
      requestData.recurringDays.forEach((day, index) => {
        redCapRecord[`recurring_days___${index + 1}`] = '1';
      });
    }

    if (requestData.adminNotes) {
      redCapRecord.admin_notes = requestData.adminNotes;
    }

    if (requestData.directorNotes) {
      redCapRecord.director_notes = requestData.directorNotes;
    }

    return redCapRecord;
  }

  // Map request types
  mapRequestType(type) {
    const typeMap = {
      'specific_time': '1',
      'full_day': '2',
      'multiple_days': '3',
      'recurring': '4'
    };
    return typeMap[type] || '1';
  }

  // Map status values
  mapStatus(status) {
    const statusMap = {
      'pending': '1',
      'under_review': '2',
      'approved': '3',
      'rejected': '4',
      'cancelled': '5'
    };
    return statusMap[status] || '1';
  }

  // Map recurring patterns
  mapRecurringPattern(pattern) {
    const patternMap = {
      'weekly': '1',
      'bi-weekly': '2',
      'monthly': '3',
      'custom': '4'
    };
    return patternMap[pattern] || '1';
  }
}

// Migration utility functions
class SchederREDCapMigration {
  constructor(redCapAPI, schederData) {
    this.redCapAPI = redCapAPI;
    this.schederData = schederData;
  }

  // Migrate all existing Scheder data to REDCap
  async migrateAllData() {
    console.log('Starting Scheder to REDCap migration...');
    const results = {
      successful: 0,
      failed: 0,
      errors: []
    };

    for (const request of this.schederData) {
      try {
        await this.redCapAPI.createScheduleRequest(request);
        results.successful++;
        console.log(`✓ Migrated request: ${request.id}`);
      } catch (error) {
        results.failed++;
        results.errors.push({
          requestId: request.id,
          error: error.message
        });
        console.error(`✗ Failed to migrate request: ${request.id}`, error.message);
      }
    }

    console.log(`Migration completed: ${results.successful} successful, ${results.failed} failed`);
    return results;
  }

  // Validate data before migration
  validateData() {
    const issues = [];
    
    this.schederData.forEach((request, index) => {
      if (!request.providerId || !request.providerName || !request.providerEmail) {
        issues.push(`Record ${index}: Missing provider information`);
      }
      
      if (!request.startDate) {
        issues.push(`Record ${index}: Missing start date`);
      }
      
      if (!request.reason) {
        issues.push(`Record ${index}: Missing reason`);
      }
    });

    return issues;
  }
}

// Export classes and utility functions
module.exports = {
  REDCapAPI,
  SchederREDCapMigration
};

// Example usage:
/*
const redCapAPI = new REDCapAPI('https://redcap.institution.edu/api/', 'YOUR_API_TOKEN');

// Create a new request
const newRequest = {
  providerId: 'PROV001',
  providerName: 'Dr. Smith',
  providerEmail: 'smith@clinic.com',
  requestType: 'full_day',
  startDate: '2025-01-15',
  reason: 'Medical conference attendance',
  ptoRequired: true,
  status: 'pending',
  createdAt: new Date().toISOString()
};

redCapAPI.createScheduleRequest(newRequest)
  .then(result => console.log('Request created:', result))
  .catch(error => console.error('Error:', error));
*/