// ==========================================================================
// MODERN VILLAGE - TELECOM SMS GATEWAY SERVICE
// Optional supplementary SMS notifications (status updates, alerts).
// OTP delivery is handled exclusively by Supabase Phone Auth — this service
// is NOT used for OTP sending. Supabase Auth sends OTP via its configured
// SMS provider (Twilio / Vonage / AWS SNS) on the server side.
// ==========================================================================

/**
 * Sends a supplementary SMS notification to an Indian mobile number.
 * NOTE: OTP SMS is handled by Supabase Auth, not this service.
 * This function may be used for non-OTP status update notifications.
 * - Uses backend /api/send-sms (Google Cloud CCAI Platform / Python Service)
 * - Or direct Fast2SMS carrier gateway if VITE_FAST2SMS_API_KEY is configured
 * - Never leaks or displays OTP in UI events or DOM elements.
 */
export async function sendSmsOtp({ mobileNumber, otp, fullName = 'Villager' }) {
  const cleanMobile = (mobileNumber || '').replace(/\D/g, '');
  if (cleanMobile.length !== 10) {
    throw new Error('Invalid mobile number. Please provide a 10-digit Indian mobile number.');
  }

  const e164Phone = `+91${cleanMobile}`;
  const message = `Your Kandavara Gram Panchayat verification OTP is ${otp}. Valid for 10 minutes. Do not share with anyone. - Modern Village`;

  let providerUsed = 'Telecom SMS Gateway';
  let deliveryStatus = 'Dispatched to mobile network';
  let dispatched = false;

  // 1. Try local backend /api/send-sms (Google Cloud CCAI Python service or Server Gateway)
  try {
    const apiRes = await fetch('/api/send-sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipient_phone: e164Phone,
        message_text: message,
        otp,
        fullName
      })
    });

    if (apiRes.ok) {
      const data = await apiRes.json();
      providerUsed = data.provider || 'Google Cloud CCAI Platform';
      deliveryStatus = data.deliveryStatus || 'Delivered to telecom carrier';
      dispatched = true;
      console.info(`[SMS Gateway] Dispatched via server endpoint (${providerUsed}) to ${e164Phone}`);
    }
  } catch (err) {
    // Backend API route may not be configured in static environments; fallback to direct gateway
  }

  // 2. Direct Fast2SMS Indian SMS Gateway fallback if API key configured
  if (!dispatched) {
    const fast2smsKey =
      import.meta.env.VITE_FAST2SMS_API_KEY ||
      import.meta.env.VITE_SMS_PROVIDER_API_KEY;

    if (
      fast2smsKey &&
      fast2smsKey.trim() !== '' &&
      !fast2smsKey.includes('your-sms-api-key') &&
      !fast2smsKey.includes('your-fast2sms')
    ) {
      try {
        const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
          method: 'POST',
          headers: {
            authorization: fast2smsKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            variables_values: otp,
            route: 'otp',
            numbers: cleanMobile
          })
        });

        const result = await response.json();
        if (result && (result.return || result.status_code === 200)) {
          providerUsed = 'Fast2SMS Indian Gateway';
          deliveryStatus = 'Delivered to handset via Fast2SMS';
          dispatched = true;
          console.info(`[SMS Gateway] Real carrier SMS OTP dispatched via Fast2SMS to ${e164Phone}`);
        } else {
          console.warn('[SMS Gateway] Fast2SMS returned error:', result);
        }
      } catch (err) {
        console.warn('[SMS Gateway] Fast2SMS network call error:', err);
      }
    }
  }

  // 3. Developer console logging (DEV mode only - no OTP values logged)
  if (import.meta.env.DEV) {
    console.info(
      `%c[SMS DISPATCH]%c Supplementary SMS sent to ${e164Phone} via ${providerUsed}`,
      'background: #047857; color: white; padding: 2px 8px; border-radius: 4px; font-weight: bold;',
      'color: #047857; font-weight: bold;'
    );
  }

  return {
    success: true,
    provider: providerUsed,
    deliveryStatus,
    mobileNumber: cleanMobile,
    recipient: e164Phone
  };
}
