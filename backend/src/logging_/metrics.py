from opentelemetry import metrics
from opentelemetry.metrics import Counter, Histogram
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.sdk.metrics.export import PeriodicExportingMetricReader
from opentelemetry.exporter.otlp.proto.grpc.metric_exporter import OTLPMetricExporter

# Set up meter provider
metric_reader = PeriodicExportingMetricReader(
    OTLPMetricExporter(endpoint="http://localhost:4317", insecure=True)
)
meter_provider = MeterProvider(metric_readers=[metric_reader])
metrics.set_meter_provider(meter_provider)

# Get meter
meter = metrics.get_meter(__name__)

# Create metrics
request_counter = meter.create_counter(
    name="http_requests_total",
    description="Total number of HTTP requests",
    unit="requests"
)

request_duration_histogram = meter.create_histogram(
    name="http_request_duration_seconds",
    description="Duration of HTTP requests",
    unit="seconds"
)

error_counter = meter.create_counter(
    name="http_errors_total",
    description="Total number of HTTP errors",
    unit="errors"
)

def record_request(method: str, path: str, status_code: int, duration: float):
    """Record an HTTP request metric"""
    request_counter.add(
        1,
        attributes={
            "http.method": method,
            "http.route": path,
            "http.status_code": status_code
        }
    )

    request_duration_histogram.record(
        duration,
        attributes={
            "http.method": method,
            "http.route": path,
            "http.status_code": status_code
        }
    )

    if status_code >= 400:
        error_counter.add(
            1,
            attributes={
                "http.method": method,
                "http.route": path,
                "http.status_code": status_code
            }
        )