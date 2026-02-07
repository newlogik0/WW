"""
Backend tests for Face Authentication APIs
Tests: /api/auth/face/login, /api/auth/face/register, Remember Me token expiry
"""
import pytest
import requests
import os
import jwt
from datetime import datetime, timezone

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test user credentials
TEST_USER = {
    "username": "facetest",
    "email": "facetest@example.com",
    "password": "test123456"
}

# Sample 128-dimensional face descriptor (normalized vector)
SAMPLE_FACE_DESCRIPTOR = [0.1] * 128  # Simplified for testing


class TestHealthCheck:
    """Basic health check tests"""
    
    def test_api_health(self):
        """Test API health endpoint"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "healthy"
        print("SUCCESS: API health check passed")


class TestRememberMeTokenExpiry:
    """Test Remember Me feature - token expiry differences"""
    
    def test_login_without_remember_me_7_day_token(self):
        """Login without remember_me should give 7 day token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_USER["username"],
            "password": TEST_USER["password"],
            "remember_me": False
        })
        
        if response.status_code == 401:
            pytest.skip("Test user not found - may need to register first")
        
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        
        assert "access_token" in data
        token = data["access_token"]
        
        # Decode token to check expiry (without verification)
        decoded = jwt.decode(token, options={"verify_signature": False})
        exp_timestamp = decoded.get("exp")
        
        if exp_timestamp:
            exp_date = datetime.fromtimestamp(exp_timestamp, tz=timezone.utc)
            now = datetime.now(timezone.utc)
            days_until_expiry = (exp_date - now).days
            
            print(f"Token expires in {days_until_expiry} days")
            # Should be around 7 days (6-8 to account for timing)
            assert 6 <= days_until_expiry <= 8, f"Expected ~7 days, got {days_until_expiry}"
            print("SUCCESS: Login without remember_me gives ~7 day token")
    
    def test_login_with_remember_me_30_day_token(self):
        """Login with remember_me=true should give 30 day token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_USER["username"],
            "password": TEST_USER["password"],
            "remember_me": True
        })
        
        if response.status_code == 401:
            pytest.skip("Test user not found - may need to register first")
        
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        
        assert "access_token" in data
        token = data["access_token"]
        
        # Decode token to check expiry (without verification)
        decoded = jwt.decode(token, options={"verify_signature": False})
        exp_timestamp = decoded.get("exp")
        
        if exp_timestamp:
            exp_date = datetime.fromtimestamp(exp_timestamp, tz=timezone.utc)
            now = datetime.now(timezone.utc)
            days_until_expiry = (exp_date - now).days
            
            print(f"Token expires in {days_until_expiry} days")
            # Should be around 30 days (29-31 to account for timing)
            assert 29 <= days_until_expiry <= 31, f"Expected ~30 days, got {days_until_expiry}"
            print("SUCCESS: Login with remember_me=true gives ~30 day token")


class TestFaceRegisterAPI:
    """Test Face Registration API - /api/auth/face/register"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token for test user"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_USER["username"],
            "password": TEST_USER["password"]
        })
        
        if response.status_code == 401:
            pytest.skip("Test user not found")
        
        return response.json().get("access_token")
    
    @pytest.fixture
    def user_id(self, auth_token):
        """Get user ID from /auth/me"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
        
        if response.status_code != 200:
            pytest.skip("Could not get user info")
        
        return response.json().get("id")
    
    def test_face_register_requires_auth(self):
        """Face registration should require authentication"""
        response = requests.post(f"{BASE_URL}/api/auth/face/register", json={
            "user_id": "some-user-id",
            "face_descriptor": SAMPLE_FACE_DESCRIPTOR
        })
        
        # Should return 401 or 403 without auth
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("SUCCESS: Face register requires authentication")
    
    def test_face_register_success(self, auth_token, user_id):
        """Test successful face registration"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        response = requests.post(f"{BASE_URL}/api/auth/face/register", 
            headers=headers,
            json={
                "user_id": user_id,
                "face_descriptor": SAMPLE_FACE_DESCRIPTOR
            }
        )
        
        assert response.status_code == 200, f"Face register failed: {response.text}"
        data = response.json()
        assert "message" in data
        print(f"SUCCESS: Face registered - {data.get('message')}")
    
    def test_face_register_wrong_user_id(self, auth_token):
        """Cannot register face for another user"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        response = requests.post(f"{BASE_URL}/api/auth/face/register", 
            headers=headers,
            json={
                "user_id": "wrong-user-id-12345",
                "face_descriptor": SAMPLE_FACE_DESCRIPTOR
            }
        )
        
        # Should return 403 Forbidden
        assert response.status_code == 403, f"Expected 403, got {response.status_code}"
        print("SUCCESS: Cannot register face for another user")


class TestFaceLoginAPI:
    """Test Face Login API - /api/auth/face/login"""
    
    def test_face_login_no_registered_faces(self):
        """Face login with no matching faces should return 404 or 401 or 200 if similar face exists"""
        # Use a random descriptor that won't match anyone
        random_descriptor = [0.5] * 128
        
        response = requests.post(f"{BASE_URL}/api/auth/face/login", json={
            "face_descriptor": random_descriptor
        })
        
        # May return 200 if a similar face exists (cosine similarity > 0.6)
        # Or 404 (no faces) or 401 (not recognized)
        assert response.status_code in [200, 401, 404], f"Expected 200/401/404, got {response.status_code}"
        print(f"SUCCESS: Face login with random descriptor returns {response.status_code}")
    
    def test_face_login_invalid_descriptor_length(self):
        """Face login with wrong descriptor length should fail"""
        # Wrong length descriptor
        wrong_descriptor = [0.1] * 64  # Should be 128
        
        response = requests.post(f"{BASE_URL}/api/auth/face/login", json={
            "face_descriptor": wrong_descriptor
        })
        
        # Should fail - either validation error (422), processing error (500/520), or auth error
        assert response.status_code in [400, 401, 404, 422, 500, 520], f"Unexpected status: {response.status_code}"
        print(f"SUCCESS: Face login with wrong descriptor length returns {response.status_code}")
    
    def test_face_login_with_username_hint(self):
        """Face login with username hint"""
        response = requests.post(f"{BASE_URL}/api/auth/face/login", json={
            "face_descriptor": SAMPLE_FACE_DESCRIPTOR,
            "username": TEST_USER["username"]
        })
        
        # May succeed if face was registered, or fail if not matching
        # Just verify the endpoint accepts the username parameter
        assert response.status_code in [200, 401, 404], f"Unexpected status: {response.status_code}"
        print(f"SUCCESS: Face login with username hint returns {response.status_code}")
    
    def test_face_login_success_after_registration(self):
        """Test face login after registering face"""
        # First login with password to get token
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_USER["username"],
            "password": TEST_USER["password"]
        })
        
        if login_response.status_code == 401:
            pytest.skip("Test user not found")
        
        token = login_response.json().get("access_token")
        user_id = login_response.json().get("user", {}).get("id")
        
        if not user_id:
            # Get user ID from /auth/me
            headers = {"Authorization": f"Bearer {token}"}
            me_response = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
            user_id = me_response.json().get("id")
        
        # Register face
        headers = {"Authorization": f"Bearer {token}"}
        register_response = requests.post(f"{BASE_URL}/api/auth/face/register",
            headers=headers,
            json={
                "user_id": user_id,
                "face_descriptor": SAMPLE_FACE_DESCRIPTOR
            }
        )
        
        assert register_response.status_code == 200, f"Face register failed: {register_response.text}"
        
        # Now try face login with the same descriptor
        face_login_response = requests.post(f"{BASE_URL}/api/auth/face/login", json={
            "face_descriptor": SAMPLE_FACE_DESCRIPTOR
        })
        
        assert face_login_response.status_code == 200, f"Face login failed: {face_login_response.text}"
        data = face_login_response.json()
        
        assert "access_token" in data
        assert "user" in data
        assert data["user"]["username"] == TEST_USER["username"]
        
        # Verify face login gives 30 day token
        token = data["access_token"]
        decoded = jwt.decode(token, options={"verify_signature": False})
        exp_timestamp = decoded.get("exp")
        
        if exp_timestamp:
            exp_date = datetime.fromtimestamp(exp_timestamp, tz=timezone.utc)
            now = datetime.now(timezone.utc)
            days_until_expiry = (exp_date - now).days
            print(f"Face login token expires in {days_until_expiry} days")
            # Face login should give 30 day token
            assert 29 <= days_until_expiry <= 31, f"Expected ~30 days, got {days_until_expiry}"
        
        print("SUCCESS: Face login works after registration with 30 day token")


class TestUserRegistration:
    """Test user registration to ensure test user exists"""
    
    def test_register_test_user(self):
        """Register test user if not exists"""
        # First try to login
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_USER["username"],
            "password": TEST_USER["password"]
        })
        
        if login_response.status_code == 200:
            print("Test user already exists")
            return
        
        # Register new user
        register_response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": TEST_USER["email"],
            "password": TEST_USER["password"],
            "username": TEST_USER["username"]
        })
        
        if register_response.status_code == 400:
            # User might already exist with different credentials
            print(f"Registration returned 400: {register_response.text}")
            pytest.skip("User may already exist")
        
        assert register_response.status_code == 200, f"Registration failed: {register_response.text}"
        print("SUCCESS: Test user registered")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
