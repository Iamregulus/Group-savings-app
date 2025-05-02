# Migrating from SQLite to PostgreSQL

This guide will help you migrate the Group Savings App from SQLite to PostgreSQL.

## Prerequisites

1. PostgreSQL installed on your system
2. Python dependencies installed (psycopg2-binary)

## Step 1: Install the PostgreSQL Python Driver

```bash
# Activate your virtual environment
source .venv/bin/activate

# Install the driver
pip install psycopg2-binary
# Or using uv
uv pip install psycopg2-binary

# Update requirements.txt
echo "psycopg2-binary==2.9.9" >> requirements.txt
```

## Step 2: Create a PostgreSQL Database

You can create the database using the PostgreSQL command-line tools:

```bash
# Login as the postgres user (may require sudo)
sudo -u postgres psql

# In the PostgreSQL prompt, create the database and user
postgres=# CREATE DATABASE group_savings;
postgres=# CREATE USER your_username WITH PASSWORD 'your_password';
postgres=# GRANT ALL PRIVILEGES ON DATABASE group_savings TO your_username;
postgres=# \q
```

Or if you prefer a one-liner with sudo:

```bash
sudo -u postgres createdb group_savings
```

## Step 3: Update Environment Variables

Create or update your `.env` file with the PostgreSQL connection string:

```bash
# Create .env file with PostgreSQL configuration
cat > .env << EOF
# Flask application settings
SECRET_KEY=your_secure_secret_key
JWT_SECRET_KEY=your_secure_jwt_secret

# Database
DATABASE_URI=postgresql://your_username:your_password@localhost:5432/group_savings

# JWT Settings
JWT_ACCESS_TOKEN_EXPIRES=3600

# Mail Settings
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_DEFAULT_SENDER=your_email@gmail.com
EOF
```

## Step 4: Reset and Initialize Migrations

Since we are changing database engines, it's best to reset the migrations:

```bash
# Remove existing migrations
rm -rf migrations

# Initialize new migrations with the PostgreSQL database URI
flask db init
flask db migrate -m "Initial PostgreSQL migration"
flask db upgrade
```

## Step 5: Verify the Connection

Start your Flask application to verify that it can connect to PostgreSQL:

```bash
flask run
```

## Troubleshooting

### Authentication Issues

If you encounter authentication errors, try:

1. Check your PostgreSQL connection string
2. Verify the PostgreSQL user has the correct permissions
3. Check PostgreSQL's `pg_hba.conf` file for authentication settings
4. Try using peer authentication with the current system user

### Connection Issues

If you can't connect to PostgreSQL:

1. Ensure PostgreSQL service is running: `sudo systemctl status postgresql`
2. Check PostgreSQL logs: `sudo tail -f /var/log/postgresql/postgresql-*.log`
3. Verify PostgreSQL is listening on the expected port: `sudo netstat -tuln | grep 5432`

### Migration Issues

If you encounter migration errors:

1. Check that your models are PostgreSQL-compatible
2. Remove the migrations directory and start fresh
3. Consider dumping data from SQLite and importing it to PostgreSQL if you need to preserve data

## Additional Resources

- [SQLAlchemy PostgreSQL Documentation](https://docs.sqlalchemy.org/en/14/dialects/postgresql.html)
- [Flask-Migrate Documentation](https://flask-migrate.readthedocs.io/en/latest/)
 