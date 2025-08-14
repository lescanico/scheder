#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { REDCapAPI, SchederREDCapMigration } = require('./api-integration');

// Configuration
const CONFIG = {
  redCapUrl: process.env.REDCAP_API_URL || 'https://redcap.institution.edu/api/',
  redCapToken: process.env.REDCAP_API_TOKEN || '',
  schederDataPath: process.env.SCHEDER_DATA_PATH || '../server/data/requests.json',
  backupPath: './migration-backup.json',
  logFile: './migration.log'
};

// Logging utility
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  fs.appendFileSync(CONFIG.logFile, logMessage + '\n');
}

// Load existing Scheder data
function loadSchederData() {
  try {
    const dataPath = path.resolve(CONFIG.schederDataPath);
    if (!fs.existsSync(dataPath)) {
      log(`Warning: Scheder data file not found at ${dataPath}`);
      return [];
    }
    
    const rawData = fs.readFileSync(dataPath, 'utf8');
    const data = JSON.parse(rawData);
    log(`Loaded ${data.length} records from Scheder database`);
    return data;
  } catch (error) {
    log(`Error loading Scheder data: ${error.message}`);
    return [];
  }
}

// Create backup of existing data
function createBackup(data) {
  try {
    fs.writeFileSync(CONFIG.backupPath, JSON.stringify(data, null, 2));
    log(`Created backup at ${CONFIG.backupPath}`);
  } catch (error) {
    log(`Error creating backup: ${error.message}`);
    throw error;
  }
}

// Validate configuration
function validateConfig() {
  const errors = [];
  
  if (!CONFIG.redCapUrl) {
    errors.push('REDCAP_API_URL environment variable is required');
  }
  
  if (!CONFIG.redCapToken) {
    errors.push('REDCAP_API_TOKEN environment variable is required');
  }
  
  if (errors.length > 0) {
    log('Configuration errors:');
    errors.forEach(error => log(`  - ${error}`));
    return false;
  }
  
  return true;
}

// Generate migration report
function generateReport(results, validationIssues) {
  const report = {
    timestamp: new Date().toISOString(),
    migration: results,
    validation: {
      issues: validationIssues,
      issueCount: validationIssues.length
    },
    summary: {
      totalRecords: results.successful + results.failed,
      successRate: results.successful / (results.successful + results.failed) * 100
    }
  };
  
  const reportPath = './migration-report.json';
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  log(`Migration report saved to ${reportPath}`);
  
  return report;
}

// Main migration function
async function runMigration() {
  log('=== Scheder to REDCap Migration Started ===');
  
  try {
    // Validate configuration
    if (!validateConfig()) {
      process.exit(1);
    }
    
    // Load Scheder data
    const schederData = loadSchederData();
    if (schederData.length === 0) {
      log('No data to migrate. Exiting.');
      return;
    }
    
    // Create backup
    createBackup(schederData);
    
    // Initialize REDCap API
    const redCapAPI = new REDCapAPI(CONFIG.redCapUrl, CONFIG.redCapToken);
    
    // Initialize migration utility
    const migration = new SchederREDCapMigration(redCapAPI, schederData);
    
    // Validate data
    log('Validating data before migration...');
    const validationIssues = migration.validateData();
    if (validationIssues.length > 0) {
      log('Validation issues found:');
      validationIssues.forEach(issue => log(`  - ${issue}`));
      
      const proceed = process.argv.includes('--force');
      if (!proceed) {
        log('Migration stopped due to validation errors. Use --force to proceed anyway.');
        process.exit(1);
      }
    }
    
    // Test REDCap connection
    log('Testing REDCap connection...');
    try {
      await redCapAPI.getRecords({ records: ['1'], fields: ['record_id'] });
      log('REDCap connection successful');
    } catch (error) {
      log(`REDCap connection failed: ${error.message}`);
      process.exit(1);
    }
    
    // Perform migration
    log('Starting data migration...');
    const results = await migration.migrateAllData();
    
    // Generate report
    const report = generateReport(results, validationIssues);
    
    // Log summary
    log('=== Migration Summary ===');
    log(`Total Records: ${report.summary.totalRecords}`);
    log(`Successful: ${results.successful}`);
    log(`Failed: ${results.failed}`);
    log(`Success Rate: ${report.summary.successRate.toFixed(2)}%`);
    
    if (results.errors.length > 0) {
      log('Errors encountered:');
      results.errors.forEach(error => {
        log(`  - Record ${error.requestId}: ${error.error}`);
      });
    }
    
    log('=== Scheder to REDCap Migration Completed ===');
    
  } catch (error) {
    log(`Migration failed: ${error.message}`);
    process.exit(1);
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Scheder to REDCap Migration Tool

Usage: node data-migration-script.js [options]

Options:
  --help, -h     Show this help message
  --force        Proceed with migration even if validation errors are found
  --dry-run      Validate data without performing migration

Environment Variables:
  REDCAP_API_URL    REDCap API endpoint URL
  REDCAP_API_TOKEN  REDCap API token
  SCHEDER_DATA_PATH Path to Scheder data file (optional)

Examples:
  # Basic migration
  REDCAP_API_URL="https://redcap.institution.edu/api/" REDCAP_API_TOKEN="your-token" node data-migration-script.js
  
  # Force migration with validation errors
  node data-migration-script.js --force
  
  # Dry run (validation only)
  node data-migration-script.js --dry-run
    `);
    process.exit(0);
  }
  
  if (args.includes('--dry-run')) {
    log('=== Dry Run Mode - Validation Only ===');
    const schederData = loadSchederData();
    const migration = new SchederREDCapMigration(null, schederData);
    const issues = migration.validateData();
    
    if (issues.length === 0) {
      log('✓ All data is valid for migration');
    } else {
      log('Validation issues found:');
      issues.forEach(issue => log(`  - ${issue}`));
    }
    process.exit(0);
  }
  
  runMigration();
}