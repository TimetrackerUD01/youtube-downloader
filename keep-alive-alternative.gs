/**
 * ALTERNATIVE VERSION - More Frequent Ping (10 minutes)
 * For servers that need more frequent keep-alive pings
 */

const SERVER_URL = 'https://youtube-downloader-zdxh.onrender.com';

function pingServer() {
  try {
    const startTime = new Date().getTime();
    const response = UrlFetchApp.fetch(SERVER_URL, {
      'method': 'GET',
      'timeout': 30000,
      'muteHttpExceptions': true,
      'headers': {
        'User-Agent': 'Google-Apps-Script-Keep-Alive/1.0'
      }
    });
    
    const endTime = new Date().getTime();
    const responseTime = endTime - startTime;
    const status = response.getResponseCode();
    const timestamp = new Date();
    
    console.log(`[${timestamp.toISOString()}] Ping result: ${status} (${responseTime}ms)`);
    
    if (status >= 200 && status < 300) {
      console.log('✅ Server is alive and responding!');
    } else {
      console.log(`⚠️ Server returned status: ${status}`);
      
      // Try health endpoint if main fails
      tryHealthEndpoint();
    }
    
  } catch (error) {
    console.log(`❌ Ping failed: ${error}`);
    
    // Retry once after 30 seconds
    Utilities.sleep(30000);
    retryPing();
  }
}

function tryHealthEndpoint() {
  try {
    const healthUrl = `${SERVER_URL}/health`;
    const response = UrlFetchApp.fetch(healthUrl, {
      'method': 'GET',
      'timeout': 15000,
      'muteHttpExceptions': true
    });
    
    const status = response.getResponseCode();
    console.log(`🏥 Health check: ${status}`);
    
  } catch (error) {
    console.log(`ℹ️ Health endpoint not available`);
  }
}

function retryPing() {
  try {
    const response = UrlFetchApp.fetch(SERVER_URL, {
      'method': 'GET',
      'timeout': 20000,
      'muteHttpExceptions': true
    });
    
    const status = response.getResponseCode();
    console.log(`🔄 Retry result: ${status}`);
    
  } catch (error) {
    console.log(`❌ Retry failed: ${error}`);
  }
}

function setupTriggers() {
  // Delete existing triggers
  ScriptApp.getProjectTriggers()
    .filter(t => t.getHandlerFunction() === 'pingServer')
    .forEach(t => ScriptApp.deleteTrigger(t));
  
  // Create new trigger - ping every 10 minutes for maximum uptime
  ScriptApp.newTrigger('pingServer')
    .timeBased()
    .everyMinutes(10)
    .create();
  
  console.log('✅ High-frequency keep-alive trigger created!');
  console.log('🔄 Pinging every 10 minutes for maximum server uptime');
  console.log('⚡ Server will never sleep with this configuration');
  
  // Run initial ping
  pingServer();
}

function setupLowFrequency() {
  // Alternative: 15 minutes (less Google Apps Script quota usage)
  ScriptApp.getProjectTriggers()
    .filter(t => t.getHandlerFunction() === 'pingServer')
    .forEach(t => ScriptApp.deleteTrigger(t));
  
  ScriptApp.newTrigger('pingServer')
    .timeBased()
    .everyMinutes(15)
    .create();
  
  console.log('✅ Low-frequency keep-alive trigger created (15 minutes)');
  pingServer();
}

function stopKeepAlive() {
  ScriptApp.getProjectTriggers()
    .filter(t => t.getHandlerFunction() === 'pingServer')
    .forEach(t => ScriptApp.deleteTrigger(t));
  
  console.log('🛑 Keep-alive stopped.');
}

function getStatus() {
  const triggers = ScriptApp.getProjectTriggers()
    .filter(t => t.getHandlerFunction() === 'pingServer');
  
  if (triggers.length > 0) {
    console.log(`✅ Active triggers: ${triggers.length}`);
    console.log(`🔄 Current configuration: Keep server awake 24/7`);
  } else {
    console.log('❌ No active triggers. Server may sleep.');
    console.log('💡 Run setupTriggers() to activate keep-alive');
  }
  
  return triggers.length;
}

/**
 * INSTRUCTIONS:
 * 
 * For MAXIMUM uptime (recommended):
 * - Run setupTriggers() → pings every 10 minutes
 * 
 * For MODERATE uptime (quota-friendly):
 * - Run setupLowFrequency() → pings every 15 minutes
 * 
 * To check status:
 * - Run getStatus()
 * 
 * To stop:
 * - Run stopKeepAlive()
 */
