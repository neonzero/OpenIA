"""Stub for Azure Blob Storage style interactions.

The implementation mirrors the interface expected by the application and
persists files to a local directory. It is intentionally lightweight so
it can be swapped with an SDK-backed client in production.
"""

from __future__ import annotations

import pathlib
from dataclasses import dataclass, field
from datetime import datetime
from typing import Dict, Optional


@dataclass
class BlobRecord:
    container: str
    name: str
    path: pathlib.Path
    content_type: Optional[str] = None
    uploaded_at: datetime = field(default_factory=datetime.utcnow)


class BlobStorageStub:
    """Simple filesystem-backed blob storage."""

    def __init__(self, root: pathlib.Path):
        self._root = root
        self._root.mkdir(parents=True, exist_ok=True)
        self._records: Dict[str, BlobRecord] = {}

    def _identifier(self, container: str, blob_name: str) -> str:
        return f"{container}:{blob_name}"

    def upload_blob(self, data: bytes, container: str, blob_name: str, *, content_type: Optional[str] = None) -> None:
        target_dir = self._root / container
        target_dir.mkdir(parents=True, exist_ok=True)
        target_path = target_dir / blob_name
        target_path.parent.mkdir(parents=True, exist_ok=True)
        target_path.write_bytes(data)

        self._records[self._identifier(container, blob_name)] = BlobRecord(
            container=container,
            name=blob_name,
            path=target_path,
            content_type=content_type,
        )

    def download_blob(self, container: str, blob_name: str) -> bytes:
        record = self._records.get(self._identifier(container, blob_name))
        if not record:
            raise FileNotFoundError(f"{container}/{blob_name}")
        return record.path.read_bytes()

    def delete_blob(self, container: str, blob_name: str) -> None:
        identifier = self._identifier(container, blob_name)
        record = self._records.pop(identifier, None)
        if record and record.path.exists():
            record.path.unlink()

    def list_blobs(self) -> Dict[str, BlobRecord]:
        return dict(self._records)


__all__ = ["BlobStorageStub", "BlobRecord"]
