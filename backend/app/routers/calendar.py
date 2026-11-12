"""Calendar events router (in-memory for API compatibility)."""
from fastapi import APIRouter, HTTPException
from app.models.schemas import CalendarEvent
from typing import List, Dict
import uuid
from datetime import datetime

router = APIRouter()

# In-memory storage (frontend primarily uses localStorage)
_calendar_events: Dict[str, dict] = {}


@router.get("/calendar-events")
async def get_calendar_events():
    return {"success": True, "events": list(_calendar_events.values())}


@router.post("/calendar-events")
async def create_calendar_event(event: CalendarEvent):
    event_id = event.id or str(uuid.uuid4())
    event_dict = event.dict()
    event_dict["id"] = event_id
    event_dict["createdAt"] = event_dict.get("createdAt") or datetime.utcnow().isoformat()
    _calendar_events[event_id] = event_dict
    return {"success": True, "event": event_dict}


@router.delete("/calendar-events")
async def delete_calendar_event(id: str):
    if id not in _calendar_events:
        raise HTTPException(status_code=404, detail="Event not found")
    del _calendar_events[id]
    return {"success": True}
