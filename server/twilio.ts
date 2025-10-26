import twilio from 'twilio';

export async function getTwilioClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  
  if (!accountSid || !authToken) {
    throw new Error('Missing Twilio credentials: TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN required');
  }
  
  return twilio(accountSid, authToken);
}

export async function getTwilioFromPhoneNumber() {
  const phoneNumber = process.env.TWILIO_PHONE_NUMBER;
  
  if (!phoneNumber) {
    throw new Error('Missing TWILIO_PHONE_NUMBER');
  }
  
  return phoneNumber;
}

export async function sendReminderSMS(to: string, title: string, description?: string) {
  try {
    console.log(`[Twilio] Attempting to send SMS to ${to}`);
    
    const client = await getTwilioClient();
    const from = await getTwilioFromPhoneNumber();
    
    console.log(`[Twilio] Using from number: ${from}`);
    
    let message = `QA Reminder: ${title}`;
    if (description) {
      message += `\n\n${description}`;
    }
    
    console.log(`[Twilio] Message content: ${message}`);
    
    // Format phone number properly
    let formattedTo = to;
    if (!to.startsWith('+')) {
      // If number doesn't start with +, add it
      // Check if it already starts with country code (e.g., "14377784991")
      if (to.match(/^1\d{10}$/)) {
        formattedTo = `+${to}`;
      } else {
        formattedTo = `+1${to}`;
      }
    }
    
    const result = await client.messages.create({
      body: message,
      from: from,
      to: formattedTo
    });
    
    console.log(`[Twilio] SMS sent successfully with SID: ${result.sid}`);
    return { success: true, messageSid: result.sid };
  } catch (error: any) {
    console.error('[Twilio] Failed to send SMS:', error);
    console.error('[Twilio] Error details:', {
      message: error.message,
      code: error.code,
      moreInfo: error.moreInfo
    });
    return { success: false, error: error.message };
  }
}

export async function makeReminderCall(to: string, title: string, description?: string) {
  try {
    console.log(`[Twilio] Attempting to make voice call to ${to}`);
    
    const client = await getTwilioClient();
    const from = await getTwilioFromPhoneNumber();
    
    console.log(`[Twilio] Using from number: ${from}`);
    
    let voiceMessage = `This is a Q A reminder for: ${title}.`;
    if (description) {
      voiceMessage += ` Additional details: ${description}`;
    }
    
    const twimlUrl = `http://twimlets.com/message?Message=${encodeURIComponent(voiceMessage)}`;
    
    console.log(`[Twilio] Making call with TwiML URL`);
    
    // Format phone number properly
    let formattedTo = to;
    if (!to.startsWith('+')) {
      // If number doesn't start with +, add it
      // Check if it already starts with country code (e.g., "14377784991")
      if (to.match(/^1\d{10}$/)) {
        formattedTo = `+${to}`;
      } else {
        formattedTo = `+1${to}`;
      }
    }
    
    const result = await client.calls.create({
      twiml: `<Response><Say voice="alice">${voiceMessage}</Say></Response>`,
      from: from,
      to: formattedTo
    });
    
    console.log(`[Twilio] Voice call initiated successfully with SID: ${result.sid}`);
    return { success: true, callSid: result.sid };
  } catch (error: any) {
    console.error('[Twilio] Failed to make voice call:', error);
    console.error('[Twilio] Error details:', {
      message: error.message,
      code: error.code,
      moreInfo: error.moreInfo
    });
    return { success: false, error: error.message };
  }
}

export async function sendReminder(to: string, title: string, description: string | undefined, method: 'sms' | 'call') {
  switch (method) {
    case 'sms':
      return sendReminderSMS(to, title, description);
    case 'call':
      return makeReminderCall(to, title, description);
    default:
      return { success: false, error: 'Invalid notification method' };
  }
}
