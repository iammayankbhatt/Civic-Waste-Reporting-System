# 🏙️ CivicConnect - Civic Issue Reporting Platform

A full-stack civic engagement platform that empowers citizens to report urban issues (waste, hazards, maintenance) and enables municipal authorities to track, manage, and resolve them efficiently using geolocation and visual data.

## 🚀 Try It Out
You can interact with the live deployed application here:
* **Live Demo:** [https://civic-waste-reporting-system.vercel.app](https://civic-waste-reporting-system.vercel.app)


## 🚀 Key Features

### 👤 Citizen Portal
* **Secure Authentication:** JWT-based login/signup with encrypted passwords.
* **Geo-Tagged Reporting:** Auto-detection of user location using Leaflet Maps.
* **Visual Evidence:** Image upload capability via Cloudinary.
* **Real-time Tracking:** Status updates (Pending → In Progress → Resolved).

### 🏛️ Admin Dashboard (Government)
* **Role-Based Access Control (RBAC):** Secure admin-only routes.
* **Heatmap Visualization:** Identify high-density issue zones using Leaflet Heatmaps.
* **Status Management:** One-click workflow to process and resolve reports.
* **Data Analytics:** visual statistics for total, pending, and resolved cases.

## 🛠️ Tech Stack

**Frontend:**
* React.js (Vite)
* Tailwind CSS & Shadcn UI
* React Leaflet (Maps)
* React Hook Form + Zod (Validation)

**Backend:**
* Node.js & Express.js
* PostgreSQL (Supabase)
* Multer & Cloudinary (Media Storage)
* JSON Web Tokens (JWT) & Bcrypt

## ⚙️ Installation & Setup

### Prerequisites
* Node.js (v16+)
* PostgreSQL Database (or Supabase account)
* Cloudinary Account

### 1. Clone the Repository
```bash
git clone [https://github.com/yourusername/civic-connect.git](https://github.com/yourusername/civic-connect.git)
cd civic-connect
```
### 2. Backend Setup
```cd server
npm install
```
Create a .env file in the server directory:
```
PORT=5000
DATABASE_URL=your_supabase_postgres_connection_string
JWT_SECRET=your_super_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Start the Server:
```
npm run dev
```
### 3. Frontend SetupOpen a new terminal:
```
cd client
npm install
```
Create a .env file in the client directory:
```
VITE_API_URL=http://localhost:5000/api
```
Start the Client:
```
npm run dev
```
🔐 Admin AccessBy default, all new users are registered as Citizens. To access the Admin Dashboard:
1. Register a new account.
2. Access your database (Supabase/Postgres).
3. Manually update the user's role:  
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
4. Logout and log back in to see the Admin Panel.📸 

## LicenseDistributed under the MIT License. 
See LICENSE for more information.
## 📞 Contact
Mayank Bhatt - https://www.linkedin.com/in/mayankbhatt13/