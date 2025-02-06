# Fitness Challenge Web Application

A web application for managing fitness challenges with user authentication and review system.

## Features

- User Registration and Login with JWT Authentication
- Password Security with Bcrypt
- Challenge Reviews System (1-5 stars)
- Frontend built with Bootstrap and Font Awesome
- Backend built with Express.js and MySQL

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v8 or higher)
- npm (Node Package Manager)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd fitness_challenge_template
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following content:
```env
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_DATABASE=fitness_challenge
JWT_SECRET_KEY=your_secret_key
JWT_EXPIRES_IN=1h
JWT_ALGORITHM=HS256
```

4. Initialize the database:
```bash
npm run init_tables
```

## Running the Application

1. Start the server:
```bash
npm start
```

2. For development with auto-reload:
```bash
npm run dev
```

3. Access the application at `http://localhost:3000`

## Testing

Run the test suite:
```bash
npm test
```

## Project Structure

```
fitness_challenge_template/
├── public/                 # Static files
│   ├── css/               # Stylesheets
│   ├── js/                # Client-side JavaScript
│   └── *.html             # HTML pages
├── src/                   # Server-side code
│   ├── configs/           # Configuration files
│   ├── controllers/       # Route controllers
│   ├── middlewares/       # Custom middlewares
│   ├── models/            # Database models
│   ├── routes/            # Route definitions
│   ├── services/          # Database and other services
│   └── app.js            # Express application setup
├── tests/                 # Test files
├── .env                   # Environment variables
├── .gitignore            # Git ignore file
├── index.js              # Application entry point
└── package.json          # Project dependencies
```

## API Endpoints

### Authentication
- POST `/api/register` - Register new user
- POST `/api/login` - User login

### Reviews
- GET `/api/reviews` - Get all reviews
- GET `/api/reviews/user` - Get user's reviews (requires authentication)
- POST `/api/reviews` - Create review (requires authentication)
- PUT `/api/reviews/:id` - Update review (requires authentication)
- DELETE `/api/reviews/:id` - Delete review (requires authentication)

## Security Features

- JWT for secure authentication
- Bcrypt for password hashing
- Input validation and sanitization
- Protected routes with middleware
- CORS protection
- Environment variables for sensitive data

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.
