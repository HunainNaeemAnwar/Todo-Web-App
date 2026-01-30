from typing import Callable, Optional, Any
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
import time
import structlog
import os

logger = structlog.get_logger(__name__)

class ObservabilityMiddleware(BaseHTTPMiddleware):
    """Middleware to add observability metrics and tracing to requests"""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        start_time = time.time()
        client_ip = request.client.host if request.client else None
        
        try:
            response = await call_next(request)

            logger.info(
                event="request_processed",
                method=request.method,
                path=str(request.url.path),
                status_code=response.status_code,
                duration=time.time() - start_time,
                client_ip=client_ip
            )

            return response
        except Exception as e:
            logger.error(
                event="request_error",
                method=request.method,
                path=str(request.url.path),
                error=str(e),
                duration=time.time() - start_time,
                client_ip=client_ip
            )

            raise

def _setup_telemetry():
    """Setup OpenTelemetry if available"""
    try:
        from opentelemetry import trace  # type: ignore
        from opentelemetry.sdk.trace import TracerProvider  # type: ignore
        from opentelemetry.sdk.trace.export import BatchSpanProcessor  # type: ignore
        from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter  # type: ignore
        
        trace.set_tracer_provider(TracerProvider())
        
        otlp_exporter = OTLPSpanExporter(
            endpoint=os.getenv("OTEL_EXPORTER_OTLP_ENDPOINT", "http://localhost:4317"),
            insecure=os.getenv("OTEL_EXPORTER_OTLP_INSECURE", "true").lower() == "true"
        )
        span_processor = BatchSpanProcessor(otlp_exporter)
        trace.get_tracer_provider().add_span_processor(span_processor)  # type: ignore
    except ImportError:
        pass

if os.getenv("TESTING", "").lower() != "true":
    _setup_telemetry()
