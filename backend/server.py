from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
from bson import ObjectId
import secrets

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

JWT_ALGORITHM = "HS256"

# Auth Helper Functions
def get_jwt_secret() -> str:
    return os.environ["JWT_SECRET"]

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

def create_access_token(user_id: str, email: str) -> str:
    payload = {"sub": user_id, "email": email, "exp": datetime.now(timezone.utc) + timedelta(minutes=15), "type": "access"}
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

def create_refresh_token(user_id: str) -> str:
    payload = {"sub": user_id, "exp": datetime.now(timezone.utc) + timedelta(days=7), "type": "refresh"}
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user["id"] = str(user["_id"])
        user.pop("_id", None)
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Models
class RegisterInput(BaseModel):
    email: EmailStr
    password: str
    name: str

class LoginInput(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    email: str
    name: str
    role: Optional[str] = "user"
    created_at: datetime

class PiggyBankCreate(BaseModel):
    name: str
    color: str
    icon: Optional[str] = "piggy-bank"
    goal: Optional[float] = None

class PiggyBankUpdate(BaseModel):
    name: Optional[str] = None
    color: Optional[str] = None
    icon: Optional[str] = None
    goal: Optional[float] = None

class PiggyBankResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    name: str
    color: str
    icon: Optional[str] = "piggy-bank"
    balance: float
    goal: Optional[float] = None
    created_at: datetime

class TransactionCreate(BaseModel):
    piggy_bank_id: str
    type: str
    amount: float
    description: Optional[str] = None

class TransactionResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    piggy_bank_id: str
    piggy_bank_name: Optional[str] = None
    type: str
    amount: float
    description: Optional[str] = None
    timestamp: datetime

class StatisticsResponse(BaseModel):
    total_savings: float
    total_piggy_banks: int
    total_transactions: int
    recent_transactions: List[TransactionResponse]
    piggy_banks_summary: List[dict]

# Auth Endpoints
@api_router.post("/auth/register", response_model=UserResponse)
async def register(input: RegisterInput, response: Response):
    email = input.email.lower()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed = hash_password(input.password)
    user_doc = {
        "email": email,
        "password_hash": hashed,
        "name": input.name,
        "role": "user",
        "created_at": datetime.now(timezone.utc)
    }
    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)
    
    access_token = create_access_token(user_id, email)
    refresh_token = create_refresh_token(user_id)
    
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=900, path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")
    
    return UserResponse(id=user_id, email=email, name=input.name, role="user", created_at=user_doc["created_at"])

@api_router.post("/auth/login", response_model=UserResponse)
async def login(input: LoginInput, response: Response):
    email = input.email.lower()
    user = await db.users.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not verify_password(input.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    user_id = str(user["_id"])
    access_token = create_access_token(user_id, email)
    refresh_token = create_refresh_token(user_id)
    
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=900, path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")
    
    return UserResponse(id=user_id, email=email, name=user["name"], role=user.get("role", "user"), created_at=user["created_at"])

@api_router.post("/auth/logout")
async def logout(response: Response, current_user: dict = Depends(get_current_user)):
    response.delete_cookie(key="access_token", path="/")
    response.delete_cookie(key="refresh_token", path="/")
    return {"message": "Logged out successfully"}

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(**current_user)

# Piggy Banks Endpoints
@api_router.get("/piggy-banks", response_model=List[PiggyBankResponse])
async def get_piggy_banks(current_user: dict = Depends(get_current_user)):
    piggy_banks = await db.piggy_banks.find({"user_id": current_user["id"]}, {"_id": 0}).to_list(1000)
    return piggy_banks

@api_router.post("/piggy-banks", response_model=PiggyBankResponse)
async def create_piggy_bank(input: PiggyBankCreate, current_user: dict = Depends(get_current_user)):
    piggy_bank_doc = {
        "id": str(uuid.uuid4()),
        "user_id": current_user["id"],
        "name": input.name,
        "color": input.color,
        "icon": input.icon or "piggy-bank",
        "balance": 0.0,
        "goal": input.goal,
        "created_at": datetime.now(timezone.utc)
    }
    await db.piggy_banks.insert_one(piggy_bank_doc)
    return PiggyBankResponse(**piggy_bank_doc)

@api_router.put("/piggy-banks/{piggy_bank_id}", response_model=PiggyBankResponse)
async def update_piggy_bank(piggy_bank_id: str, input: PiggyBankUpdate, current_user: dict = Depends(get_current_user)):
    piggy_bank = await db.piggy_banks.find_one({"id": piggy_bank_id, "user_id": current_user["id"]})
    if not piggy_bank:
        raise HTTPException(status_code=404, detail="Piggy bank not found")
    
    update_data = {k: v for k, v in input.model_dump().items() if v is not None}
    if update_data:
        await db.piggy_banks.update_one({"id": piggy_bank_id}, {"$set": update_data})
    
    updated = await db.piggy_banks.find_one({"id": piggy_bank_id}, {"_id": 0})
    return PiggyBankResponse(**updated)

@api_router.delete("/piggy-banks/{piggy_bank_id}")
async def delete_piggy_bank(piggy_bank_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.piggy_banks.delete_one({"id": piggy_bank_id, "user_id": current_user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Piggy bank not found")
    await db.transactions.delete_many({"piggy_bank_id": piggy_bank_id})
    return {"message": "Piggy bank deleted successfully"}

# Transactions Endpoints
@api_router.post("/transactions", response_model=TransactionResponse)
async def create_transaction(input: TransactionCreate, current_user: dict = Depends(get_current_user)):
    piggy_bank = await db.piggy_banks.find_one({"id": input.piggy_bank_id, "user_id": current_user["id"]})
    if not piggy_bank:
        raise HTTPException(status_code=404, detail="Piggy bank not found")
    
    if input.type == "withdrawal":
        if piggy_bank["balance"] < input.amount:
            raise HTTPException(status_code=400, detail="Insufficient balance")
        new_balance = piggy_bank["balance"] - input.amount
    else:
        new_balance = piggy_bank["balance"] + input.amount
    
    await db.piggy_banks.update_one({"id": input.piggy_bank_id}, {"$set": {"balance": new_balance}})
    
    transaction_doc = {
        "id": str(uuid.uuid4()),
        "user_id": current_user["id"],
        "piggy_bank_id": input.piggy_bank_id,
        "piggy_bank_name": piggy_bank["name"],
        "type": input.type,
        "amount": input.amount,
        "description": input.description,
        "timestamp": datetime.now(timezone.utc)
    }
    await db.transactions.insert_one(transaction_doc)
    return TransactionResponse(**transaction_doc)

@api_router.get("/transactions/{piggy_bank_id}", response_model=List[TransactionResponse])
async def get_piggy_bank_transactions(piggy_bank_id: str, current_user: dict = Depends(get_current_user)):
    transactions = await db.transactions.find(
        {"piggy_bank_id": piggy_bank_id, "user_id": current_user["id"]},
        {"_id": 0}
    ).sort("timestamp", -1).to_list(1000)
    return transactions

@api_router.get("/transactions", response_model=List[TransactionResponse])
async def get_user_transactions(current_user: dict = Depends(get_current_user)):
    transactions = await db.transactions.find(
        {"user_id": current_user["id"]},
        {"_id": 0}
    ).sort("timestamp", -1).to_list(1000)
    return transactions

# Statistics Endpoint
@api_router.get("/statistics", response_model=StatisticsResponse)
async def get_statistics(current_user: dict = Depends(get_current_user)):
    piggy_banks = await db.piggy_banks.find({"user_id": current_user["id"]}, {"_id": 0}).to_list(1000)
    transactions = await db.transactions.find({"user_id": current_user["id"]}, {"_id": 0}).sort("timestamp", -1).limit(10).to_list(10)
    
    total_savings = sum(pb["balance"] for pb in piggy_banks)
    total_transactions = await db.transactions.count_documents({"user_id": current_user["id"]})
    
    piggy_banks_summary = [{
        "name": pb["name"],
        "balance": pb["balance"],
        "color": pb["color"],
        "goal": pb.get("goal")
    } for pb in piggy_banks]
    
    return StatisticsResponse(
        total_savings=total_savings,
        total_piggy_banks=len(piggy_banks),
        total_transactions=total_transactions,
        recent_transactions=[TransactionResponse(**t) for t in transactions],
        piggy_banks_summary=piggy_banks_summary
    )

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    await db.users.create_index("email", unique=True)
    await db.piggy_banks.create_index("user_id")
    await db.transactions.create_index("user_id")
    await db.transactions.create_index("piggy_bank_id")
    
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@example.com")
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        hashed = hash_password(admin_password)
        await db.users.insert_one({
            "email": admin_email,
            "password_hash": hashed,
            "name": "Admin",
            "role": "admin",
            "created_at": datetime.now(timezone.utc)
        })
        logger.info(f"Admin user created: {admin_email}")
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_password)}})
        logger.info(f"Admin password updated")
    
    Path("memory").mkdir(exist_ok=True)
    with open("memory/test_credentials.md", "w") as f:
        f.write(f"""# Test Credentials

## Admin Account
- Email: {admin_email}
- Password: {admin_password}
- Role: admin

## Test User
- Email: test@example.com
- Password: test123
- Role: user

## Auth Endpoints
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/me
""")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
