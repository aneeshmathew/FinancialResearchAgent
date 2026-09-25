"""
SSE Event Schemas
-----------------
Defines the contract for Server-Sent Events emitted by the agent stream.
Each event maps to a distinct user experience in the frontend dashboard.
"""

from enum import Enum
from typing import Any, Dict, Optional
from pydantic import BaseModel, Field
import json


class StreamEventType(str, Enum):
    AGENT_THOUGHT = "agent_thought"   # Internal chain-of-thought and planning logs
    TOOL_CALL = "tool_call"           # Live notifications of tools being executed
    UI_COMPONENT = "ui_component"     # Dynamic UI widget blueprints (charts, cards, tables)
    TEXT_CHUNK = "text_chunk"         # Incremental markdown stream of the final report
    ERROR = "error"                   # Error alerts
    DONE = "done"                     # Final completion signal


class StreamEvent(BaseModel):
    """A single SSE packet emitted by the research coordinator."""
    event: StreamEventType = Field(..., description="The type of event being streamed")
    data: Dict[str, Any] = Field(default_factory=dict, description="Payload dictionary")

    def to_sse(self) -> str:
        """Formats the object into standard SSE format:
        event: <type>
        data: <json_string>

        """
        payload = json.dumps(self.data)
        return f"event: {self.event.value}\ndata: {payload}\n\n"
