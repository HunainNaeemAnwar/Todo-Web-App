#!/usr/bin/env python3
"""Todo Console App - CLI wrapper script."""

import sys
import os

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "src"))

from cli.cli_app import main as cli_main

if __name__ == "__main__":
    cli_main()
