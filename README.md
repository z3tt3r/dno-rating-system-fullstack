# D&O Rating System Fullstack Application

This application is a prototype of a Directors & Officers (D&O) insurance premium calculation system. It's a full-stack solution comprising a **Spring Boot** backend and a **React** frontend. The project aims to demonstrate a comprehensive system for determining net premiums based on various factors, while also showcasing the interaction between the frontend and backend components. It has its limitations as this has been developed for SME companies sector only. 

NOTE: The actual rates has been changed from its original values as those are internal data of my former employer. 

Michal Musil

https://www.linkedin.com/in/michal-lisum/

---

## Key Features

* **Dynamic Premium Calculation**: The application calculates premiums based on key parameters such as a company's annual **turnover**, desired insurance **limit**, and **financial performance**.
* **Tiered Coefficients and Discounts**: It utilizes predefined coefficients for turnover bands (higher turnover leads to a lower base rate per million limit) and applies cascading discounts for higher insurance limits.
* **Data Persistence**: Client and calculated risk data are stored in mySQL Database.
* **REST API**: The backend provides a robust REST API for communication with the frontend, handling requests, and delivering calculation results.
* **User Interface**: An intuitive React UI allows users to easily input data and instantly visualize premium calculation results.

---

## Technologies Used

The project is built using modern technologies and tools:

### Backend
* **Language**: Java 17+
* **Framework**: Spring Boot 3.x
* **Database**: MySQL
* **Persistence**: Spring Data JPA / Hibernate
* **Build Tool**: Gradle

### Frontend
* **Language**: JavaScript
* **Library**: React 18+
* **Build Tool**: Vite
* **Styling**: Bootstrap

---

## How to Run Locally

To get the application up and running on your local machine, follow these steps:

### Prerequisites
Make sure you have the following installed:
* **Java Development Kit (JDK)** version 17 or higher.
* **Node.js** and **npm** (Node Package Manager) or **Yarn**.

### 1. Clone the Repository
If you haven't already, clone this Git repository to your local machine:
```bash
git clone git@github.com:z3tt3r/dno-rating-system-fullstack.git
cd dno-rating-system-fullstack
2. Start the Backend (Spring Boot)

Navigate to the backend directory:

Bash
cd backend
Start the Spring Boot application using Gradle:

Bash
./gradlew bootRun
(On Windows, use gradlew.bat bootRun).

The backend will run on http://localhost:8080.

3. Start the Frontend (React)

Open a new terminal and navigate to the frontend directory (ensure you are back in the dno-rating-system-fullstack root directory first):

Bash
cd ../frontend
Install all necessary Node.js dependencies:

Bash
npm install
# or yarn install
Start the React development server:

Bash
npm run dev
# or yarn dev
The frontend will typically be available at http://localhost:5173 (or another port automatically assigned by Vite).

4. Using the Application

After successfully starting both the backend and frontend, open your web browser and go to the frontend's address (e.g., http://localhost:5173). You can now begin using the application and testing premium calculations.

Project Structure
.
├── dno-rating-system-backend/                 # Spring Boot REST API
│   ├── src/main/java/                         # Main Java source code
│   ├── src/main/resources/                    # Configuration, templates
│   └── build.gradle                           # Gradle build configuration
├── dno-rating-system-frontend/                # React Single Page Application (SPA)
│   ├── public/                                # Static assets
│   ├── src/                                   # React components and application logic
│   └── package.json                           # Node.js dependencies and scripts
├── .gitignore                                 # Global Git ignore file
└── README.md                                  # This document
