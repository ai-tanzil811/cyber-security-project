@echo off
title Cybersecurity Ransomware Lab Launcher
echo ========================================================
echo       Ransomware Simulation ^& Detection Lab Launcher
echo ========================================================
echo.

echo [+] Step 1: Initializing Victim Database ^& Files...
python scripts/setup_db.py
if %ERRORLEVEL% neq 0 (
    echo [X] Error running setup_db.py. Make sure Python is installed.
    pause
    exit /b %ERRORLEVEL%
)
echo.

echo [+] Step 2: Launching Express Backend Server (Port 5000)...
start "Ransomware Lab - Backend Server" cmd /k "cd backend && npm start"
timeout /t 2 /nobreak >nul

echo [+] Step 3: Launching React Frontend Dev Server (Port 5173)...
start "Ransomware Lab - Frontend UI" cmd /k "cd frontend && npm run dev"
timeout /t 3 /nobreak >nul

echo [+] Step 4: Launching Attacker C2 Console in Kali Linux (WSL)...
start "Ransomware Lab - Attacker C2 (Kali)" wsl -d kali-linux -e bash -c "cd \"/mnt/c/Users/Tanzil/Downloads/CS FINAL IMplementation/scripts\" && chmod +x attacker_c2.sh && ./attacker_c2.sh"

echo [+] Step 5: Launching Dashboard in Web Browser...
start http://localhost:5173/
echo.

echo ========================================================
echo [+] Lab is now running!
echo.
echo All components started automatically:
echo  1. Victim Database Initialized
echo  2. Express API Backend started
echo  3. React UI Dev Server started
echo  4. Kali Linux Attacker CLI console running in WSL
echo  5. Web browser opened to dashboard
echo ========================================================
echo.
pause
