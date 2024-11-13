import aiosqlite
from datetime import datetime
import json
from typing import Dict, Optional

class ScanDatabase:
    def __init__(self, db_path: str = "scans.db"):
        self.db_path = db_path
    
    async def init_db(self):
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute("""
                CREATE TABLE IF NOT EXISTS scans (
                    id TEXT PRIMARY KEY,
                    filename TEXT,
                    status TEXT,
                    threats TEXT,
                    scan_results TEXT,
                    timestamp TEXT
                )
            """)
            await db.commit()
    
    async def create_scan(self, scan_id: str, filename: str) -> None:
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute(
                """INSERT INTO scans (id, filename, status, threats, scan_results, timestamp)
                   VALUES (?, ?, ?, ?, ?, ?)""",
                (scan_id, filename, "scanning", "[]", "{}", datetime.now().isoformat())
            )
            await db.commit()
    
    async def update_scan_results(self, scan_id: str, results: Dict) -> None:
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute(
                """UPDATE scans 
                   SET status = ?, threats = ?, scan_results = ?, timestamp = ?
                   WHERE id = ?""",
                ("complete", 
                 json.dumps(results.get("threats", [])),
                 json.dumps(results),
                 datetime.now().isoformat(),
                 scan_id)
            )
            await db.commit()
    
    async def get_scan_results(self, scan_id: str) -> Optional[Dict]:
        async with aiosqlite.connect(self.db_path) as db:
            async with db.execute(
                "SELECT status, threats, scan_results FROM scans WHERE id = ?",
                (scan_id,)
            ) as cursor:
                result = await cursor.fetchone()
                
                if not result:
                    return None
                
                status, threats, scan_results = result
                return {
                    "status": status,
                    "results": {
                        **json.loads(scan_results),
                        "threats_found": json.loads(threats),
                    }
                }