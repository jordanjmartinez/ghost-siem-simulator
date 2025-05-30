from flask import Flask, request, jsonify
from flask_cors import CORS
from threading import Thread
import os
import json
import uuid
import random
import time
import copy
from datetime import datetime, timezone, timedelta
from faker import Faker
import threading
import uuid

app = Flask(__name__)
CORS(app)

SURICATA_LOG_PATH = os.path.join("api", "suricata", "suricata_eve.json")
FAKE_LOG_PATH = os.path.join("logs", "generated_logs.ndjson")
SCENARIO_PATH = os.path.join("logs", "simulated_attack_logs.ndjson")
ACTION_LOG_PATH = os.path.join("logs", "analyst_actions.ndjson")
REPORTS_FILE = os.path.join("logs", "incident_reports.ndjson")
os.makedirs("logs", exist_ok=True)

fake = Faker()

current_scenario = None
paused = False

with open(SCENARIO_PATH, "r") as f:
    all_scenarios = [json.loads(line) for line in f if line.strip()]

attack_chains = {}
for log in all_scenarios:
    label = log.get("label", "generic")
    attack_chains.setdefault(label, []).append(log)

NORMAL_EVENT_CONFIGS = {
    "login_success": {
        "message_template": "Successful login on {service}",
        "protocol": "TCP",
        "fields": lambda: {"service": random.choice(["SSH", "RDP", "FTP", "Webmail"])}
    },
    "file_access": {
        "message_template": "File accessed: {filename}",
        "protocol": "N/A",
        "fields": lambda: {"filename": random.choice(["/etc/passwd", "/var/log/auth.log", "C:\\Users\\Admin\\notes.txt"])}
    },
    "dns_query": {
        "message_template": "DNS query for {domain}",
        "protocol": "UDP",
        "fields": lambda: {"domain": fake.domain_name()}
    },
    "http_request": {
        "message_template": "HTTP request made to {domain}",
        "protocol": "TCP",
        "fields": lambda: {"domain": fake.domain_name()}
    },
    "vpn_connection": {
        "message_template": "VPN connection established from {hostname}",
        "protocol": "UDP",
        "fields": lambda: {"hostname": random.choice(["laptop-21.sf.corp", "remote-laptop.nyc.local", "vpn-node-03.corp"])}
    },
    "software_update": {
        "message_template": "Software update to version {version} initiated on {hostname}",
        "protocol": "TCP",
        "fields": lambda: {
            "hostname": fake.hostname(),
            "version": f"{random.randint(1,10)}.{random.randint(0,9)}.{random.randint(0,99)}"
        }
    },
    "ping_request": {
        "message_template": "Ping request sent to {destination_ip}",
        "protocol": "ICMP",
        "fields": lambda: {"destination_ip": fake.ipv4_private()}
    },
    "logout": {
        "message_template": "User logged out of session",
        "protocol": "N/A",
        "fields": lambda: {}
    }
}

def generate_scenario_id():
    return str(uuid.uuid4())

def generate_normal_event(scenario_id=None):
    event_type = random.choice(list(NORMAL_EVENT_CONFIGS.keys()))
    config = NORMAL_EVENT_CONFIGS[event_type]
    dynamic_fields = config["fields"]()

    timestamp = datetime.now(timezone.utc) - timedelta(seconds=random.randint(0, 86400))
    flow_id = str(random.randint(int(1e18), int(1e19 - 1)))
    severity = random.choices(["low", "medium"], weights=[0.8, 0.2])[0]
    destination_ip = dynamic_fields.get("destination_ip", fake.ipv4_private())
    hostname = dynamic_fields.get("hostname", fake.hostname())

    base_event = {
        "id": str(uuid.uuid4()),
        "scenario_id": scenario_id or generate_scenario_id(),
        "timestamp": timestamp.isoformat(),
        "event_type": event_type,
        "source_ip": fake.ipv4_private(),
        "destination_ip": destination_ip,
        "src_mac": fake.mac_address(),
        "dest_mac": fake.mac_address(),
        "hostname": hostname,
        "severity": severity,
        "protocol": config["protocol"],
        "flow_id": flow_id,
        "bytes_in": random.randint(100, 2000),
        "bytes_out": random.randint(100, 2000),
        "packets_in": random.randint(1, 10),
        "packets_out": random.randint(1, 10),
        "geo_location": fake.country_code(),
        "detected_by": random.choice(["Suricata", "Zeek", "OSSEC"]),
        "label": "normal_traffic"
    }

    # Merge in custom fields and format message
    base_event.update(dynamic_fields)
    base_event["message"] = config["message_template"].format(**dynamic_fields)

    return base_event
def log_writer(interval=3):
    global current_scenario, paused
    count = 0
    inject_every = 10
    scenario_labels = list(attack_chains.keys())

    while True:
        if paused:
            print("[⏸️ LOGGING PAUSED] Waiting for analyst action...", flush=True)
            time.sleep(1)
            continue

        if count % inject_every == 0 and count != 0:
            selected = random.choice(scenario_labels)
            chain = attack_chains[selected]
            print(f"\n[⚠️  SCENARIO TRIGGERED] {selected} — {len(chain)} events\n", flush=True)

            scenario_id = generate_scenario_id()
            copied_chain = []
            for original in chain:
                log = copy.deepcopy(original)
                log["timestamp"] = datetime.now(timezone.utc).isoformat()
                log["id"] = str(uuid.uuid4())
                log["severity"] = "critical"
                log["scenario_id"] = scenario_id
                log["status"] = "active"
                copied_chain.append(log)

                print(f"[SCENARIO LOG] {log['event_type']} | {log.get('message', '')} | ID: {log['id']}", flush=True)

                with open(FAKE_LOG_PATH, "a") as f:
                    f.write(json.dumps(log) + "\n")
                time.sleep(0.001)

            current_scenario = {
                "label": selected,
                "logs": copied_chain,
                "scenario_id": scenario_id
            }
            paused = True
            count += 1
            continue

        normal_log = generate_normal_event()
        with open(FAKE_LOG_PATH, "a") as f:
            f.write(json.dumps(normal_log) + "\n")
        count += 1
        time.sleep(interval)

@app.route('/api/suricata', methods=['GET'])
def get_suricata_alerts():
    alerts = []
    try:
        with open(SURICATA_LOG_PATH, "r") as f:
            for line in f:
                try:
                    alerts.append(json.loads(line))
                except json.JSONDecodeError:
                    continue
    except FileNotFoundError:
        return jsonify({"error": "Suricata log file not found"}), 404
    return jsonify(alerts)

@app.route('/api/fake-events', methods=['GET'])
def get_fake_events():
    seen_ids = set()
    unique_logs = []
    try:
        with open(FAKE_LOG_PATH, "r") as f:
            for line in f:
                if not line.strip():
                    continue
                log = json.loads(line)
                if log["id"] not in seen_ids:
                    seen_ids.add(log["id"])
                    unique_logs.append(log)
    except FileNotFoundError:
        return jsonify({"error": "Fake log file not found"}), 404
    return jsonify(unique_logs)

@app.route("/api/reset-simulator", methods=["POST"])
def reset_simulator():
    global current_scenario, paused

    # Stop the thread if needed
    paused = True
    current_scenario = None

    # Clear log-related files
    for filepath in [FAKE_LOG_PATH, ACTION_LOG_PATH, REPORTS_FILE]:
        with open(filepath, "w") as f:
            f.truncate(0)

    print("[🧹 Simulator Reset] Files cleared. Waiting for analyst to resume.")
    return jsonify({"message": "Simulator reset. Click 'Simulate Events' to restart."}), 200



@app.route('/api/analytics', methods=['GET'])
def get_analytics():
    if not os.path.exists(FAKE_LOG_PATH):
        return jsonify({
            "total_alerts": 0,
            "critical_alerts": 0,
            "high_severity_rate": 0.0,
            "weekly_alerts": []
        })

    with open(FAKE_LOG_PATH, "r") as f:
        logs = [json.loads(line) for line in f if line.strip()]

    total = len(logs)
    critical = sum(1 for log in logs if log.get("severity") == "critical" and log.get("status") in ["active"])
    high = sum(1 for log in logs if log.get("severity") == "high")
    rate = round(((critical + high) / total) * 100, 2) if total else 0.0

    weekdays = {d: 0 for d in ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]}
    for log in logs:
        try:
            ts = datetime.fromisoformat(log["timestamp"].replace("Z", ""))
            d = ts.strftime("%a")
            if d in weekdays:
                weekdays[d] += 1
        except Exception:
            continue

    return jsonify({
        "total_alerts": total,
        "critical_alerts": critical,
        "high_severity_rate": rate,
        "weekly_alerts": [{"day": d, "alerts": c} for d, c in weekdays.items()]
    })

@app.route("/api/analytics/report_card", methods=["GET"])
def get_analyst_report_card():
    try:
        with open(ACTION_LOG_PATH, "r") as f:
            actions = [json.loads(line) for line in f if line.strip()]

        with open(SCENARIO_PATH, "r") as f:
            scenario_templates = [json.loads(line) for line in f if line.strip()]

        with open(REPORTS_FILE, "r") as f:
            reports = [json.loads(line) for line in f if line.strip()]

        # Step 1: Build lookup from label → category
        label_to_category = {}
        for log in scenario_templates:
            label = log.get("label")
            category = log.get("category", "").lower()
            if label:
                label_to_category[label] = category

        # Step 2: Lookup for report scoring
        report_lookup = {r["scenario_id"]: r for r in reports}

        # Step 3: Scoring logic
        resolved_fp = 0
        escalated_tt = 0
        investigated_correct = 0
        total = len(actions)

        for action in actions:
            sid = action.get("scenario_id")
            act = action.get("action")
            label = action.get("label", "").lower()
            true_category = label_to_category.get(label)

            if not true_category:
                continue

            if act == "resolve" and true_category == "false positive":
                resolved_fp += 1

            elif act == "escalate" and true_category != "false positive":
                escalated_tt += 1

            elif act == "investigate":
                report = report_lookup.get(sid)
                if report and report.get("category_match") is True:
                    investigated_correct += 1

        correct_actions = resolved_fp + escalated_tt + investigated_correct
        incorrect_actions = total - correct_actions
        accuracy = round((correct_actions / total) * 100, 2) if total else 0

        return jsonify({
            "resolved_false_positives": resolved_fp,
            "escalated_true_threats": escalated_tt,
            "investigated_correct": investigated_correct,
            "incorrect_actions": incorrect_actions,
            "total_actions": total,
            "accuracy": accuracy
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/current-scenario", methods=["GET"])
def get_current_scenario():
    return jsonify(current_scenario if current_scenario else {})

@app.route("/api/resume", methods=["POST"])
def resume_generation():
    global current_scenario, paused
    data = request.json
    action = data.get("analyst_action")
    scenario_id = data.get("scenario_id")
    label = data.get("label", "unknown")

    if not scenario_id:
        return jsonify({"error": "Missing scenario_id"}), 400

    print(f"\n[✅ ANALYST ACTION] {action.upper()} on {label} ({scenario_id})\n", flush=True)

    existing_category = None

    if os.path.exists(FAKE_LOG_PATH):
        with open(FAKE_LOG_PATH, "r") as f:
            all_logs = [json.loads(line) for line in f if line.strip()]

        # Step 1: Look in logs
        for log in all_logs:
            if log.get("scenario_id") == scenario_id and log.get("category"):
                existing_category = log["category"]
                break

        # Step 2: If not in logs, check incident_reports.ndjson
        if not existing_category and os.path.exists(REPORTS_FILE):
            with open(REPORTS_FILE, "r") as f:
                for line in f:
                    report = json.loads(line)
                    if report.get("scenario_id") == scenario_id and report.get("threat_category"):
                        existing_category = report["threat_category"]
                        break

        # Step 3: If still missing and resolved, infer category
        inferred_category = None
        if not existing_category and action == "resolve":
            if "normal" in label.lower() or "false" in label.lower():
                inferred_category = "False Positive"
            else:
                inferred_category = "Unknown"

        # Step 4: Update logs with normalized status, action, and category
        updated_logs = []
        for log in all_logs:
            if log.get("scenario_id") == scenario_id:
                log["status"] = (
                    "escalated" if action == "escalate"
                    else "resolved" if action == "resolve"
                    else action
                )
                log["analyst_action"] = action
                log["category"] = existing_category or inferred_category or "Unknown"
            updated_logs.append(log)

        with open(FAKE_LOG_PATH, "w") as f:
            for log in updated_logs:
                f.write(json.dumps(log) + "\n")

    # Step 5: Write to analyst action log
    action_log = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "scenario_id": scenario_id,
        "action": action,
        "label": label
    }

    with open(ACTION_LOG_PATH, "a") as f:
        f.write(json.dumps(action_log) + "\n")

    paused = False
    current_scenario = None
    return jsonify({"status": "action logged", "action": action})


@app.route('/api/grouped-alerts', methods=['GET'])
def get_grouped_alerts():
    if not os.path.exists(FAKE_LOG_PATH):
        return jsonify([])

    with open(FAKE_LOG_PATH, "r") as f:
        logs = [json.loads(line) for line in f if line.strip()]

    grouped = {}

    for log in logs:
        scenario_id = log.get("scenario_id")
        threat_pattern = log.get("threat_pattern", "Suspicious Activity")

        if not scenario_id or log.get("label") == "normal_traffic":
            continue

        # Composite key: scenario + pattern
        group_key = f"{scenario_id}_{threat_pattern}"

        if group_key not in grouped:
            grouped[group_key] = {
                "scenario_id": scenario_id,
                "threat_pattern": threat_pattern,
                "label": log.get("label", "Unknown"),
                "status": log.get("status", "unknown"),
                "severity": log.get("severity", "unknown"),
                "category": log.get("category", ""),  # ✅ Add this line
                "log_count": 0,
                "logs": []
            }

        grouped[group_key]["logs"].append(log)
        grouped[group_key]["log_count"] += 1

    return jsonify(list(grouped.values()))



@app.route("/api/reports", methods=["POST"])
def submit_report():
    global current_scenario, paused

    data = request.json
    scenario_id = data.get("scenario_id")
    submitted_category = data.get("threat_category") 
    data["timestamp"] = datetime.now(timezone.utc).isoformat()
    data["id"] = str(uuid.uuid4())  # ✅ Add unique ID

    # === Determine correct category from FAKE_LOG_PATH ===
    correct_category = None

    if os.path.exists(FAKE_LOG_PATH):
        with open(FAKE_LOG_PATH, "r") as f:
            for line in f:
                log = json.loads(line)
                if log.get("scenario_id") == scenario_id:
                    correct_category = log.get("category")
                    break

    is_correct = (submitted_category or "").lower() == (correct_category or "").lower()
    data["correct_category"] = correct_category
    data["category_match"] = is_correct

    # === Save report ===
    with open(REPORTS_FILE, "a") as f:
        f.write(json.dumps(data) + "\n")

    # === Update logs for that scenario ===
    if scenario_id:
        if os.path.exists(FAKE_LOG_PATH):
            with open(FAKE_LOG_PATH, "r") as f:
                logs = [json.loads(line) for line in f if line.strip()]

            for log in logs:
                if log.get("scenario_id") == scenario_id:
                    log["status"] = "investigating"
                    log["analyst_action"] = "investigate"

            with open(FAKE_LOG_PATH, "w") as f:
                for log in logs:
                    f.write(json.dumps(log) + "\n")

        # === Log analyst action with actual label ===
        label = "unknown"
        if scenario_id and os.path.exists(FAKE_LOG_PATH):
            with open(FAKE_LOG_PATH, "r") as f:
                for line in f:
                    log = json.loads(line)
                    if log.get("scenario_id") == scenario_id:
                        label = log.get("label", "unknown")
                        break

        action_log = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "scenario_id": scenario_id,
            "action": "investigate",
            "label": label
        }
        with open(ACTION_LOG_PATH, "a") as f:
            f.write(json.dumps(action_log) + "\n")

        current_scenario = None
        paused = False

    return jsonify({"message": "Report submitted and scenario resolved"}), 200


@app.route("/api/reports", methods=["GET"])
def get_reports():
    if not os.path.exists(REPORTS_FILE):
        return jsonify([])
    with open(REPORTS_FILE, "r") as f:
        reports = [json.loads(line) for line in f if line.strip()]
    return jsonify(reports)

@app.route('/api/reports/<report_id>', methods=['PUT'])
def update_report(report_id):
    try:
        if not os.path.exists(REPORTS_FILE):
            return jsonify({'error': 'Report storage not found'}), 404

        updated_data = request.json
        updated_data['id'] = report_id  # Ensure ID consistency

        updated_reports = []

        with open(REPORTS_FILE, 'r') as f:
            for line in f:
                if not line.strip():
                    continue
                report = json.loads(line)
                if report.get('id') == report_id:
                    updated_reports.append(updated_data)
                else:
                    updated_reports.append(report)

        with open(REPORTS_FILE, 'w') as f:
            for report in updated_reports:
                f.write(json.dumps(report) + '\n')

        return jsonify({'message': 'Report updated'}), 200

    except Exception as e:
        print(f"Error updating report: {e}")
        return jsonify({'error': 'Internal server error'}), 500


# def start_background_thread():
#    thread = Thread(target=log_writer, daemon=True)
 #   thread.start()

# start_background_thread()

@app.route('/api/start-simulator', methods=['POST'])
def start_simulator():
    global paused

    # Resume if paused
    if paused:
        paused = False
        return jsonify({"message": "Simulator resumed"}), 200

    # Start a new thread if not already running
    running_threads = [t.name for t in threading.enumerate()]
    if "LogWriter" not in running_threads:
        thread = threading.Thread(target=log_writer, kwargs={"interval": 3}, daemon=True)
        thread.name = "LogWriter"
        thread.start()
        return jsonify({"message": "Simulator started"}), 200

    return jsonify({"message": "Simulator already running"}), 200


if __name__ == '__main__':
    app.config['JSONIFY_PRETTYPRINT_REGULAR'] = True
    app.run(port=5000)
