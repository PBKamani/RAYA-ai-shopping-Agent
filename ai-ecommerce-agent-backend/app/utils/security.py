import hashlib
import os
import secrets


def hash_password(password: str) -> str:
    """
    Hash a password securely using PBKDF2-HMAC-SHA256 with a unique random salt.
    Format stored: pbkdf2_sha256$iterations$salt_hex$hash_hex
    """
    salt = secrets.token_hex(16)
    iterations = 100_000
    derived = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        iterations
    )
    return f"pbkdf2_sha256${iterations}${salt}${derived.hex()}"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify plain password against a stored hashed password.
    """
    try:
        parts = hashed_password.split('$')
        if len(parts) != 4 or parts[0] != 'pbkdf2_sha256':
            return False
        iterations = int(parts[1])
        salt = parts[2]
        expected_hash = parts[3]
        
        derived = hashlib.pbkdf2_hmac(
            'sha256',
            plain_password.encode('utf-8'),
            salt.encode('utf-8'),
            iterations
        )
        return secrets.compare_digest(derived.hex(), expected_hash)
    except Exception:
        return False
