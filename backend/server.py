from fastapi import FastAPI, APIRouter, HTTPException, Header
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import asyncio
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Literal
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# App + router
app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ---- Config ----
ADMIN_PIN = os.environ.get("ADMIN_PIN", "1234")
TWILIO_ACCOUNT_SID = os.environ.get("TWILIO_ACCOUNT_SID", "")
TWILIO_AUTH_TOKEN = os.environ.get("TWILIO_AUTH_TOKEN", "")
TWILIO_FROM_NUMBER = os.environ.get("TWILIO_FROM_NUMBER", "")
ALERT_TO_NUMBER = os.environ.get("ALERT_TO_NUMBER", "")

STATUSES = ("New", "Contacted", "Booked", "Closed")

# ---- Models ----
class LeadCreate(BaseModel):
    name: str
    phone: str
    email: EmailStr
    service_type: str
    property_type: str
    bedrooms: int = 0
    bathrooms: int = 0
    address: str
    message: Optional[str] = ""


class Lead(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    phone: str
    email: str
    service_type: str
    property_type: str
    bedrooms: int
    bathrooms: int
    address: str
    message: str = ""
    status: Literal["New", "Contacted", "Booked", "Closed"] = "New"
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class StatusUpdate(BaseModel):
    status: Literal["New", "Contacted", "Booked", "Closed"]


class PinVerify(BaseModel):
    pin: str


# ---- Twilio helper (sync SDK -> run in threadpool) ----
def _send_sms_sync(body: str) -> bool:
    if not (TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN and TWILIO_FROM_NUMBER and ALERT_TO_NUMBER):
        logger.warning("Twilio not configured — skipping SMS alert.")
        return False
    try:
        from twilio.rest import Client
        tw = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        msg = tw.messages.create(body=body, from_=TWILIO_FROM_NUMBER, to=ALERT_TO_NUMBER)
        logger.info(f"Twilio SMS sent: {msg.sid}")
        return True
    except Exception as e:
        logger.error(f"Twilio SMS failed: {e}")
        return False


async def send_lead_alert(lead: Lead) -> bool:
    body = (
        f"🐰 New Tidyups Lead!\n"
        f"{lead.name} ({lead.phone})\n"
        f"{lead.service_type} — {lead.property_type}\n"
        f"{lead.bedrooms} bed / {lead.bathrooms} bath\n"
        f"{lead.address}"
    )
    return await asyncio.to_thread(_send_sms_sync, body)


def require_admin(x_admin_pin: Optional[str]):
    if x_admin_pin != ADMIN_PIN:
        raise HTTPException(status_code=401, detail="Invalid admin PIN")


# ---- Routes ----
@api_router.get("/")
async def root():
    return {"message": "Tidyups API is running", "tagline": "Leave The Mess To Us!"}


@api_router.get("/services")
async def get_services():
    return {
        "service_types": ["Standard Cleaning", "Deep Cleaning", "Move In Cleaning", "Move Out Cleaning"],
        "property_types": ["House", "Flat/Apartment", "Studio", "Office"],
    }


@api_router.post("/leads", response_model=Lead)
async def create_lead(payload: LeadCreate):
    lead = Lead(**payload.dict())
    await db.leads.insert_one(lead.dict())
    await send_lead_alert(lead)
    return lead


@api_router.get("/leads", response_model=List[Lead])
async def list_leads(x_admin_pin: Optional[str] = Header(default=None)):
    require_admin(x_admin_pin)
    docs = await db.leads.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return [Lead(**d) for d in docs]


@api_router.patch("/leads/{lead_id}/status", response_model=Lead)
async def update_lead_status(lead_id: str, payload: StatusUpdate, x_admin_pin: Optional[str] = Header(default=None)):
    require_admin(x_admin_pin)
    res = await db.leads.find_one_and_update(
        {"id": lead_id},
        {"$set": {"status": payload.status}},
        projection={"_id": 0},
        return_document=True,
    )
    if not res:
        raise HTTPException(status_code=404, detail="Lead not found")
    return Lead(**res)


@api_router.post("/admin/verify-pin")
async def verify_pin(payload: PinVerify):
    if payload.pin != ADMIN_PIN:
        raise HTTPException(status_code=401, detail="Incorrect PIN")
    return {"ok": True}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
