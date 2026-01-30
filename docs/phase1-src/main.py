"""Main entry point for Todo Console App."""

import sys
import os

# Add src to path so we can import from sibling packages
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from cli.cli_app import main as cli_main

if __name__ == "__main__":
    cli_main()
