#!/usr/bin/env python3
"""
FastAPI Backend Run Script

This script provides a convenient way to run the FastAPI backend server
with various configuration options.
"""

import argparse
import os
import subprocess
import sys
from pathlib import Path


def main():
    parser = argparse.ArgumentParser(description="Run the FastAPI backend server")
    parser.add_argument(
        "--host",
        default="127.0.0.1",
        help="Host to bind to (default: 127.0.0.1)"
    )
    parser.add_argument(
        "--port",
        type=int,
        default=8000,
        help="Port to run the server on (default: 8000)"
    )
    parser.add_argument(
        "--reload",
        action="store_true",
        help="Enable auto-reload on code changes"
    )
    parser.add_argument(
        "--workers",
        type=int,
        help="Number of worker processes (default: 1, reload mode forces 1 worker)"
    )
    parser.add_argument(
        "--log-level",
        choices=["debug", "info", "warning", "error", "critical"],
        default="info",
        help="Log level (default: info)"
    )
    parser.add_argument(
        "--check-env",
        action="store_true",
        help="Check if required environment variables are set"
    )

    args = parser.parse_args()

    # Check if we're in the right directory
    backend_dir = Path(__file__).parent
    os.chdir(backend_dir)

    # Check environment variables if requested
    if args.check_env:
        required_vars = ["BETTER_AUTH_SECRET", "NEON_DATABASE_URL"]
        missing_vars = []

        for var in required_vars:
            if not os.getenv(var):
                if (backend_dir / ".env").exists():
                    # Try loading from .env file
                    import dotenv
                    dotenv.load_dotenv()

                    if not os.getenv(var):
                        missing_vars.append(var)
                else:
                    missing_vars.append(var)

        if missing_vars:
            print(f"❌ Missing required environment variables: {', '.join(missing_vars)}")
            print("Please set them in your .env file or environment")
            sys.exit(1)

        print("✅ All required environment variables are set")

    # Build the uvicorn command
    cmd = [
        "uvicorn",
        "src.api.main:app",
        f"--host={args.host}",
        f"--port={args.port}",
        f"--log-level={args.log_level}"
    ]

    if args.reload:
        cmd.append("--reload")

    if args.workers and not args.reload:
        cmd.extend(["--workers", str(args.workers)])

    print(f"🚀 Starting FastAPI server on {args.host}:{args.port}")
    if args.reload:
        print("🔄 Auto-reload enabled")

    try:
        subprocess.run(cmd, check=True)
    except subprocess.CalledProcessError as e:
        print(f"❌ Server exited with error: {e}")
        sys.exit(e.returncode)
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
        sys.exit(0)


if __name__ == "__main__":
    main()