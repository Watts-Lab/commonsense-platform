import pymysql
import os

# Database credentials
DB_HOST = os.environ.get('DB_HOST')
DB_USER = os.environ.get('DB_USER')
DB_PASSWORD = os.environ.get('DB_PASSWORD')
DB_NAME = os.environ.get('DB_NAME') 

# Connect to the database
conn = pymysql.connect(
    host=DB_HOST,
    user=DB_USER,
    password=DB_PASSWORD,
    database=DB_NAME
)

cursor = conn.cursor()

try:
    # Retrieve the first 20 rows from the source table
    cursor.execute("SELECT * FROM statements LIMIT 20")
    rows = cursor.fetchall()

    if rows:
        placeholders = ', '.join(['%s'] * len(rows[0]))
        insert_query = f"INSERT INTO statements_subsets VALUES ({placeholders})"
        
        # Insert the rows into the target table
        cursor.executemany(insert_query, rows)
        
        # Commit the transaction
        conn.commit()
        print("First 20 rows copied successfully.")
    else:
        print("No rows found in the source table.")
    
except pymysql.MySQLError as err:
    print(f"Error: {err}")
    conn.rollback()
    
finally:
    cursor.close()
    conn.close()
