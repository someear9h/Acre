import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "acre_ledger.db")


def get_connection():
    """Returns a new SQLite connection to the Acre ledger database."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Creates the smart_contracts and iot_logs tables if they don't exist."""
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS smart_contracts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            farmer_phone TEXT NOT NULL,
            buyer_phone TEXT NOT NULL,
            commodity TEXT NOT NULL,
            initial_qty REAL NOT NULL,
            current_qty REAL NOT NULL,
            status TEXT NOT NULL DEFAULT 'ACTIVE'
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS iot_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            farmer_phone TEXT NOT NULL,
            soil_moisture REAL,
            temperature REAL,
            disease_flag BOOLEAN DEFAULT 0,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)

    conn.commit()
    conn.close()
    print("SQLite Acre Ledger initialized.")


def seed_demo_contract(farmer_phone: str, buyer_phone: str):
    """Wipes the smart_contracts table and inserts a demo contract for testing."""
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("DELETE FROM smart_contracts")

    cursor.execute("""
        INSERT INTO smart_contracts (farmer_phone, buyer_phone, commodity, initial_qty, current_qty, status)
        VALUES (?, ?, 'Potato', 100.0, 100.0, 'ACTIVE')
    """, (farmer_phone, buyer_phone))

    conn.commit()
    conn.close()
    print(f"Demo contract seeded: {farmer_phone} <-> {buyer_phone}, 100 Quintals Potato.")
