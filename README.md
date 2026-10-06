# ⚡ DevVerse

### A Developer-Focused Blogging & Community Platform

<p align="center">
  <b>Learn · Build · Share · Connect</b>
</p>

<p align="center">
  DevVerse is a full-stack developer blogging and community platform built with the MERN stack.
</p>

<p align="center">
  <a href="https://github.com/abhishekyadav77/devverse">
    <img src="https://img.shields.io/badge/MERN-Stack-3DDC84?style=for-the-badge&logo=mongodb&logoColor=white" alt="MERN Stack" />
  </a>
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
</p>


### 🚀 Live Demo

**https://devverse-three.vercel.app/**
---

## 🌐 About DevVerse

**DevVerse** is a developer-focused blogging and community platform built with the **MERN stack**.

The idea behind DevVerse is simple:

> **Developers learn better when they share what they build, what they learn, and what they experience.**

DevVerse provides a modern space where developers can discover technical content, write and publish articles, share experiences, interact with other developers, and grow together as a community.

The project focuses on real-world full-stack development, including:

- Frontend architecture
- Backend REST APIs
- Authentication & authorization
- Database design
- Community features
- Security
- SEO
- Testing
- Cloud deployment

---

## ✨ Features

### 📝 Blogging

- Create blog posts
- Edit posts
- Save drafts
- Publish posts
- Unpublish posts
- Delete posts
- Rich-text blog editor
- Categories
- Tags
- Author preview
- Public article pages
- Search and content discovery

### 👥 Developer Community

- Like posts
- Bookmark posts
- Comment on posts
- Reply to comments
- Follow developers
- Unfollow developers
- Developer profiles
- Notifications
- Search developers and content

### 🔐 Authentication & Authorization

- User registration
- User login/logout
- Session management
- Protected routes
- Role-based authorization
- Admin dashboard
- Admin-only APIs
- Permission checks
- Protected user actions

### 🛡️ Security

DevVerse includes several security-focused features:

- CSRF protection
- CORS configuration
- Foreign-origin request protection
- NoSQL operator protection
- Input validation
- Authentication checks
- Authorization checks
- Protected admin endpoints
- Environment-based secrets
- Production-oriented API protection

### 🔎 SEO

DevVerse also includes SEO and crawler-friendly functionality:

- `robots.txt`
- `sitemap.xml`
- Open Graph metadata
- JSON-LD structured data
- Crawler-friendly pages
- SEO-friendly article pages
- Metadata for shared content

---

# 🧰 Tech Stack

## Frontend

- React
- Vite
- React Router
- Tailwind CSS
- Framer Motion
- Tiptap
- Lucide React

## Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- REST APIs
- Authentication & Sessions
- CORS
- Morgan
- Security Middleware

## Cloud & Deployment

- MongoDB Atlas
- Cloudinary
- Vercel
- Render
- GitHub

---

# 🏗️ Architecture

```text
                         DEVVERSE
                            │
                            ▼
                  ┌──────────────────┐
                  │  React + Vite    │
                  │    Frontend      │
                  └────────┬─────────┘
                           │
                        REST API
                           │
                           ▼
                  ┌──────────────────┐
                  │ Express + Node.js│
                  │     Backend      │
                  └───────┬────┬─────┘
                          │    │
                 ┌────────┘    └────────┐
                 ▼                      ▼
          ┌──────────────┐       ┌──────────────┐
          │   MongoDB    │       │  Cloudinary  │
          │    Atlas     │       │    Media     │
          └──────────────┘       └──────────────┘
```

---

# 📂 Project Structure

```text
devverse/
│
├── client/
│   ├── public/
│   └── src/
│       ├── components/
│       │   ├── common/
│       │   └── dashboard/
│       ├── config/
│       ├── context/
│       ├── layouts/
│       ├── pages/
│       │   └── public/
│       ├── services/
│       └── App.jsx
│
├── server/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── scripts/
│   └── server.js
│
├── .gitignore
└── README.md
```

---

# 🚀 Getting Started

## Prerequisites

Make sure you have the following installed:

- Node.js
- npm
- Git
- MongoDB / MongoDB Atlas
- Cloudinary account for media uploads

---

## 1. Clone the Repository

```bash
git clone https://github.com/abhishekyadav77/devverse.git
cd devverse
```

---

# ⚙️ Backend Setup

## 2. Install Backend Dependencies

```bash
cd server
npm install
```

## 3. Configure Backend Environment Variables

Create:

```text
server/.env
```

Example:

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

CLIENT_URL=http://localhost:5173
```

> ⚠️ Never commit your `.env` file or real credentials to GitHub.

## 4. Start the Backend

```bash
npm start
```

Backend:

```text
http://localhost:5000
```

---

# 💻 Frontend Setup

Open another terminal.

## 5. Install Frontend Dependencies

```bash
cd client
npm install
```

## 6. Configure Frontend Environment Variables

Create:

```text
client/.env
```

Example:

```env
VITE_API_URL=http://localhost:5000
```

## 7. Start the Frontend

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

# 🧪 Testing

DevVerse includes automated tests and smoke tests covering important application functionality.

Run the test suite:

```bash
npm test
```

Run smoke tests:

```bash
npm run smoke
```

Build the frontend:

```bash
cd client
npm run build
```

---

# 🔐 Security & Environment Variables

Sensitive credentials should never be committed to GitHub.

Keep files such as these private:

```text
.env
.env.local
.env.production
```

Sensitive values include:

- MongoDB credentials
- JWT secrets
- Cloudinary API secrets
- Production API keys
- Private configuration values

For production deployment, configure environment variables directly in Vercel and Render.

---

# ☁️ Deployment

DevVerse is designed for a modern cloud deployment architecture:

```text
                         GitHub
                            │
                 ┌──────────┴──────────┐
                 │                     │
                 ▼                     ▼
              Vercel                 Render
             Frontend               Backend
                 │                     │
                 └──────────┬──────────┘
                            │
                            ▼
                      MongoDB Atlas
                            │
                            ▼
                        Cloudinary
```

### Frontend

Deploy the `client` directory using:

**Vercel**

### Backend

Deploy the `server` directory using:

**Render**

### Database

Use:

**MongoDB Atlas**

### Media Storage

Use:

**Cloudinary**

---

# 🖥️ Application Areas

## Public

- Home
- Explore
- Search
- Categories
- Blog/Post pages
- Developer profiles
- About DevVerse
- About the Developer

## Authenticated

- Dashboard
- Create post
- Edit post
- Drafts
- Bookmarks
- Notifications
- Profile
- Following system

## Admin

- Admin dashboard
- Content management
- User management
- Protected administrative APIs

---

# 🔄 How DevVerse Works

```text
                 Discover
                    │
                    ▼
                 Explore
                    │
                    ▼
                   Read
                    │
                    ▼
                Interact
          ┌─────────┼─────────┐
          ▼         ▼         ▼
        Like     Comment   Bookmark
          │         │         │
          └─────────┼─────────┘
                    │
                    ▼
                  Follow
                    │
                    ▼
                  Write
                    │
                    ▼
                 Publish
                    │
                    ▼
                 Connect
                    │
                    ▼
                   Grow
```

---

# 🧠 What I Learned

Building DevVerse provided practical experience across multiple areas of full-stack development.

### Frontend

- React application architecture
- Component-based development
- Client-side routing
- Responsive UI development
- State and context management
- Rich-text editing
- Animations

### Backend

- REST API development
- Express.js architecture
- Middleware
- Authentication
- Authorization
- Role-based access control
- API security

### Database

- MongoDB
- Mongoose
- Schema design
- Data relationships
- Querying and filtering
- Data validation

### Deployment

- Git and GitHub
- Environment variables
- Vercel
- Render
- MongoDB Atlas
- Cloudinary

### Engineering

- Debugging
- Automated testing
- Security testing
- SEO
- Application architecture
- Production builds

---

# 🗺️ Roadmap

## ✅ Completed

- [x] MERN architecture
- [x] Authentication
- [x] Authorization
- [x] User sessions
- [x] Blog creation
- [x] Blog editing
- [x] Draft system
- [x] Publishing workflow
- [x] Categories
- [x] Tags
- [x] Likes
- [x] Bookmarks
- [x] Comments
- [x] Comment replies
- [x] Follow system
- [x] Notifications
- [x] Search
- [x] Developer profiles
- [x] Admin dashboard
- [x] SEO support
- [x] Security testing
- [x] Frontend production build

## 🚧 Future Improvements

- [ ] Personalized developer feed
- [ ] Trending content algorithm
- [ ] Advanced developer analytics
- [ ] Email notifications
- [ ] Social sharing
- [ ] Content recommendation system
- [ ] Advanced moderation tools
- [ ] Progressive Web App support
- [ ] Further performance optimization

---

---

# 📌 Project Status

DevVerse is an actively developed project.

The current focus is building a complete developer blogging and community experience while continuously improving functionality, security, performance, SEO, and user experience.

---

# 👨‍💻 About the Developer

## Abhishek Kumar Yadav

**B.Tech CSE · Full-Stack Developer**

I enjoy building full-stack applications, learning new technologies, solving programming problems, and turning ideas into useful software.

My interests include:

- Full-Stack Development
- MERN Stack
- Problem Solving
- Software Engineering
- Backend Development
- Building Real-World Applications

---

# 🔗 Connect With Me

<p>
  <a href="https://github.com/abhishekyadav77">
    <img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub" />
  </a>

  <a href="https://www.linkedin.com/in/abhishek-yadav-mzp/">
    <img src="https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn" />
  </a>

  <a href="https://leetcode.com/u/abhishek_yadav_12/">
    <img src="https://img.shields.io/badge/LeetCode-FFA116?style=for-the-badge&logo=leetcode&logoColor=black" alt="LeetCode" />
  </a>
</p>

---

# ⭐ Support

If you find DevVerse interesting, consider giving the repository a ⭐ on GitHub.

Your support helps motivate further development and improvements.

---

<div align="center">

# ⚡ DevVerse

### Learn · Build · Share · Connect

Built with ❤️ by **Abhishek Kumar Yadav**

</div>
