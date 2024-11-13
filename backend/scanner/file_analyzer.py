import filetype
import math
from typing import List, Dict
import os
import hashlib
from .rules import RuleEngine

class FileAnalyzer:
    def __init__(self):
        self.rule_engine = RuleEngine()
        self.high_risk_types = {
            # Executable files
            'application/x-executable',
            'application/x-dosexec',
            'application/x-sharedlib',
            'application/x-msdownload',
            'application/x-mach-binary',
            'application/vnd.microsoft.portable-executable',
            # Script files
            'application/x-python',
            'application/x-javascript',
            'application/x-php',
            'text/x-php',
            'application/x-perl',
            'application/x-ruby',
            # Macro-enabled documents
            'application/vnd.ms-office',
            'application/vnd.openxmlformats-officedocument',
            # Archive files
            'application/x-rar',
            'application/zip',
            'application/x-7z-compressed',
            'application/java-archive',
            # Other risky types
            'application/x-shellscript',
            'application/x-bat',
            'application/x-com'
        }
    
    def calculate_hashes(self, file_path: str) -> Dict[str, str]:
        """Calculate MD5, SHA1, and SHA256 hashes of the file."""
        md5 = hashlib.md5()
        sha1 = hashlib.sha1()
        sha256 = hashlib.sha256()
        
        with open(file_path, 'rb') as f:
            while chunk := f.read(8192):
                md5.update(chunk)
                sha1.update(chunk)
                sha256.update(chunk)
        
        return {
            'md5': md5.hexdigest(),
            'sha1': sha1.hexdigest(),
            'sha256': sha256.hexdigest()
        }
    
    def check_file_entropy(self, file_path: str) -> float:
        """Calculate Shannon entropy to detect potential encryption/packing."""
        with open(file_path, 'rb') as f:
            data = f.read()
        
        if not data:
            return 0.0
        
        entropy = 0
        size = len(data)
        
        # Count byte frequencies
        byte_counts = {}
        for byte in data:
            byte_counts[byte] = byte_counts.get(byte, 0) + 1
        
        # Calculate entropy
        for count in byte_counts.values():
            p_x = count / size
            entropy += -p_x * math.log2(p_x)
        
        return entropy
    
    def analyze_file(self, file_path: str) -> Dict[str, any]:
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")
        
        try:
            # Get file type using filetype
            kind = filetype.guess(file_path)
            mime_type = kind.mime if kind else 'application/octet-stream'
            
            # Basic file info
            file_size = os.path.getsize(file_path)
            file_hashes = self.calculate_hashes(file_path)
            entropy = self.check_file_entropy(file_path)
            
            # YARA rule matching
            yara_matches = self.rule_engine.scan_file(file_path)
            
            threats = []
            risk_level = "low"
            
            # Check file type risk
            if mime_type in self.high_risk_types:
                threats.append(f"High-risk file type detected: {mime_type}")
                risk_level = "high"
            
            # Check file entropy (possible encryption/packing)
            if entropy > 7.0:  # High entropy threshold
                threats.append("High entropy detected: possible encryption or packing")
                risk_level = "high"
            
            # Add YARA matches
            for match in yara_matches:
                threats.append(f"Pattern match: {match}")
                if risk_level == "low":
                    risk_level = "medium"
            
            # Prepare detailed analysis results
            return {
                "mime_type": mime_type,
                "file_size": file_size,
                "hashes": file_hashes,
                "entropy": entropy,
                "threats": threats,
                "is_malicious": len(threats) > 0,
                "risk_level": risk_level,
                "detection_time": os.path.getmtime(file_path),
                "yara_matches": yara_matches
            }
        except Exception as e:
            return {
                "mime_type": "unknown",
                "file_size": os.path.getsize(file_path),
                "hashes": self.calculate_hashes(file_path),
                "entropy": 0.0,
                "threats": [f"Error analyzing file: {str(e)}"],
                "is_malicious": False,
                "risk_level": "unknown",
                "detection_time": os.path.getmtime(file_path),
                "yara_matches": []
            }