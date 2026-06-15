# Shwapno Customer Data Leakage - Ransomware Detection & Prevention Lab

An educational, interactive, and safe lab environment simulating the **Shwapno Customer Data Leakage Incident** (compromise of 4 million registered users, $1.5M ransom demand, and 410 GB data leak). It demonstrates how a ransomware payload (Qilin variant) affects Shwapno's database servers, how data is exfiltrated to the **LockBit 5.0** portal, and how Wazuh SIEM and MyDLP controls intercept the attack.

> [!NOTE]  
> **Safe Simulation:** This project does **NOT** use actual ransomware or perform real encryption. File locking is simulated using non-destructive file renaming (`.locked`) and a high-fidelity cosmetic **LockBit 5.0** warning note.

---

## 💻 Tech Stack
* **Shwapno Database System (Windows Host):**
  * **Backend Service:** Node.js + Express API (manages system state and file system operations).
  * **Admin Dashboard UI:** React + Vite (replicates the **Shwapno Database Administration Portal** displaying file statuses, Wazuh SIEM alarms, and MyDLP logs).
  * **Ransomware Simulator:** Python (performs file renaming and launches the visual LockBit 5.0 ransom note).
* **Attacker System (Kali Linux / WSL2):**
  * **C2 Console:** Interactive Bash script (`attacker_c2.sh`) communicating with the Windows host via curl.

---

## 🛠️ Prerequisites

Before starting, ensure your Windows host has the following installed:
1. **Node.js** (v18 or higher) -> [Download here](https://nodejs.org/)
2. **Python 3** -> [Download here](https://www.python.org/)
3. **WSL2** with **Kali Linux** installed.
   * Verify inside PowerShell:
     ```powershell
     wsl -l -v
     ```
   * If Kali is not installed, install it via:
     ```powershell
     wsl --install -d kali-linux
     ```

---

## 📂 Project Structure

```
CS FINAL Implementation/
├── run_project.bat         # One-click automation launcher
├── scripts/
│   ├── setup_db.py         # Seeds C:\SensitiveData with mock databases and files
│   ├── invoice_update.py   # Safe simulated ransomware payload
│   └── attacker_c2.sh      # Bash command-line interface for the attacker
├── backend/
│   ├── server.js           # Coordinates states, API endpoints, and logs
│   └── package.json        # Backend server dependencies (Express, Cors)
└── frontend/
    ├── src/
    │   ├── App.jsx         # 3-panel victim visualizer
    │   └── index.css       # Obsidian cybersecurity stylesheet
    └── index.html          # Web entry point
```

---

## 🚀 Getting Started (Automatic Startup)

The easiest way to run the entire project is using the Windows batch launcher:

1. Close any running node or python scripts in your current terminals.
2. Double-click the **`run_project.bat`** (or **`tanzil.bat`**) script in the project root folder.
3. This batch script will automate the following:
   * Seed/Reset `C:\SensitiveData` with clean files.
   * Start the Backend API Server on `http://localhost:5000`.
   * Start the React Web Dashboard on `http://localhost:5173`.
   * Open the Kali Linux C2 Terminal automatically in a separate console window.
   * Open your default browser to the web interface.

---

## 🔍 How to Run the Demonstration Scenarios

Once the launcher runs and all windows open, follow these steps to demonstrate the lab:

### **Scenario 1: Unprotected Environment (Attack Successful)**
1. On the **Web Dashboard** (`http://localhost:5173`), turn **OFF** both toggles:
   * **Wazuh Endpoint Protection**
   * **MyDLP Data Loss Prevention**
2. In the **Kali Linux CLI Console** (C2 window), press **`1`** to dispatch the phishing email.
   * On Windows, a simulated ransomware warning page opens in the browser.
   * On the Web Dashboard, files in `C:\SensitiveData` will turn red and mark as **Locked**.
3. In the **Kali Linux CLI Console**, press **`2`** to attempt exfiltration.
   * The exfiltration succeeds.
   * The database record content (John Smith, Sarah Khan, etc.) is dumped directly inside your Kali CLI.

---

### **Scenario 2: Protected Environment (Detection & Prevention)**
1. On the **Web Dashboard**, click the green **"Restore / Recover Files"** button (top-left) to clean the directory and close the ransom note.
2. Turn **ON** both toggles:
   * **Wazuh Endpoint Protection**
   * **MyDLP Data Loss Prevention**
3. In the **Kali Linux CLI Console**, press **`1`** to dispatch the phishing email again.
   * The script runs but detects the active Wazuh agent and terminates safely.
   * On the Web Dashboard, a **High-Severity Wazuh Alert** pops up: *“Potential Ransomware Behavior Detected: Process invoice_update.py attempted unauthorized bulk file renaming”*.
   * The victim files remain safe and **Active**.
4. In the **Kali Linux CLI Console**, press **`2`** to attempt exfiltration.
   * The request is intercepted by the MyDLP rules.
   * The Kali CLI prints: `[X] EXFILTRATION BLOCKED: Intercepted by MyDLP Agent!`.
   * On the Web Dashboard, the **MyDLP Incident Logs** record the event: *“DLP Policy: Customer Data Protection intercepted and blocked web upload of customer_data.sql.”*
5. In the **Kali Linux CLI Console**, press **`3`** to check logs showing the failed campaign status.

---

## 💡 Important Learning Concepts Covered
* **Initial Access & Phishing:** Demonstrates social engineering entry points.
* **Double Extortion:** Attackers steal data before applying encryption (neutralizing system backups).
* **File Integrity Monitoring (FIM):** Wazuh rules monitor anomalous bulk file extensions and system state changes.
* **Active Response:** Security tools dynamically block execution paths when a threat signature matches.
* **Data Loss Prevention (DLP):** How policies filter files containing customer identifiers (like phone numbers/emails) from leaving the organization via web endpoints.
