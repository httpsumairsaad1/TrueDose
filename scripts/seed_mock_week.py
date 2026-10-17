#!/usr/bin/env python3
"""
Seed one simulated week of mock data for OmniCare Mesh:
- 6 days logged
- 1 day pending
- All items clearly marked MOCK.
"""

import json
from datetime import datetime, timedelta

def seed():
    today = datetime.now()
    logs = []
    
    for i in range(6, 0, -1):
        day = today - timedelta(days=i)
        logs.append({
            "elder_id": "grandma",
            "taken_at": f"{day.strftime('%Y-%m-%d')}T08:02:15Z",
            "day": day.strftime("%Y-%m-%d"),
            "status": "logged",
            "mock": True
        })

    mock_gate_events = [
        {"ts": f"{(today - timedelta(days=1)).strftime('%Y-%m-%d')}T18:30:00Z", "action": "lock", "mock": True},
        {"ts": f"{today.strftime('%Y-%m-%d')}T07:15:00Z", "action": "unlock", "mock": True}
    ]

    result = {
        "dataset": "MOCK",
        "description": "Simulated weekly medication and hardware events",
        "dose_logs": logs,
        "gate_events": mock_gate_events
    }

    print(json.dumps(result, indent=2))
    return result

if __name__ == "__main__":
    seed()
