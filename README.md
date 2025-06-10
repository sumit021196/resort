# Vegetable Inventory Management System

This project is a web application designed to help resort owners manage their vegetable inventory, track purchases, usage, and stock levels to prevent mismanagement and potential theft.

## Project Objective
To provide a system for accountability, transparency, and real-time tracking of all vegetable stock-related activities within a resort's kitchen operations.

## Features
- User Management (Admin, Purchase Manager, Kitchen Staff)
- Purchase Entry & Tracking
- Daily Usage Logging
- Live Stock Monitoring
- Analytics and Reports
- Alert System for anomalies
- Audit Trails

## Technology Stack
- **Frontend**: React.js
- **Backend**: Node.js with Express.js
- **Database**: Firebase Firestore

## Setup and Installation

### Prerequisites
- Node.js and npm (or yarn)
- Firebase Account and Project Setup

### Backend Setup
1. Navigate to the `backend` directory: `cd backend`
2. Install dependencies: `npm install` (or `yarn install`)
3. Create a `.env` file based on `.env.example` and add your Firebase credentials and other configurations.
4. Start the server: `npm start` (or `yarn start`)

### Frontend Setup
1. Navigate to the `frontend` directory: `cd frontend`
2. Install dependencies: `npm install` (or `yarn install`)
3. Configure Firebase in the frontend (e.g., in `src/firebase.js`).
4. Start the development server: `npm start` (or `yarn start`)

## Project Structure
```
VegetableInventorySystem/
├── backend/                # Node.js/Express backend
│   ├── src/
│   ├── package.json
│   └── ...
├── frontend/               # React.js frontend
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── ...
├── .gitignore
└── README.md
```
