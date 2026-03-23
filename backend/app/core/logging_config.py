"""
Logging configuration for Revendu.

Provides structured JSON logging in production and pretty-printed logs in development.
Each request gets a unique request_id for traceability.
"""

import json
import logging
import sys
import uuid
from typing import Any

from app.config import get_settings

settings = get_settings()


class JSONFormatter(logging.Formatter):
    """Format logs as JSON for production use."""

    def format(self, record: logging.LogRecord) -> str:
        log_data = {
            "timestamp": self.formatTime(record),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }

        # Add optional request context
        if hasattr(record, "request_id"):
            log_data["request_id"] = record.request_id
        if hasattr(record, "user_id"):
            log_data["user_id"] = str(record.user_id)
        if hasattr(record, "action"):
            log_data["action"] = record.action

        # Add exception info if present
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)

        return json.dumps(log_data, ensure_ascii=False)


class SimpleFormatter(logging.Formatter):
    """Pretty-print logs for development."""

    def format(self, record: logging.LogRecord) -> str:
        msg = super().format(record)
        if record.exc_info:
            msg += "\n" + self.formatException(record.exc_info)
        return msg


def setup_logging() -> None:
    """Configure application logging based on environment."""
    root_logger = logging.getLogger()

    # Clear any existing handlers
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)

    # Choose formatter based on environment
    if settings.is_production:
        formatter = JSONFormatter()
        level = logging.INFO
    else:
        formatter = SimpleFormatter(
            fmt="[%(levelname)s] %(name)s — %(message)s",
        )
        level = logging.DEBUG

    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(level)
    console_handler.setFormatter(formatter)
    root_logger.addHandler(console_handler)

    # Set root logger level
    root_logger.setLevel(level)

    # Suppress noisy third-party loggers
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
    logging.getLogger("urllib3.connectionpool").setLevel(logging.WARNING)


class ContextFilter(logging.Filter):
    """Add request context (request_id, user_id) to log records."""

    # Thread-local storage for request context
    # In a real production app, you'd use contextvars for async support
    _context: dict[str, Any] = {}

    @classmethod
    def set_context(cls, request_id: str | None = None, user_id: str | None = None, action: str | None = None) -> None:
        """Set context for the current request."""
        cls._context = {}
        if request_id:
            cls._context["request_id"] = request_id
        if user_id:
            cls._context["user_id"] = user_id
        if action:
            cls._context["action"] = action

    @classmethod
    def clear_context(cls) -> None:
        """Clear context."""
        cls._context = {}

    def filter(self, record: logging.LogRecord) -> bool:
        """Add context to the log record."""
        for key, value in self._context.items():
            setattr(record, key, value)
        return True


def get_logger(name: str) -> logging.Logger:
    """Get a logger with context filter attached."""
    logger = logging.getLogger(name)
    # Add context filter if not already present
    if not any(isinstance(f, ContextFilter) for f in logger.filters):
        logger.addFilter(ContextFilter())
    return logger


def generate_request_id() -> str:
    """Generate a unique request ID."""
    return str(uuid.uuid4())
