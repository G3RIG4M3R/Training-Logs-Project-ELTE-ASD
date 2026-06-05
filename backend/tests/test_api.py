from fastapi.testclient import TestClient


ATHLETE_PAYLOAD = {
    "name": "Kovacs Bence",
    "dateOfBirth": "2005-03-14",
    "sex": "male",
    "height": 182,
    "weight": 74,
    "shirtSize": "L",
    "shortSize": "L",
    "shoeSize": 43,
    "notes": "Sprinter",
}


def create_athlete(client: TestClient, **overrides) -> dict:
    payload = {**ATHLETE_PAYLOAD, **overrides}
    response = client.post("/athletes", json=payload)
    assert response.status_code == 201
    return response.json()


def create_session(client: TestClient, date: str = "2026-01-10", title: str = "Track") -> dict:
    response = client.post("/sessions", json={"date": date, "title": title})
    assert response.status_code == 201
    return response.json()


def test_root_and_health(client: TestClient) -> None:
    assert client.get("/").json() == {"message": "Training Logs API is running"}
    assert client.get("/health").json() == {"status": "ok"}


def test_athlete_crud_profile_sizes_and_soft_delete(client: TestClient) -> None:
    athlete = create_athlete(client)
    assert athlete["name"] == "Kovacs Bence"
    assert athlete["dateOfBirth"] == "2005-03-14"
    assert athlete["shirtSize"] == "L"

    athletes = client.get("/athletes").json()
    assert [item["name"] for item in athletes] == ["Kovacs Bence"]

    read_response = client.get(f"/athletes/{athlete['id']}")
    assert read_response.status_code == 200
    assert read_response.json()["id"] == athlete["id"]

    update_payload = {**ATHLETE_PAYLOAD, "name": "Kovacs Aron", "height": 184}
    update_response = client.put(f"/athletes/{athlete['id']}", json=update_payload)
    assert update_response.status_code == 200
    assert update_response.json()["name"] == "Kovacs Aron"
    assert update_response.json()["height"] == 184

    sizes_response = client.put(
        f"/athletes/{athlete['id']}/sizes",
        json={"shirtSize": "XL", "shortSize": "M", "shoeSize": 44},
    )
    assert sizes_response.status_code == 200
    assert sizes_response.json()["shirtSize"] == "XL"
    assert sizes_response.json()["shortSize"] == "M"
    assert sizes_response.json()["shoeSize"] == 44

    profile_response = client.get(f"/athletes/{athlete['id']}/profile")
    assert profile_response.status_code == 200
    profile = profile_response.json()
    assert profile["attendanceSummary"] == {
        "totalSessions": 0,
        "present": 0,
        "absent": 0,
        "excused": 0,
    }
    assert profile["recentResults"] == []

    delete_response = client.delete(f"/athletes/{athlete['id']}")
    assert delete_response.status_code == 204
    assert client.get(f"/athletes/{athlete['id']}").status_code == 404
    assert client.get("/athletes").json() == []


def test_validation_and_error_shape(client: TestClient) -> None:
    response = client.post("/athletes", json={**ATHLETE_PAYLOAD, "name": " ", "height": 99})
    assert response.status_code == 422
    body = response.json()
    assert body["error"]["code"] == "validation_error"
    assert body["error"]["message"] == "Request validation failed"
    assert isinstance(body["error"]["details"], list)

    missing_response = client.get("/athletes/999")
    assert missing_response.status_code == 404
    assert missing_response.json()["error"]["code"] == "athlete_not_found"


def test_sessions_attendance_and_duplicate_protection(client: TestClient) -> None:
    athlete = create_athlete(client)
    session = create_session(client)

    sessions = client.get("/sessions").json()
    assert len(sessions) == 1
    assert sessions[0]["date"] == "2026-01-10"

    attendance_response = client.post(
        "/attendance",
        json={"athleteId": athlete["id"], "sessionId": session["id"]},
    )
    assert attendance_response.status_code == 201
    attendance = attendance_response.json()
    assert attendance["status"] == "present"
    assert attendance["athleteName"] == "Kovacs Bence"
    assert attendance["sessionDate"] == "2026-01-10"

    duplicate_response = client.post(
        "/attendance",
        json={"athleteId": athlete["id"], "sessionId": session["id"]},
    )
    assert duplicate_response.status_code == 409
    assert duplicate_response.json()["error"]["code"] == "attendance_duplicate"

    update_response = client.put(
        f"/attendance/{attendance['id']}",
        json={"status": "absent", "notes": "Sick"},
    )
    assert update_response.status_code == 200
    assert update_response.json()["status"] == "absent"
    assert update_response.json()["notes"] == "Sick"

    session_attendance = client.get(f"/sessions/{session['id']}/attendance").json()
    assert len(session_attendance) == 1
    assert session_attendance[0]["id"] == attendance["id"]


def test_results_by_athlete_and_session(client: TestClient) -> None:
    athlete = create_athlete(client)
    older_session = create_session(client, date="2026-01-10", title="Older")
    newer_session = create_session(client, date="2026-02-10", title="Newer")

    first_response = client.post(
        "/results",
        json={
            "athleteId": athlete["id"],
            "sessionId": older_session["id"],
            "eventName": "100m",
            "value": 12.4,
            "unit": "s",
        },
    )
    assert first_response.status_code == 201

    second_response = client.post(
        "/results",
        json={
            "athleteId": athlete["id"],
            "sessionId": newer_session["id"],
            "eventName": "Long jump",
            "value": 5.8,
            "unit": "m",
            "notes": "PB",
        },
    )
    assert second_response.status_code == 201
    second_result = second_response.json()
    assert second_result["resultDate"] == "2026-02-10"
    assert second_result["athleteName"] == "Kovacs Bence"

    athlete_results = client.get(f"/athletes/{athlete['id']}/results").json()
    assert [result["eventName"] for result in athlete_results] == ["Long jump", "100m"]

    session_results = client.get(f"/sessions/{newer_session['id']}/results").json()
    assert len(session_results) == 1
    assert session_results[0]["eventName"] == "Long jump"

    profile = client.get(f"/athletes/{athlete['id']}/profile").json()
    assert [result["eventName"] for result in profile["recentResults"]] == ["Long jump", "100m"]
