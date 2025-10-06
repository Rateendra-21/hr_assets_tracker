from datetime import datetime, timedelta
from jose import jwt
from app.config import JWT_SECRET_KEY, JWT_ALGORITHM

ACCESS_TOKEN_EXPIRE_MINUTES = 60  

def create_access_token(user_id: int, role: str):
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "user_id": user_id,
        "role": str(role),
        "exp": expire
    }
    token = jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return token
