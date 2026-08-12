from uuid import UUID
from datetime import datetime, date
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict, Field, EmailStr

from app.db.models import (
    TrajectoryKind, TrajectoryStatus, PlanMode, PermissionStatus, EventType, TaskStatus
)

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    name: str
    preferences: Optional[Dict[str, Any]] = Field(default_factory=dict)

class UserCreate(UserBase):
    pass

class UserRead(UserBase):
    id: UUID
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Trajectory Schemas
class TrajectoryBase(BaseModel):
    title: str
    kind: TrajectoryKind = TrajectoryKind.INTEREST
    status: TrajectoryStatus = TrajectoryStatus.NEW
    subtitle: Optional[str] = None
    photo_url: Optional[str] = None
    standing: str = "Fresh signal, uncommitted"
    current_state: Optional[str] = None
    goal: Optional[str] = None
    momentum: float = 0.5
    extra_metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)

class TrajectoryCreate(BaseModel):
    title: str
    kind: TrajectoryKind = TrajectoryKind.INTEREST
    subtitle: Optional[str] = None
    photo_url: Optional[str] = None
    goal: Optional[str] = None

class TrajectoryUpdate(BaseModel):
    title: Optional[str] = None
    kind: Optional[TrajectoryKind] = None
    status: Optional[TrajectoryStatus] = None
    subtitle: Optional[str] = None
    photo_url: Optional[str] = None
    standing: Optional[str] = None
    current_state: Optional[str] = None
    goal: Optional[str] = None
    momentum: Optional[float] = None
    extra_metadata: Optional[Dict[str, Any]] = None

class TrajectoryRead(TrajectoryBase):
    id: UUID
    user_id: UUID
    last_touched: datetime
    created_at: datetime
    updated_at: datetime
    archived_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

# Plan Step Schemas
class PlanStepBase(BaseModel):
    title: str
    detail: Optional[str] = None
    week_label: Optional[str] = None
    step_order: int
    is_done: bool = False
    status: TaskStatus = TaskStatus.TODO
    scheduled_date: Optional[date] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    recurrence_rule: Optional[str] = None

class PlanStepCreate(BaseModel):
    trajectory_id: Optional[UUID] = None
    title: str
    detail: Optional[str] = None
    status: TaskStatus = TaskStatus.TODO
    scheduled_date: Optional[date] = None
    scheduled_dates: Optional[List[date]] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    recurrence_rule: Optional[str] = None

class PlanStepRead(PlanStepBase):
    id: UUID
    plan_id: Optional[UUID] = None
    parent_step_id: Optional[UUID] = None
    completed_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class PlanStepToggleResponse(BaseModel):
    step_id: UUID
    is_done: bool
    status: TaskStatus
    completed_at: Optional[datetime] = None

class PlanStepUpdate(BaseModel):
    title: Optional[str] = None
    detail: Optional[str] = None
    status: Optional[TaskStatus] = None
    scheduled_date: Optional[date] = None
    recurrence_rule: Optional[str] = None
    parent_step_id: Optional[UUID] = None

# Plan Schemas
class PlanBase(BaseModel):
    mode: PlanMode = PlanMode.BALANCED
    goal_snapshot: str
    is_active: bool = True

class PlanCreate(BaseModel):
    trajectory_id: UUID
    mode: PlanMode = PlanMode.BALANCED
    goal_override: Optional[str] = None

class PlanRefactorRequest(BaseModel):
    trajectory_id: UUID
    target_mode: PlanMode
    reason: Optional[str] = None

class PlanRead(PlanBase):
    id: UUID
    trajectory_id: UUID
    created_at: datetime
    steps: List[PlanStepRead] = []
    model_config = ConfigDict(from_attributes=True)

# Detail Trajectory with active plan & journey timeline
class TrajectoryDetailRead(TrajectoryRead):
    active_plan: Optional[PlanRead] = None
    recent_events_count: int = 0

class PlanStepWithTrajectoryRead(PlanStepRead):
    trajectory_id: Optional[UUID] = None
    trajectory_title: Optional[str] = None
    trajectory_kind: Optional[str] = None
    


# Journal Entry Schemas
class JournalEntryBase(BaseModel):
    text: str

class JournalEntryCreate(JournalEntryBase):
    user_id: Optional[UUID] = None
    created_at_override: Optional[datetime] = None

class JournalAnalysisResponse(BaseModel):
    journal_id: UUID
    ai_read: str
    linked_trajectory_ids: List[str]
    proposed_permission: Optional[Dict[str, Any]] = None

class JournalEntryRead(JournalEntryBase):
    id: UUID
    user_id: UUID
    ai_read: Optional[str] = None
    linked_trajectory_ids: List[str] = []
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class DayRead(BaseModel):
    date: date
    tasks: List[PlanStepWithTrajectoryRead] = []
    journal_entries: List[JournalEntryRead] = []

# Journey Event Schemas
class JourneyEventBase(BaseModel):
    event_type: EventType = EventType.NOTE
    text: str

class JourneyEventCreate(JourneyEventBase):
    trajectory_id: UUID

class JourneyEventRead(JourneyEventBase):
    id: UUID
    trajectory_id: UUID
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Resource Schemas
class ResourceBase(BaseModel):
    title: str
    url: Optional[str] = None
    source: Optional[str] = None
    notes: Optional[str] = None
    why_relevant: Optional[str] = None

class ResourceCreate(ResourceBase):
    trajectory_id: Optional[UUID] = None

class ResourceRead(ResourceBase):
    id: UUID
    user_id: UUID
    trajectory_id: Optional[UUID] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Reflection Schemas
class ReflectionBase(BaseModel):
    period: str
    content: str
    patterns: Dict[str, Any] = Field(default_factory=dict)
    decisions: Dict[str, Any] = Field(default_factory=dict)

class ReflectionCreate(ReflectionBase):
    pass

class ReflectionRead(ReflectionBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Permission Log Schemas
class PermissionActionRequest(BaseModel):
    permission_id: UUID
    action: str  # 'approve' or 'reject'

class PermissionLogRead(BaseModel):
    id: UUID
    user_id: UUID
    proposal: str
    affected_trajectory_ids: List[str]
    status: PermissionStatus
    created_at: datetime
    resolved_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

# Chat / Jarvis Sidebar Schemas
class ChatMessage(BaseModel):
    role: str  # 'user' | 'assistant' | 'system'
    content: str

class ChatMessageRead(ChatMessage):
    id: UUID
    thread_id: UUID
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class ChatThreadRead(BaseModel):
    id: UUID
    trajectory_id: Optional[UUID] = None
    context_mode: str
    messages: List[ChatMessageRead] = []
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    context_page: Optional[str] = "Homepage"
    trajectory_id: Optional[UUID] = None

class ChatResponse(BaseModel):
    reply: str
    suggested_actions: Optional[List[Dict[str, Any]]] = None
