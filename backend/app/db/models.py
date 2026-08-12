import uuid
import enum
from datetime import datetime
from typing import Optional, List, Dict, Any

from sqlalchemy import (
    String, Text, Float, Integer, Boolean, DateTime, ForeignKey, Enum as SQLEnum, JSON, ARRAY
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
try:
    from pgvector.sqlalchemy import Vector
except ImportError:
    Vector = None

from app.db.base import Base

class TrajectoryKind(str, enum.Enum):
    INTEREST = "interest"
    CAREER = "career"
    MONEY = "money"
    TRAVEL = "travel"
    PERSONAL = "personal"
    HEALTH = "health"
    CREATIVE = "creative"
    LEARNING = "learning"

class TrajectoryStatus(str, enum.Enum):
    NEW = "new"
    ACTIVE = "active"
    WARM = "warm"
    STALE = "stale"
    PAUSED = "paused"
    KILLED = "killed"

class PlanMode(str, enum.Enum):
    LIGHTER = "lighter"
    BALANCED = "balanced"
    INTENSE = "intense"

class PermissionStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    EXPIRED = "expired"

class EventType(str, enum.Enum):
    MILESTONE = "milestone"
    NOTE = "note"
    AI_OBSERVATION = "ai_observation"
    DECISION = "decision"
    RESOURCE_ADDED = "resource_added"


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    preferences: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    trajectories: Mapped[List["Trajectory"]] = relationship("Trajectory", back_populates="user", cascade="all, delete-orphan", lazy="selectin")
    journal_entries: Mapped[List["JournalEntry"]] = relationship("JournalEntry", back_populates="user", cascade="all, delete-orphan", lazy="selectin")
    resources: Mapped[List["Resource"]] = relationship("Resource", back_populates="user", cascade="all, delete-orphan", lazy="selectin")
    reflections: Mapped[List["Reflection"]] = relationship("Reflection", back_populates="user", cascade="all, delete-orphan", lazy="selectin")
    permission_logs: Mapped[List["AIPermissionLog"]] = relationship("AIPermissionLog", back_populates="user", cascade="all, delete-orphan", lazy="selectin")


class Trajectory(Base):
    __tablename__ = "trajectories"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    kind: Mapped[TrajectoryKind] = mapped_column(SQLEnum(TrajectoryKind), default=TrajectoryKind.INTEREST, nullable=False)
    status: Mapped[TrajectoryStatus] = mapped_column(SQLEnum(TrajectoryStatus), default=TrajectoryStatus.NEW, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    subtitle: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    photo_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    standing: Mapped[str] = mapped_column(Text, default="Fresh signal, uncommitted", nullable=False)
    current_state: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    goal: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    momentum: Mapped[float] = mapped_column(Float, default=0.5, nullable=False)
    last_touched: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    archived_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    extra_metadata: Mapped[Dict[str, Any]] = mapped_column("metadata", JSON, default=dict, nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="trajectories")
    plans: Mapped[List["Plan"]] = relationship("Plan", back_populates="trajectory", cascade="all, delete-orphan", lazy="selectin")
    journey_events: Mapped[List["JourneyEvent"]] = relationship("JourneyEvent", back_populates="trajectory", cascade="all, delete-orphan", lazy="selectin")
    resources: Mapped[List["Resource"]] = relationship("Resource", back_populates="trajectory", cascade="all, delete-orphan", lazy="selectin")


class Plan(Base):
    __tablename__ = "plans"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    trajectory_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("trajectories.id", ondelete="CASCADE"), nullable=False, index=True)
    mode: Mapped[PlanMode] = mapped_column(SQLEnum(PlanMode), default=PlanMode.BALANCED, nullable=False)
    goal_snapshot: Mapped[str] = mapped_column(Text, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    trajectory: Mapped["Trajectory"] = relationship("Trajectory", back_populates="plans")
    steps: Mapped[List["PlanStep"]] = relationship("PlanStep", back_populates="plan", cascade="all, delete-orphan", order_by="PlanStep.step_order", lazy="selectin")


class PlanStep(Base):
    __tablename__ = "plan_steps"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    plan_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("plans.id", ondelete="CASCADE"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    detail: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    week_label: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    step_order: Mapped[int] = mapped_column(Integer, nullable=False)
    is_done: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    plan: Mapped["Plan"] = relationship("Plan", back_populates="steps")


class JournalEntry(Base):
    __tablename__ = "journal_entries"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    ai_read: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    linked_trajectory_ids: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    embedding: Mapped[Optional[Any]] = mapped_column(Vector(1536) if Vector else JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="journal_entries")


class JourneyEvent(Base):
    __tablename__ = "journey_events"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    trajectory_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("trajectories.id", ondelete="CASCADE"), nullable=False, index=True)
    event_type: Mapped[EventType] = mapped_column(SQLEnum(EventType), default=EventType.NOTE, nullable=False)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    trajectory: Mapped["Trajectory"] = relationship("Trajectory", back_populates="journey_events")


class Resource(Base):
    __tablename__ = "resources"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    trajectory_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("trajectories.id", ondelete="SET NULL"), nullable=True, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    source: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    why_relevant: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    embedding: Mapped[Optional[Any]] = mapped_column(Vector(1536) if Vector else JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="resources")
    trajectory: Mapped[Optional["Trajectory"]] = relationship("Trajectory", back_populates="resources")


class Reflection(Base):
    __tablename__ = "reflections"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    period: Mapped[str] = mapped_column(String(50), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    patterns: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    decisions: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    embedding: Mapped[Optional[Any]] = mapped_column(Vector(1536) if Vector else JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="reflections")


class AIPermissionLog(Base):
    __tablename__ = "ai_permission_logs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    proposal: Mapped[str] = mapped_column(Text, nullable=False)
    affected_trajectory_ids: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    status: Mapped[PermissionStatus] = mapped_column(SQLEnum(PermissionStatus), default=PermissionStatus.PENDING, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    resolved_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    user: Mapped["User"] = relationship("User", back_populates="permission_logs")

class ChatThread(Base):
    __tablename__ = "chat_threads"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    trajectory_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("trajectories.id", ondelete="CASCADE"), nullable=True, index=True)
    context_mode: Mapped[str] = mapped_column(String(50), default="global", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    user: Mapped["User"] = relationship("User")
    trajectory: Mapped[Optional["Trajectory"]] = relationship("Trajectory")
    messages: Mapped[List["ChatMessage"]] = relationship("ChatMessage", back_populates="thread", cascade="all, delete-orphan", lazy="selectin", order_by="ChatMessage.created_at")

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    thread_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("chat_threads.id", ondelete="CASCADE"), nullable=False, index=True)
    role: Mapped[str] = mapped_column(String(50), nullable=False) # 'user', 'assistant', 'system'
    content: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    thread: Mapped["ChatThread"] = relationship("ChatThread", back_populates="messages")

