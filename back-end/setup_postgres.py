#!/usr/bin/env python3
import os
import subprocess
import sys
import getpass

# Get current system username
SYSTEM_USER = getpass.getuser()

# PostgreSQL configuration
DB_NAME = 'group_savings'
DB_USER = SYSTEM_USER  # Use current system user
DB_HOST = 'localhost'
DB_PORT = '5432'

def create_env_file():
    """Create a .env file with PostgreSQL configuration"""
    # Use connection string without password for peer authentication
    env_content = f"""# Flask application settings
SECRET_KEY=your_secure_secret_key
JWT_SECRET_KEY=your_secure_jwt_secret

# Database
DATABASE_URI=postgresql://{DB_USER}@{DB_HOST}:{DB_PORT}/{DB_NAME}

# JWT Settings
JWT_ACCESS_TOKEN_EXPIRES=3600

# Mail Settings
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_DEFAULT_SENDER=your_email@gmail.com
"""
    with open('.env', 'w') as env_file:
        env_file.write(env_content)
    print("Created .env file with PostgreSQL configuration")

def create_database():
    """Create the PostgreSQL database if it doesn't exist"""
    print("\nDatabase setup:")
    print("1. Creating database user role if it doesn't exist")
    
    try:
        # Create user role if it doesn't exist
        create_role_cmd = f"sudo -u postgres psql -c \"DO $$ BEGIN CREATE ROLE {DB_USER} WITH LOGIN CREATEDB; EXCEPTION WHEN duplicate_object THEN RAISE NOTICE 'Role already exists'; END $$;\""
        subprocess.run(create_role_cmd, shell=True, check=True)
        print(f"✓ User role '{DB_USER}' is ready")
    except subprocess.CalledProcessError as e:
        print(f"✗ Error creating user role: {e}")
        print("\nTry running this command manually with sudo:")
        print(f"sudo -u postgres psql -c \"CREATE ROLE {DB_USER} WITH LOGIN CREATEDB;\"")
        sys.exit(1)
    
    print("2. Creating database if it doesn't exist")
    try:
        # Check if database exists
        check_cmd = f"sudo -u postgres psql -c \"SELECT 1 FROM pg_database WHERE datname='{DB_NAME}'\" | grep -q 1"
        db_exists = subprocess.run(check_cmd, shell=True)
        
        if db_exists.returncode == 0:
            print(f"✓ Database '{DB_NAME}' already exists")
        else:
            # Create database and grant privileges
            create_db_cmd = f"sudo -u postgres createdb {DB_NAME} -O {DB_USER}"
            subprocess.run(create_db_cmd, shell=True, check=True)
            print(f"✓ Created database '{DB_NAME}' and assigned to user '{DB_USER}'")
    except subprocess.CalledProcessError as e:
        print(f"✗ Error with database operations: {e}")
        sys.exit(1)

def run_migrations():
    """Run the database migrations"""
    print("\nMigrations setup:")
    try:
        # Create a new environment variables dictionary with the DATABASE_URI set
        my_env = os.environ.copy()
        my_env["DATABASE_URI"] = f"postgresql://{DB_USER}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
        
        # First, if migrations directory exists, remove it to start fresh
        if os.path.exists('migrations'):
            if os.name == 'nt':  # Windows
                subprocess.run('rmdir /S /Q migrations', shell=True, check=True)
            else:  # Unix-like
                subprocess.run('rm -rf migrations', shell=True, check=True)
            print("1. ✓ Removed existing migrations folder")
        else:
            print("1. ✓ No existing migrations folder found")
            
        # Initialize migrations
        print("2. Initializing migrations...")
        subprocess.run('flask db init', shell=True, check=True, env=my_env)
        print("   ✓ Initialized new migrations")
        
        # Create migrations
        print("3. Creating migration files...")
        subprocess.run('flask db migrate -m "Initial migration for PostgreSQL"', shell=True, check=True, env=my_env)
        print("   ✓ Created migration files")
        
        # Apply migrations
        print("4. Applying migrations...")
        subprocess.run('flask db upgrade', shell=True, check=True, env=my_env)
        print("   ✓ Applied migrations to the database")
    except subprocess.CalledProcessError as e:
        print(f"✗ Error running migrations: {e}")
        sys.exit(1)

if __name__ == "__main__":
    # Ensure we're in the right directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    
    print("===== PostgreSQL Setup for Group Savings App =====")
    print(f"System user: '{SYSTEM_USER}'")
    print(f"Database name: '{DB_NAME}'")
    print("=============================================")
    
    # Create .env file
    create_env_file()
    
    # Create database
    create_database()
    
    # Run migrations
    run_migrations()
    
    print("\n✅ PostgreSQL setup completed successfully!") 