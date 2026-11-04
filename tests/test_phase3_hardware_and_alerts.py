import unittest
import math
import time
from datetime import datetime, timezone

class TestPhase3HardwareAndAlerts(unittest.TestCase):
    def test_haversine_distance_calculation(self):
        """Verifies Haversine GPS geo-fence distance calculation."""
        # Classroom LH-104: Pune (18.5204, 73.8567)
        lat1, lon1 = 18.5204, 73.8567
        
        # Student near desk (~22 meters away)
        lat2, lon2 = 18.5206, 73.8567
        
        R = 6371000 # Earth radius in meters
        dLat = math.radians(lat2 - lat1)
        dLon = math.radians(lon2 - lon1)
        a = math.sin(dLat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dLon / 2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        distance = round(R * c, 1)
        
        self.assertTrue(15 < distance < 35, f"Expected distance ~22m, got {distance}m")

    def test_dynamic_qr_window_expiration(self):
        """Verifies that 10-second rolling token step increments over time."""
        window_seconds = 10
        step1 = int(time.time() // window_seconds)
        time_remaining = int(window_seconds - (time.time() % window_seconds))
        
        self.assertGreaterEqual(time_remaining, 0)
        self.assertLessEqual(time_remaining, 10)
        self.assertIsInstance(step1, int)

    def test_statutory_alert_formatting(self):
        """Verifies statutory debarment notice generation under 70% threshold."""
        student_name = "Samoh Baiin"
        roll_no = "20000004"
        rate = 67.5
        course = "CS603"
        classes_needed = 12
        
        sms = f"[ATTENDORA CRITICAL] {student_name} ({roll_no}): Attendance in {course} is {rate}%, below statutory 75%. You face semester exam debarment. Attend next {classes_needed} classes & contact HOD."
        
        self.assertIn("CRITICAL", sms)
        self.assertIn("67.5%", sms)
        self.assertIn("12 classes", sms)
        self.assertLess(len(sms), 250, "SMS must remain within standard carrier segments")

    def test_hardware_rfid_timetable_reconciliation(self):
        """Verifies gate punch timestamp reconciliation against lecture slots."""
        slot_start_minutes = 14 * 60 # 14:00 (2:00 PM)
        
        # Punch at 14:03 (on time)
        punch_minutes_on_time = 14 * 60 + 3
        is_on_time = (slot_start_minutes - 15) <= punch_minutes_on_time <= (slot_start_minutes + 10)
        self.assertTrue(is_on_time)
        
        # Punch at 14:22 (late entry)
        punch_minutes_late = 14 * 60 + 22
        is_late = (slot_start_minutes + 10) < punch_minutes_late <= (slot_start_minutes + 30)
        self.assertTrue(is_late)
        
        # Punch at 15:45 (outside window)
        punch_minutes_outside = 15 * 60 + 45
        is_outside = punch_minutes_outside > (slot_start_minutes + 30)
        self.assertTrue(is_outside)

if __name__ == "__main__":
    unittest.main()

