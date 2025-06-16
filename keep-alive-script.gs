/**
 * YouTube Downloader Keep-Alive Script
 * Google Apps Script to ping server every 14 minutes to prevent sleep
 * 
 * Setup Instructions:
 * 1. Go to script.google.com
 * 2. Create new project
 * 3. Paste this code
 * 4. Save and run setupTriggers() once
 * 5. Authorize permissions
 */

// Configuration
const SERVER_URL = 'https://youtube-downloader-zdxh.onrender.com';
const PING_INTERVAL_MINUTES = 15; // Ping every 15 minutes (Google Apps Script supports: 1, 5, 10, 15, 30)
const MAX_RETRIES = 3;
const TIMEOUT_SECONDS = 30;

/**
 * Main function to ping the server
 */
function pingServer() {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Starting ping to ${SERVER_URL}`);
  
  try {
    const options = {
      'method': 'GET',
      'headers': {
        'User-Agent': 'Google-Apps-Script-Keep-Alive/1.0',
        'Accept': 'text/html,application/json'
      },
      'muteHttpExceptions': true,
      'timeout': TIMEOUT_SECONDS * 1000
    };
    
    const startTime = new Date().getTime();
    const response = UrlFetchApp.fetch(SERVER_URL, options);
    const endTime = new Date().getTime();
    const responseTime = endTime - startTime;
    
    const statusCode = response.getResponseCode();
    const responseText = response.getContentText().substring(0, 200); // First 200 chars
    
    if (statusCode >= 200 && statusCode < 300) {
      console.log(`✅ Ping successful! Status: ${statusCode}, Response time: ${responseTime}ms`);
      logToSheet('SUCCESS', statusCode, responseTime, responseText);
    } else {
      console.warn(`⚠️ Ping returned status: ${statusCode}, Response time: ${responseTime}ms`);
      logToSheet('WARNING', statusCode, responseTime, responseText);
    }
    
    // Optional: Send simple health check request to a specific endpoint
    pingHealthEndpoint();
    
  } catch (error) {
    console.error(`❌ Ping failed: ${error.toString()}`);
    logToSheet('ERROR', null, null, error.toString());
    
    // Retry logic
    retryPing(1);
  }
}

/**
 * Retry ping with exponential backoff
 */
function retryPing(attempt) {
  if (attempt > MAX_RETRIES) {
    console.error(`❌ Max retries (${MAX_RETRIES}) exceeded. Giving up.`);
    return;
  }
  
  const delay = Math.pow(2, attempt) * 1000; // Exponential backoff: 2s, 4s, 8s
  console.log(`🔄 Retrying ping in ${delay/1000} seconds (attempt ${attempt}/${MAX_RETRIES})`);
  
  Utilities.sleep(delay);
  
  try {
    const response = UrlFetchApp.fetch(SERVER_URL, {
      'method': 'GET',
      'muteHttpExceptions': true,
      'timeout': TIMEOUT_SECONDS * 1000
    });
    
    const statusCode = response.getResponseCode();
    if (statusCode >= 200 && statusCode < 300) {
      console.log(`✅ Retry ${attempt} successful! Status: ${statusCode}`);
      logToSheet('RETRY_SUCCESS', statusCode, null, `Retry ${attempt} successful`);
    } else {
      console.warn(`⚠️ Retry ${attempt} returned status: ${statusCode}`);
      retryPing(attempt + 1);
    }
  } catch (error) {
    console.error(`❌ Retry ${attempt} failed: ${error.toString()}`);
    retryPing(attempt + 1);
  }
}

/**
 * Ping health endpoint if available
 */
function pingHealthEndpoint() {
  try {
    const healthUrl = `${SERVER_URL}/health`;
    const response = UrlFetchApp.fetch(healthUrl, {
      'method': 'GET',
      'muteHttpExceptions': true,
      'timeout': 10000 // 10 seconds timeout for health check
    });
    
    const statusCode = response.getResponseCode();
    if (statusCode === 200) {
      console.log(`💚 Health check passed`);
    }
  } catch (error) {
    // Health endpoint might not exist, that's okay
    console.log(`ℹ️ Health endpoint not available (this is normal)`);
  }
}

/**
 * Log results to Google Sheets for monitoring
 */
function logToSheet(status, statusCode, responseTime, message) {
  try {
    const sheetName = 'Keep-Alive-Log';
    let sheet;
    
    // Try to get existing sheet or create new one
    try {
      const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
      sheet = spreadsheet.getSheetByName(sheetName);
    } catch (e) {
      // No active spreadsheet, create new one
      const spreadsheet = SpreadsheetApp.create('YouTube Downloader Keep-Alive Monitor');
      sheet = spreadsheet.getActiveSheet();
      sheet.setName(sheetName);
    }
    
    if (!sheet) {
      const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
      sheet = spreadsheet.insertSheet(sheetName);
    }
    
    // Add headers if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, 5).setValues([
        ['Timestamp', 'Status', 'HTTP Code', 'Response Time (ms)', 'Message']
      ]);
      sheet.getRange(1, 1, 1, 5).setFontWeight('bold');
    }
    
    // Add new log entry
    const timestamp = new Date();
    sheet.appendRow([timestamp, status, statusCode || '', responseTime || '', message || '']);
    
    // Keep only last 1000 entries
    const lastRow = sheet.getLastRow();
    if (lastRow > 1001) {
      sheet.deleteRows(2, lastRow - 1001);
    }
    
  } catch (error) {
    console.warn(`Could not log to sheet: ${error.toString()}`);
  }
}

/**
 * Setup automatic triggers (run this once manually)
 */
function setupTriggers() {
  // Delete existing triggers first
  deleteTriggers();
  
  // Create new trigger to run every 14 minutes
  ScriptApp.newTrigger('pingServer')
    .timeBased()
    .everyMinutes(PING_INTERVAL_MINUTES)
    .create();
    console.log(`✅ Trigger created! Will ping ${SERVER_URL} every ${PING_INTERVAL_MINUTES} minutes.`);
  console.log(`⚠️  Note: Using 15-minute interval (Google Apps Script limitation)`);
  console.log(`💡 Tip: Server may still sleep briefly but will wake up quickly`);
  
  // Run initial ping
  pingServer();
}

/**
 * Delete all triggers for this script
 */
function deleteTriggers() {
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'pingServer') {
      ScriptApp.deleteTrigger(trigger);
    }
  });
  console.log('🗑️ Existing triggers deleted.');
}

/**
 * Manual test function
 */
function testPing() {
  console.log('🧪 Testing ping functionality...');
  pingServer();
}

/**
 * Get current trigger status
 */
function getTriggerStatus() {
  const triggers = ScriptApp.getProjectTriggers();
  const pingTriggers = triggers.filter(trigger => trigger.getHandlerFunction() === 'pingServer');
  
  if (pingTriggers.length > 0) {
    console.log(`✅ Active triggers: ${pingTriggers.length}`);
    pingTriggers.forEach((trigger, index) => {
      console.log(`   Trigger ${index + 1}: ${trigger.getTriggerSource()} - ${trigger.getEventType()}`);
    });
  } else {
    console.log('❌ No active triggers found. Run setupTriggers() to create them.');
  }
  
  return pingTriggers.length;
}

/**
 * Emergency stop - delete all triggers
 */
function emergencyStop() {
  deleteTriggers();
  console.log('🛑 Emergency stop executed. All triggers deleted.');
}

/**
 * Advanced ping with multiple endpoints
 */
function advancedPing() {
  const endpoints = [
    '/',
    '/health',
    '/api/status'
  ];
  
  endpoints.forEach(endpoint => {
    try {
      const url = `${SERVER_URL}${endpoint}`;
      const response = UrlFetchApp.fetch(url, {
        'method': 'GET',
        'muteHttpExceptions': true,
        'timeout': 15000
      });
      
      console.log(`📍 ${endpoint}: ${response.getResponseCode()}`);
    } catch (error) {
      console.log(`📍 ${endpoint}: ERROR - ${error.toString()}`);
    }
  });
}
