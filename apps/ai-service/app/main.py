import os
import json
import asyncio
import pika
import requests
from fastapi import FastAPI
import threading
import time
import base64

app = FastAPI()

def mock_llm_analysis(filename):
    print(f"Mock analyzing via LLM for file {filename}...")
    time.sleep(2) # Mock processing time for OCR/LLM

    return {
        "status": "ANALYZED",
        "components": [
            {"name": "API Gateway", "type": "Gateway", "description": "Entry point for all requests"},
            {"name": "Auth Service", "type": "Microservice", "description": "Handles authentication"}
        ],
        "risks": [
            {"id": "R1", "category": "Security", "description": "No auth on internal services", "severity": "HIGH"},
            {"id": "R2", "category": "Reliability", "description": "Single point of failure in gateway", "severity": "MEDIUM"}
        ],
        "recommendations": [
            {"id": "RC1", "description": "Implement mutual TLS", "targetComponent": "API Gateway"},
            {"id": "RC2", "description": "Deploy multiple gateway instances", "targetComponent": "API Gateway"}
        ],
        "summary": "The architecture has good separation of concerns but lacks secure internal communication and high availability at the gateway level.",
        "score": 75.5
    }

def process_diagram(data):
    analysis_id = data.get('analysisId')
    file_path = data.get('fileUrl')
    file_name = data.get('fileName')
    print(f"Starting pipeline processing for diagram: {file_name}")

    # 1. OCR / Data Extraction Phase
    # Real pipeline would extract text/base64 here
    # Since we are mock-reading the file to prove we can access it:
    if os.path.exists(file_path):
        print(f"File {file_path} located. Size: {os.path.getsize(file_path)} bytes")
    else:
        print(f"Warning: File {file_path} not found on volume.")

    # 2. LLM Analysis Phase (simulated structured pipeline)
    report_data = mock_llm_analysis(file_name)
    report_data["analysisId"] = analysis_id

    # 3. Webhook Phase
    report_service_url = os.getenv("REPORT_SERVICE_URL", "http://report-service:3003")
    try:
        response = requests.post(f"{report_service_url}/reports/webhook", json=report_data)
        print(f"Report webhook sent. Status: {response.status_code}")
    except Exception as e:
        print(f"Error sending webhook: {e}")

def callback(ch, method, properties, body):
    data = json.loads(body)
    print(f"Received message: {data}")
    process_diagram(data)
    ch.basic_ack(delivery_tag=method.delivery_tag)

def start_rabbitmq_consumer():
    rabbitmq_url = os.getenv("RABBITMQ_URL", "amqp://guest:guest@localhost:5672")
    retries = 5
    while retries > 0:
        try:
            params = pika.URLParameters(rabbitmq_url)
            connection = pika.BlockingConnection(params)
            channel = connection.channel()
            channel.queue_declare(queue='diagram_processing_queue', durable=True)
            channel.basic_consume(queue='diagram_processing_queue', on_message_callback=callback)
            print("Started consuming RabbitMQ messages...")
            channel.start_consuming()
            break
        except Exception as e:
            print(f"Failed to connect to RabbitMQ: {e}")
            retries -= 1
            time.sleep(5)

@app.on_event("startup")
def startup_event():
    # Run consumer in background thread
    t = threading.Thread(target=start_rabbitmq_consumer, daemon=True)
    t.start()

@app.get("/health")
def health():
    return {"status": "ok"}
