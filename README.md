# Mind Haven Backend

A Node.js backend API server built with Express.js.

## Features

- Express.js web framework
- CORS enabled
- Security headers with Helmet
- Request logging with Morgan
- Environment variables support with dotenv
- Development auto-restart with nodemon

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm (comes with Node.js)

### Installation

1. Clone the repository or navigate to the project directory
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example` (already created)

### Running the Application

#### Development Mode (with auto-restart)
```bash
npm run dev
```

#### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3000` (or the port specified in your `.env` file).

## API Endpoints

### Base Routes
- `GET /` - Welcome message and server status
- `GET /api/health` - Health check endpoint

### User Routes (Example)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create a new user
- `PUT /api/users/:id` - Update user by ID
- `DELETE /api/users/:id` - Delete user by ID

## Project Structure

```
mind_haven_backend/
├── src/
│   ├── routes/          # Route definitions
│   ├── controllers/     # Business logic
│   ├── middleware/      # Custom middleware
│   ├── models/          # Data models
│   └── utils/           # Utility functions
├── .env                 # Environment variables
├── .gitignore          # Git ignore rules
├── package.json        # Project dependencies and scripts
├── server.js           # Main server file
└── README.md           # This file
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
PORT=3000
NODE_ENV=development
```

## Available Scripts

- `npm start` - Start the server in production mode
- `npm run dev` - Start the server in development mode with nodemon
- `npm test` - Run tests (placeholder)

## Next Steps

1. Set up a database (MongoDB, PostgreSQL, MySQL, etc.)
2. Add authentication and authorization
3. Implement proper error handling
4. Add input validation
5. Set up testing
6. Add API documentation (Swagger/OpenAPI)
7. Implement logging
8. Add rate limiting
9. Set up CI/CD pipeline

## License

ISC