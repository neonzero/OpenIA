"""Lightweight S3 client stub for local development.

This module mimics a subset of boto3's S3 client interface so the
application can be exercised without requiring AWS credentials. The
implementation keeps uploaded files in a local directory and records
metadata for inspection during tests.
"""

from __future__ import annotations

import json
import pathlib
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import Dict, Optional


@dataclass
class S3Object:
    """Representation of an object tracked by the stub."""

    bucket: str
    key: str
    path: pathlib.Path
    content_type: Optional[str] = None
    size_bytes: int = 0
    metadata: Dict[str, str] = field(default_factory=dict)
    uploaded_at: datetime = field(default_factory=datetime.utcnow)


class S3StubClient:
    """Tiny S3 client that operates on the local filesystem."""

    def __init__(self, storage_dir: pathlib.Path):
        self._storage_dir = storage_dir
        self._storage_dir.mkdir(parents=True, exist_ok=True)
        self._objects: Dict[str, S3Object] = {}

    def _object_id(self, bucket: str, key: str) -> str:
        return f"{bucket}:{key}"

    def upload_file(self, filename: str, bucket: str, key: str, ExtraArgs: Optional[Dict[str, str]] = None) -> None:  # noqa: N803 (match boto3 casing)
        """Store a file in the stub's local directory."""

        file_path = pathlib.Path(filename)
        if not file_path.exists():
            raise FileNotFoundError(filename)

        target_dir = self._storage_dir / bucket
        target_dir.mkdir(parents=True, exist_ok=True)
        target_path = target_dir / key
        target_path.parent.mkdir(parents=True, exist_ok=True)
        target_path.write_bytes(file_path.read_bytes())

        metadata = ExtraArgs or {}
        obj = S3Object(
            bucket=bucket,
            key=key,
            path=target_path,
            content_type=metadata.get("ContentType"),
            size_bytes=target_path.stat().st_size,
            metadata={k: v for k, v in metadata.items() if k != "ContentType"},
        )
        self._objects[self._object_id(bucket, key)] = obj

    def download_file(self, bucket: str, key: str, filename: str) -> None:
        """Write the stored object to the requested file path."""

        obj = self._objects.get(self._object_id(bucket, key))
        if not obj:
            raise FileNotFoundError(f"{bucket}/{key}")

        target_path = pathlib.Path(filename)
        target_path.parent.mkdir(parents=True, exist_ok=True)
        target_path.write_bytes(obj.path.read_bytes())

    def delete_object(self, bucket: str, key: str) -> None:
        """Remove the object if it exists."""

        identifier = self._object_id(bucket, key)
        obj = self._objects.pop(identifier, None)
        if obj and obj.path.exists():
            obj.path.unlink()

    def generate_presigned_url(self, bucket: str, key: str, expires_in: int = 3600) -> str:
        """Return a deterministic pseudo-URL for the object."""

        expiry = datetime.utcnow() + timedelta(seconds=expires_in)
        token = json.dumps({"bucket": bucket, "key": key, "expires_at": expiry.isoformat()})
        return f"https://example.com/s3/{bucket}/{key}?stub-token={token}"

    def list_objects(self) -> Dict[str, S3Object]:
        """Expose stored objects for assertions in tests."""

        return dict(self._objects)


__all__ = ["S3StubClient", "S3Object"]
