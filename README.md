# 🎓 Student Record Management System (SRMS)

This is a web-based **Student Record Management System** designed for educational institutions to streamline and automate the handling of student records. The system provides a simple and efficient alternative to traditional manual methods by integrating both client-side and server-side technologies.

## 🚀 Project Overview

The system offers a **RESTful API backend** and a responsive **web UI frontend** that allows the student affairs unit to manage student data efficiently. It supports full CRUD operations (Create, Read, Update, Delete) and real-time data handling using modern web technologies.

## 🛠️ Technologies Used

### ✅ Frontend
- **HTML + Bootstrap**: For building a clean, responsive UI.
- **jQuery**: Used in five different ways:
  1. Form validation
  2. DOM manipulation
  3. Event handling
  4. AJAX requests
  5. Dynamic UI updates (e.g., loading student details without refreshing)
- **AJAX**: For seamless communication with the backend.
- **JSON**: Used to exchange data between client and server.

### ✅ Backend
- **Node.js**: For building the REST API server.
- **Express.js**: To handle routing and middleware.
- **MongoDB (optional)**: For storing student records in a NoSQL format.
- **REST API**: Implements standard REST endpoints for students (GET, POST, PUT, DELETE).

## 🔗 Features
- Add, edit, view, and delete student records
- Asynchronous data loading with AJAX
- Responsive design for both desktop and mobile
- Real-time updates without page reload
- Secure form handling and validation

## 📁 Folder Structure

```
assignment2/
  ├── app.js/
  ├── config/
  ├── controllers/
  ├── models/
  │   └── Student.js
  ├── package.json
  ├── package-lock.json
  ├── public/
  │   ├── index.html
  │   ├── login.html
  │   ├── register.html
  │   └── script.js
  ├── routes/
  ├── server.js
  └── Student_record_management/
      └── README.md
```

## 📦 Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/shamlanoufer/Student-Record-Management-System.git
   cd Student-Record-Management-System
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the server:**
   ```bash
   node server.js
   ```
   The app will be available at `http://localhost:3000` (or your configured port).

## 📝 License

This project is for educational purposes.

---

Feel free to customize this README further to match your project’s specifics!
