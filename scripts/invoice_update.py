import os
import sys
import json
import urllib.request
import urllib.error
import webbrowser

TARGET_DIR = r"C:\SensitiveData"
BACKEND_URL = "http://localhost:5000/api/status"
REPORT_URL = "http://localhost:5000/api/report-payload"

def check_protection():
    try:
        req = urllib.request.Request(BACKEND_URL)
        with urllib.request.urlopen(req, timeout=2) as response:
            data = json.loads(response.read().decode())
            return data.get("wazuhActive", False)
    except Exception:
        return False

def report_status(status_details):
    try:
        req = urllib.request.Request(
            REPORT_URL,
            data=json.dumps(status_details).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
        )
        with urllib.request.urlopen(req, timeout=2) as response:
            pass
    except Exception:
        pass

def show_ransom_note():
    html_content = """<!DOCTYPE html>
<html>
<head>
    <title>LockBit 5.0 - Alert</title>
    <style>
        body {
            background-color: #0f0f11;
            color: #ffffff;
            font-family: 'Courier New', Courier, monospace;
            padding: 30px;
            margin: 0;
        }
        .header {
            background-color: #ff3333;
            color: #ffffff;
            padding: 20px;
            text-align: center;
            font-weight: bold;
            font-size: 28px;
            border-radius: 4px;
            letter-spacing: 2px;
            box-shadow: 0 0 20px rgba(255, 51, 51, 0.4);
        }
        .logo-box {
            font-size: 40px;
            color: #ff3333;
            margin: 20px 0;
            text-align: center;
            font-weight: 900;
        }
        .content {
            border: 1px solid #333;
            background-color: #16161a;
            padding: 30px;
            border-radius: 6px;
            margin-top: 20px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.5);
        }
        h2 {
            color: #ff3333;
            border-bottom: 1px solid #333;
            padding-bottom: 10px;
            font-size: 22px;
        }
        p {
            line-height: 1.6;
            font-size: 15px;
            color: #d1d1d6;
        }
        .warning-box {
            background-color: rgba(255, 51, 51, 0.08);
            border-left: 5px solid #ff3333;
            padding: 15px;
            margin: 20px 0;
        }
        .warning-box ul {
            margin: 5px 0 0 20px;
            padding: 0;
        }
        .warning-box li {
            margin: 5px 0;
            color: #ffb3b3;
        }
        .highlight {
            color: #ff3333;
            font-weight: bold;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 13px;
            color: #555;
            border-top: 1px solid #222;
            padding-top: 20px;
        }
    </style>
</head>
<body>
    <div class="logo-box">LockBit 5.0</div>
    <div class="header">
        ALL YOUR FILES ARE ENCRYPTED!
    </div>
    
    <div class="content">
        <h2>What Happened?</h2>
        <p>Your systems at <span class="highlight">ACI Logistics Limited / Shwapno</span> have been compromised. Personal data, sales databases, suppliers documents, and administrative files have been encrypted using safe cryptographic routines.</p>
        <p>The total volume of exfiltrated data is <span class="highlight">410 GB</span>. If you do not pay the ransom of <span class="highlight">$1.5 Million (Tk 18.3 Crore)</span> before the deadline, all details will be published on the LockBit leak portal.</p>
        
        <div class="warning-box">
            <strong>ATTENTION:</strong>
            <ul>
                <li>Do not attempt to rename, decrypt, or modify locked files.</li>
                <li>Do not use third-party recovery software; you risk damaging database records permanently.</li>
                <li>Contact the LockBit 5.0 representative via the Tor browser portal immediately to negotiate restoration.</li>
            </ul>
        </div>
        
        <h2>How to negotiate?</h2>
        <p>1. Download and install Tor Browser: <span class="highlight">https://www.torproject.org/</span></p>
        <p>2. Open Tor Browser and visit the chat portal link left in your system directories.</p>
    </div>
    
    <div class="footer">
        LockBit 5.0 Syndicate - Safe Simulation Environment - Educational Demo Only
    </div>
</body>
</html>
"""
    note_path = os.path.join(TARGET_DIR, "ransomware_warning.html")
    try:
        with open(note_path, "w", encoding="utf-8") as f:
            f.write(html_content)
        webbrowser.open(f"file:///{note_path}")
    except Exception as e:
        print(f"Failed to show ransom note: {e}")

def main():
    print("Executing invoice_update.py simulated payload...")
    is_protected = check_protection()
    
    if is_protected:
        print("[WAZUH DETECTED] Suspicious file modification and process creation blocked.")
        report_status({
            "status": "blocked",
            "message": "Wazuh Active Response detected process creation (invoice_update.py) and blocked file renaming."
        })
        sys.exit(0)
        
    print("[UNPROTECTED] Simulating encryption...")
    if not os.path.exists(TARGET_DIR):
        print(f"Directory {TARGET_DIR} does not exist. Please run setup_db.py first.")
        sys.exit(1)
        
    locked_files = []
    for filename in os.listdir(TARGET_DIR):
        file_path = os.path.join(TARGET_DIR, filename)
        if os.path.isfile(file_path) and not filename.endswith(".locked") and filename != "ransomware_warning.html":
            new_path = file_path + ".locked"
            try:
                os.rename(file_path, new_path)
                locked_files.append(filename)
                print(f"Renamed: {filename} -> {filename}.locked")
            except Exception as e:
                print(f"Failed to rename {filename}: {e}")
                
    report_status({
        "status": "success",
        "lockedFiles": locked_files
    })
    
    show_ransom_note()
    print("Simulation execution complete. LockBit 5.0 warning displayed.")

if __name__ == "__main__":
    main()
