/**
 * QUICK SETUP VERSION - YouTube Downloader Keep-Alive
 * Copy this code to Google Apps Script and run setupTriggers() once
 */

const SERVER_URL = 'https://youtube-downloader-zdxh.onrender.com';

function pingServer() {
  try {
    const response = UrlFetchApp.fetch(SERVER_URL, {
      'method': 'GET',
      'timeout': 30000,
      'muteHttpExceptions': true
    });
    
    const status = response.getResponseCode();
    const timestamp = new Date();
    
    console.log(`[${timestamp.toISOString()}] Ping result: ${status}`);
    
    if (status >= 200 && status < 300) {
      console.log('✅ Server is alive!');
    } else {
      console.log(`⚠️ Server returned status: ${status}`);
    }
    
  } catch (error) {
    console.log(`❌ Ping failed: ${error}`);
  }
}

function setupTriggers() {
  // Delete existing triggers
  ScriptApp.getProjectTriggers()
    .filter(t => t.getHandlerFunction() === 'pingServer')
    .forEach(t => ScriptApp.deleteTrigger(t));
    // Create new trigger - ping every 15 minutes (Google Apps Script limitation)
  ScriptApp.newTrigger('pingServer')
    .timeBased()
    .everyMinutes(15)
    .create();
  
  console.log('✅ Keep-alive trigger created! Pinging every 15 minutes.');
  console.log('⚠️  Note: Server may sleep briefly but will wake up quickly.');
  
  // Run initial ping
  pingServer();
}

function stopKeepAlive() {
  ScriptApp.getProjectTriggers()
    .filter(t => t.getHandlerFunction() === 'pingServer')
    .forEach(t => ScriptApp.deleteTrigger(t));
  
  console.log('🛑 Keep-alive stopped.');
}

/**
 * INSTRUCTIONS:
 * 1. Go to script.google.com
 * 2. Create new project
 * 3. Replace code with this script
 * 4. Run setupTriggers() function once
 * 5. Authorize permissions when prompted
 * 6. Done! Your server will stay awake 24/7
 */
