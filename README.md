# Secure Personal Notes & Task Vault

> A production-ready, security-first full-stack web application for private note and task management built with Node.js, Express.js, MongoDB, Mongoose, JWT, bcryptjs, and Vanilla JavaScript.

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Objectives](#objectives)
3. [Key Features](#key-features)
4. [Technology Stack](#technology-stack)
5. [Architecture & Folder Structure](#architecture--folder-structure)
6. [Security Architecture & Implementation](#security-architecture--implementation)
7. [Installation & Prerequisites](#installation--prerequisites)
8. [Database Setup (MongoDB Local & Atlas)](#database-setup-mongodb-local--atlas)
9. [Environment Configuration](#environment-configuration)
10. [Running the Application](#running-the-application)
11. [API Endpoint Documentation](#api-endpoint-documentation)
12. [Verification & Acceptance Testing](#verification--acceptance-testing)
13. [Frontend UI & Screenshots Section](#frontend-ui--screenshots-section)
14. [Deployment & GitHub Instructions](#deployment--github-instructions)

---

## Project Overview

The **Secure Personal Notes & Task Vault** is an enterprise-grade personal vault designed to let users securely store confidential thoughts, passwords, and task checklists. Built from the ground up to solve modern web vulnerabilities, every note is strictly isolated, encrypted in transit, and tied to an authenticated cryptographic identity.

---

## Objectives

- **Absolute User Isolation**: Ensure that User A can never read, modify, or delete notes created by User B.
- **Cryptographic Security**: Store passwords using strong, one-way bcrypt hashing with exactly 10 salt rounds. Plaintext passwords are never saved or returned in API responses.
- **Stateless Authorization**: Utilize industry-standard JSON Web Tokens (JWT) adhering to `Authorization: Bearer <token>` conventions.
- **Zero Framework Bloat**: Implement a sleek, responsive SaaS frontend using pure HTML5, modern CSS3 variables/flexbox/grid, and Vanilla JavaScript with safe DOM methods to prevent Cross-Site Scripting (XSS).

---

## Key Features

- **User Authentication**:
  - Registration with duplicate email detection and format validation.
  - Secure login with generic error messages to eliminate account enumeration attacks.
  - Interactive password visibility toggle.
  - Real-time client-side and server-side validation.
- **Private Dashboard**:
  - Live welcome greeting with the user's name and avatar badge.
  - Real-time note counter pill.
  - Instant client-side search across notes by title or content.
  - Dynamic note creation drawer with validation and loading spinners.
  - Card-based responsive note list sorted newest first.
  - Interactive deletion confirmation modal to prevent accidental data loss.
  - Safe, friendly empty state when no notes exist.
- **Secure Session Management**:
  - Automatic token management via `localStorage`.
  - Automatic logout and redirection upon session expiration or HTTP 401 unauthorized responses.
  - Clean sign out that purges all sensitive client memory.

---

## Technology Stack

### Backend
- **Node.js**: Asynchronous JavaScript runtime.
- **Express.js (v5)**: Fast, minimalist web framework.
- **MongoDB**: NoSQL document database for structured storage.
- **Mongoose**: Object Data Modeling (ODM) library for schema validation and indexing.
- **bcryptjs**: Blowfish password hashing (configured with 10 salt rounds).
- **jsonwebtoken (JWT)**: Cryptographic signature and token issuance.
- **dotenv**: Secure environment variable loading.

### Frontend
- **HTML5**: Semantic, accessible markup.
- **CSS3**: Custom design system featuring CSS Grid, Flexbox, custom properties, and smooth transitions (no external CSS frameworks like Bootstrap or Tailwind).
- **Vanilla JavaScript**: Pure ES6+ with DOM manipulation, Fetch API, and zero framework dependencies.

---

## Architecture & Folder Structure

```text
secure-notes-vault/
│
├── config/
│   └── db.js                 # Database connection logic using Mongoose
│
├── controllers/
│   ├── authController.js     # User registration and login business logic
│   └── noteController.js     # Note CRUD handlers with strict user scoping
│
├── middleware/
│   └── authMiddleware.js     # JWT verification & req.user attachment
│
├── models/
│   ├── User.js               # User Mongoose schema & methods
│   └── Note.js               # Note Mongoose schema with User ObjectId reference
│
├── routes/
│   ├── authRoutes.js         # /api/auth route definitions
│   └── noteRoutes.js         # /api/notes route definitions
│
├── public/
│   ├── index.html            # Single Page Application HTML markup
│   ├── style.css             # Modern SaaS design system stylesheet
│   └── script.js             # Client-side SPA routing, fetch calls, DOM handlers
│
├── tests/
│   ├── acceptanceTest.js     # Automated test suite for all 7 security tests
│   └── e2eVerify.js          # End-to-end static & server validation
│
├── .env                      # Local environment configuration (git ignored)
├── .env.example              # Environment variable template
├── .gitignore                # Git exclusions
├── package.json              # Project metadata, dependencies, and scripts
├── server.js                 # Application entry point and Express server
└── README.md                 # Complete documentation
```

---

## Security Architecture & Implementation

### 1. Password Hashing (bcryptjs)
Passwords submitted during registration undergo salt generation with **10 rounds** before being hashed and stored in the database:
```javascript
const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash(password, salt);
```
Plaintext passwords are never stored in MongoDB. The `User` model also implements a `toJSON` transform that strips the `password` field before serialization.

### 2. JWT Authentication & Bearer Header Verification
Protected endpoints require an `Authorization` header formatted as:
```http
Authorization: Bearer <jwt_token>
```
The `authMiddleware` validates:
1. Header presence and format.
2. Token signature against `JWT_SECRET`.
3. Token expiration.
4. User existence in MongoDB, attaching the sanitized record to `req.user`.

### 3. User Data Isolation
Note queries and mutations enforce tenancy at the database level:
- **Fetch**:
  ```javascript
  const notes = await Note.find({ user: req.user._id }).sort({ createdAt: -1 });
  ```
- **Delete**:
  ```javascript
  const note = await Note.findOne({ _id: id, user: req.user._id });
  ```
  If a user attempts to delete a note belonging to another user, the query returns `null` and the API responds with `404 Not Found`, completely shielding note IDs and preventing cross-user data manipulation.

### 4. Cross-Site Scripting (XSS) Prevention
Frontend rendering does **not** inject user inputs via `innerHTML`. All titles and note bodies are injected strictly using `element.textContent`:
```javascript
const titleEl = document.createElement('h3');
titleEl.textContent = note.title; // Safe injection

const bodyEl = document.createElement('div');
bodyEl.textContent = note.content; // Safe injection
```

---

## Installation & Prerequisites

### Prerequisites
- **Node.js**: v18.0.0 or higher (Tested on Node v24).
- **npm**: v9.0.0 or higher.
- **MongoDB**: Local MongoDB instance (v6.0+) or MongoDB Atlas cluster.

### Setup Steps
1. Open your terminal in the project directory:
   ```bash
   cd secure-notes-vault
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

---

## Database Setup (MongoDB Local & Atlas)

### Option A: Local MongoDB
1. Ensure your local MongoDB server is running:
   ```bash
   mongod --dbpath <path_to_data_dir>
   ```
2. Set the connection string in your `.env`:
   ```env
   MONGO_URI=mongodb://127.0.0.1:27017/secure_notes_vault
   ```

### Option B: MongoDB Atlas (Cloud)
1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a Database User with read/write privileges.
3. Under **Network Access**, add your current IP address (or `0.0.0.0/0` for development).
4. Copy the connection URI and update `.env`:
   ```env
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/secure_notes_vault?retryWrites=true&w=majority
   ```

---

## Environment Configuration

Copy `.env.example` to create your `.env` file:
```bash
cp .env.example .env
```

Ensure your `.env` contains:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/secure_notes_vault
JWT_SECRET=super_secret_jwt_vault_production_key_9837492817349
JWT_EXPIRES_IN=1d
```

---

## Running the Application

### Development Mode (with hot-reload via nodemon)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Accessing the Web Application
Open your web browser and navigate to:
```text
http://localhost:5000
```

---

## API Endpoint Documentation

### Authentication Routes (`/api/auth`)

#### 1. Register User
- **Method**: `POST`
- **Path**: `/api/auth/register`
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "name": "Alice Smith",
    "email": "alice@example.com",
    "password": "AlicePassword123"
  }
  ```
- **Success Response (`201 Created`)**:
  ```json
  {
    "message": "User registered successfully.",
    "user": {
      "id": "67329acdf45b80a1",
      "name": "Alice Smith",
      "email": "alice@example.com",
      "createdAt": "2026-11-12T12:00:00.000Z"
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Missing fields, invalid email format, password under 6 characters, or email already registered.

#### 2. User Login
- **Method**: `POST`
- **Path**: `/api/auth/login`
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "email": "alice@example.com",
    "password": "AlicePassword123"
  }
  ```
- **Success Response (`200 OK`)**:
  ```json
  {
    "message": "Login successful.",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "67329acdf45b80a1",
      "name": "Alice Smith",
      "email": "alice@example.com"
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Generic "Invalid email or password" error.

---

### Notes Routes (`/api/notes`)

All note routes require the header:
`Authorization: Bearer <token>`

#### 1. Create a Note
- **Method**: `POST`
- **Path**: `/api/notes`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "title": "Confidential Research Plan",
    "content": "Verify zero-knowledge proof implementation."
  }
  ```
- **Success Response (`201 Created`)**:
  ```json
  {
    "message": "Note created successfully.",
    "note": {
      "_id": "67329bb2f45b80a2",
      "title": "Confidential Research Plan",
      "content": "Verify zero-knowledge proof implementation.",
      "user": "67329acdf45b80a1",
      "createdAt": "2026-11-12T12:05:00.000Z"
    }
  }
  ```

#### 2. Get User Notes
- **Method**: `GET`
- **Path**: `/api/notes`
- **Auth Required**: Yes
- **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "count": 1,
    "notes": [
      {
        "_id": "67329bb2f45b80a2",
        "title": "Confidential Research Plan",
        "content": "Verify zero-knowledge proof implementation.",
        "user": "67329acdf45b80a1",
        "createdAt": "2026-11-12T12:05:00.000Z"
      }
    ]
  }
  ```

#### 3. Delete a Note
- **Method**: `DELETE`
- **Path**: `/api/notes/:id`
- **Auth Required**: Yes
- **Success Response (`200 OK`)**:
  ```json
  {
    "message": "Note deleted successfully.",
    "id": "67329bb2f45b80a2"
  }
  ```
- **Error Responses**:
  - `404 Not Found`: Note does not exist or does not belong to the authenticated user.
  - `401 Unauthorized`: Missing or invalid token.

---

## Verification & Acceptance Testing

An automated acceptance test suite is included in `tests/acceptanceTest.js`.

### Run Automated Security Tests
```bash
npm test
```

### Acceptance Test Matrix
| Test # | Test Name | Description | Verification Method | Status |
| :---: | :--- | :--- | :--- | :---: |
| **1** | **Password Hashing** | Verify bcrypt encryption with 10 salt rounds | Direct MongoDB document inspection for `$2b$10$` prefix | **PASSED** |
| **2** | **Duplicate Email** | Reject duplicate email registrations | API returns HTTP 400 with duplicate error message | **PASSED** |
| **3** | **Data Isolation** | Ensure Alice's notes are hidden from Bob | Bob queries `/api/notes` and receives `0` notes | **PASSED** |
| **4** | **Unauthorized Access** | Reject unauthenticated requests | `GET /api/notes` without token returns HTTP 401 | **PASSED** |
| **5** | **Cross-User Deletion** | Prevent Bob from deleting Alice's note | `DELETE /api/notes/:id` returns HTTP 404, note remains intact | **PASSED** |
| **6** | **Invalid JWT** | Reject forged or expired tokens | API returns HTTP 401 for invalid signatures | **PASSED** |
| **7** | **Post-Logout Access** | Block protected actions after logout | Request without stored token is rejected with HTTP 401 | **PASSED** |

---

## Frontend UI & Screenshots Section

To include visual proof in your assignment submission, take screenshots of the live application running on `http://localhost:5000` and save them into a `screenshots/` directory.

### 1. Authentication View (Sign In & Sign Up)
> *Shows the clean SaaS authentication card, tab switcher, input validation, and password toggle.*
```
+-------------------------------------------------------------+
|                                                             |
|                   [ Secure Vault Logo ]                     |
|                        Secure Vault                         |
|                                                             |
|              [ Sign In ]   [ Create Account ]               |
|                                                             |
|    Email:    [ alice@example.com                         ]  |
|    Password: [ ••••••••••••                           (o)]  |
|                                                             |
|              [ Sign In to Vault Button ]                    |
|                                                             |
+-------------------------------------------------------------+
```
*(Place screenshot here: `screenshots/01_login_screen.png`)*

### 2. User Dashboard & Empty State
> *Shows the private dashboard with welcome badge, live counter (0 Notes), search bar, and empty state.*
*(Place screenshot here: `screenshots/02_empty_dashboard.png`)*

### 3. Note Creation & Multi-Note Display
> *Shows note creation drawer and responsive grid of cards with formatted timestamps and delete triggers.*
*(Place screenshot here: `screenshots/03_notes_grid.png`)*

### 4. Note Deletion Confirmation Modal
> *Shows the custom confirmation modal asking the user to confirm note deletion.*
*(Place screenshot here: `screenshots/04_delete_modal.png`)*

### 5. MongoDB Compass Verification
> *Shows MongoDB Compass displaying the Users collection with bcrypt hashes and Notes collection referencing user ObjectIds.*
*(Place screenshot here: `screenshots/05_mongodb_compass.png`)*

---

## Deployment & GitHub Instructions

### 1. Initialize Git Repository
```bash
git init
git add .
git commit -m "feat: complete Secure Personal Notes & Task Vault application"
```

### 2. Push to GitHub
1. Create a new repository on GitHub (e.g. `secure-personal-notes-vault`).
2. Link your local repository and push:
```bash
git remote add origin https://github.com/<your-username>/secure-personal-notes-vault.git
git branch -M main
git push -u origin main
```

*(Note: `.env` and `node_modules/` are automatically excluded via `.gitignore` to prevent leaking credentials).*

---

## License
MIT License. Developed for academic and production assessment.
