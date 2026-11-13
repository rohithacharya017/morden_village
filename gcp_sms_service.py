"""
=============================================================================
MODERN VILLAGE - GOOGLE CLOUD CCAI PLATFORM OUTBOUND SMS SERVICE
=============================================================================
Connects to Google Cloud Platform to send outbound SMS messages using
Application Default Credentials (ADC) and the Google Cloud Contact Center AI
(CCAI) Platform / Cloud Messaging API.

Features:
- Application Default Credentials (ADC) authentication via google-auth
- E.164 phone number normalization and validation
- Exponential backoff retry mechanism for rate limits (HTTP 429) & transient errors
- Diagnostic error reporting for missing IAM roles and permission issues (HTTP 401/403)
- Google Cloud Logging integration with structured JSON fallback
- Standalone CLI execution support (--phone, --message, --dry-run)
=============================================================================
"""

import os
import sys
import time
import json
import re
import logging
from typing import Dict, Any, Optional

# Load environment variables from .env if python-dotenv is present
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# Try importing Google Cloud SDK libraries
GOOGLE_AUTH_AVAILABLE = False
GOOGLE_LOGGING_AVAILABLE = False
REQUESTS_AVAILABLE = False

try:
    import google.auth
    from google.auth.transport.requests import Request
    from google.auth.exceptions import DefaultCredentialsError
    GOOGLE_AUTH_AVAILABLE = True
except ImportError:
    pass

try:
    import google.cloud.logging
    GOOGLE_LOGGING_AVAILABLE = True
except ImportError:
    pass

try:
    import requests
    REQUESTS_AVAILABLE = True
except ImportError:
    import urllib.request
    import urllib.error

# ===========================================================================
# CONFIGURATION & CONSTANTS
# ===========================================================================
DEFAULT_GCP_REGION = os.getenv("GCP_REGION", "us-central1")
DEFAULT_PROJECT_ID = os.getenv("GCP_PROJECT_ID", "")
CCAI_INSTANCE_ID = os.getenv("CCAI_INSTANCE_ID", "default-contact-center")
CCAI_SENDER_NUMBER = os.getenv("CCAI_SMS_SENDER_NUMBER", "")

# Required OAuth2 scope for Google Cloud Platform APIs
GCP_OAUTH_SCOPES = ["https://www.googleapis.com/auth/cloud-platform"]

# Retry settings for rate limiting (HTTP 429) & transient errors (HTTP 503)
MAX_RETRIES = 3
INITIAL_BACKOFF_SECONDS = 1.5
BACKOFF_MULTIPLIER = 2.0


# ===========================================================================
# 1. LOGGING SETUP (Google Cloud Logging with Structured Fallback)
# ===========================================================================
def setup_logger() -> logging.Logger:
    """
    Sets up Google Cloud Logging if google-cloud-logging is installed
    and valid GCP credentials are provided. Otherwise, falls back to
    standard Python logging with structured formatting.
    """
    logger = logging.getLogger("gcp_sms_service")
    logger.setLevel(logging.INFO)

    # Avoid duplicate handlers if already configured
    if logger.handlers:
        return logger

    if GOOGLE_LOGGING_AVAILABLE:
        try:
            client = google.cloud.logging.Client()
            client.setup_logging()
            logger.info("Initialized Google Cloud Logging (Cloud Logging API active)")
            return logger
        except Exception as e:
            # Fall back to standard stream logger if ADC or project is not yet configured
            pass

    # Standard Console Logger fallback
    handler = logging.StreamHandler(sys.stdout)
    formatter = logging.Formatter(
        '{"timestamp": "%(asctime)s", "severity": "%(levelname)s", "component": "gcp_sms_service", "message": "%(message)s"}',
        datefmt="%Y-%m-%dT%H:%M:%SZ"
    )
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    return logger


logger = setup_logger()


# ===========================================================================
# 2. AUTHENTICATION SETUP (Application Default Credentials - ADC)
# ===========================================================================
def get_adc_credentials() -> tuple[Any, str]:
    """
    Loads Google Cloud Application Default Credentials (ADC).
    Validates the active account and generates an authorized OAuth2 Bearer token.

    Returns:
        tuple (credentials, project_id)

    Raises:
        RuntimeError: If google-auth is not installed or ADC credentials cannot be determined.
    """
    if not GOOGLE_AUTH_AVAILABLE:
        raise RuntimeError(
            "google-auth library is not installed. Please install it using:\n"
            "pip install google-auth requests google-cloud-logging"
        )

    try:
        credentials, project_id = google.auth.default(scopes=GCP_OAUTH_SCOPES)
        resolved_project = project_id or DEFAULT_PROJECT_ID

        # Refresh token to verify authenticity and obtain active bearer token
        auth_req = Request()
        credentials.refresh(auth_req)

        logger.info(
            f"Successfully authenticated via Google Cloud ADC. Target Project ID: '{resolved_project}'"
        )
        return credentials, resolved_project

    except DefaultCredentialsError as e:
        error_msg = (
            "Could not automatically determine Google Cloud Application Default Credentials (ADC).\n"
            "To resolve this, please run:\n"
            "    gcloud auth application-default login\n"
            "Or set the GOOGLE_APPLICATION_CREDENTIALS environment variable:\n"
            "    export GOOGLE_APPLICATION_CREDENTIALS=\"/path/to/service-account-key.json\""
        )
        logger.error(error_msg)
        raise RuntimeError(error_msg) from e

    except Exception as e:
        logger.error(f"Unexpected error while refreshing ADC credentials: {str(e)}")
        raise


# ===========================================================================
# 3. PHONE NUMBER NORMALIZATION
# ===========================================================================
def normalize_phone_e164(phone: str, default_country_code: str = "+91") -> str:
    """
    Normalizes a recipient phone number into E.164 international format (e.g. +919876543210).
    Removes spaces, dashes, parentheses, and prefixes country code if missing.
    """
    if not phone:
        raise ValueError("Recipient phone number cannot be empty.")

    cleaned = re.sub(r"[\s\-\(\)]", "", phone.strip())

    # If number starts with +, keep it
    if cleaned.startswith("+"):
        digits_only = cleaned[1:]
        if not digits_only.isdigit() or len(digits_only) < 7 or len(digits_only) > 15:
            raise ValueError(f"Invalid international phone number format: '{phone}'")
        return cleaned

    # If 10-digit Indian mobile number
    if len(cleaned) == 10 and cleaned.isdigit():
        return f"{default_country_code}{cleaned}"

    # If 11-digit starting with 0
    if len(cleaned) == 11 and cleaned.startswith("0") and cleaned[1:].isdigit():
        return f"{default_country_code}{cleaned[1:]}"

    # If already prefixed with 91 but missing '+'
    if cleaned.startswith("91") and len(cleaned) == 12 and cleaned.isdigit():
        return f"+{cleaned}"

    raise ValueError(
        f"Phone number '{phone}' cannot be formatted to E.164. "
        "Please provide an international number with country code (e.g. +919876543210)."
    )


# ===========================================================================
# 4. SEND GCP SMS FUNCTION
# ===========================================================================
def send_gcp_sms(
    recipient_phone: str,
    message_text: str,
    project_id: Optional[str] = None,
    region: Optional[str] = None,
    contact_center_id: Optional[str] = None,
    sender_number: Optional[str] = None,
    dry_run: bool = False
) -> Dict[str, Any]:
    """
    Connects to Google Cloud Platform to send an outbound SMS message
    using Google Cloud CCAI Platform / Cloud Messaging API and ADC authentication.

    Args:
        recipient_phone: Destination phone number in E.164 format (e.g. "+919876543210")
        message_text: Text content of the SMS message
        project_id: Optional GCP Project ID (defaults to ADC project or GCP_PROJECT_ID env var)
        region: Optional GCP region (defaults to GCP_REGION or "us-central1")
        contact_center_id: Optional CCAI Platform contact center ID
        sender_number: Optional authorized outbound sender phone number / shortcode
        dry_run: If True, validates authentication and payloads without dispatching HTTP network request

    Returns:
        dict: Standardized result with status, message_id, recipient, and diagnostic details

    Raises:
        ValueError: For invalid phone numbers or empty messages
        PermissionError: For missing GCP IAM permissions (HTTP 401/403)
        RuntimeError: For unrecoverable GCP API errors or exhausted rate limit retries
    """
    # Step A: Validate input parameters
    recipient_e164 = normalize_phone_e164(recipient_phone)

    trimmed_message = (message_text or "").strip()
    if not trimmed_message:
        raise ValueError("SMS message text cannot be empty.")

    logger.info(f"Initiating outbound GCP SMS request to '{recipient_e164}' ({len(trimmed_message)} chars)")

    # Step B: Authenticate via Application Default Credentials
    credentials, adc_project = get_adc_credentials()
    effective_project = project_id or adc_project or DEFAULT_PROJECT_ID

    if not effective_project:
        raise ValueError(
            "GCP Project ID could not be determined. "
            "Please pass project_id or set the GCP_PROJECT_ID environment variable."
        )

    effective_region = region or DEFAULT_GCP_REGION
    effective_ccai_id = contact_center_id or CCAI_INSTANCE_ID
    effective_sender = sender_number or CCAI_SENDER_NUMBER

    # Step C: Construct Google Cloud CCAI Platform REST endpoint & Payload
    # Google Cloud CCAI Platform SMS API endpoint format:
    # https://contactcenteraiplatform.googleapis.com/v1/projects/{project}/locations/{location}/contactCenters/{contactCenter}/messages:send
    endpoint_url = (
        f"https://contactcenteraiplatform.googleapis.com/v1/"
        f"projects/{effective_project}/locations/{effective_region}/"
        f"contactCenters/{effective_ccai_id}/messages:send"
    )

    request_payload = {
        "channel": "SMS",
        "recipient": {
            "phoneNumber": recipient_e164
        },
        "content": {
            "text": trimmed_message
        }
    }
    if effective_sender:
        request_payload["sender"] = {"phoneNumber": effective_sender}

    # Handle Dry-Run Mode
    if dry_run:
        logger.info("[DRY-RUN] Verification successful. ADC credentials valid. SMS payload generated.")
        return {
            "status": "dry_run_success",
            "message_id": f"dry-run-{int(time.time())}",
            "recipient": recipient_e164,
            "project_id": effective_project,
            "endpoint": endpoint_url,
            "payload": request_payload,
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        }

    # Step D: Dispatch request with Exponential Backoff Retry logic
    headers = {
        "Authorization": f"Bearer {credentials.token}",
        "Content-Type": "application/json; charset=utf-8",
        "X-Goog-User-Project": effective_project
    }

    attempt = 0
    current_backoff = INITIAL_BACKOFF_SECONDS

    while attempt < MAX_RETRIES:
        attempt += 1
        try:
            logger.info(f"Dispatching SMS attempt {attempt}/{MAX_RETRIES} to {endpoint_url}...")

            if REQUESTS_AVAILABLE:
                response = requests.post(
                    endpoint_url,
                    headers=headers,
                    json=request_payload,
                    timeout=15
                )
                status_code = response.status_code
                response_text = response.text
            else:
                # Fallback using standard urllib
                req_data = json.dumps(request_payload).encode("utf-8")
                url_req = urllib.request.Request(endpoint_url, data=req_data, headers=headers, method="POST")
                try:
                    with urllib.request.urlopen(url_req, timeout=15) as res:
                        status_code = res.status
                        response_text = res.read().decode("utf-8")
                except urllib.error.HTTPError as he:
                    status_code = he.code
                    response_text = he.read().decode("utf-8")

            # ---------------------------------------------------------------
            # 1. SUCCESS (HTTP 200 / 201)
            # ---------------------------------------------------------------
            if status_code in (200, 201):
                try:
                    response_json = json.loads(response_text)
                except Exception:
                    response_json = {"raw": response_text}

                message_id = (
                    response_json.get("name") or
                    response_json.get("messageId") or
                    f"gcp-msg-{int(time.time())}"
                )

                logger.info(f"SMS successfully dispatched via GCP CCAI! Message ID: '{message_id}'")
                return {
                    "status": "success",
                    "message_id": message_id,
                    "recipient": recipient_e164,
                    "project_id": effective_project,
                    "response": response_json,
                    "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
                }

            # ---------------------------------------------------------------
            # 2. PERMISSION & AUTH ISSUES (HTTP 401 / 403) - DO NOT RETRY
            # ---------------------------------------------------------------
            elif status_code in (401, 403):
                permission_err = (
                    f"GCP SMS Authorization Failed (HTTP {status_code}):\n"
                    f"Details: {response_text}\n\n"
                    "REQUIRED ACTIONS:\n"
                    "1. Ensure 'Contact Center AI Platform API' is enabled:\n"
                    "   gcloud services enable contactcenteraiplatform.googleapis.com\n"
                    "2. Verify your IAM identity has one of the following roles:\n"
                    "   - roles/contactcenteraiplatform.admin\n"
                    "   - roles/contactcenteraiplatform.viewer\n"
                    "   - roles/serviceusage.serviceUsageConsumer\n"
                    "3. Ensure Cloud Logging permission is granted:\n"
                    "   - roles/logging.logWriter"
                )
                logger.error(permission_err)
                raise PermissionError(permission_err)

            # ---------------------------------------------------------------
            # 3. RATE LIMITING / QUOTA EXHAUSTED (HTTP 429) - RETRY WITH BACKOFF
            # ---------------------------------------------------------------
            elif status_code == 429:
                logger.warning(
                    f"Rate limit reached (HTTP 429). Attempt {attempt}/{MAX_RETRIES}. "
                    f"Backing off for {current_backoff:.1f}s before retrying..."
                )
                if attempt >= MAX_RETRIES:
                    quota_err = (
                        f"GCP SMS Rate Limit exceeded after {MAX_RETRIES} retries. "
                        f"Response: {response_text}. Consider requesting a quota increase in GCP Console."
                    )
                    logger.error(quota_err)
                    raise RuntimeError(quota_err)

                time.sleep(current_backoff)
                current_backoff *= BACKOFF_MULTIPLIER
                continue

            # ---------------------------------------------------------------
            # 4. INVALID ARGUMENT / PHONE NUMBER (HTTP 400) - DO NOT RETRY
            # ---------------------------------------------------------------
            elif status_code == 400:
                bad_req_err = (
                    f"GCP CCAI Bad Request (HTTP 400): {response_text}\n"
                    f"Please verify recipient phone number '{recipient_e164}' and message encoding."
                )
                logger.error(bad_req_err)
                raise ValueError(bad_req_err)

            # ---------------------------------------------------------------
            # 5. TRANSIENT SERVICE ERROR (HTTP 500, 502, 503, 504) - RETRY
            # ---------------------------------------------------------------
            elif status_code in (500, 502, 503, 504):
                logger.warning(
                    f"Transient GCP server error (HTTP {status_code}). Attempt {attempt}/{MAX_RETRIES}. "
                    f"Retrying in {current_backoff:.1f}s..."
                )
                if attempt >= MAX_RETRIES:
                    server_err = f"GCP CCAI service unavailable after {MAX_RETRIES} attempts. Response: {response_text}"
                    logger.error(server_err)
                    raise RuntimeError(server_err)

                time.sleep(current_backoff)
                current_backoff *= BACKOFF_MULTIPLIER
                continue

            # ---------------------------------------------------------------
            # 6. OTHER UNEXPECTED STATUS CODES
            # ---------------------------------------------------------------
            else:
                unexpected_err = f"Unexpected response from GCP SMS API (HTTP {status_code}): {response_text}"
                logger.error(unexpected_err)
                raise RuntimeError(unexpected_err)

        except (PermissionError, ValueError):
            raise
        except Exception as ex:
            if attempt >= MAX_RETRIES:
                logger.error(f"Network error communicating with GCP SMS API: {str(ex)}")
                raise RuntimeError(f"Failed to send GCP SMS after {MAX_RETRIES} attempts: {str(ex)}") from ex

            logger.warning(f"Connection attempt {attempt} failed ({str(ex)}). Retrying in {current_backoff:.1f}s...")
            time.sleep(current_backoff)
            current_backoff *= BACKOFF_MULTIPLIER

    raise RuntimeError("Unexpected termination of GCP SMS retry loop.")


# ===========================================================================
# 5. CLI EXECUTION ENTRYPOINT
# ===========================================================================
if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(
        description="Send outbound SMS messages via Google Cloud CCAI Platform / Google Cloud SMS API"
    )
    parser.add_argument(
        "--phone",
        type=str,
        default="+919876543210",
        help="Recipient phone number in E.164 format (e.g. +919876543210)"
    )
    parser.add_argument(
        "--message",
        type=str,
        default="Your Kandavara Gram Panchayat grievance OTP is 492018. Valid for 10 minutes. - Modern Village",
        help="SMS text content"
    )
    parser.add_argument(
        "--project",
        type=str,
        default=None,
        help="GCP Project ID (optional, defaults to ADC or GCP_PROJECT_ID env var)"
    )
    parser.add_argument(
        "--region",
        type=str,
        default=None,
        help="GCP Region (optional, defaults to us-central1)"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Validate ADC authentication and payloads without sending HTTP request"
    )

    args = parser.parse_args()

    print("\n" + "=" * 60)
    print(" MODERN VILLAGE - GOOGLE CLOUD CCAI SMS DISPATCHER")
    print("=" * 60)
    print(f"Recipient : {args.phone}")
    print(f"Message   : {args.message}")
    print(f"Dry Run   : {'YES' if args.dry_run else 'NO'}")
    print("-" * 60)

    try:
        result = send_gcp_sms(
            recipient_phone=args.phone,
            message_text=args.message,
            project_id=args.project,
            region=args.region,
            dry_run=args.dry_run
        )
        print("\n[SUCCESS] Dispatch Result:")
        print(json.dumps(result, indent=2))
        sys.exit(0)
    except Exception as e:
        print(f"\n[ERROR] Failed to send GCP SMS:\n{str(e)}", file=sys.stderr)
        sys.exit(1)
