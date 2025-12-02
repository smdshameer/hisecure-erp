# Hi Secure Solutions ERP

A comprehensive Enterprise Resource Planning (ERP) system designed for retail and service businesses. This monorepo contains the Backend (NestJS), Web Dashboard (Next.js), and Mobile App (React Native).

## 📚 Documentation
- **[Deployment Guide](./DEPLOYMENT_GUIDE.md)**: Instructions for deploying to Neon, Render, and Vercel for free.
- **[User Manual](./USER_MANUAL.md)**: Guide for Managers and Technicians on how to use the system.

## 🏗️ Tech Stack
- **Backend**: NestJS, Prisma, PostgreSQL
- **Frontend**: Next.js (React), CSS Modules (White Theme)
- **Mobile**: React Native (Expo)
- **Infrastructure**: Docker, Docker Compose

## 🚀 Quick Start (Local)

1.  **Clone the repository**
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Start Database**:
    ```bash
    docker-compose up -d postgres
    ```
4.  **Run Development Servers**:
    ```bash
    # Terminal 1: Backend
    cd apps/backend
    npx prisma generate
    npx prisma db push
    npm run start:dev

    # Terminal 2: Web Dashboard
    cd apps/web
    npm run dev

    # Terminal 3: Mobile App
    cd apps/mobile
    npm start
    ```

## ✨ Key Features
- **Inventory Management**: Real-time stock tracking, Barcode generation, Auto-reordering.
- **Point of Sale (POS)**: Fast checkout with multiple payment modes.
- **Service Tickets**: Track repairs and assign technicians.
- **Mobile App**: Field technicians can view jobs, transfer stock, and scan barcodes.
- **Reports**: Sales analytics, Low stock alerts, GST reports.

## 🎨 Theme
The Web Dashboard features a modern, clean **White Theme** with responsive design for all devices.

---
Built with ❤️ by Antigravity
