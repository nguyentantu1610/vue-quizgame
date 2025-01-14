# Real-Time Quiz App (Vue.js Frontend)

## Overview

This project is the frontend of a real-time quiz application built with Vue.js. It interacts with a Laravel-based backend to allow users to participate in live quizzes. Users can join quiz rooms, answer questions in real-time, and view their scores as the quiz progresses.

## Features

- **User Authentication**: Login, registration, and password reset functionality.
- **Quiz Management**: View available quizzes, users can search, create, update and delete quiz.
- **Real-time quiz participation**: Users can create or join a room and participate in real-time with others.
- **Dynamic question display**: Questions are shown one by one, and users have limited time to answer each question.
- **Real-time score updates**: Scores are updated live as the quiz progresses.

## Installation

Follow these steps to set up the frontend application locally.

### 1. Clone the repository

```bash
git clone https://github.com/nguyentantu1610/vue-quizgame.git
cd vue-quizgame
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create .env

Add a .env file in the root of the project and configure it with the necessary API base URL:

```env
VITE_REVERB_APP_KEY=your_app_key
VITE_REVERB_HOST=your_host
VITE_REVERB_PORT=your_port
```

### 4. Compile and Hot-Reload for Development

```bash
npm run dev
```

### 5. Type-Check, Compile and Minify for Production

```bash
npm run build
```

## Technologies Used

- **Vue.js**: A progressive JavaScript framework for building user interfaces.
- **Vue Router**: To handle client-side routing and navigation between different views (e.g., quiz room, results).
- **Pinia**: For state management, keeping track of user data, quiz data, and real-time updates.
- **Laravel Echo**: To subscribe to channels and listen for events broadcast by the server-side broadcasting driver.
- **Pusher**: Real-time broadcasting service integrated with Laravel for instant updates.
- **Tailwind CSS**: A utility-first CSS framework for building custom designs.
- **Primevue**: A comprehensive UI component suite for Vue.js.

## API Documentation

The API documentation for the backend is available [here](https://github.com/nguyentantu1610/quizgame).

## Acknowledgements

- Vue.js for providing an approachable, performant, and versatile framework for building web user interfaces.
- Tailwind CSS for offering flexible CSS classes with predefined rules.
- Primevue for providing a rich set of UI components and icons.
