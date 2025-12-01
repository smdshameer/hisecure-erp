# Hi Secure Solutions ERP - User Manual

Welcome to the Hi Secure Solutions ERP system! This guide will help you navigate and use the features of the Web Dashboard and Mobile App.

## 🚀 Getting Started

### System URLs
- **Web Dashboard**: [http://localhost:3006](http://localhost:3006)
- **Backend API**: [http://localhost:3005](http://localhost:3005)

### Login Credentials
| Role | Email | Password |
| :--- | :--- | :--- |
| **Store Manager** | `manager@hisecure.com` | `password123` |
| **Technician** | `tech@hisecure.com` | `password123` |

---

## 💻 Web Dashboard (For Managers)

### 1. Dashboard Overview
The home page gives you a quick snapshot of your business:
- **Total Revenue**: Real-time sales total.
- **Total Orders**: Number of completed sales.
- **Low Stock Alerts**: Items that need reordering.
- **Top Products**: A chart showing your best-selling items.

### 2. Inventory Management
Navigate to **Inventory** to manage your stock.
- **Add Product**: Click "Add Product" to create new items.
- **Edit/Delete**: Use the actions column to modify items.
- **Search**: Quickly find products by name or SKU.

### 3. Point of Sale (POS)
Navigate to **POS** to process sales.
- **Add to Cart**: Click on products to add them to the bill.
- **Adjust Quantity**: Use `+` and `-` buttons.
- **Checkout**:
    - Click "Complete Sale".
    - Select **Cash**, **Card**, or **UPI**.
    - For Card/UPI, a payment simulation will run.

### 4. Service Tickets
Navigate to **Service** to manage repairs.
- **Create Ticket**: Log a new repair job for a customer.
- **Assign Technician**: Assign the job to a field tech.
- **Update Status**: Track progress (Open -> In Progress -> Completed).

### 5. Customers & Suppliers
- **Customers**: Manage your client database.
- **Suppliers**: Manage vendor details for purchasing.

---

## 📱 Mobile App (For Technicians)

### 1. Getting Started
- Open the app and login with your Technician credentials.
- **Note**: Ensure the backend is running and your device is on the same network (or use localhost for simulator).

### 2. Jobs Tab
- View your assigned service tickets.
- Tap a job to see details (Customer address, issue description).
- **Complete Job**: Upload photos and mark the job as done.

### 3. Transfers Tab
- **Check Stock**: Search for products to see stock levels in the Main Warehouse.
- **Barcode Scanner**: Tap the QR code icon to scan a product barcode and instantly find it.
- **Request Stock**: Enter a quantity and click "Get" to transfer stock to your van/branch.

### 4. Profile
- View your details and logout.

---

## ❓ Troubleshooting

### "Network Error"
- Ensure the backend server is running (`docker-compose up`).
- Check if the API URL is correctly configured in the app.

### "Camera Permission Denied"
- Go to your device settings and allow camera access for the Expo Go app.

---

**Built with ❤️ by Antigravity**
