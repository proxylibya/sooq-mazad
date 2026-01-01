/*
 * مزودو الإشعارات: إيميل و SMS عبر HTTP APIs
 */

export interface SendEmailParams {
  provider?: 'sendgrid' | 'mailgun';
  to: string;
  subject: string;
  text?: string;
  html?: string;
  from?: string;
}

export async function sendEmail(params: SendEmailParams) {
  const provider = (params.provider || process.env.EMAIL_PROVIDER || 'sendgrid').toLowerCase();
  if (provider === 'sendgrid') {
    const apiKey = process.env.SENDGRID_API_KEY;
    const from = params.from || process.env.SENDGRID_FROM;
    if (!apiKey || !from) {
      return { ok: false, error: 'مفاتيح SendGrid غير مُتوفرة' } as const;
    }

    const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: params.to }] }],
        from: { email: from },
        subject: params.subject,
        content: [
          params.html
            ? { type: 'text/html', value: params.html }
            : { type: 'text/plain', value: params.text || '' },
        ],
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return {
        ok: false as const,
        error: `SendGrid فشل: ${res.status} ${text}`,
      };
    }
    return { ok: true as const };
  }

  if (provider === 'mailgun') {
    const domain = process.env.MAILGUN_DOMAIN;
    const apiKey = process.env.MAILGUN_API_KEY;
    const from = params.from || process.env.MAILGUN_FROM;
    if (!domain || !apiKey || !from) {
      return { ok: false, error: 'مفاتيح Mailgun غير مُتوفرة' } as const;
    }

    const body = new URLSearchParams();
    body.append('from', from);
    body.append('to', params.to);
    body.append('subject', params.subject);
    if (params.html) body.append('html', params.html);
    if (params.text) body.append('text', params.text);

    const res = await fetch(`https://api.mailgun.net/v3/${domain}/messages`, {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + Buffer.from('api:' + apiKey).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return {
        ok: false as const,
        error: `Mailgun فشل: ${res.status} ${text}`,
      };
    }
    return { ok: true as const };
  }

  return { ok: false as const, error: 'مزود بريد غير مدعوم' };
}

export interface SendSMSParams {
  provider?: 'twilio' | 'vonage';
  to: string;
  body: string;
  from?: string;
}

export async function sendSMS(params: SendSMSParams) {
  const provider = (params.provider || process.env.SMS_PROVIDER || 'twilio').toLowerCase();

  if (provider === 'twilio') {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    const from = params.from || process.env.TWILIO_FROM;
    if (!sid || !token || !from) {
      return { ok: false as const, error: 'مفاتيح Twilio غير مُتوفرة' };
    }

    const body = new URLSearchParams();
    body.append('To', params.to);
    body.append('From', from);
    body.append('Body', params.body);

    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + Buffer.from(`${sid}:${token}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return { ok: false as const, error: `Twilio فشل: ${res.status} ${text}` };
    }

    const data = await res.json().catch(() => ({}));
    return { ok: true as const, providerId: data.sid };
  }

  if (provider === 'vonage') {
    const apiKey = process.env.VONAGE_API_KEY;
    const apiSecret = process.env.VONAGE_API_SECRET;
    const from = params.from || process.env.VONAGE_FROM;
    if (!apiKey || !apiSecret || !from) {
      return { ok: false as const, error: 'مفاتيح Vonage غير مُتوفرة' };
    }

    const body = new URLSearchParams();
    body.append('api_key', apiKey);
    body.append('api_secret', apiSecret);
    body.append('to', params.to);
    body.append('from', from);
    body.append('text', params.body);

    const res = await fetch('https://rest.nexmo.com/sms/json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return { ok: false as const, error: `Vonage فشل: ${res.status} ${text}` };
    }

    const data = await res.json().catch(() => ({}));
    return {
      ok: true as const,
      providerId: data.messages?.[0]?.['message-id'],
    };
  }

  return { ok: false as const, error: 'مزود SMS غير مدعوم' };
}
