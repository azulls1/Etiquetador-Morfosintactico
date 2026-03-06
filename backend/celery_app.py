"""Celery application — uses Redis as broker and result backend."""

from celery import Celery
from config import REDIS_URL

celery = Celery(
    "etiquetador",
    broker=REDIS_URL,
    backend=REDIS_URL,
    include=["tasks.training"],
)

celery.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    worker_max_tasks_per_child=10,
    task_track_started=True,
    result_expires=3600,
)
