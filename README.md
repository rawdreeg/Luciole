# Luciole

Welcome to **Luciole**, a web application that lets you connect and sync with lights around you. Create a spark, share it with others, and watch as your lights synchronize when you're close to each other.

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
- [Technologies Used](#technologies-used)
- [License](#license)

## Features

- **Create and Join Sparks**: Easily create a new spark and share it with a unique ID or QR code.
- **Real-time Synchronization**: Lights synchronize in real-time when users are in close proximity.
- **Proximity Display**: A visual indicator shows how close you are to other users in the same spark.
- **Customizable Flash Colors**: Choose a custom color for your spark's flash.
- **PWA Support**: Install the application on your mobile device for a better experience.

## Project Structure

The repository is organized into three main directories:

- `client/`: Contains the frontend code, built with React and TypeScript.
- `server/`: Contains the backend code, built with Express and TypeScript.
- `shared/`: Contains shared code between the client and server, such as data schemas.

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

1. **Clone the repository**:
   ```sh
   git clone https://github.com/your-username/luciole.git
   cd luciole
   ```

2. **Install dependencies for the server**:
   ```sh
   cd server
   npm install
   cd ..
   ```

3. **Install dependencies for the client**:
   ```sh
   cd client
   npm install
   cd ..
   ```

### Running the Application

1. **Start the server**:
   ```sh
   cd server
   npm start
   ```

2. **Start the client**:
   ```sh
   cd client
   npm start
   ```

The application will be available at `http://localhost:3000`.

## Technologies Used

- **Frontend**:
  - [React](https://reactjs.org/)
  - [TypeScript](https://www.typescriptlang.org/)
  - [Tailwind CSS](https://tailwindcss.com/)
  - [Vite](https://vitejs.dev/)

- **Backend**:
  - [Node.js](https://nodejs.org/)
  - [Express](https://expressjs.com/)
  - [TypeScript](https://www.typescriptlang.org/)
  - [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)

- **Database**:
  - [PostgreSQL](https://www.postgresql.org/)
  - [Drizzle ORM](https://orm.drizzle.team/)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.