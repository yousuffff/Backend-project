# 🚀 Chai Backend Project (YouTube-like Backend)

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18+-green" />
  <img src="https://img.shields.io/badge/Express.js-Backend-blue" />
  <img src="https://img.shields.io/badge/MongoDB-Database-green" />
  <img src="https://img.shields.io/badge/Status-Production--Ready-success" />
</p>

---

## 📌 Overview

A **production-ready backend system** inspired by platforms like **YouTube / Instagram**, built using **Node.js, Express, MongoDB, and Mongoose**.

This project includes everything from **authentication → video upload → feed system → dashboard analytics**.

---

## ✨ Features

### 🔐 Authentication

* JWT-based authentication
* Secure routes with middleware

### 🎥 Video System

* Upload video (Multer + Cloudinary)
* Update video (title, description, thumbnail)
* Delete video (cloud + DB cleanup)
* Toggle publish/unpublish

### 💬 Comment System

* Add / update / delete comments
* Like system integration
* Aggregation-based comment fetching

### ❤️ Like System

* Toggle like on videos, comments, tweets
* Efficient aggregation for like counts

### 📺 Subscription System

* Subscribe / Unsubscribe (toggle)
* Get subscribers & subscribed channels
* Aggregation-based counts

### 📂 Playlist System

* Create, update, delete playlists
* Add/remove videos

### 📊 Dashboard System

* Total videos, views, likes, subscribers
* Aggregation-powered analytics

### 🏠 Feed System (Core Feature)

* Fetch videos from subscribed channels
* Pagination + sorting (latest / trending)

---

## 🧠 Tech Stack

| Layer    | Technology        |
| -------- | ----------------- |
| Backend  | Node.js, Express  |
| Database | MongoDB, Mongoose |
| Storage  | Cloudinary        |
| Auth     | JWT               |
| Upload   | Multer            |

---

## 📁 Project Structure

```bash
src/
│
├── controllers/
├── models/
├── routes/
├── middlewares/
├── utils/
│
├── db/
├── app.js
└── server.js
```

---

## ⚙️ Environment Variables

Create a `.env` file:

```env
PORT=5000
MONGO_URI=your_mongodb_url

JWT_SECRET=your_secret

CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
```

---

## ▶️ Installation & Run

```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo

npm install
npm run dev
```

---

## 📡 API Endpoints

### 🔥 Feed

```http
GET /api/v1/feed?page=1&limit=10
```

### 🎥 Upload Video

```http
POST /api/v1/videos
```

**Form Data:**

* videoFile
* thumbnail
* title
* description

### ❤️ Toggle Like

```http
POST /api/v1/likes/video/:videoId
```

### 📺 Subscribe

```http
POST /api/v1/subscriptions/:channelId
```

---

## 🧪 Sample Response (Feed)

```json
[
  {
    "title": "React Tutorial",
    "views": 1200,
    "likesCount": 200,
    "owner": {
      "userName": "amit",
      "avatar": "..."
    }
  }
]
```

---

## 🔥 Key Concepts Implemented

* REST API design
* MVC architecture
* MongoDB Aggregation:

  * `$match`
  * `$lookup`
  * `$addFields`
  * `$group`
  * `$project`
* Pagination & filtering
* File uploads (Multer)
* Cloud storage (Cloudinary)
* Data relationships

---

## 🚀 Advanced Features

* Aggregation-based dashboard
* Feed system (multi-collection queries)
* Toggle APIs (like / subscribe)
* Soft delete strategy
* Optimized queries

---

## 🛠 Future Improvements

* Redis caching (feed optimization)
* Rate limiting
* Notification system
* WebSockets (real-time updates)
* Docker + CI/CD deployment

---

## 👨‍💻 Author

Built while learning backend from **Chai Backend Series**
Focused on becoming a **production-level backend developer**

---

## ⭐ Support

If you like this project:

* ⭐ Star the repo
* 🍴 Fork it
* 🛠 Contribute

---

## 📜 License

This project is licensed under the **MIT License**

---

> 💡 *This is not just CRUD — it’s a complete backend system with real-world architecture.*
