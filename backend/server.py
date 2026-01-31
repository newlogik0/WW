from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
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
import base64
import tempfile

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'training-hero-secret-key-2024')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# LLM Key for AI features
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

# Create the main app
app = FastAPI(title="Training Hero API")

# Create router with /api prefix
api_router = APIRouter(prefix="/api")

security = HTTPBearer()

# ==================== MODELS ====================

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    username: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    email: str
    username: str
    level: int
    xp: int
    xp_to_next_level: int
    strength: int
    endurance: int
    agility: int
    total_workouts: int
    created_at: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class WorkoutType(BaseModel):
    type: str  # "weightlifting" or "cardio"

class Exercise(BaseModel):
    name: str
    sets: int
    reps: str  # String to support ranges like "8-12"
    weight: float
    tempo: Optional[str] = None  # e.g., "3-1-2" (eccentric-hold-concentric)

class WeightliftingSession(BaseModel):
    exercises: List[Exercise]
    notes: Optional[str] = None

class CardioSession(BaseModel):
    activity: str  # running, cycling, swimming, etc.
    duration_minutes: int
    distance_km: Optional[float] = None
    notes: Optional[str] = None

class WorkoutResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    workout_type: str
    xp_earned: int
    stats_gained: dict
    created_at: str
    details: dict

class Achievement(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    description: str
    icon: str
    xp_reward: int
    unlocked: bool
    unlocked_at: Optional[str] = None

class Quest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    description: str
    quest_type: str  # daily, weekly
    target: int
    progress: int
    xp_reward: int
    completed: bool
    expires_at: str

class StatsUpdate(BaseModel):
    strength: Optional[int] = None
    endurance: Optional[int] = None
    agility: Optional[int] = None

# ==================== HELPERS ====================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def calculate_xp_to_level(level: int) -> int:
    return 100 * level

def calculate_workout_xp(workout_type: str, details: dict) -> tuple:
    """Calculate XP and stat gains from workout"""
    xp = 0
    stats = {"strength": 0, "endurance": 0, "agility": 0}
    
    if workout_type == "weightlifting":
        # XP based on total volume (sets * reps * weight)
        total_volume = sum(e.get('sets', 0) * e.get('reps', 0) * e.get('weight', 0) 
                         for e in details.get('exercises', []))
        xp = min(int(total_volume / 100) + len(details.get('exercises', [])) * 5, 50)
        stats["strength"] = min(len(details.get('exercises', [])), 3)
        stats["agility"] = 1 if len(details.get('exercises', [])) >= 3 else 0
    
    elif workout_type == "cardio":
        duration = details.get('duration_minutes', 0)
        distance = details.get('distance_km', 0)
        xp = min(int(duration / 2) + int(distance * 5), 50)
        stats["endurance"] = min(int(duration / 10), 3)
        stats["agility"] = 1 if duration >= 20 else 0
    
    return max(xp, 10), stats  # Minimum 10 XP per workout

# ==================== AUTH ROUTES ====================

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    # Check if email exists
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Check if username exists
    existing_username = await db.users.find_one({"username": user_data.username})
    if existing_username:
        raise HTTPException(status_code=400, detail="Username already taken")
    
    user_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    user_doc = {
        "id": user_id,
        "email": user_data.email,
        "username": user_data.username,
        "password_hash": hash_password(user_data.password),
        "level": 1,
        "xp": 0,
        "xp_to_next_level": 100,
        "strength": 10,
        "endurance": 10,
        "agility": 10,
        "total_workouts": 0,
        "created_at": now
    }
    
    await db.users.insert_one(user_doc)
    
    # Initialize achievements
    await initialize_achievements(user_id)
    
    # Initialize quests
    await initialize_quests(user_id)
    
    token = create_token(user_id)
    
    user_response = UserResponse(
        id=user_id,
        email=user_data.email,
        username=user_data.username,
        level=1,
        xp=0,
        xp_to_next_level=100,
        strength=10,
        endurance=10,
        agility=10,
        total_workouts=0,
        created_at=now
    )
    
    return TokenResponse(access_token=token, token_type="bearer", user=user_response)

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(credentials.password, user['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user['id'])
    
    user_response = UserResponse(
        id=user['id'],
        email=user['email'],
        username=user['username'],
        level=user['level'],
        xp=user['xp'],
        xp_to_next_level=user['xp_to_next_level'],
        strength=user['strength'],
        endurance=user['endurance'],
        agility=user['agility'],
        total_workouts=user['total_workouts'],
        created_at=user['created_at']
    )
    
    return TokenResponse(access_token=token, token_type="bearer", user=user_response)

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=current_user['id'],
        email=current_user['email'],
        username=current_user['username'],
        level=current_user['level'],
        xp=current_user['xp'],
        xp_to_next_level=current_user['xp_to_next_level'],
        strength=current_user['strength'],
        endurance=current_user['endurance'],
        agility=current_user['agility'],
        total_workouts=current_user['total_workouts'],
        created_at=current_user['created_at']
    )

# ==================== WORKOUT ROUTES ====================

@api_router.post("/workouts/weightlifting", response_model=WorkoutResponse)
async def log_weightlifting(session: WeightliftingSession, current_user: dict = Depends(get_current_user)):
    workout_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    details = {
        "exercises": [e.model_dump() for e in session.exercises],
        "notes": session.notes
    }
    
    xp_earned, stats_gained = calculate_workout_xp("weightlifting", details)
    
    workout_doc = {
        "id": workout_id,
        "user_id": current_user['id'],
        "workout_type": "weightlifting",
        "xp_earned": xp_earned,
        "stats_gained": stats_gained,
        "created_at": now,
        "details": details
    }
    
    await db.workouts.insert_one(workout_doc)
    
    # Update user stats
    await update_user_stats(current_user['id'], xp_earned, stats_gained)
    
    # Check achievements
    await check_achievements(current_user['id'])
    
    # Update quest progress
    await update_quest_progress(current_user['id'], "weightlifting")
    
    return WorkoutResponse(**workout_doc)

@api_router.post("/workouts/cardio", response_model=WorkoutResponse)
async def log_cardio(session: CardioSession, current_user: dict = Depends(get_current_user)):
    workout_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    details = {
        "activity": session.activity,
        "duration_minutes": session.duration_minutes,
        "distance_km": session.distance_km,
        "notes": session.notes
    }
    
    xp_earned, stats_gained = calculate_workout_xp("cardio", details)
    
    workout_doc = {
        "id": workout_id,
        "user_id": current_user['id'],
        "workout_type": "cardio",
        "xp_earned": xp_earned,
        "stats_gained": stats_gained,
        "created_at": now,
        "details": details
    }
    
    await db.workouts.insert_one(workout_doc)
    
    # Update user stats
    await update_user_stats(current_user['id'], xp_earned, stats_gained)
    
    # Check achievements
    await check_achievements(current_user['id'])
    
    # Update quest progress
    await update_quest_progress(current_user['id'], "cardio")
    
    return WorkoutResponse(**workout_doc)

@api_router.get("/workouts", response_model=List[WorkoutResponse])
async def get_workouts(limit: int = 20, current_user: dict = Depends(get_current_user)):
    workouts = await db.workouts.find(
        {"user_id": current_user['id']}, 
        {"_id": 0}
    ).sort("created_at", -1).limit(limit).to_list(limit)
    return workouts

@api_router.get("/workouts/stats")
async def get_workout_stats(current_user: dict = Depends(get_current_user)):
    total_workouts = await db.workouts.count_documents({"user_id": current_user['id']})
    weightlifting_count = await db.workouts.count_documents({"user_id": current_user['id'], "workout_type": "weightlifting"})
    cardio_count = await db.workouts.count_documents({"user_id": current_user['id'], "workout_type": "cardio"})
    
    # Get total XP earned from workouts
    pipeline = [
        {"$match": {"user_id": current_user['id']}},
        {"$group": {"_id": None, "total_xp": {"$sum": "$xp_earned"}}}
    ]
    result = await db.workouts.aggregate(pipeline).to_list(1)
    total_xp_earned = result[0]['total_xp'] if result else 0
    
    return {
        "total_workouts": total_workouts,
        "weightlifting_count": weightlifting_count,
        "cardio_count": cardio_count,
        "total_xp_earned": total_xp_earned
    }

# ==================== USER STATS HELPERS ====================

async def update_user_stats(user_id: str, xp: int, stats: dict):
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        return
    
    new_xp = user['xp'] + xp
    new_level = user['level']
    new_xp_to_next = user['xp_to_next_level']
    
    # Level up check
    while new_xp >= new_xp_to_next:
        new_xp -= new_xp_to_next
        new_level += 1
        new_xp_to_next = calculate_xp_to_level(new_level)
    
    update_data = {
        "xp": new_xp,
        "level": new_level,
        "xp_to_next_level": new_xp_to_next,
        "strength": user['strength'] + stats.get('strength', 0),
        "endurance": user['endurance'] + stats.get('endurance', 0),
        "agility": user['agility'] + stats.get('agility', 0),
        "total_workouts": user['total_workouts'] + 1
    }
    
    await db.users.update_one({"id": user_id}, {"$set": update_data})

# ==================== ACHIEVEMENTS ====================

ACHIEVEMENTS = [
    {"id": "first_workout", "name": "First Steps", "description": "Complete your first workout", "icon": "sword", "xp_reward": 20, "condition": {"total_workouts": 1}},
    {"id": "workout_5", "name": "Getting Serious", "description": "Complete 5 workouts", "icon": "shield", "xp_reward": 50, "condition": {"total_workouts": 5}},
    {"id": "workout_10", "name": "Warrior", "description": "Complete 10 workouts", "icon": "trophy", "xp_reward": 100, "condition": {"total_workouts": 10}},
    {"id": "workout_25", "name": "Champion", "description": "Complete 25 workouts", "icon": "crown", "xp_reward": 200, "condition": {"total_workouts": 25}},
    {"id": "workout_50", "name": "Legend", "description": "Complete 50 workouts", "icon": "star", "xp_reward": 500, "condition": {"total_workouts": 50}},
    {"id": "strength_20", "name": "Mighty", "description": "Reach 20 Strength", "icon": "dumbbell", "xp_reward": 75, "condition": {"strength": 20}},
    {"id": "strength_50", "name": "Titan", "description": "Reach 50 Strength", "icon": "mountain", "xp_reward": 150, "condition": {"strength": 50}},
    {"id": "endurance_20", "name": "Runner", "description": "Reach 20 Endurance", "icon": "heart", "xp_reward": 75, "condition": {"endurance": 20}},
    {"id": "endurance_50", "name": "Marathoner", "description": "Reach 50 Endurance", "icon": "flame", "xp_reward": 150, "condition": {"endurance": 50}},
    {"id": "level_5", "name": "Apprentice", "description": "Reach Level 5", "icon": "badge", "xp_reward": 100, "condition": {"level": 5}},
    {"id": "level_10", "name": "Master", "description": "Reach Level 10", "icon": "gem", "xp_reward": 250, "condition": {"level": 10}},
]

async def initialize_achievements(user_id: str):
    for ach in ACHIEVEMENTS:
        doc = {
            "id": ach['id'],
            "user_id": user_id,
            "name": ach['name'],
            "description": ach['description'],
            "icon": ach['icon'],
            "xp_reward": ach['xp_reward'],
            "condition": ach['condition'],
            "unlocked": False,
            "unlocked_at": None
        }
        await db.achievements.insert_one(doc)

async def check_achievements(user_id: str):
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        return
    
    achievements = await db.achievements.find({"user_id": user_id, "unlocked": False}, {"_id": 0}).to_list(100)
    
    for ach in achievements:
        condition = ach.get('condition', {})
        unlocked = True
        
        for key, value in condition.items():
            if user.get(key, 0) < value:
                unlocked = False
                break
        
        if unlocked:
            await db.achievements.update_one(
                {"id": ach['id'], "user_id": user_id},
                {"$set": {"unlocked": True, "unlocked_at": datetime.now(timezone.utc).isoformat()}}
            )
            # Grant XP reward
            await db.users.update_one(
                {"id": user_id},
                {"$inc": {"xp": ach['xp_reward']}}
            )

@api_router.get("/achievements", response_model=List[Achievement])
async def get_achievements(current_user: dict = Depends(get_current_user)):
    achievements = await db.achievements.find({"user_id": current_user['id']}, {"_id": 0, "condition": 0, "user_id": 0}).to_list(100)
    return achievements

# ==================== QUESTS ====================

QUEST_TEMPLATES = [
    {"id": "daily_workout", "name": "Daily Grind", "description": "Complete 1 workout today", "quest_type": "daily", "target": 1, "xp_reward": 25},
    {"id": "daily_double", "name": "Double Down", "description": "Complete 2 workouts today", "quest_type": "daily", "target": 2, "xp_reward": 50},
    {"id": "weekly_warrior", "name": "Weekly Warrior", "description": "Complete 5 workouts this week", "quest_type": "weekly", "target": 5, "xp_reward": 150},
    {"id": "weekly_champion", "name": "Weekly Champion", "description": "Complete 7 workouts this week", "quest_type": "weekly", "target": 7, "xp_reward": 250},
]

async def initialize_quests(user_id: str):
    now = datetime.now(timezone.utc)
    
    for quest in QUEST_TEMPLATES:
        if quest['quest_type'] == 'daily':
            expires = (now + timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)
        else:
            expires = (now + timedelta(days=7 - now.weekday())).replace(hour=0, minute=0, second=0, microsecond=0)
        
        doc = {
            "id": f"{quest['id']}_{user_id}",
            "user_id": user_id,
            "template_id": quest['id'],
            "name": quest['name'],
            "description": quest['description'],
            "quest_type": quest['quest_type'],
            "target": quest['target'],
            "progress": 0,
            "xp_reward": quest['xp_reward'],
            "completed": False,
            "expires_at": expires.isoformat()
        }
        await db.quests.insert_one(doc)

async def update_quest_progress(user_id: str, workout_type: str):
    now = datetime.now(timezone.utc)
    
    # Get active quests
    quests = await db.quests.find({
        "user_id": user_id,
        "completed": False,
        "expires_at": {"$gt": now.isoformat()}
    }, {"_id": 0}).to_list(100)
    
    for quest in quests:
        new_progress = quest['progress'] + 1
        completed = new_progress >= quest['target']
        
        await db.quests.update_one(
            {"id": quest['id'], "user_id": user_id},
            {"$set": {"progress": new_progress, "completed": completed}}
        )
        
        if completed:
            # Grant XP reward
            await db.users.update_one(
                {"id": user_id},
                {"$inc": {"xp": quest['xp_reward']}}
            )

@api_router.get("/quests", response_model=List[Quest])
async def get_quests(current_user: dict = Depends(get_current_user)):
    now = datetime.now(timezone.utc)
    quests = await db.quests.find({
        "user_id": current_user['id'],
        "expires_at": {"$gt": now.isoformat()}
    }, {"_id": 0, "user_id": 0, "template_id": 0}).to_list(100)
    return quests

@api_router.post("/quests/refresh")
async def refresh_quests(current_user: dict = Depends(get_current_user)):
    """Refresh expired quests"""
    now = datetime.now(timezone.utc)
    
    # Delete expired quests
    await db.quests.delete_many({
        "user_id": current_user['id'],
        "expires_at": {"$lt": now.isoformat()}
    })
    
    # Check which quests exist
    existing = await db.quests.find({"user_id": current_user['id']}, {"_id": 0, "template_id": 1}).to_list(100)
    existing_templates = {q['template_id'] for q in existing}
    
    # Add missing quests
    for quest in QUEST_TEMPLATES:
        if quest['id'] not in existing_templates:
            if quest['quest_type'] == 'daily':
                expires = (now + timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)
            else:
                expires = (now + timedelta(days=7 - now.weekday())).replace(hour=0, minute=0, second=0, microsecond=0)
            
            doc = {
                "id": f"{quest['id']}_{current_user['id']}_{now.isoformat()}",
                "user_id": current_user['id'],
                "template_id": quest['id'],
                "name": quest['name'],
                "description": quest['description'],
                "quest_type": quest['quest_type'],
                "target": quest['target'],
                "progress": 0,
                "xp_reward": quest['xp_reward'],
                "completed": False,
                "expires_at": expires.isoformat()
            }
            await db.quests.insert_one(doc)
    
    return {"message": "Quests refreshed"}

# ==================== LEADERBOARD ====================

@api_router.get("/leaderboard")
async def get_leaderboard(limit: int = 10):
    users = await db.users.find({}, {
        "_id": 0, 
        "id": 1, 
        "username": 1, 
        "level": 1, 
        "xp": 1, 
        "strength": 1, 
        "endurance": 1, 
        "agility": 1,
        "total_workouts": 1
    }).sort("level", -1).limit(limit).to_list(limit)
    return users

# ==================== TRAINING PLAN MODELS ====================

class PlanExercise(BaseModel):
    name: str
    sets: int = 3
    reps: str = "10"  # String to support ranges like "8-12"
    weight: Optional[float] = 0
    notes: Optional[str] = None

class TrainingPlan(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    name: str
    exercises: List[dict]
    is_active: bool = True
    created_at: str
    updated_at: str

class TrainingPlanCreate(BaseModel):
    name: str
    exercises: List[PlanExercise]

class TrainingPlanUpdate(BaseModel):
    name: Optional[str] = None
    exercises: Optional[List[PlanExercise]] = None
    is_active: Optional[bool] = None

# ==================== TRAINING PLAN ROUTES ====================

@api_router.post("/plans/import")
async def import_training_plan(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """Import a training plan from PDF or image using AI"""
    
    if not EMERGENT_LLM_KEY:
        raise HTTPException(status_code=500, detail="AI service not configured")
    
    # Validate file type
    allowed_types = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'text/plain']
    content_type = file.content_type
    
    # Handle text files with different content types
    filename_lower = file.filename.lower() if file.filename else ""
    if filename_lower.endswith('.txt'):
        content_type = 'text/plain'
    
    if content_type not in allowed_types:
        raise HTTPException(status_code=400, detail=f"File type {content_type} not supported. Use PDF, images (JPG, PNG), or text files")
    
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage, FileContentWithMimeType
        
        # Save uploaded file temporarily
        file_content = await file.read()
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=Path(file.filename).suffix) as tmp:
            tmp.write(file_content)
            tmp_path = tmp.name
        
        # Initialize AI chat with Gemini (supports file attachments)
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"plan-import-{current_user['id']}-{uuid.uuid4()}",
            system_message="""You are a fitness training plan analyzer. Extract exercise information from uploaded documents.
            
            Return ONLY a valid JSON object in this exact format:
            {
                "plan_name": "Name of the training plan or 'Imported Plan'",
                "exercises": [
                    {"name": "Exercise Name", "sets": 3, "reps": "8-12", "weight": 0, "notes": "any notes"},
                    ...
                ]
            }
            
            IMPORTANT RULES:
            - Extract all exercises you can find
            - Use standard exercise names (e.g., "Bench Press", "Incline Bench Press", "Squat", "Deadlift")
            - PRESERVE REP RANGES: If the plan shows "8-12" or "10-15" reps, keep the FULL range as a string like "8-12", do NOT simplify to just one number
            - For sets, use the exact number shown (e.g., 4 sets = 4)
            - Format examples: "4x8-12" means sets: 4, reps: "8-12" | "3x10" means sets: 3, reps: "10"
            - Weight should be in kg, use 0 if not specified
            - If sets/reps are not specified at all, use reasonable defaults (3 sets, "10" reps)
            - Return ONLY the JSON, no other text"""
        ).with_model("gemini", "gemini-2.5-flash")
        
        # Create file attachment - for text files, read content directly
        if content_type == 'text/plain':
            text_content = file_content.decode('utf-8', errors='ignore')
            user_message = UserMessage(
                text=f"Please analyze this training plan text and extract all exercises with their sets, reps, and weights. Return the data as JSON.\n\nTraining Plan Content:\n{text_content}"
            )
        else:
            file_attachment = FileContentWithMimeType(
                file_path=tmp_path,
                mime_type=content_type
            )
            user_message = UserMessage(
                text="Please analyze this training plan document and extract all exercises with their sets, reps, and weights. Return the data as JSON.",
                file_contents=[file_attachment]
            )
        
        response = await chat.send_message(user_message)
        
        # Clean up temp file
        os.unlink(tmp_path)
        
        # Parse AI response
        import json
        
        # Try to extract JSON from response
        response_text = response.strip()
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.startswith("```"):
            response_text = response_text[3:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
        
        try:
            plan_data = json.loads(response_text.strip())
        except json.JSONDecodeError:
            # Try to find JSON in the response
            import re
            json_match = re.search(r'\{[\s\S]*\}', response_text)
            if json_match:
                plan_data = json.loads(json_match.group())
            else:
                raise HTTPException(status_code=500, detail="Failed to parse AI response")
        
        # Create the training plan
        plan_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()
        
        # Deactivate existing active plans
        await db.training_plans.update_many(
            {"user_id": current_user['id'], "is_active": True},
            {"$set": {"is_active": False}}
        )
        
        plan_doc = {
            "id": plan_id,
            "user_id": current_user['id'],
            "name": plan_data.get('plan_name', 'Imported Plan'),
            "exercises": plan_data.get('exercises', []),
            "is_active": True,
            "created_at": now,
            "updated_at": now
        }
        
        await db.training_plans.insert_one(plan_doc)
        
        return {
            "message": "Training plan imported successfully",
            "plan": {
                "id": plan_id,
                "name": plan_doc['name'],
                "exercises": plan_doc['exercises'],
                "is_active": True
            }
        }
        
    except Exception as e:
        logger.error(f"Failed to import training plan: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to process file: {str(e)}")

@api_router.post("/plans", response_model=TrainingPlan)
async def create_training_plan(plan: TrainingPlanCreate, current_user: dict = Depends(get_current_user)):
    """Create a new training plan manually"""
    plan_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    # Deactivate existing active plans
    await db.training_plans.update_many(
        {"user_id": current_user['id'], "is_active": True},
        {"$set": {"is_active": False}}
    )
    
    plan_doc = {
        "id": plan_id,
        "user_id": current_user['id'],
        "name": plan.name,
        "exercises": [e.model_dump() for e in plan.exercises],
        "is_active": True,
        "created_at": now,
        "updated_at": now
    }
    
    await db.training_plans.insert_one(plan_doc)
    return TrainingPlan(**plan_doc)

@api_router.get("/plans")
async def get_training_plans(current_user: dict = Depends(get_current_user)):
    """Get all training plans for the user"""
    plans = await db.training_plans.find(
        {"user_id": current_user['id']},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    return plans

@api_router.get("/plans/active")
async def get_active_plan(current_user: dict = Depends(get_current_user)):
    """Get the currently active training plan"""
    plan = await db.training_plans.find_one(
        {"user_id": current_user['id'], "is_active": True},
        {"_id": 0}
    )
    return plan

@api_router.put("/plans/{plan_id}")
async def update_training_plan(
    plan_id: str, 
    update: TrainingPlanUpdate, 
    current_user: dict = Depends(get_current_user)
):
    """Update a training plan"""
    plan = await db.training_plans.find_one({"id": plan_id, "user_id": current_user['id']})
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    update_data = {"updated_at": datetime.now(timezone.utc).isoformat()}
    
    if update.name is not None:
        update_data["name"] = update.name
    if update.exercises is not None:
        update_data["exercises"] = [e.model_dump() for e in update.exercises]
    if update.is_active is not None:
        if update.is_active:
            # Deactivate other plans first
            await db.training_plans.update_many(
                {"user_id": current_user['id'], "is_active": True},
                {"$set": {"is_active": False}}
            )
        update_data["is_active"] = update.is_active
    
    await db.training_plans.update_one({"id": plan_id}, {"$set": update_data})
    
    updated_plan = await db.training_plans.find_one({"id": plan_id}, {"_id": 0})
    return updated_plan

@api_router.delete("/plans/{plan_id}")
async def delete_training_plan(plan_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a training plan"""
    result = await db.training_plans.delete_one({"id": plan_id, "user_id": current_user['id']})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Plan not found")
    return {"message": "Plan deleted"}

# ==================== ROOT ROUTE ====================

@api_router.get("/")
async def root():
    return {"message": "Training Hero API - Level up your fitness!"}

@api_router.get("/health")
async def health():
    return {"status": "healthy"}

# Include the router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
