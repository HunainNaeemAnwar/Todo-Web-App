"""
Startup Configuration Module

Handles environment configuration before application startup to prevent:
- OpenAI tracing conflicts when using Gemini API
- Module import warnings
- Proper environment variable setup
"""

import os
import warnings


def configure_environment():
    """
    Configure environment variables and settings before application startup.
    """
    # Disable OpenAI tracing to prevent API key conflicts when using Gemini
    os.environ["TRACELOOP_TRACING_ENABLED"] = "false"
    os.environ["OPENAI_LOG"] = "none"

    # Additional environment variables that might trigger tracing
    os.environ["TRACELOOP_SDK_AUTO_CREATED"] = "false"

    # Suppress specific import warnings that occur during MCP server operation
    warnings.filterwarnings("ignore", message=".*found in sys.modules after import.*")

    # Set proper logging for MCP servers
    if os.getenv("RUNNING_AS_MCP_SERVER", "false").lower() == "true":
        os.environ["LOGGING_SUPPRESS_STDOUT"] = "true"

    print("Environment configured: OpenAI tracing disabled, warnings suppressed")


def setup_tracing_if_enabled():
    """
    Conditionally setup tracing if explicitly enabled and using OpenAI.
    This is used when we want to enable tracing for OpenAI models specifically.
    """
    enable_tracing = os.getenv("ENABLE_OPENAI_TRACING", "false").lower() == "true"
    use_openai = os.getenv("USE_OPENAI_MODEL", "false").lower() == "true"

    if enable_tracing and use_openai:
        # Only enable tracing when explicitly using OpenAI (not Gemini)
        if "TRACELOOP_TRACING_ENABLED" in os.environ:
            del os.environ["TRACELOOP_TRACING_ENABLED"]
        if "OPENAI_LOG" in os.environ:
            del os.environ["OPENAI_LOG"]

        # Initialize tracing if OpenAI API key is available
        if os.getenv("OPENAI_API_KEY"):
            try:
                from traceloop.sdk import Traceloop  # type: ignore[import-not-found]

                Traceloop.init()
                print("OpenAI tracing enabled")
            except ImportError:
                print("Traceloop SDK not available, skipping tracing initialization")
        else:
            print("OpenAI API key not available, tracing remains disabled")
    else:
        # Ensure tracing remains disabled for Gemini
        os.environ["TRACELOOP_TRACING_ENABLED"] = "false"
        os.environ["OPENAI_LOG"] = "none"


if __name__ == "__main__":
    configure_environment()
    setup_tracing_if_enabled()
