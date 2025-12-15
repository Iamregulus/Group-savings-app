# Group Savings App - Backend

This is the Flask-based backend API for the Group Savings application.

## Features

- User authentication and management
- Group creation and management
- Contribution and withdrawal management
- Transaction tracking and reporting

## Tech Stack

- Flask - Web framework
- Flask-JWT-Extended - Authentication
- Flask-SQLAlchemy - ORM
- Flask-Migrate - Database migrations
- SQLite (development) / PostgreSQL (production) - Database
- Flask-Mail - Email functionality

## Getting Started

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)

### Installation

1. Clone the repository
2. Navigate to the back-end directory
3. Create a virtual environment:

```bash
python -m venv venv
```

4. Activate the virtual environment:

- On Windows:
```bash
venv\Scripts\activate
```

- On macOS/Linux:
```bash
source venv/bin/activate
```

5. Install dependencies:

```bash
pip install -r requirements.txt
```

6. Set up environment variables by creating a .env file in the project root:

```
SECRET_KEY=your_secret_key
JWT_SECRET_KEY=your_jwt_secret_key
DATABASE_URI=sqlite:///group_savings.db
```

7. Initialize the database:

```bash
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
```

### Running the API

```bash
python run.py
```

The API will be available at http://localhost:5000

## API Endpoints

### Authentication

- POST /api/auth/register - Register a new user
- POST /api/auth/login - User login
- GET /api/auth/me - Get current user profile
- PUT /api/auth/profile - Update user profile
- PUT /api/auth/password - Change password
- POST /api/auth/reset-password - Request password reset
- POST /api/auth/reset-password/:token - Reset password with token
- GET /api/auth/verify-email/:token - Verify email

### Groups

- GET /api/groups/available - Get available groups for joining
- GET /api/groups/my-groups - Get user's groups
- GET /api/groups/:id - Get group details
- POST /api/groups - Create a new group
- PUT /api/groups/:id - Update group
- POST /api/groups/:id/join - Join a group
- POST /api/groups/:id/leave - Leave a group
- GET /api/groups/:id/members - Get group members
- POST /api/groups/:id/contributions - Make a contribution
- POST /api/groups/:id/withdrawals - Request a withdrawal
- PUT /api/groups/:id/withdrawals/:transactionId - Process withdrawal request
- GET /api/groups/:id/stats - Get group statistics

### Users

- GET /api/users/:id/groups - Get user's groups
- GET /api/users/:id/transactions - Get user's transactions
- GET /api/users/:id/transactions/summary - Get user's transaction summary

### Transactions

- GET /api/transactions/:id - Get transaction details
- GET /api/transactions/export - Export transactions

## License

This project is licensed under the MIT License. 