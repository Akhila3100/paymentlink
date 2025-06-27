import urllib
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# SQL Server DB configs
DB_CONFIG_PAYMENT = {
    'server': '183.82.126.21',
    'database': 'payment',
    'username': 'sa',
    'password': 'Oliva@9876'
}

DB_CONFIG_OLIVA = {
    'server': '183.82.126.21',
    'database': 'Oliva',
    'username': 'sa',
    'password': 'Oliva@9876'
}

# Payment DB
connection_string_payment = (
    f"DRIVER={{ODBC Driver 17 for SQL Server}};"
    f"SERVER={DB_CONFIG_PAYMENT['server']};"
    f"DATABASE={DB_CONFIG_PAYMENT['database']};"
    f"UID={DB_CONFIG_PAYMENT['username']};"
    f"PWD={DB_CONFIG_PAYMENT['password']}"
)
params_payment = urllib.parse.quote_plus(connection_string_payment)
DATABASE_URL_PAYMENT = f"mssql+pyodbc:///?odbc_connect={params_payment}"
engine_payment = create_engine(DATABASE_URL_PAYMENT)
SessionLocalPayment = sessionmaker(bind=engine_payment, autocommit=False, autoflush=False)

# Oliva DB
connection_string_oliva = (
    f"DRIVER={{ODBC Driver 17 for SQL Server}};"
    f"SERVER={DB_CONFIG_OLIVA['server']};"
    f"DATABASE={DB_CONFIG_OLIVA['database']};"
    f"UID={DB_CONFIG_OLIVA['username']};"
    f"PWD={DB_CONFIG_OLIVA['password']}"
)
params_oliva = urllib.parse.quote_plus(connection_string_oliva)
DATABASE_URL_OLIVA = f"mssql+pyodbc:///?odbc_connect={params_oliva}"
engine_oliva = create_engine(DATABASE_URL_OLIVA)
SessionLocalOliva = sessionmaker(bind=engine_oliva, autocommit=False, autoflush=False)

Base = declarative_base()