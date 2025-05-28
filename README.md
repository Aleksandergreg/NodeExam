[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/eWobU840)

## Live cycling blog and auth system

**A live cycling blow and authentication and authorization system build with Node.js with Express backend utilizing a PostgreSQL database and a Svelte5 frontend**

## Prerequisites

**To run the program locally you must fill in the fields in the .env.sample file, and rename it to .env**

**You must also have PostgreSQL installed and running on your system**

**Node.js**

**npm**

**If you need PostGreSQL running locally do**

* ``export PGPASSWORD=your_actual_password ``
* ``psql -h localhost -p DBPORT -U myappuser -d myappdb ``
* Change the "your_actual_password" and DBPORT to whatever you put in your .env file lcoally 😄

## Installation

**Clone the repository**
**CD into the repo folder**

1. ``cd server``
2. ``npm install``
3. ``cd ../client``
4. ``npm install``

## Running the application

### Backend
1. **From the server folder start the server:**
   ``npm start or npm run dev for hot-reload``
2. **The API will be available on port 8080**

### Frontend

1. **From the client folder, start Vite**
   ``npm run dev``
2. **The application will now be available on port 5173**
