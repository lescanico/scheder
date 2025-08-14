# Scheder to REDCap Migration Guide

## Overview

This guide provides step-by-step instructions for migrating your Scheder schedule blocking management system to REDCap (Research Electronic Data Capture). REDCap offers enhanced data management capabilities, better compliance features, and institutional support.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [REDCap Project Setup](#redcap-project-setup)
3. [Data Migration](#data-migration)
4. [User Management](#user-management)
5. [Workflow Configuration](#workflow-configuration)
6. [Testing](#testing)
7. [Go-Live Checklist](#go-live-checklist)
8. [Post-Migration Support](#post-migration-support)

## Prerequisites

### System Requirements
- REDCap instance access (version 10.0+)
- Node.js 18+ (for migration scripts)
- Administrative access to REDCap project creation
- Access to existing Scheder data

### Required Information
- REDCap API URL (e.g., `https://redcap.institution.edu/api/`)
- REDCap API token (to be generated after project creation)
- Email server configuration for notifications
- List of users and their roles

## REDCap Project Setup

### Step 1: Create New REDCap Project

1. Log into your REDCap instance
2. Click "New Project"
3. Choose "Create a new project"
4. Project Title: `Scheder - Schedule Blocking Management System`
5. Purpose: Select "Quality Improvement" or "Operational Support"
6. Import the project configuration:
   - Use `project-config.xml` from this migration package

### Step 2: Import Data Dictionary

1. Go to "Project Setup" → "Data Dictionary"
2. Click "Upload Data Dictionary"
3. Upload `data-dictionary.csv`
4. Review and confirm field mappings

### Step 3: Configure Project Settings

```xml
<!-- Key settings to verify -->
<surveys_enabled>1</surveys_enabled>
<record_autonumbering_enabled>1</record_autonumbering_enabled>
<project_dashboard_enabled>1</project_dashboard_enabled>
<data_resolution_enabled>2</data_resolution_enabled>
```

### Step 4: Set Up User Roles

1. Navigate to "User Rights"
2. Click "User Roles"
3. Import roles using `user-roles.csv`:
   - **Provider Role**: Limited access, can create requests and view own submissions
   - **Administrator Role**: Full access except final PTO approvals
   - **Director Role**: Complete access including final approvals

## Data Migration

### Step 5: Prepare Migration Environment

1. Install Node.js dependencies:
   ```bash
   cd redcap-migration
   npm install axios form-data
   ```

2. Set environment variables:
   ```bash
   export REDCAP_API_URL="https://your-redcap-instance.edu/api/"
   export REDCAP_API_TOKEN="your-api-token-here"
   export SCHEDER_DATA_PATH="../server/data/requests.json"
   ```

### Step 6: Validate Existing Data

Run data validation before migration:
```bash
node data-migration-script.js --dry-run
```

This will identify any data quality issues that need to be addressed.

### Step 7: Perform Migration

1. **Backup existing data** (automatically done by script)
2. **Run migration**:
   ```bash
   node data-migration-script.js
   ```
3. **Review migration report** in `migration-report.json`

### Step 8: Verify Data Integrity

1. Compare record counts between Scheder and REDCap
2. Spot-check several records for accuracy
3. Verify file uploads (PTO forms) transferred correctly

## User Management

### Step 9: Create User Accounts

1. Navigate to "User Rights" in REDCap
2. Add users with appropriate roles:

| User Type | Role Assignment | Permissions |
|-----------|----------------|-------------|
| Providers | provider_role | Submit requests, view own data |
| Administrators | admin_role | Review requests, manage workflow |
| Directors | director_role | Final approvals, full access |

### Step 10: Configure Data Access Groups (Optional)

If managing multiple departments:
1. Go to "Data Access Groups"
2. Create groups for each department
3. Assign users to appropriate groups

## Workflow Configuration

### Step 11: Set Up Automated Notifications

1. Navigate to "Alerts & Notifications"
2. Import alert configurations from `alerts-notifications.csv`
3. Configure email settings:
   - **From Address**: `noreply@clinic.com`
   - **Admin Email**: `admin@clinic.com`
   - **Director Email**: `director@clinic.com`

### Step 12: Configure Surveys (Optional)

For external provider access:
1. Go to "Survey Distribution Tools"
2. Enable public survey for `schedule_request_form`
3. Customize survey settings and appearance

### Step 13: Set Up Reports

Create standard reports for:
- Pending requests dashboard
- Monthly request summary
- Provider request history
- Approval timeline analysis

## Testing

### Step 14: User Acceptance Testing

1. **Provider Testing**:
   - Submit new schedule requests
   - Verify email notifications
   - Test file uploads

2. **Administrator Testing**:
   - Review and approve requests
   - Add notes and comments
   - Test rejection workflow

3. **Director Testing**:
   - Final PTO approvals
   - Access to all reports
   - User management functions

### Step 15: Integration Testing

1. Test API endpoints using `api-integration.js`
2. Verify data synchronization
3. Test error handling and recovery

## Go-Live Checklist

### Technical Checklist
- [ ] All data migrated successfully
- [ ] User accounts created and tested
- [ ] Email notifications working
- [ ] File uploads functioning
- [ ] Reports generating correctly
- [ ] API integration tested
- [ ] Backup procedures in place

### Operational Checklist
- [ ] Staff training completed
- [ ] Documentation updated
- [ ] Support procedures established
- [ ] Go-live date communicated
- [ ] Rollback plan prepared
- [ ] Monitor system performance

## Post-Migration Support

### Monitoring

Monitor these key metrics during the first month:
- System response times
- User adoption rates
- Error rates and issues
- Email delivery success

### Common Issues and Solutions

| Issue | Solution |
|-------|----------|
| Users can't access REDCap | Check user roles and permissions |
| Emails not sending | Verify SMTP configuration |
| File uploads failing | Check file size limits and permissions |
| Data not syncing | Verify API token and connectivity |

### Training Resources

1. **REDCap Training Videos**: Available in REDCap Help section
2. **Custom Training Materials**: Created for Scheder-specific workflows
3. **Quick Reference Guides**: For each user role
4. **Support Contact Information**: IT helpdesk and REDCap administrators

## API Integration (Advanced)

For organizations needing to maintain API access:

### REDCap API Endpoints

```javascript
// Example API usage
const redCapAPI = new REDCapAPI(apiUrl, apiToken);

// Create new request
await redCapAPI.createScheduleRequest(requestData);

// Update status
await redCapAPI.updateRequestStatus(recordId, 'approved', 'admin');

// Get records
const records = await redCapAPI.getRecords();
```

### Webhook Configuration

Set up webhooks for real-time integrations:
1. Go to "Project Setup" → "Additional Customizations"
2. Configure webhook URL for external systems
3. Test webhook delivery

## Data Mapping Reference

| Scheder Field | REDCap Field | Notes |
|---------------|--------------|-------|
| `id` | `record_id` | Auto-generated in REDCap |
| `providerId` | `provider_id` | Unique identifier |
| `requestType` | `request_type` | Mapped to radio buttons |
| `status` | `request_status` | Controlled vocabulary |
| `ptoFormPath` | `pto_form_upload` | File upload field |

## Security Considerations

### Data Protection
- All data encrypted in transit and at rest
- Role-based access controls enforced
- Audit trail maintained for all changes
- Regular security updates applied

### Compliance
- HIPAA compliance maintained
- Institutional review board approval if required
- Data retention policies enforced
- User access regularly reviewed

## Troubleshooting

### Migration Issues

**Problem**: Migration script fails with authentication error
**Solution**: Verify API token and URL are correct

**Problem**: Some records fail to import
**Solution**: Check data validation errors in migration log

**Problem**: File uploads not working
**Solution**: Verify file paths and permissions

### Operational Issues

**Problem**: Users not receiving email notifications
**Solution**: Check email configuration and spam filters

**Problem**: Slow system performance
**Solution**: Review REDCap server resources and optimize queries

## Support Contacts

- **Technical Support**: IT Help Desk
- **REDCap Administration**: REDCap Support Team
- **Functional Support**: Dr. Nicolas Lescano (Author)
- **Emergency Contact**: On-call IT Support

---

## Migration Timeline

| Phase | Duration | Activities |
|-------|----------|------------|
| Planning | 1 week | Requirements gathering, project setup |
| Development | 2 weeks | REDCap configuration, testing |
| Migration | 1 week | Data migration, validation |
| Training | 1 week | User training, documentation |
| Go-Live | 1 week | Deployment, monitoring |
| Support | 4 weeks | Post-go-live support and optimization |

**Total Estimated Duration**: 10 weeks

---

*This migration guide was created for the University of Pennsylvania Department of Psychiatry's transition from the custom Scheder application to REDCap.*