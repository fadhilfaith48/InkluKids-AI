"""Cache TTL kecil di memori untuk hasil AI (Green IT).

Cache mencegah gambar yang sama diproses dua kali. Karena disimpan di memori
proses, cache hilang saat server restart dan tidak dibagi antar-worker.
Untuk produksi multi-worker, ganti dengan Redis atau tabel cache Supabase.
"""

from __future__ import annotations

import threading
import time
from collections import OrderedDict
from typing import Any


class TTLCache:
    def __init__(self, ttl_seconds: int, max_entries: int) -> None:
        self._ttl = ttl_seconds
        self._max = max_entries
        self._store: OrderedDict[str, tuple[float, Any]] = OrderedDict()
        self._lock = threading.Lock()

    def get(self, key: str) -> Any | None:
        now = time.monotonic()
        with self._lock:
            hit = self._store.get(key)
            if hit is None:
                return None
            expires_at, value = hit
            if expires_at <= now:
                self._store.pop(key, None)
                return None
            self._store.move_to_end(key)
            return value

    def set(self, key: str, value: Any) -> None:
        expires_at = time.monotonic() + self._ttl
        with self._lock:
            self._store[key] = (expires_at, value)
            self._store.move_to_end(key)
            while len(self._store) > self._max:
                self._store.popitem(last=False)

    def clear(self) -> None:
        with self._lock:
            self._store.clear()

    def __len__(self) -> int:
        with self._lock:
            return len(self._store)
