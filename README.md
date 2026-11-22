# WedNest – Wedding Planning Platform

WedNest is a wedding planning platform designed to make wedding management easier and more organized. It connects customers with wedding service providers, allowing users to explore services, book vendors, and manage their wedding plans from one platform.

The platform includes separate dashboards for Admin, Vendor, and Customer users, with role-based access control and secure authentication.

## ✨ Important Features

### Customer
- Browse available wedding services.
- View service details and vendor information.
- Book wedding services.
- View and manage bookings.
- Cancel pending bookings.
- Manage personal dashboard.

### Vendor
- Create and manage wedding services.
- Upload service images.
- Edit and delete own services.
- Manage incoming bookings.
- Accept, reject, and complete bookings.
- Upgrade to Premium subscription using Stripe.
- Manage vendor dashboard.

### Admin
- View and manage platform users.
- Monitor all listed services.
- Approve or reject vendor services.
- Delete services.
- View transaction history.
- Monitor subscription payments and platform revenue.

### Security & Payment
- Better Auth authentication.
- JWT-based API authentication.
- Role-based authorization for Admin, Vendor, and Customer.
- Protected backend routes.
- Service ownership verification.
- Stripe Checkout integration.
- Stripe Webhook signature verification.
- Secure subscription status updates.

## 🛠️ Technology Stack

### Frontend
- Next.js 16
- React
- TypeScript
- Tailwind CSS
- Shadcn UI
- Better Auth
- Lucide React
- Sonner

### Backend
- Node.js
- Express.js 5
- MongoDB
- MongoDB Native Driver
- JWT / JOSE
- Multer
- CORS
- Dotenv

### Payment & Deployment
- Stripe
- Vercel

## 📦 Installation Instructions

### Prerequisites
Make sure you have installed:

- Node.js
- npm
- MongoDB database
- Git

### 1. Clone the Client Repository

```bash
git clone YOUR_CLIENT_REPOSITORY_URL
cd wednest
npm install
```

### 2. Clone the Server Repository

Open another terminal:

```bash
git clone YOUR_SERVER_REPOSITORY_URL
cd wednest-server
npm install
```

### 3. Environment Variables

Create a `.env` file in the frontend project:

```env
MONGODB_URI=your_mongodb_connection_string
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=your_better_auth_secret
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
NEXT_PUBLIC_APP_URL=http://localhost:3000
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
STRIPE_PREMIUM_PRICE_ID=your_stripe_price_id
```

Create a `.env` file in the backend project:

```env
PORT=5000
AUTH_URL=http://localhost:3000
MONGO_DB_USER=your_mongodb_username
MONGO_DB_PASSWORD=your_mongodb_password
```

Add any other environment variables required by your project configuration.

**Important:** Never upload `.env` files or expose secret keys in a public repository.

## 🚀 How to Run the Project Locally

### Start the Backend

```bash
cd wednest-server
node index.js
```

Backend will run at:

`http://localhost:5000`

### Start the Frontend

Open another terminal:

```bash
cd wednest
npm run dev
```

Frontend will run at:

`http://localhost:3000`

Open the frontend URL in your browser to use WedNest.

## 🌐 Live Website

**Live Website:** YOUR_LIVE_WEBSITE_URL

## 🔗 GitHub Repositories

- **Client Repository:** YOUR_CLIENT_REPOSITORY_URL
- **Server Repository:** YOUR_SERVER_REPOSITORY_URL

---

Made with ❤️ for better wedding planning.

**Project Name:** WedNest – Wedding Planning Platform

## **Author:** IFTEKHAR MAHAMUD AL ASIF