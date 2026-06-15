import os

def setup():
    dir_path = r"C:\SensitiveData"
    try:
        if not os.path.exists(dir_path):
            os.makedirs(dir_path)
        
        # 1. customer_data.sql
        sql_content = """-- Fake Customer Database Dump
CREATE DATABASE IF NOT EXISTS customer_db;
USE customer_db;

CREATE TABLE IF NOT EXISTS customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20)
);

INSERT INTO customers (name, email, phone) VALUES
('John Smith', 'john@test.com', '01700000001'),
('Sarah Khan', 'sarah@test.com', '01700000002'),
('David Rahman', 'david@test.com', '01700000003'),
('Anika Ahmed', 'anika@test.com', '01700000004'),
('Moinul Islam', 'moin@test.com', '01700000005');
"""
        with open(os.path.join(dir_path, "customer_data.sql"), "w", encoding="utf-8") as f:
            f.write(sql_content)
            
        # 2. report.docx (dummy content for simulation)
        with open(os.path.join(dir_path, "report.docx"), "w", encoding="utf-8") as f:
            f.write("CONFIDENTIAL: Monthly Performance Report - June 2026\nThis document contains sensitive internal performance metrics.")

        # 3. sales.xlsx (dummy CSV-like content for simulation)
        with open(os.path.join(dir_path, "sales.xlsx"), "w", encoding="utf-8") as f:
            f.write("Month,Sales,Revenue\nJan,12000,45000\nFeb,15000,56000\nMar,18000,68000")
            
        print(f"SUCCESS: Environment successfully initialized in {dir_path}")
    except Exception as e:
        print(f"ERROR: Failed to write to {dir_path}. Exception: {e}")

if __name__ == "__main__":
    setup()
