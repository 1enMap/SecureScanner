from typing import List
import yara

YARA_RULES = """
// Common malware patterns
rule suspicious_executable {
    strings:
        $mz_header = { 4D 5A }  // PE/DOS MZ header
        $elf_header = { 7F 45 4C 46 } // ELF header
        $script_header = { 23 21 } // Shebang (#!)
        $pdf_header = { 25 50 44 46 } // PDF header
    condition:
        $mz_header at 0 or
        $elf_header at 0 or
        $script_header at 0 or
        $pdf_header at 0
}

rule suspicious_script_content {
    strings:
        // Shell command execution
        $shell1 = "shell_exec" fullword
        $shell2 = "exec(" nocase
        $shell3 = "system(" nocase
        $shell4 = "popen(" nocase
        
        // Code execution
        $exec1 = "eval(" nocase
        $exec2 = "execute(" nocase
        $exec3 = "assert(" nocase
        
        // File operations
        $file1 = "file_get_contents" fullword
        $file2 = "fopen(" nocase
        $file3 = "readfile(" nocase
        
        // Network operations
        $net1 = "curl_exec(" nocase
        $net2 = "fsockopen(" nocase
        $net3 = "socket(" nocase
        
        // Encoding/Decoding
        $enc1 = "base64_decode(" nocase
        $enc2 = "str_rot13(" nocase
        $enc3 = "gzinflate(" nocase
        $enc4 = "gzuncompress(" nocase
    condition:
        3 of them
}

rule ransomware_patterns {
    strings:
        $ransom1 = "Your files have been encrypted" nocase wide ascii
        $ransom2 = "bitcoin" nocase wide ascii
        $ransom3 = "decrypt" nocase wide ascii
        $ransom4 = "payment" nocase wide ascii
        $ransom5 = "wallet" nocase wide ascii
    condition:
        3 of them
}

rule malicious_urls {
    strings:
        $url1 = /https?:\/\/[^\s\/$.?#].[^\s]*\.onion\b/ wide ascii
        $url2 = /https?:\/\/[^\s\/$.?#].[^\s]*\.ru\b/ wide ascii
        $url3 = /https?:\/\/[^\s\/$.?#].[^\s]*\.cn\b/ wide ascii
        $url4 = /(bitcoin|monero|ethereum)[a-zA-Z0-9]{25,45}/ wide ascii
    condition:
        any of them
}

rule suspicious_powershell {
    strings:
        $enc_cmd = "-enc" nocase
        $hidden = "-w hidden" nocase
        $noninteractive = "-noninteractive" nocase
        $bypass = "bypass" nocase
        $downloadstring = "downloadstring" nocase
        $webclient = "net.webclient" nocase
        $invoke_expression = "iex" nocase
    condition:
        3 of them
}

rule potential_backdoor {
    strings:
        $php_shell = "<?php" nocase
        $asp_shell = "<%@ Page" nocase
        $jsp_shell = "<%@ page" nocase
        $cmd_exec = "cmd" nocase
        $remote_shell = "shell" nocase
        $upload_func = "upload" nocase
        $connect_back = "connect" nocase
    condition:
        ($php_shell or $asp_shell or $jsp_shell) and
        2 of ($cmd_exec, $remote_shell, $upload_func, $connect_back)
}
"""

class RuleEngine:
    def __init__(self):
        self.rules = yara.compile(source=YARA_RULES)
    
    def scan_file(self, file_path: str) -> List[str]:
        matches = self.rules.match(file_path)
        return [match.rule for match in matches]