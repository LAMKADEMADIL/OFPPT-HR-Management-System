# services/password_service.py
import bcrypt
from typing import Optional

class PasswordService:
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash a password with a randomly generated salt."""
        salt = bcrypt.gensalt(rounds=12)  # Using 12 rounds for good security
        return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash."""
        return bcrypt.checkpw(
            plain_password.encode('utf-8'),
            hashed_password.encode('utf-8')
        )
