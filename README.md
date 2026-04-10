# Sales Management System (Java-Based ERP Simulation)

A lightweight and modular Java-based enterprise simulation system designed to replicate core ERP (Enterprise Resource Planning) functionalities. The system focuses on inventory tracking, financial operations, logistics simulation, and tax calculations within a structured and easy-to-use command-driven interface.

---

## KEY FEATURES

### Inventory Management
Tracks products across their lifecycle including procurement, stock updates, and sales operations.

---

### Dynamic Tax Engine
Automatically calculates Turkish tax structures including SCT (ÖTV) and VAT (KDV) based on product categories and price tiers.

---

### Logistics Simulation (LG01)
Provides a logistics flow system for shipment tracking and warehouse-to-customer delivery processes using structured simulation logic.

---

### Financial Reporting (FG01)
Generates basic profit & loss analysis including revenue, costs, tax liabilities, and net balance calculations.

---

### Order Management
Supports creation, updating, and tracking of orders with status transitions:
- Ordered  
- Shipped  
- Delivered  
- Cancelled  

---

### Secure Operations
Uses an authorization key system to protect sensitive administrative actions.

---

### Data Export
Exports all transaction records into CSV format for external analysis (Excel-compatible).

---

## SYSTEM OPERATIONS (COMMAND CODES)

- **MN23** → Product Catalog  
- **MM03** → Inventory & Tax Analysis  
- **CR01** → Create New Order  
- **UP01** → Update Order Status  
- **SL01** → Direct Sale Operation  
- **LG01** → Logistics Tracking  
- **FG01** → Financial Analysis  

---

## TECHNOLOGIES USED

- **Language:** Java (Core SE)
- **Paradigm:** Object-Oriented Programming (OOP)
- **Architecture:** Modular service-based structure
- **Data Handling:** File-based / In-memory storage
- **Output:** CSV export functionality
- **UI:** Console-based interface

---

## INSTALLATION

Clone the repository:
```bash
git clone https://github.com/abidoprojects/ERP-System.git
