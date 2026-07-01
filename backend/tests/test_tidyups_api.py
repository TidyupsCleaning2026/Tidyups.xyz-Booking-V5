"""Tidyups backend API test suite - leads CRUD, admin auth, PIN verify."""
import os
import pytest
import requests

BASE_URL = os.environ.get("EXPO_PUBLIC_BACKEND_URL", "https://purple-tidyups.preview.emergentagent.com").rstrip("/")
ADMIN_PIN = "1234"
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def created_lead():
    payload = {
        "name": "TEST_Jane Doe",
        "phone": "+15551234567",
        "email": "TEST_jane@example.com",
        "service_type": "Deep Cleaning",
        "property_type": "House",
        "bedrooms": 3,
        "bathrooms": 2,
        "address": "123 Test Street, Testville",
        "message": "TEST_message from pytest",
    }
    r = requests.post(f"{API}/leads", json=payload, timeout=30)
    assert r.status_code == 200, r.text
    yield r.json()


# ---- Health ----
class TestHealth:
    def test_root(self):
        r = requests.get(f"{API}/", timeout=15)
        assert r.status_code == 200
        assert "Tidyups" in r.json().get("message", "")

    def test_services(self):
        r = requests.get(f"{API}/services", timeout=15)
        assert r.status_code == 200
        j = r.json()
        assert "Standard Cleaning" in j["service_types"]
        assert "House" in j["property_types"]


# ---- PIN verify ----
class TestPin:
    def test_verify_pin_success(self):
        r = requests.post(f"{API}/admin/verify-pin", json={"pin": ADMIN_PIN}, timeout=15)
        assert r.status_code == 200
        assert r.json() == {"ok": True}

    def test_verify_pin_wrong(self):
        r = requests.post(f"{API}/admin/verify-pin", json={"pin": "0000"}, timeout=15)
        assert r.status_code == 401


# ---- Leads create ----
class TestCreateLead:
    def test_create_lead_returns_new_status(self, created_lead):
        assert created_lead["status"] == "New"
        assert created_lead["name"] == "TEST_Jane Doe"
        assert created_lead["service_type"] == "Deep Cleaning"
        assert created_lead["bedrooms"] == 3
        assert "id" in created_lead
        assert "created_at" in created_lead

    def test_create_lead_invalid_email(self):
        payload = {
            "name": "Bad",
            "phone": "+15551234567",
            "email": "not-an-email",
            "service_type": "Standard Cleaning",
            "property_type": "Studio",
            "bedrooms": 0,
            "bathrooms": 0,
            "address": "x",
        }
        r = requests.post(f"{API}/leads", json=payload, timeout=15)
        assert r.status_code == 422


# ---- Leads listing (auth-guarded) ----
class TestListLeads:
    def test_list_leads_no_pin(self):
        r = requests.get(f"{API}/leads", timeout=15)
        assert r.status_code == 401

    def test_list_leads_wrong_pin(self):
        r = requests.get(f"{API}/leads", headers={"x-admin-pin": "0000"}, timeout=15)
        assert r.status_code == 401

    def test_list_leads_ok(self, created_lead):
        r = requests.get(f"{API}/leads", headers={"x-admin-pin": ADMIN_PIN}, timeout=15)
        assert r.status_code == 200
        arr = r.json()
        assert isinstance(arr, list)
        ids = [l["id"] for l in arr]
        assert created_lead["id"] in ids
        # newest first
        if len(arr) >= 2:
            assert arr[0]["created_at"] >= arr[-1]["created_at"]


# ---- Status update ----
class TestUpdateStatus:
    def test_update_status_requires_pin(self, created_lead):
        r = requests.patch(f"{API}/leads/{created_lead['id']}/status", json={"status": "Contacted"}, timeout=15)
        assert r.status_code == 401

    def test_update_status_wrong_pin(self, created_lead):
        r = requests.patch(
            f"{API}/leads/{created_lead['id']}/status",
            headers={"x-admin-pin": "0000"},
            json={"status": "Contacted"},
            timeout=15,
        )
        assert r.status_code == 401

    def test_update_status_ok_and_persisted(self, created_lead):
        r = requests.patch(
            f"{API}/leads/{created_lead['id']}/status",
            headers={"x-admin-pin": ADMIN_PIN},
            json={"status": "Booked"},
            timeout=15,
        )
        assert r.status_code == 200
        assert r.json()["status"] == "Booked"
        # verify persistence via GET
        r2 = requests.get(f"{API}/leads", headers={"x-admin-pin": ADMIN_PIN}, timeout=15)
        assert r2.status_code == 200
        found = [l for l in r2.json() if l["id"] == created_lead["id"]]
        assert found and found[0]["status"] == "Booked"

    def test_update_status_invalid_value(self, created_lead):
        r = requests.patch(
            f"{API}/leads/{created_lead['id']}/status",
            headers={"x-admin-pin": ADMIN_PIN},
            json={"status": "Bogus"},
            timeout=15,
        )
        assert r.status_code == 422

    def test_update_status_not_found(self):
        r = requests.patch(
            f"{API}/leads/nope-nope-nope/status",
            headers={"x-admin-pin": ADMIN_PIN},
            json={"status": "New"},
            timeout=15,
        )
        assert r.status_code == 404
