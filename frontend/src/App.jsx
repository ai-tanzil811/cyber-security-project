import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  ShieldAlert, 
  FileText, 
  Lock, 
  Unlock, 
  Settings, 
  Activity,
  FileCode,
  RefreshCw,
  Eye,
  Server,
  Database,
  Users,
  HardDrive
} from 'lucide-react';
import './App.css';

function App() {
  const [wazuhActive, setWazuhActive] = useState(false);
  const [myDlpActive, setMyDlpActive] = useState(false);
  const [files, setFiles] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [payloadStatus, setPayloadStatus] = useState('idle');

  // Poll backend for system status every 1.5 seconds
  const fetchStatus = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/status');
      if (response.ok) {
        const data = await response.json();
        setWazuhActive(data.wazuhActive);
        setMyDlpActive(data.myDlpActive);
        setFiles(data.files);
        setAlerts(data.alerts);
        setPayloadStatus(data.payloadStatus);
      }
    } catch (error) {
      console.error('Error contacting backend server:', error);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 1500);
    return () => clearInterval(interval);
  }, []);

  // Toggle Wazuh and MyDLP
  const handleToggle = async (type, val) => {
    try {
      const payload = type === 'wazuh' ? { wazuh: val } : { myDlp: val };
      const response = await fetch('http://localhost:5000/api/toggle-protection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        fetchStatus();
      }
    } catch (error) {
      console.error('Failed to toggle protection:', error);
    }
  };

  // Restore environment (IR Simulation)
  const handleRestore = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/restore', {
        method: 'POST'
      });
      if (response.ok) {
        fetchStatus();
      }
    } catch (error) {
      console.error('Failed to restore files:', error);
    }
  };

  const hasFiles = files.length > 0;
  const isLocked = files.some(f => f.isLocked);

  return (
    <div className="app-container">
      <header style={{ borderBottom: '3px solid #fec107' }}>
        <div className="logo-section">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ 
              backgroundColor: '#ff2525', 
              color: '#fff', 
              padding: '6px 12px', 
              fontSize: '1.4rem', 
              fontWeight: 'bold', 
              borderRadius: '4px',
              border: '2px solid #fff'
            }}>shwapno</span>
            <h1 style={{ margin: 0, fontSize: '1.2rem', letterSpacing: '0.5px' }}>
              ADMIN <span style={{ color: '#fec107' }}>DATABASE PORTAL</span>
            </h1>
          </div>
          <div className="logo-subtitle" style={{ color: '#a0aec0' }}>ACI LOGISTICS LIMITED - PRODUCTION ENVIRONMENT</div>
        </div>
        
        <div className="global-controls">
          <div className="status-indicator">
            <span className="text-muted">WAZUH SIEM:</span>
            <span className={`dot ${wazuhActive ? 'active' : 'danger'}`}></span>
            <span className={wazuhActive ? 'active' : 'text-muted'}>
              {wazuhActive ? 'ON' : 'OFF'}
            </span>
          </div>
          <div className="status-indicator">
            <span className="text-muted">MyDLP AGENT:</span>
            <span className={`dot ${myDlpActive ? 'active' : 'danger'}`}></span>
            <span className={myDlpActive ? 'active' : 'text-muted'}>
              {myDlpActive ? 'ON' : 'OFF'}
            </span>
          </div>
        </div>
      </header>

      <div className="dashboard-grid 3-panel-layout">
        {/* PANEL 1: Shwapno Admin Database Console */}
        <div className="panel victim-panel" style={{ gridRow: 'span 2', height: '100%' }}>
          <div className="panel-header">
            <span className="panel-title" style={{ color: '#fff' }}>
              <Server size={18} style={{ color: '#ff2525' }} /> Shwapno Core Infrastructure
            </span>
            <button className="btn btn-green" onClick={handleRestore} disabled={payloadStatus === 'idle'}>
              <RefreshCw size={14} /> Emergency Recovery: Restore Data
            </button>
          </div>
          <div className="panel-content">
            {/* Server Performance Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
              <div style={{ padding: '0.75rem', backgroundColor: '#070913', border: '1px solid #1e293b', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                  <Users size={14} /> Registered Customers
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', marginTop: '0.25rem', color: '#fec107' }}>4,000,000</div>
              </div>
              <div style={{ padding: '0.75rem', backgroundColor: '#070913', border: '1px solid #1e293b', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                  <Database size={14} /> Total DB Size
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', marginTop: '0.25rem' }}>410 GB</div>
              </div>
              <div style={{ padding: '0.75rem', backgroundColor: '#070913', border: '1px solid #1e293b', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                  <HardDrive size={14} /> System Status
                </div>
                <div style={{ 
                  fontSize: '1.1rem', 
                  fontWeight: 'bold', 
                  marginTop: '0.25rem',
                  color: isLocked ? 'var(--accent-red)' : 'var(--accent-green)' 
                }}>
                  {isLocked ? 'COMPROMISED' : 'ONLINE'}
                </div>
              </div>
            </div>

            <div className="settings-group" style={{ padding: '0.75rem 1rem' }}>
              <div className="setting-row" style={{ fontSize: '0.85rem' }}>
                <div><strong>Server Path:</strong> C:\SensitiveData\</div>
                <div style={{ color: isLocked ? 'var(--accent-red)' : 'var(--accent-green)', fontWeight: 'bold' }}>
                  {isLocked ? '⚠ LOCKBIT 5.0 ATTACK ACTIVE' : '✓ DIRECTORIES SECURED'}
                </div>
              </div>
            </div>

            <div className="file-list" style={{ flex: 1, overflowY: 'auto' }}>
              {!hasFiles ? (
                <div className="empty-state">
                  <FileText /> Server files not initialized. Run setup_db.py to configure.
                </div>
              ) : (
                files.map((file, idx) => (
                  <div key={idx} className="file-item">
                    <div className="file-info">
                      <div className="file-icon" style={{ color: file.isLocked ? 'var(--accent-red)' : 'var(--text-secondary)' }}>
                        {file.name.includes('.sql') ? <FileCode size={18} /> : <FileText size={18} />}
                      </div>
                      <div>
                        <div className="file-name" style={{ textDecoration: file.isLocked ? 'line-through' : 'none' }}>
                          {file.displayName}
                        </div>
                        <div className="file-size">{(file.size / 1024).toFixed(2)} KB</div>
                      </div>
                    </div>
                    <div>
                      {file.isLocked ? (
                        <span className="file-status locked" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ff3333', borderColor: 'rgba(239,68,68,0.3)' }}>
                          <Lock size={12} style={{ marginRight: '4px' }} /> ENCRYPTED
                        </span>
                      ) : (
                        <span className="file-status unlocked" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-green)', borderColor: 'rgba(16,185,129,0.3)' }}>
                          <Unlock size={12} style={{ marginRight: '4px' }} /> SECURED
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* PANEL 2: Wazuh SIEM Alarms */}
        <div className="panel wazuh-panel">
          <div className="panel-header">
            <span className="panel-title" style={{ color: '#fff' }}>
              <ShieldAlert style={{ color: '#fec107' }} /> Wazuh Dashboard (SIEM Threat Intel)
            </span>
            <span className="status-indicator">
              <span className={`dot ${wazuhActive ? 'active' : 'danger'}`}></span>
              <span>{wazuhActive ? 'SIEM ACTIVE' : 'SIEM OFFLINE'}</span>
            </span>
          </div>
          <div className="panel-content">
            <div className="wazuh-alerts-list" style={{ flex: 1, overflowY: 'auto' }}>
              {alerts.filter(a => a.type === 'wazuh').length === 0 ? (
                <div className="empty-state">
                  <Shield />
                  Wazuh logs clear. Trigger a payload simulation from Kali to see security events.
                </div>
              ) : (
                alerts.filter(a => a.type === 'wazuh').map((alert) => (
                  <div key={alert.id} className="alert-card high" style={{ borderLeftColor: '#ff2525' }}>
                    <div className="alert-meta">
                      <span>AGENT: Shwapno-Server-01</span>
                      <span>{alert.timestamp}</span>
                    </div>
                    <div className="alert-title">{alert.title}</div>
                    <div className="alert-desc">{alert.message}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* PANEL 3: Security Settings & MyDLP logs */}
        <div className="panel dlp-panel">
          <div className="panel-header">
            <span className="panel-title" style={{ color: '#fff' }}>
              <Settings style={{ color: 'var(--accent-cyan)' }} /> MyDLP Policies & Leakage Logs
            </span>
          </div>
          <div className="panel-content">
            {/* Setting Configuration */}
            <div className="settings-group">
              <div className="setting-row">
                <div className="setting-info">
                  <h4>Wazuh Active Response Rules</h4>
                  <p>Enables active block on illegal system process calls</p>
                </div>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={wazuhActive}
                    onChange={(e) => handleToggle('wazuh', e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="setting-row">
                <div className="setting-info">
                  <h4>MyDLP Database Protection Rules</h4>
                  <p>Blocks bulk outbound uploads containing SQL customer dumps</p>
                </div>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={myDlpActive}
                    onChange={(e) => handleToggle('myDlp', e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </div>

            {/* DLP Logs */}
            <div className="dlp-logs-list" style={{ flex: 1, overflowY: 'auto' }}>
              {alerts.filter(a => a.type === 'dlp').length === 0 ? (
                <div className="empty-state">
                  <Eye />
                  No leakage events intercepted. Try SQL exfiltration under protection.
                </div>
              ) : (
                alerts.filter(a => a.type === 'dlp').map((alert) => (
                  <div key={alert.id} className="alert-card dlp-alert" style={{ borderLeftColor: 'var(--accent-cyan)' }}>
                    <div className="alert-meta">
                      <span>MODULE: Shwapno-DLP-Filter</span>
                      <span>{alert.timestamp}</span>
                    </div>
                    <div className="alert-title">{alert.title}</div>
                    <div className="alert-desc">{alert.message}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <footer>
        Shwapno Incident Case Study Replication Lab © 2026. Closed Environment Simulation.
      </footer>
    </div>
  );
}

export default App;
