import requests
import time

# Wait a moment for services to start
time.sleep(10)

print("1. Logging in...")
login_res = requests.post("http://localhost:3000/auth/login", json={"username":"admin", "password":"admin"})
print(login_res.status_code, login_res.text)
token = login_res.json().get('access_token')

print("2. Uploading mock diagram...")
with open("mock_diagram.png", "wb") as f:
    f.write(b"mock image content")

with open("mock_diagram.png", "rb") as f:
    upload_res = requests.post("http://localhost:3000/upload",
        headers={"Authorization": f"Bearer {token}"},
        files={"file": ("mock_diagram.png", f, "image/png")}
    )
print(upload_res.status_code, upload_res.text)
analysis_id = upload_res.json().get("analysisId")

print("3. Checking status...")
for i in range(5):
    status_res = requests.get(f"http://localhost:3000/reports/{analysis_id}/status", headers={"Authorization": f"Bearer {token}"})
    print(status_res.status_code, status_res.text)
    if "ANALYZED" in status_res.text:
        break
    time.sleep(3)

print("4. Getting report...")
report_res = requests.get(f"http://localhost:3000/reports/{analysis_id}", headers={"Authorization": f"Bearer {token}"})
print(report_res.status_code, report_res.text)
