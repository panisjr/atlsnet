def test_add_timer(client):
    # Arrange: Prepare the input data
    payload = {
        "intersection_id": 1,
        "traffic_light_name": "North Pole",
        "traffic_light_timer": 30,
        "day": "Monday"
    }

    # Act: Send a POST request to the endpoint
    response = client.post("/add_timer", json=payload)

    # Assert: Verify the response and database update
    assert response.status_code == 200
    assert response.json["message"] == "Timer added successfully"
