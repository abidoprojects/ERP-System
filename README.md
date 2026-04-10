# Sales Management System - Stored Procedure Engine v2.5

This project is a web-based **Enterprise Sales Management System** that simulates retail and wholesale operations, inventory management, and complex tax calculations.  
The system combines a user-friendly interface with backend-like business logic powered by a **Stored Procedure execution model**.

---

# KEY FEATURES

## Dynamic Tax Engine (TR-Tax Mode)
Automatically calculates tiered Special Consumption Tax (SCT/ÖTV) for vehicles (45%, 80%, 220), fixed SCT for electronics, and VAT (KDV) across all categories.

## Logistics & Fleet Tracking (LG01)
Simulates inter-warehouse shipment processes on a real-time map using **Leaflet.js** and Routing Machine integration.

## Financial Analysis (FG01)
Generates a professional **P&L (Profit & Loss)** report including gross cash flow, tax liabilities, costs, and net profit margins.

## Inventory Management (MM03)
Tracks the full lifecycle of products from procurement to final sale and provides cost analysis based on stock levels.

## Secure Authentication System
Includes registration with recovery questions and protected operations via an authorization key (Auth Key).

## Data Export
Allows exporting all business transactions into Excel-compatible CSV format.

---

# TECHNOLOGIES USED

- **Frontend:** HTML5, Modern CSS (Glassmorphism & CSS Variables), Font Awesome  
- **Logic:** Vanilla JavaScript (ES6+)  
- **Maps:** Leaflet.js, OpenStreetMap, Leaflet Routing Machine  
- **Testing:** Jest (unit and system flow testing)  
- **Storage:** LocalStorage (persistent data management)  

---

# SYSTEM CODES (STORED PROCEDURES)

The system can be controlled via terminal input or UI using the following codes:

- **MN23:** Master Product Catalog  
- **MM03:** Inventory Report & Tax Base Analysis  
- **CR01:** Create New Order (Factory Cost-Based)  
- **UP01:** Update Order Status (Shipment / Delivery / Cancellation)  
- **SL01:** Direct Sale & Tax Collection  
- **LG01:** Logistics Network Map  
- **FG01:** Financial Performance Analysis  

---

# SETUP & TESTING

## Clone the repository

```bash
git clone https://github.com/username/sales-system-js.git
cd sales-system-js
```
## Test the project
```bash
npm test

