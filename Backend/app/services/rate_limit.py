"""Rate limit sederhana per IP (sliding window) untuk menjaga kuota AI."""

from __future__ import annotations

import threading
import time
from collections import deque


class RateLimiter:
    def __init__(self, limit: int, window_seconds: int) -> None:
        self._limit = limit
        self._window = window_seconds
        self._hits: dict[str, deque[float]] = {}
        self._lock = threading.Lock()

    def hit(self, key: str) -> tuple[bool, int]:
        """Catat satu permintaan.

        Mengembalikan (diizinkan, detik_tunggu). detik_tunggu 0 bila diizinkan.
        """
        now = time.monotonic()
        cutoff = now - self._window

        with self._lock:
            bucket = self._hits.setdefault(key, deque())
            while bucket and bucket[0] <= cutoff:
                bucket.popleft()

            if len(bucket) >= self._limit:
                retry_after = max(1, int(self._window - (now - bucket[0])) + 1)
                return False, retry_after

            bucket.append(now)
            return True, 0

    def reset(self) -> None:
        """Kosongkan hitungan (dipakai pengujian)."""
        with self._lock:
            self._hits.clear()
