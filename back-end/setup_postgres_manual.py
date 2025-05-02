#!/usr/bin/env python3
import os
import subprocess
import sys
import getpass

# Get current system username
SYSTEM_USER = getpass.getuser()

# PostgreSQL configuration - ADJUST THESE VALUES MANUALLY
DB_NAME = 'group_savings'
DB_USER = 'postgres'        # Change to your PostgreSQL username
DB_PASSWORD = 'postgres'    # Change to your PostgreSQL password
DB_HOST = 'localhost'
DB_PORT = '5432'

def create_env_file():
    """Create a .env file with PostgreSQL configuration"""
    env_content = f"""# Flask application settings
SECRET_KEY=your_secure_secret_key
JWT_SECRET_KEY=your_secure_jwt_secret

# Database
DATABASE_URI=postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}

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

def run_migrations():
    """Run the database migrations"""
    print("\nRunning migrations...")
    try:
        # Create a new environment variables dictionary with the DATABASE_URI set
        my_env = os.environ.copy()
        my_env["DATABASE_URI"] = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
        
        # First, if migrations directory exists, remove it to start fresh
        if os.path.exists('migrations'):
            if os.name == 'nt':  # Windows
                subprocess.run('rmdir /S /Q migrations', shell=True, check=True)
            else:  # Unix-like
                subprocess.run('rm -rf migrations', shell=True, check=True)
            print("✓ Removed existing migrations folder")
            
        # Initialize migrations
        print("Initializing migrations...")
        subprocess.run('flask db init', shell=True, check=True, env=my_env)
        print("✓ Initialized new migrations")
        
        # Create migrations
        print("Creating migration files...")
        subprocess.run('flask db migrate -m "Initial migration for PostgreSQL"', shell=True, check=True, env=my_env)
        print("✓ Created migration files")
        
        # Apply migrations
        print("Applying migrations...")
        subprocess.run('flask db upgrade', shell=True, check=True, env=my_env)
        print("✓ Applied migrations to the database")
    except subprocess.CalledProcessError as e:
        print(f"Error running migrations: {e}")
        sys.exit(1)

if __name__ == "__main__":
    # Ensure we're in the right directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    
    print("===== PostgreSQL Simplified Setup =====")
    print(f"Database: postgresql://{DB_USER}:***@{DB_HOST}:{DB_PORT}/{DB_NAME}")
    print("======================================")
    
    print("\nBefore running this script:")
    print("1. Make sure PostgreSQL is installed and running")
    print(f"2. Make sure the database '{DB_NAME}' has been created")
    print("3. Adjust the DB_USER and DB_PASSWORD variables in this script")
    
    response = input("\nDo you want to proceed? (y/n): ")
    if response.lower() != 'y':
        print("Setup canceled.")
        sys.exit(0)
    
    # Create .env file
    create_env_file()
    
    # Run migrations
    run_migrations()
    
    print("\n✅ PostgreSQL setup completed successfully!") 