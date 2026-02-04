# HEADY_BRAND:BEGIN
# HEADY SYSTEMS :: SACRED GEOMETRY
# FILE: apps/heady-academy/Tools/Heady_Chaos.py
# LAYER: root
# 
#         _   _  _____    _    ____   __   __
#        | | | || ____|  / \  |  _ \ \ \ / /
#        | |_| ||  _|   / _ \ | | | | \ V / 
#        |  _  || |___ / ___ \| |_| |  | |  
#        |_| |_||_____/_/   \_\____/   |_|  
# 
#    Sacred Geometry :: Organic Systems :: Breathing Interfaces
# HEADY_BRAND:END

"""
HeadyChaos - The Entropy Engine & Pattern Recognizer
"Breaking down the data dump of life into tiny little pieces that form a whole puzzle."

Role: Analyzes system entropy, identifies patterns, and simulates 'chemical' interactions 
between system components to ensure resilience against randomness.
"""

import os
import sys
import math
import time
import random
import logging
import argparse
from pathlib import Path
from collections import Counter

# Logging Setup
logging.basicConfig(level=logging.INFO, format='[CHAOS] %(message)s')
logger = logging.getLogger("HeadyChaos")

class HeadyChaos:
    def __init__(self, workspace=None):
        self.workspace = Path(workspace) if workspace else Path.cwd()
        self.entropy_report = {}
        
    def calculate_shannon_entropy(self, data):
        """Calculate Shannon entropy of a string/byte sequence."""
        if not data:
            return 0
        entropy = 0
        for x in Counter(data).values():
            p_x = x / len(data)
            entropy -= p_x * math.log2(p_x)
        return entropy

    def measure_file_entropy(self, file_path):
        """Measure entropy of a specific file."""
        try:
            with open(file_path, 'rb') as f:
                data = f.read()
                return self.calculate_shannon_entropy(data)
        except Exception as e:
            logger.warning(f"Could not read {file_path}: {e}")
            return 0

    def scan_workspace_entropy(self):
        """Scan workspace to build an entropy map."""
        logger.info(f"Scanning entropy in: {self.workspace}")
        results = []
        
        # Walk through interesting files (code, configs, md)
        extensions = {'.py', '.js', '.ts', '.ps1', '.md', '.json', '.yaml', '.yml'}
        
        for root, dirs, files in os.walk(self.workspace):
            # Skip common noise dirs
            if any(x in root for x in ['node_modules', '.git', '__pycache__', 'venv']):
                continue
                
            for file in files:
                file_path = Path(root) / file
                if file_path.suffix in extensions:
                    entropy = self.measure_file_entropy(file_path)
                    size = file_path.stat().st_size
                    results.append({
                        'path': str(file_path.relative_to(self.workspace)),
                        'entropy': entropy,
                        'size': size
                    })
        
        # Sort by entropy descending
        results.sort(key=lambda x: x['entropy'], reverse=True)
        self.entropy_report = results
        return results

    def analyze_patterns(self):
        """Recognize fundamental patterns (duplication, structural similarity)."""
        logger.info("Analyzing fundamental patterns (Chemistry Model)...")
        # Simple pattern: High entropy + High size = Potential Complexity/Chaos center
        # "Chemistry": Interaction between high entropy nodes
        
        chaos_nodes = [r for r in self.entropy_report if r['entropy'] > 5.5 and r['size'] > 1000]
        
        logger.info(f"Found {len(chaos_nodes)} High-Entropy Nodes (Chaos Centers)")
        for node in chaos_nodes[:5]:
            logger.info(f"  - {node['path']} (Entropy: {node['entropy']:.2f})")
            
        return chaos_nodes

    def simulate_interactions(self):
        """Simulate deterministic interactions between components."""
        # "Defining models that seem deterministic"
        logger.info("Simulating chemical interactions between nodes...")
        
        if not self.entropy_report:
            return
            
        # Select two random nodes to 'react'
        node_a = random.choice(self.entropy_report)
        node_b = random.choice(self.entropy_report)
        
        interaction_potential = (node_a['entropy'] + node_b['entropy']) / 2
        
        logger.info(f"Interaction: {node_a['path']} + {node_b['path']}")
        logger.info(f"Resulting Interaction Potential: {interaction_potential:.2f}")
        
        if interaction_potential > 6.0:
            logger.warning("  -> UNSTABLE REACTION DETECTED (High Complexity)")
        else:
            logger.info("  -> Stable Bond")

    def run(self):
        """Main execution flow."""
        print(f"[CHAOS] Initiating Entropy Awareness Protocol...")
        print(f"[CHAOS] Target: {self.workspace}")
        
        entropy_map = self.scan_workspace_entropy()
        avg_entropy = sum(r['entropy'] for r in entropy_map) / len(entropy_map) if entropy_map else 0
        
        print(f"[CHAOS] System Average Entropy: {avg_entropy:.4f}")
        
        self.analyze_patterns()
        self.simulate_interactions()
        
        # Deterministic conclusion
        status = "STABLE" if avg_entropy < 5.8 else "VOLATILE"
        print(f"[CHAOS] System State: {status}")

def main():
    parser = argparse.ArgumentParser(description="HeadyChaos Entropy Engine")
    parser.add_argument("--target", help="Target directory to scan", default=".")
    args = parser.parse_args()
    
    chaos = HeadyChaos(args.target)
    chaos.run()

if __name__ == "__main__":
    main()
