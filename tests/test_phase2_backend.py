import unittest
import json
import sys
import os

# Add root directory to python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app import create_app

class TestPhase2Backend(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.client = self.app.test_client()
        self.tenant_id = "a1b2c3d4-e5f6-7890-abcd-ef1234567890"

    def test_health_check(self):
        """Verifies health check endpoint and statutory compliance label."""
        res = self.client.get("/api/health")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["status"], "healthy")
        self.assertEqual(data["complianceEngine"], "UGC-75-Statutory")

    def test_auth_login_success(self):
        """Verifies JWT issuance for Dr. Anita Roy (Admin)."""
        payload = {
            "email": "anita.roy@attendora.edu",
            "password": "password123"
        }
        res = self.client.post("/api/v1/auth/login", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data["success"])
        self.assertIn("access_token", data)
        self.assertEqual(data["user"]["role"], "ADMIN")

    def test_auth_login_invalid_credentials(self):
        """Verifies 401 response on incorrect password."""
        payload = {
            "email": "anita.roy@attendora.edu",
            "password": "wrong-password"
        }
        res = self.client.post("/api/v1/auth/login", json=payload)
        self.assertEqual(res.status_code, 401)
        data = res.get_json()
        self.assertEqual(data["error"]["code"], "INVALID_CREDENTIALS")

    def test_student_roster_with_tenant_context(self):
        """Verifies student list retrieval scoped by tenant header."""
        headers = {"X-Tenant-ID": self.tenant_id}
        res = self.client.get("/api/v1/students", headers=headers)
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data["success"])
        self.assertGreater(data["total"], 0)

    def test_attendance_session_locking_and_audit(self):
        """Verifies that roll-call submission auto-locks session under ADR-007."""
        # 1. Login as Faculty
        login_res = self.client.post("/api/v1/auth/login", json={
            "email": "rajesh.deshmukh@attendora.edu",
            "password": "password123"
        })
        token = login_res.get_json()["access_token"]
        headers = {
            "Authorization": f"Bearer {token}",
            "X-Tenant-ID": self.tenant_id
        }

        # 2. Submit roll-call
        session_payload = {
            "subjectCode": "CS603",
            "subjectName": "Database Management Systems",
            "department": "Computer Sci.",
            "semester": 6,
            "section": "A",
            "timeSlot": "02:00 PM - 03:00 PM",
            "date": "2026-11-04",
            "records": [
                {"studentId": "stu-1", "rollNo": "20000001", "studentName": "Heuren Name", "status": "Present"},
                {"studentId": "stu-2", "rollNo": "20000002", "studentName": "Kenrii Anay", "status": "Present"},
                {"studentId": "stu-4", "rollNo": "20000004", "studentName": "Samoh Baiin", "status": "Absent"}
            ]
        }
        res = self.client.post("/api/v1/attendance/sessions", json=session_payload, headers=headers)
        self.assertEqual(res.status_code, 201)
        session = res.get_json()["session"]
        self.assertTrue(session["isLocked"], "Session must be locked upon finalization")
        self.assertEqual(session["presentCount"], 2)
        self.assertEqual(session["absentCount"], 1)

    def test_defaulters_statutory_threshold(self):
        """Verifies statutory defaulter calculation against 75.0% threshold."""
        headers = {"X-Tenant-ID": self.tenant_id}
        res = self.client.get("/api/v1/reports/defaulters?threshold=75.0", headers=headers)
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data["success"])
        self.assertEqual(data["threshold"], 75.0)
        for defaulter in data["defaulters"]:
            self.assertLess(defaulter["attendanceRate"], 75.0)
            self.assertGreater(defaulter["shortfall"], 0)

    def test_audit_logs_retrieval(self):
        """Verifies retrieval of tamper-resistant audit trail."""
        headers = {"X-Tenant-ID": self.tenant_id}
        res = self.client.get("/api/v1/audit/logs", headers=headers)
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data["success"])
        self.assertGreater(data["total"], 0)

if __name__ == "__main__":
    unittest.main()

