import pyodbc

def get_db_connection():
    """Establish and return a SQL Server connection"""
    try:
        conn = pyodbc.connect(
            f"DRIVER={{ODBC Driver 17 for SQL Server}};"
            f"SERVER=111.93.26.122;"
            f"DATABASE=Zoho_Zenoti_Integration;"
            f"UID=sa;"
            f"PWD=Oliva@9876"
        )
        return conn
    except Exception as e:
        print(" Database connection failed:", e)
        raise
