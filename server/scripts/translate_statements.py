import os
import pymysql
import boto3
from datetime import datetime

# AWS credentials
AWS_ACCESS_KEY_ID = os.environ.get('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.environ.get('AWS_SECRET_ACCESS_KEY')
AWS_REGION = os.environ.get('AWS_REGION')

# Database credentials
DB_HOST = os.environ.get('DB_HOST')
DB_USER = os.environ.get('DB_USER')
DB_PASSWORD = os.environ.get('DB_PASSWORD')
DB_NAME = os.environ.get('DB_NAME') 

# Initialize the Translate client
translate_client = boto3.client(
    service_name='translate',
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    region_name=AWS_REGION
)

# Connect to the database
connection = pymysql.connect(
    host=DB_HOST,
    user=DB_USER,
    password=DB_PASSWORD,
    database=DB_NAME
)

def translate_statement(text, target_language):
    response = translate_client.translate_text(
        Text=text,
        SourceLanguageCode='en',
        TargetLanguageCode=target_language
    )
    return response['TranslatedText']

def update_statements():
    try:
        with connection.cursor() as cursor:
            # Fetch all English statements
            cursor.execute("SELECT id, statement FROM statements_subsets WHERE origLanguage = 'En'")
            statements = cursor.fetchall()

            languages = ['ar','bn','es','fr','hi','ja','pt','ru','zh']

            for statement in statements:
                statement_id, text = statement
                for lang in languages:
                    translated_text = translate_statement(text, lang)
                    created_at = updated_at = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                    cursor.execute(
                        "INSERT INTO statements_subsets (statement, origLanguage, statementSource, createdAt, updatedAt) VALUES (%s, %s, %s, %s, %s)",
                        (translated_text, lang, 'translated', created_at, updated_at)
                    )
                    connection.commit()
                print(f"Translated and saved statement ID {statement_id}")
    finally:
        connection.close()

if __name__ == "__main__":
    update_statements()
