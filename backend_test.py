import requests
import sys
import json
from datetime import datetime

class TrainingHeroAPITester:
    def __init__(self, base_url="https://warrior-fitness.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "name": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            
            if success:
                self.log_test(name, True)
                try:
                    return True, response.json()
                except:
                    return True, {}
            else:
                self.log_test(name, False, f"Expected {expected_status}, got {response.status_code} - {response.text[:200]}")
                return False, {}

        except Exception as e:
            self.log_test(name, False, f"Request failed: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test basic health endpoints"""
        print("\n🔍 Testing Health Endpoints...")
        self.run_test("API Root", "GET", "", 200)
        self.run_test("Health Check", "GET", "health", 200)

    def test_user_registration(self):
        """Test user registration"""
        print("\n🔍 Testing User Registration...")
        
        # Test with existing test user credentials
        test_data = {
            "email": "test@hero.com",
            "password": "hero123",
            "username": "TestHero"
        }
        
        success, response = self.run_test(
            "User Registration (existing user)",
            "POST",
            "auth/register",
            400,  # Should fail if user exists
            data=test_data
        )
        
        # Test with new user
        timestamp = datetime.now().strftime("%H%M%S")
        new_user_data = {
            "email": f"testuser{timestamp}@hero.com",
            "password": "testpass123",
            "username": f"TestUser{timestamp}"
        }
        
        success, response = self.run_test(
            "User Registration (new user)",
            "POST",
            "auth/register",
            200,
            data=new_user_data
        )
        
        if success and 'access_token' in response:
            print(f"   New user created: {new_user_data['username']}")

    def test_user_login(self):
        """Test user login with test credentials"""
        print("\n🔍 Testing User Login...")
        
        login_data = {
            "email": "test@hero.com",
            "password": "hero123"
        }
        
        success, response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data=login_data
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            self.user_id = response['user']['id']
            print(f"   Logged in as: {response['user']['username']}")
            print(f"   Level: {response['user']['level']}, XP: {response['user']['xp']}")
            return True
        return False

    def test_auth_me(self):
        """Test getting current user info"""
        print("\n🔍 Testing Auth Me...")
        
        if not self.token:
            self.log_test("Auth Me", False, "No token available")
            return False
            
        success, response = self.run_test(
            "Get Current User",
            "GET",
            "auth/me",
            200
        )
        
        if success:
            print(f"   User: {response.get('username', 'N/A')}")
            print(f"   Stats - STR: {response.get('strength', 0)}, END: {response.get('endurance', 0)}, AGI: {response.get('agility', 0)}")

    def test_weightlifting_workout(self):
        """Test creating a weightlifting workout"""
        print("\n🔍 Testing Weightlifting Workout...")
        
        if not self.token:
            self.log_test("Weightlifting Workout", False, "No token available")
            return False
        
        workout_data = {
            "exercises": [
                {
                    "name": "Bench Press",
                    "sets": 3,
                    "reps": 10,
                    "weight": 80.0,
                    "tempo": "3-1-2"
                },
                {
                    "name": "Squat",
                    "sets": 3,
                    "reps": 8,
                    "weight": 100.0,
                    "tempo": "3-0-1"
                }
            ],
            "notes": "Great workout session!"
        }
        
        success, response = self.run_test(
            "Create Weightlifting Workout",
            "POST",
            "workouts/weightlifting",
            200,
            data=workout_data
        )
        
        if success:
            print(f"   XP Earned: {response.get('xp_earned', 0)}")
            print(f"   Stats Gained: {response.get('stats_gained', {})}")

    def test_cardio_workout(self):
        """Test creating a cardio workout"""
        print("\n🔍 Testing Cardio Workout...")
        
        if not self.token:
            self.log_test("Cardio Workout", False, "No token available")
            return False
        
        cardio_data = {
            "activity": "running",
            "duration_minutes": 30,
            "distance_km": 5.0,
            "notes": "Morning run in the park"
        }
        
        success, response = self.run_test(
            "Create Cardio Workout",
            "POST",
            "workouts/cardio",
            200,
            data=cardio_data
        )
        
        if success:
            print(f"   XP Earned: {response.get('xp_earned', 0)}")
            print(f"   Stats Gained: {response.get('stats_gained', {})}")

    def test_workout_history(self):
        """Test getting workout history"""
        print("\n🔍 Testing Workout History...")
        
        if not self.token:
            self.log_test("Workout History", False, "No token available")
            return False
        
        success, response = self.run_test(
            "Get Workout History",
            "GET",
            "workouts?limit=10",
            200
        )
        
        if success and isinstance(response, list):
            print(f"   Found {len(response)} workouts")

    def test_workout_stats(self):
        """Test getting workout statistics"""
        print("\n🔍 Testing Workout Stats...")
        
        if not self.token:
            self.log_test("Workout Stats", False, "No token available")
            return False
        
        success, response = self.run_test(
            "Get Workout Stats",
            "GET",
            "workouts/stats",
            200
        )
        
        if success:
            print(f"   Total Workouts: {response.get('total_workouts', 0)}")
            print(f"   Weightlifting: {response.get('weightlifting_count', 0)}")
            print(f"   Cardio: {response.get('cardio_count', 0)}")

    def test_achievements(self):
        """Test achievements system"""
        print("\n🔍 Testing Achievements...")
        
        if not self.token:
            self.log_test("Achievements", False, "No token available")
            return False
        
        success, response = self.run_test(
            "Get Achievements",
            "GET",
            "achievements",
            200
        )
        
        if success and isinstance(response, list):
            unlocked = [a for a in response if a.get('unlocked', False)]
            print(f"   Total Achievements: {len(response)}")
            print(f"   Unlocked: {len(unlocked)}")

    def test_quests(self):
        """Test quests system"""
        print("\n🔍 Testing Quests...")
        
        if not self.token:
            self.log_test("Quests", False, "No token available")
            return False
        
        success, response = self.run_test(
            "Get Quests",
            "GET",
            "quests",
            200
        )
        
        if success and isinstance(response, list):
            active = [q for q in response if not q.get('completed', False)]
            completed = [q for q in response if q.get('completed', False)]
            print(f"   Total Quests: {len(response)}")
            print(f"   Active: {len(active)}")
            print(f"   Completed: {len(completed)}")

    def test_quest_refresh(self):
        """Test quest refresh functionality"""
        print("\n🔍 Testing Quest Refresh...")
        
        if not self.token:
            self.log_test("Quest Refresh", False, "No token available")
            return False
        
        success, response = self.run_test(
            "Refresh Quests",
            "POST",
            "quests/refresh",
            200
        )

    def test_leaderboard(self):
        """Test leaderboard endpoint"""
        print("\n🔍 Testing Leaderboard...")
        
        success, response = self.run_test(
            "Get Leaderboard",
            "GET",
            "leaderboard?limit=5",
            200
        )
        
        if success and isinstance(response, list):
            print(f"   Leaderboard entries: {len(response)}")

    def test_invalid_auth(self):
        """Test endpoints with invalid authentication"""
        print("\n🔍 Testing Invalid Authentication...")
        
        # Store current token
        original_token = self.token
        
        # Test with invalid token
        self.token = "invalid_token_123"
        
        self.run_test(
            "Invalid Token Test",
            "GET",
            "auth/me",
            401
        )
        
        # Test with no token
        self.token = None
        
        self.run_test(
            "No Token Test",
            "GET",
            "auth/me",
            401
        )
        
        # Restore original token
        self.token = original_token

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting Training Hero API Tests")
        print(f"🎯 Testing against: {self.base_url}")
        
        # Basic health checks
        self.test_health_check()
        
        # Authentication tests
        self.test_user_registration()
        
        # Login and get token
        if self.test_user_login():
            self.test_auth_me()
            
            # Workout tests
            self.test_weightlifting_workout()
            self.test_cardio_workout()
            self.test_workout_history()
            self.test_workout_stats()
            
            # RPG system tests
            self.test_achievements()
            self.test_quests()
            self.test_quest_refresh()
        
        # Public endpoints
        self.test_leaderboard()
        
        # Security tests
        self.test_invalid_auth()
        
        # Print summary
        print(f"\n📊 Test Summary:")
        print(f"   Tests Run: {self.tests_run}")
        print(f"   Tests Passed: {self.tests_passed}")
        print(f"   Tests Failed: {self.tests_run - self.tests_passed}")
        print(f"   Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        return self.tests_passed == self.tests_run

def main():
    tester = TrainingHeroAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())