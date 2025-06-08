# 🎟️ BookMyTicket – Movie & Event Ticket Booking Platform

A comprehensive web application built with **Node.js**, **Express**, **MongoDB**, and **EJS** that enables users to seamlessly book movie and event tickets online. Featuring dedicated user, organizer, and admin panels, real-time seat selection, payment integration, and much more.

---

## 📦 Project Information

- **Project Name:** BookMyTicket
- **Version:** 1.0.0
- **Author:** Santanu Samanta
- **License:** ISC
- **Main Entry Point:** `bookmyticket.js`
- **Start Command:** `npm start` (runs `nodemon bookmyticket.js`)

---

## 🚀 Features

### 👥 User Panel
- User registration and login with validation
- Browse and filter movies/events by date, language, genre, and format
- Detailed pages with trailers, cast, and event info
- Real-time seat selection with multiple seat classes (Classic, Golden, Prime)
- Integrated payment gateway (Razorpay)
- E-ticket generation with QR codes
- Booking history and profile management

### 🗂 Organizer Panel
- Role-based organizer login and session management (refresh tokens)
- Event creation, editing, and deletion
- Manage schedules, venues, and ticket availability
- View booking and sales analytics
- Dedicated organizer dashboard

### 🎬 Admin Panel
- Comprehensive dashboard with charts and statistics (Bar, Pie, Area)
- Manage movies, events, theaters, users, and bookings
- Soft delete and administrative controls
- Automated email notifications to users

---

## 🧰 Technologies & Libraries Used

- **Backend:** Node.js, Express.js, Mongoose (MongoDB)
- **Frontend:** EJS, Bootstrap 5, jQuery, SweetAlert2
- **Authentication:** jsonwebtoken
- **Email:** Nodemailer
- **Payment Gateway:** Razorpay
- **Other Libraries:**
  - bcryptjs (password hashing)
  - body-parser, cookie-parser, express-session
  - joi, joi-objectid (validation)
  - morgan, multer
  - qrcode (QR code generation)
  - route-label (route naming)

---
## 🗂️ Project Structure


## ⚙️ Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/bookmyticket.git
   cd bookmyticket

### Demo Credentials

🛠 Admin Panel

  http://localhost:3006/admin/login
    email:santanusamantalearning@gmail.com
    password :123456

👤 User Panel

  http://localhost:3006/user/loginpage-display
    email:soumyadippaul@yopmail.com
    password :123456
    email:goodyonm@yopmail.com
    password :123456

🎫 Organizer Panel

   http://localhost:3006/organizer/login
 
    event management
        email:deraone@yopmail.com
        password :123456
        email:servland@yopmail.com
        password :123456

    theater managment
        email:goodyonm@yopmail.com
        password :123456
        email:cinepolis@yopmail.com
        password :123456