# 🚀 Zero-Cost Deployment Guide

This guide will help you deploy the **Hi Secure Solutions ERP** for free using **Neon** (Database), **Render** (Backend), and **Vercel** (Frontend).

---

## 📋 Prerequisites
1.  **GitHub Account**: Your code must be pushed to a GitHub repository.
2.  **Neon Account**: [https://neon.tech](https://neon.tech) (Free Postgres)
3.  **Render Account**: [https://render.com](https://render.com) (Free Backend)
4.  **Vercel Account**: [https://vercel.com](https://vercel.com) (Free Frontend)

---

## Step 1: Database (Neon) 🗄️

1.  Log in to **Neon** and create a new project.
2.  Copy the **Connection String** (it looks like `postgres://user:pass@ep-xyz.aws.neon.tech/neondb...`).
3.  **Important**: Append `?sslmode=require` to the end of the URL if it's not there.
4.  Save this URL; you will need it for the Backend.

---

## Step 2: Backend (Render) ⚙️

1.  Log in to **Render** and click **New +** -> **Web Service**.
2.  Connect your **GitHub Repository**.
3.  **Configuration**:
    -   **Name**: `hisecure-backend`
    -   **Region**: Choose one close to you (e.g., Singapore or Frankfurt).
    -   **Branch**: `main`
    -   **Root Directory**: `apps/backend` (Important!)
    -   **Runtime**: `Node`
    -   **Build Command**: `npm install && npx prisma generate && npm run build`
    -   **Start Command**: `npm run start:prod`
    -   **Instance Type**: Free
4.  **Environment Variables** (Scroll down to "Advanced"):
    -   `DATABASE_URL`: Paste your Neon Connection String from Step 1.
    -   `JWT_SECRET`: Enter a secure random string (e.g., `mysecretkey123`).
    -   `JWT_EXPIRATION`: `1d`
5.  Click **Create Web Service**.
6.  Wait for the deployment to finish. Copy the **Service URL** (e.g., `https://hisecure-backend.onrender.com`).

---

## Step 3: Frontend (Vercel) 🖥️

1.  Log in to **Vercel** and click **Add New...** -> **Project**.
2.  Import your **GitHub Repository**.
3.  **Framework Preset**: Select **Next.js**.
4.  **Root Directory**: Click "Edit" and select `apps/web`.
5.  **Environment Variables**:
    -   `NEXT_PUBLIC_API_URL`: Paste your Render Backend URL from Step 2 (e.g., `https://hisecure-backend.onrender.com`).
    -   **Note**: Do NOT add a trailing slash `/`.
6.  Click **Deploy**.

---

## Step 4: Final Setup 🔄

1.  Once Vercel finishes, your ERP is live!
2.  **Database Seeding**:
    -   The first time, your database will be empty.
    -   You can connect to your Neon DB using a tool like **pgAdmin** or **DBeaver** on your computer using the Connection String.
    -   Manually insert the initial admin user, or run the seed script locally pointing to the remote DB:
        ```bash
        # In your local terminal
        export DATABASE_URL="your-neon-url-here"
        cd apps/backend
        npx prisma db push
        npx ts-node prisma/seed.ts
        ```

## 🔄 How to Update
1.  Make changes to your code locally.
2.  Commit and push to GitHub:
    ```bash
    git add .
    git commit -m "Fixed a bug"
    git push origin main
    ```
3.  **Vercel** and **Render** will automatically detect the push and redeploy your site!

---

**Enjoy your free ERP!** 🚀
