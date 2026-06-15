const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Project Constants
const TARGET_DIR = 'C:\\SensitiveData';

// Global Simulation State
let wazuhActive = false;
let myDlpActive = false;
let alerts = [];
let attackerLogs = [];
let payloadStatus = 'idle'; // 'idle', 'running', 'success', 'blocked'

// Helper: Add alarm
function addAlert(type, title, message, severity) {
  alerts.unshift({
    id: '_' + Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toLocaleTimeString(),
    type, // 'wazuh' | 'dlp'
    title,
    message,
    severity // 'HIGH' | 'MEDIUM' | 'LOW'
  });
}

// Helper: Add attacker log
function addAttackerLog(logText) {
  attackerLogs.push({
    timestamp: new Date().toLocaleTimeString(),
    message: logText
  });
}

// Endpoint: Get current status, files, and alerts
app.get('/api/status', (req, res) => {
  let files = [];
  try {
    if (fs.existsSync(TARGET_DIR)) {
      const dirFiles = fs.readdirSync(TARGET_DIR);
      files = dirFiles.map(filename => {
        const isLocked = filename.endsWith('.locked');
        let displayName = filename;
        if (isLocked) {
          displayName = filename.replace('.locked', '');
        }
        return {
          name: filename,
          displayName,
          isLocked,
          size: fs.statSync(path.join(TARGET_DIR, filename)).size
        };
      });
    }
  } catch (err) {
    console.error("Error reading directory:", err);
  }

  res.json({
    wazuhActive,
    myDlpActive,
    files,
    alerts,
    attackerLogs,
    payloadStatus
  });
});

// Endpoint: Toggle security configurations
app.post('/api/toggle-protection', (req, res) => {
  const { wazuh, myDlp } = req.body;
  if (wazuh !== undefined) wazuhActive = wazuh;
  if (myDlp !== undefined) myDlpActive = myDlp;
  res.json({ success: true, wazuhActive, myDlpActive });
});

// Endpoint: Run phishing campaign / execute payload
app.post('/api/run-phishing', (req, res) => {
  payloadStatus = 'running';
  attackerLogs = []; // Reset logs for the new run
  
  addAttackerLog("Campaign Started...");
  addAttackerLog("Victim targeting: employee@company.local");
  addAttackerLog("Phishing Email Delivered successfully.");
  addAttackerLog("Waiting for user to open attachment...");

  const scriptPath = path.resolve(__dirname, '../scripts/invoice_update.py');

  // Trigger script asynchronously
  setTimeout(() => {
    addAttackerLog("User executed 'invoice_update.py'.");
    exec(`python "${scriptPath}"`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Script error: ${error.message}`);
        addAttackerLog(`Error during execution: ${error.message}`);
        payloadStatus = 'error';
        return;
      }
      console.log(`Script output: ${stdout}`);
    });
  }, 2000);

  res.json({ success: true, message: "Phishing campaign initialized." });
});

// Endpoint: Python script reports its execution status
app.post('/api/report-payload', (req, res) => {
  const { status, lockedFiles, message } = req.body;

  if (status === 'blocked') {
    payloadStatus = 'blocked';
    addAttackerLog("Process execution intercepted.");
    addAttackerLog("Wazuh Active Response rules triggered.");
    addAttackerLog("Execution Blocked.");
    addAttackerLog("Campaign Status: FAILED");

    addAlert(
      'wazuh',
      'Potential Ransomware Behavior Detected',
      message || 'Process invoice_update.py attempted unauthorized bulk file renaming in C:\\SensitiveData',
      'HIGH'
    );
  } else if (status === 'success') {
    payloadStatus = 'success';
    addAttackerLog("Simulation executed successfully.");
    if (lockedFiles && lockedFiles.length > 0) {
      lockedFiles.forEach(file => {
        addAttackerLog(`Target file impacted: ${file} -> ${file}.locked`);
      });
      addAttackerLog("Files Locked.");
    }
    addAttackerLog("Ransom note displayed to victim.");
    addAttackerLog("Campaign Status: SUCCESSFUL");
  }

  res.json({ success: true });
});

// Endpoint: Simulate data exfiltration
app.post('/api/exfiltrate', (req, res) => {
  addAttackerLog("Initiating Data Exfiltration request for customer_data.sql...");

  if (myDlpActive) {
    addAttackerLog("Data access request intercepted by MyDLP agent.");
    addAttackerLog("Data Exfiltration Blocked.");
    addAttackerLog("Exfiltration Status: FAILED");

    addAlert(
      'dlp',
      'Sensitive Data Transfer Blocked',
      'DLP Policy: Customer Data Protection intercepted and blocked web upload of customer_data.sql.',
      'HIGH'
    );
    res.status(403).json({
      success: false,
      message: 'Blocked by MyDLP Policy: Customer Data Protection'
    });
  } else {
    // Unprotected - exfiltrate SQL data
    addAttackerLog("Data access request processed.");
    
    let sqlContent = '';
    const sqlPath = path.join(TARGET_DIR, 'customer_data.sql');
    const sqlLockedPath = path.join(TARGET_DIR, 'customer_data.sql.locked');
    
    try {
      if (fs.existsSync(sqlPath)) {
        sqlContent = fs.readFileSync(sqlPath, 'utf8');
      } else if (fs.existsSync(sqlLockedPath)) {
        sqlContent = fs.readFileSync(sqlLockedPath, 'utf8');
      } else {
        sqlContent = '-- Database dump file not found --';
      }
      addAttackerLog("Exfiltrated 410 GB of database records and internal documentation.");
      addAttackerLog("Exfiltration Status: SUCCESSFUL");
      
      res.json({
        success: true,
        data: sqlContent
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Failed to read SQL file.' });
    }
  }
});

// Endpoint: Restore files (simulate Incident Response recovery)
app.post('/api/restore', (req, res) => {
  let restoredCount = 0;
  
  try {
    if (fs.existsSync(TARGET_DIR)) {
      const files = fs.readdirSync(TARGET_DIR);
      files.forEach(filename => {
        if (filename.endsWith('.locked')) {
          const oldPath = path.join(TARGET_DIR, filename);
          const newPath = path.join(TARGET_DIR, filename.replace('.locked', ''));
          fs.renameSync(oldPath, newPath);
          restoredCount++;
        }
      });

      // Remove the ransom note
      const notePath = path.join(TARGET_DIR, 'ransomware_warning.html');
      if (fs.existsSync(notePath)) {
        fs.unlinkSync(notePath);
      }
    }

    // Reset status
    alerts = [];
    attackerLogs = [];
    payloadStatus = 'idle';
    
    res.json({ success: true, restoredCount });
  } catch (err) {
    console.error("Restore error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server is running on http://0.0.0.0:${PORT}`);
});
