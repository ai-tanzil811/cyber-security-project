#!/bin/bash

# ANSI Color Codes
GREEN='\033[0;32m'
RED='\033[0;31m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Resolve Windows Host IP if running inside WSL
WINDOWS_HOST="localhost"
if ! curl -s -m 1 -o /dev/null -w "%{http_code}" "http://localhost:5000/api/status" | grep -q "200"; then
    if grep -qi microsoft /proc/version 2>/dev/null || grep -qi wsl /proc/version 2>/dev/null; then
        # Get Windows host IP from route table
        WSL_HOST_IP=$(ip route | grep default | awk '{print $3}')
        if [ -n "$WSL_HOST_IP" ]; then
            WINDOWS_HOST="$WSL_HOST_IP"
        fi
    fi
fi

API_URL="http://${WINDOWS_HOST}:5000/api"

clear
echo -e "${CYAN}====================================================${NC}"
echo -e "${CYAN}          KALI LINUX - C2 CONTROL PANEL             ${NC}"
echo -e "${CYAN}====================================================${NC}"
echo -e "Target Endpoint: ${YELLOW}employee@company.local${NC}"
echo -e "Resolved Host:   ${YELLOW}${WINDOWS_HOST}${NC}"
echo -e "Host API:        ${YELLOW}${API_URL}${NC}"
echo -e "${CYAN}----------------------------------------------------${NC}"

show_menu() {
    echo -e "\n${CYAN}[+] SELECT ATTACK OPERATION:${NC}"
    echo -e "  ${GREEN}1)${NC} Send Phishing Email (Deliver invoice_update.py)"
    echo -e "  ${GREEN}2)${NC} Attempt Data Exfiltration (Get customer_data.sql)"
    echo -e "  ${GREEN}3)${NC} Check Attack Status / Active Logs"
    echo -e "  ${GREEN}4)${NC} Exit"
    echo -ne "\nOption > "
}

send_phishing() {
    echo -e "\n${YELLOW}[*] Initializing Phishing Campaign...${NC}"
    response=$(curl -s -X POST "${API_URL}/run-phishing")
    if [[ $response == *"success"* ]]; then
        echo -e "${GREEN}[+] Phishing email dispatched successfully!${NC}"
        echo -e "${GREEN}[+] Payload 'invoice_update.py' delivered to victim inbox.${NC}"
    else
        echo -e "${RED}[X] Error dispatching email. Is backend running?${NC}"
    fi
}

attempt_exfiltrate() {
    echo -e "\n${YELLOW}[*] Attempting exfiltration of customer database...${NC}"
    response=$(curl -s -H "Content-Type: application/json" -X POST "${API_URL}/exfiltrate")
    
    if [[ $response == *"Blocked by MyDLP"* ]]; then
        echo -e "${RED}[X] EXFILTRATION BLOCKED: Intercepted by MyDLP Agent!${NC}"
        echo -e "${RED}[X] Reason: Policy violation (Customer Data Protection).${NC}"
    elif [[ $response == *"success\":true"* ]]; then
        echo -e "${GREEN}[+] EXFILTRATION SUCCESSFUL! Customer records exfiltrated:${NC}"
        echo -e "${CYAN}----------------------------------------------------${NC}"
        # Extract SQL content from JSON (handles newline character literals)
        echo "$response" | grep -o '"data":"[^"]*' | cut -d'"' -f4 | sed 's/\\n/\n/g'
        echo -e "${CYAN}----------------------------------------------------${NC}"
    else
        echo -e "${RED}[X] Exfiltration attempt failed. Target may be offline or database file missing.${NC}"
    fi
}

check_status() {
    echo -e "\n${YELLOW}[*] Querying C2 Server Logs...${NC}"
    response=$(curl -s "${API_URL}/status")
    
    if [ -z "$response" ]; then
        echo -e "${RED}[X] Failed to connect to server. Is backend running?${NC}"
        return
    fi
    
    status=$(echo "$response" | grep -o '"payloadStatus":"[^"]*' | cut -d'"' -f4)
    echo -e "Target Payload Status: ${YELLOW}${status^^}${NC}"
    
    echo -e "\n${CYAN}--- C2 Action Logs ---${NC}"
    echo "$response" | grep -o '"message":"[^"]*' | cut -d'"' -f4 | while read -r line; do
        echo -e " - $line"
    done
}

while true; do
    show_menu
    read -r opt
    case $opt in
        1) send_phishing ;;
        2) attempt_exfiltrate ;;
        3) check_status ;;
        4) echo -e "\n${CYAN}Closing C2 Console.${NC}"; exit 0 ;;
        *) echo -e "${RED}Invalid option!${NC}" ;;
    esac
done
