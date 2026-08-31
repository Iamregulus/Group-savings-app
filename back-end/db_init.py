from app import create_app, db
import time
import sys
from sqlalchemy.exc import OperationalError, SQLAlchemyError

MAX_RETRIES = 5
RETRY_DELAY = 5  # seconds

def init_db():
    app = create_app()
    
    with app.app_context():
        # Print database connection info (without exposing credentials). Read
        # this from the app's actual configured engine rather than
        # re-deriving it from raw env vars -- that way this message can
        # never drift from what db.create_all() below actually connects to.
        engine_url = db.engine.url
        db_type = 'PostgreSQL' if engine_url.drivername.startswith('postgresql') else 'SQLite'
        print(f"Using {db_type} database")
        if db_type == 'PostgreSQL':
            print(f"Database host: {engine_url.host}")
        
        # Add retry logic for database connection
        retry_count = 0
        while retry_count < MAX_RETRIES:
            try:
                # Create all tables
                print(f"Creating database tables... (Attempt {retry_count + 1}/{MAX_RETRIES})")
                db.create_all()
                print("Tables created successfully")

                # If we get here, the database connection is working fine
                break
                
            except OperationalError as e:
                print(f"Database connection error: {str(e)}")
                if retry_count < MAX_RETRIES - 1:
                    print(f"Retrying in {RETRY_DELAY} seconds...")
                    time.sleep(RETRY_DELAY)
                    retry_count += 1
                else:
                    print("Maximum retry attempts reached. Unable to connect to database.")
                    raise
                
            except SQLAlchemyError as e:
                print(f"SQLAlchemy error: {str(e)}")
                if retry_count < MAX_RETRIES - 1:
                    print(f"Retrying in {RETRY_DELAY} seconds...")
                    time.sleep(RETRY_DELAY)
                    retry_count += 1
                else:
                    print("Maximum retry attempts reached. Database error persists.")
                    raise
                
            except Exception as e:
                print(f"Error initializing database: {str(e)}")
                raise

if __name__ == "__main__":
    try:
        init_db()
        print("Database initialization completed successfully.")
    except Exception as e:
        print(f"Database initialization failed: {str(e)}")
        sys.exit(1) 