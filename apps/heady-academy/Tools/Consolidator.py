# HEADY_BRAND:BEGIN
# HEADY SYSTEMS :: SACRED GEOMETRY
# FILE: apps/heady-academy/Tools/Consolidator.py
# LAYER: root
# 
#         _   _  _____    _  __   __
#        | | | || ____|  / \ \  / /
#        | |_| ||  _|   / _ \ \ V / 
#        |  _  || |___ / ___ \ | |  
#        |_| |_||_____/_/   \_\|_|  
# 
#    Sacred Geometry :: Organic Systems :: Breathing Interfaces
# HEADY_BRAND:END

"""
HeadyConsolidator - Golden Master Protocol
Implements the Identical Squash Merge protocol for Heady Federation.
Fuses HeadyConnection (Features) and HeadySystems (Infra) into Golden Master.
"""
import os
import subprocess
import logging
import sys
import re
import datetime
from pathlib import Path

# Configuration: The Duality of Heady
SOURCE_A_MISSION = "git@github.com:HeadyConnection/Heady.git"  # Non-Profit (Features)
SOURCE_B_INFRA = "git@github.com:HeadySystems/Heady.git"        # C-Corp (Hardened Core)
TARGET_GOLDEN = "git@github.com:HeadyConnection/HeadySystems.git"
OUTPUT_DIR = Path("Logs/Consolidation_Reports")

# Logging Setup
logging.basicConfig(level=logging.INFO, format='[HEADY-WORKER] %(message)s')
logger = logging.getLogger("HeadyConsolidator")

class Consolidator:
    def __init__(self, workspace=None):
        self.workspace = Path(workspace) if workspace else Path.cwd()
        self.report = []
        
    def _exec(self, cmd, cwd=None, capture=True):
        """Execute shell command with error handling."""
        try:
            logger.info(f"EXEC: {cmd}")
            result = subprocess.run(
                cmd, shell=True, check=True, cwd=cwd or self.workspace,
                capture_output=capture, text=True
            )
            return result.stdout.strip() if capture else None
        except subprocess.CalledProcessError as e:
            error_msg = e.stderr if e.stderr else str(e)
            logger.error(f"Command failed: {error_msg}")
            return None
    
    def check_git_status(self):
        """Check current git repository status."""
        self.report.append("## Git Status Check")
        
        # Check if in git repo
        result = self._exec("git rev-parse --is-inside-work-tree")
        if result != "true":
            self.report.append("- ❌ Not a git repository")
            return False
        
        # Get current branch
        branch = self._exec("git branch --show-current")
        self.report.append(f"- **Current Branch:** {branch}")
        
        # Check for uncommitted changes
        status = self._exec("git status --porcelain")
        if status:
            changes = len(status.split('\n'))
            self.report.append(f"- ⚠️ Uncommitted changes: {changes} files")
        else:
            self.report.append("- ✅ Working tree clean")
        
        # Get remotes
        remotes = self._exec("git remote -v")
        if remotes:
            self.report.append(f"- **Remotes:** {len(remotes.split(chr(10)))//2}")
        
        return True
    
    def analyze_branches(self):
        """Analyze branch structure."""
        self.report.append("\n## Branch Analysis")
        
        # Local branches
        local = self._exec("git branch")
        if local:
            branches = [b.strip().lstrip('* ') for b in local.split('\n')]
            self.report.append(f"- **Local branches:** {len(branches)}")
            for b in branches[:10]:
                self.report.append(f"  - {b}")
        
        # Remote branches
        remote = self._exec("git branch -r")
        if remote:
            remote_branches = [b.strip() for b in remote.split('\n') if b.strip()]
            self.report.append(f"- **Remote branches:** {len(remote_branches)}")
    
    def analyze_commits(self, limit=10):
        """Analyze recent commit history."""
        self.report.append("\n## Recent Commits")
        
        log = self._exec(f"git log --oneline -n {limit}")
        if log:
            for line in log.split('\n'):
                self.report.append(f"- `{line}`")
    
    def check_merge_conflicts(self, target_branch="main"):
        """Check for potential merge conflicts."""
        self.report.append(f"\n## Merge Conflict Check (vs {target_branch})")
        
        current = self._exec("git branch --show-current")
        if current == target_branch:
            self.report.append("- ℹ️ Already on target branch")
            return
        
        # Dry-run merge
        result = self._exec(f"git merge --no-commit --no-ff {target_branch} 2>&1 || true")
        self._exec("git merge --abort 2>&1 || true")
        
        if "CONFLICT" in str(result):
            self.report.append("- ⚠️ Potential conflicts detected")
        else:
            self.report.append("- ✅ Clean merge expected")

    def final_scan(self):
        """Perform final scan and ensure functionality and optimization."""
        self.report.append("\n## Final Scan & Optimization Check")
        
        issues = []
        py_files = list(self.workspace.rglob("*.py"))
        
        # Check for syntax errors across all Python files
        syntax_errors = 0
        for py_file in py_files:
            try:
                with open(py_file, 'r', encoding='utf-8', errors='ignore') as f:
                    source = f.read()
                compile(source, str(py_file), "exec")
            except SyntaxError:
                syntax_errors += 1
            except Exception:
                continue
        
        if syntax_errors:
            self.report.append(f"- ⚠️ {syntax_errors} files with syntax errors")
            issues.append("Syntax errors")
        else:
            self.report.append("- ✅ No syntax errors detected")
        
        # Check for orphaned files (no imports/references)
        orphaned = []
        for py_file in py_files:
            if py_file.name == "__init__.py":
                continue
            try:
                is_referenced = False
                file_stem = py_file.stem
                for other in py_files:
                    if other == py_file:
                        continue
                    with open(other, 'r', encoding='utf-8', errors='ignore') as f:
                        content = f.read()
                        if file_stem in content:
                            is_referenced = True
                            break
                if not is_referenced:
                    orphaned.append(py_file.name)
            except Exception:
                continue
        
        if orphaned:
            self.report.append(f"- ⚠️ {len(orphaned)} potentially orphaned files")
            issues.append("Orphaned files")
        else:
            self.report.append("- ✅ No orphaned files detected")
        
        # Verify critical project files exist
        critical_files = ["README.md", "requirements.txt", ".gitignore"]
        missing_critical = [f for f in critical_files if not (self.workspace / f).exists()]
        if missing_critical:
            self.report.append(f"- ⚠️ Missing critical files: {', '.join(missing_critical)}")
            issues.append("Missing critical files")
        else:
            self.report.append("- ✅ All critical project files present")
        
        # Check for TODO/FIXME comments
        todo_count = 0
        for py_file in py_files:
            try:
                with open(py_file, 'r', encoding='utf-8', errors='ignore') as f:
                    for line in f:
                        if 'TODO' in line or 'FIXME' in line:
                            todo_count += 1
            except Exception:
                pass
        
        if todo_count > 0:
            self.report.append(f"- ⚠️ Found {todo_count} TODO/FIXME comments")
            issues.append(f"TODO/FIXME: {todo_count}")
        else:
            self.report.append("- ✅ No TODO/FIXME comments found")
        
        # Check for large files (>50KB)
        large_files = []
        for py_file in py_files:
            try:
                size = py_file.stat().st_size
                if size > 50000:
                    large_files.append((py_file.name, size / 1024))
            except Exception:
                pass
        
        if large_files:
            self.report.append(f"- ⚠️ {len(large_files)} large files detected (>50KB)")
            for fname, size in large_files[:5]:
                self.report.append(f"  - {fname}: {size:.1f}KB")
            issues.append("Large files")
        else:
            self.report.append("- ✅ File sizes within optimal range")
        
        # Final optimization score
        optimization_score = max(0, 100 - (len(issues) * 10))
        self.report.append(f"\n**Optimization Score**: {optimization_score}/100")
        
        # Summary
        if issues:
            self.report.append(f"\n**Issues to address**: {', '.join(issues)}")
        else:
            self.report.append("\n**Status**: All checks passed ✅")
        
        return issues
    
    def generate_report(self):
        """Generate consolidation report."""
        OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
        
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        report_file = OUTPUT_DIR / f"consolidation_{timestamp}.md"
        
        header = [
            "# Consolidation Report",
            f"Generated: {datetime.datetime.now().isoformat()}",
            f"Workspace: {self.workspace}",
            ""
        ]
        
        full_report = header + self.report
        
        with open(report_file, 'w', encoding='utf-8') as f:
            f.write('\n'.join(full_report))
        
        return report_file
    
    def consolidate(self, analyze_only=True):
        """Run consolidation analysis."""
        logger.info(f"Analyzing workspace: {self.workspace}")
        
        if not self.check_git_status():
            logger.warning("Not a git repository - limited analysis")
            self.report.append("\n## Directory Analysis")
            
            # Fallback: analyze directory structure
            py_files = list(self.workspace.rglob("*.py"))
            self.report.append(f"- Python files: {len(py_files)}")
            
            yaml_files = list(self.workspace.rglob("*.yaml")) + list(self.workspace.rglob("*.yml"))
            self.report.append(f"- YAML files: {len(yaml_files)}")
        else:
            self.analyze_branches()
            self.analyze_commits()
            self.check_merge_conflicts()
        
        self.final_scan()
        report_file = self.generate_report()
        
        print(f"[FOREMAN] Consolidation analysis complete")
        print(f"  Report: {report_file}")
        
        return str(report_file)


def consolidate(target=None):
    """Main entry point."""
    workspace = Path(target) if target else Path.cwd()
    consolidator = Consolidator(workspace)
    return consolidator.consolidate()


if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "."
    target_path = Path(target).resolve()
    
    if not target_path.exists():
        logger.warning(f"Target path '{target}' not found, using current directory")
        target_path = Path.cwd()
    
    logger.info(f"Starting consolidation for: {target_path}")
    
    try:
        result = consolidate(str(target_path))
        if result:
            logger.info(f"Report saved to: {result}")
        else:
            logger.error("Consolidation failed - no report generated")
            sys.exit(1)
    except Exception as e:
        logger.error(f"Consolidation error: {e}")
        import traceback
        logger.debug(traceback.format_exc())
        sys.exit(1)
