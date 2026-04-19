#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class PiggyBankAPITester:
    def __init__(self, base_url="https://savings-jar.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.session = requests.Session()
        self.tests_run = 0
        self.tests_passed = 0
        self.user_id = None
        self.piggy_bank_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, cookies=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {method} {url}")
        
        try:
            if method == 'GET':
                response = self.session.get(url, headers=headers)
            elif method == 'POST':
                response = self.session.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = self.session.put(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = self.session.delete(url, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    if isinstance(response_data, dict) and len(str(response_data)) < 200:
                        print(f"   Response: {response_data}")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Error: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_auth_register(self):
        """Test user registration"""
        test_email = f"test_{datetime.now().strftime('%H%M%S')}@example.com"
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data={
                "email": test_email,
                "password": "test123",
                "name": "Test User"
            }
        )
        if success and 'id' in response:
            self.user_id = response['id']
            print(f"   Registered user ID: {self.user_id}")
        return success

    def test_auth_login_admin(self):
        """Test admin login"""
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "auth/login",
            200,
            data={
                "email": "admin@huchas.com",
                "password": "admin123"
            }
        )
        if success and 'id' in response:
            print(f"   Admin logged in: {response['email']}")
        return success

    def test_auth_me(self):
        """Test get current user"""
        success, response = self.run_test(
            "Get Current User",
            "GET",
            "auth/me",
            200
        )
        return success

    def test_create_piggy_bank(self):
        """Test creating a piggy bank"""
        success, response = self.run_test(
            "Create Piggy Bank",
            "POST",
            "piggy-banks",
            200,
            data={
                "name": "Test Savings",
                "color": "mint",
                "goal": 1000.0
            }
        )
        if success and 'id' in response:
            self.piggy_bank_id = response['id']
            print(f"   Created piggy bank ID: {self.piggy_bank_id}")
        return success

    def test_get_piggy_banks(self):
        """Test getting all piggy banks"""
        success, response = self.run_test(
            "Get Piggy Banks",
            "GET",
            "piggy-banks",
            200
        )
        if success and isinstance(response, list):
            print(f"   Found {len(response)} piggy banks")
        return success

    def test_update_piggy_bank(self):
        """Test updating a piggy bank"""
        if not self.piggy_bank_id:
            print("❌ No piggy bank ID available for update test")
            return False
            
        success, response = self.run_test(
            "Update Piggy Bank",
            "PUT",
            f"piggy-banks/{self.piggy_bank_id}",
            200,
            data={
                "name": "Updated Test Savings",
                "color": "lavender"
            }
        )
        return success

    def test_create_deposit_transaction(self):
        """Test creating a deposit transaction"""
        if not self.piggy_bank_id:
            print("❌ No piggy bank ID available for transaction test")
            return False
            
        success, response = self.run_test(
            "Create Deposit Transaction",
            "POST",
            "transactions",
            200,
            data={
                "piggy_bank_id": self.piggy_bank_id,
                "type": "deposit",
                "amount": 50.0,
                "description": "Test deposit"
            }
        )
        return success

    def test_create_withdrawal_transaction(self):
        """Test creating a withdrawal transaction"""
        if not self.piggy_bank_id:
            print("❌ No piggy bank ID available for transaction test")
            return False
            
        success, response = self.run_test(
            "Create Withdrawal Transaction",
            "POST",
            "transactions",
            200,
            data={
                "piggy_bank_id": self.piggy_bank_id,
                "type": "withdrawal",
                "amount": 25.0,
                "description": "Test withdrawal"
            }
        )
        return success

    def test_get_piggy_bank_transactions(self):
        """Test getting transactions for a piggy bank"""
        if not self.piggy_bank_id:
            print("❌ No piggy bank ID available for transaction history test")
            return False
            
        success, response = self.run_test(
            "Get Piggy Bank Transactions",
            "GET",
            f"transactions/{self.piggy_bank_id}",
            200
        )
        if success and isinstance(response, list):
            print(f"   Found {len(response)} transactions")
        return success

    def test_get_all_transactions(self):
        """Test getting all user transactions"""
        success, response = self.run_test(
            "Get All User Transactions",
            "GET",
            "transactions",
            200
        )
        if success and isinstance(response, list):
            print(f"   Found {len(response)} total transactions")
        return success

    def test_get_statistics(self):
        """Test getting user statistics"""
        success, response = self.run_test(
            "Get Statistics",
            "GET",
            "statistics",
            200
        )
        if success:
            print(f"   Total savings: €{response.get('total_savings', 0)}")
            print(f"   Total piggy banks: {response.get('total_piggy_banks', 0)}")
            print(f"   Total transactions: {response.get('total_transactions', 0)}")
        return success

    def test_delete_piggy_bank(self):
        """Test deleting a piggy bank"""
        if not self.piggy_bank_id:
            print("❌ No piggy bank ID available for delete test")
            return False
            
        success, response = self.run_test(
            "Delete Piggy Bank",
            "DELETE",
            f"piggy-banks/{self.piggy_bank_id}",
            200
        )
        return success

    def test_auth_logout(self):
        """Test user logout"""
        success, response = self.run_test(
            "User Logout",
            "POST",
            "auth/logout",
            200
        )
        return success

    def test_insufficient_balance_withdrawal(self):
        """Test withdrawal with insufficient balance"""
        if not self.piggy_bank_id:
            print("❌ No piggy bank ID available for insufficient balance test")
            return False
            
        success, response = self.run_test(
            "Insufficient Balance Withdrawal",
            "POST",
            "transactions",
            400,  # Should fail with 400
            data={
                "piggy_bank_id": self.piggy_bank_id,
                "type": "withdrawal",
                "amount": 10000.0,  # Large amount
                "description": "Test insufficient balance"
            }
        )
        return success

def main():
    print("🏦 Starting Piggy Bank API Tests")
    print("=" * 50)
    
    tester = PiggyBankAPITester()
    
    # Test sequence
    tests = [
        # Auth tests
        tester.test_auth_register,
        tester.test_auth_me,
        
        # Piggy bank CRUD tests
        tester.test_create_piggy_bank,
        tester.test_get_piggy_banks,
        tester.test_update_piggy_bank,
        
        # Transaction tests
        tester.test_create_deposit_transaction,
        tester.test_create_withdrawal_transaction,
        tester.test_get_piggy_bank_transactions,
        tester.test_get_all_transactions,
        
        # Statistics test
        tester.test_get_statistics,
        
        # Error handling test
        tester.test_insufficient_balance_withdrawal,
        
        # Cleanup
        tester.test_delete_piggy_bank,
        tester.test_auth_logout,
        
        # Admin login test
        tester.test_auth_login_admin,
        tester.test_auth_me,
        tester.test_auth_logout
    ]
    
    # Run all tests
    for test in tests:
        try:
            test()
        except Exception as e:
            print(f"❌ Test failed with exception: {str(e)}")
            tester.tests_run += 1
    
    # Print results
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print(f"⚠️  {tester.tests_run - tester.tests_passed} tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())