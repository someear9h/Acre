import warnings
from contextlib import asynccontextmanager
from fastapi import FastAPI
import uvicorn
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

from routers import scan, advisory, market, status, iot
from db.database import init_db

warnings.simplefilter("ignore", FutureWarning)

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # --- Startup: Initialize SQLite ledger ---
    init_db()
    yield
    # --- Shutdown: cleanup if needed ---


app = FastAPI(title="Acre Backend APIs", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for the hackathon demo
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(scan.router)
app.include_router(advisory.router)
app.include_router(market.router)
app.include_router(status.router)
app.include_router(iot.router)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)