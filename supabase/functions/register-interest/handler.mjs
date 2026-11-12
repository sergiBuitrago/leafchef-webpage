const countryCodes = ["AD", "AE", "AF", "AG", "AI", "AL", "AM", "AO", "AQ", "AR", "AS", "AT", "AU", "AW", "AX", "AZ", "BA", "BB", "BD", "BE", "BF", "BG", "BH", "BI", "BJ", "BL", "BM", "BN", "BO", "BQ", "BR", "BS", "BT", "BV", "BW", "BY", "BZ", "CA", "CC", "CD", "CF", "CG", "CH", "CI", "CK", "CL", "CM", "CN", "CO", "CR", "CU", "CV", "CW", "CX", "CY", "CZ", "DE", "DJ", "DK", "DM", "DO", "DZ", "EC", "EE", "EG", "EH", "ER", "ES", "ET", "FI", "FJ", "FK", "FM", "FO", "FR", "GA", "GB", "GD", "GE", "GF", "GG", "GH", "GI", "GL", "GM", "GN", "GP", "GQ", "GR", "GS", "GT", "GU", "GW", "GY", "HK", "HM", "HN", "HR", "HT", "HU", "ID", "IE", "IL", "IM", "IN", "IO", "IQ", "IR", "IS", "IT", "JE", "JM", "JO", "JP", "KE", "KG", "KH", "KI", "KM", "KN", "KP", "KR", "KW", "KY", "KZ", "LA", "LB", "LC", "LI", "LK", "LR", "LS", "LT", "LU", "LV", "LY", "MA", "MC", "MD", "ME", "MF", "MG", "MH", "MK", "ML", "MM", "MN", "MO", "MP", "MQ", "MR", "MS", "MT", "MU", "MV", "MW", "MX", "MY", "MZ", "NA", "NC", "NE", "NF", "NG", "NI", "NL", "NO", "NP", "NR", "NU", "NZ", "OM", "PA", "PE", "PF", "PG", "PH", "PK", "PL", "PM", "PN", "PR", "PS", "PT", "PW", "PY", "QA", "RE", "RO", "RS", "RU", "RW", "SA", "SB", "SC", "SD", "SE", "SG", "SH", "SI", "SJ", "SK", "SL", "SM", "SN", "SO", "SR", "SS", "ST", "SV", "SX", "SY", "SZ", "TC", "TD", "TF", "TG", "TH", "TJ", "TK", "TL", "TM", "TN", "TO", "TR", "TT", "TV", "TW", "TZ", "UA", "UG", "UM", "US", "UY", "UZ", "VA", "VC", "VE", "VG", "VI", "VN", "VU", "WF", "WS", "YE", "YT", "ZA", "ZM", "ZW"];
const emailValid = value => typeof value === 'string' && value.length <= 254 && /^[^\s@<>\r\n]+@[^\s@<>\r\n]+\.[^\s@<>\r\n]+$/.test(value);
export function createHandler(env, fetcher = fetch) {
  const get = key => env[key];
  return async request => {
    const origin = request.headers.get('origin');
    const allowed = get('LEAFCHEF_SITE_ORIGIN');
    const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', Vary: 'Origin' };
    if (allowed && origin === allowed) Object.assign(headers, {
      'Access-Control-Allow-Origin': allowed,
      'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    });
    const reply = (status, message) => new Response(JSON.stringify({message}), {status, headers});
    if (request.method === 'OPTIONS') return new Response(null, {status: origin === allowed ? 204 : 403, headers});
    const ready = get('LEAFCHEF_INTEREST_ENABLED') === 'true' && get('LEAFCHEF_BREVO_API_KEY') &&
      emailValid(get('LEAFCHEF_BREVO_SENDER_EMAIL')) && emailValid(get('LEAFCHEF_INTEREST_TO_EMAIL')) &&
      get('LEAFCHEF_TURNSTILE_SECRET_KEY') && get('SUPABASE_URL') && get('SUPABASE_SERVICE_ROLE_KEY') && /^https:\/\/[^/]+$/.test(allowed || '');
    if (request.method === 'GET') return reply(200, ready ? 'open' : 'closed');
    if (request.method !== 'POST') return reply(405, 'Method not allowed.');
    if (!ready) return reply(503, 'The interest form is not open yet. Please check back later.');
    if (origin !== allowed) return reply(403, 'Please use the LeafChef website.');
    if (!(request.headers.get('content-type') || '').startsWith('application/json')) return reply(415, 'Expected JSON.');
    try {
      // Enforce actual streamed bytes, regardless of the supplied Content-Length.
      const reader = request.body?.getReader();
      if (!reader) return reply(400, 'Invalid form.');
      const chunks = []; let length = 0;
      while (true) {
        const {value, done} = await reader.read();
        if (done) break;
        length += value.byteLength;
        if (length > 4096) { await reader.cancel(); return reply(413, 'The form is too large.'); }
        chunks.push(value);
      }
      const bytes = new Uint8Array(length); let offset = 0;
      for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
      let data;
      try { data = JSON.parse(new TextDecoder().decode(bytes)); } catch { return reply(400, 'Invalid form.'); }
      if (!data || Array.isArray(data) || typeof data !== 'object' || data.website) return reply(400, 'Invalid form.');
      if (Object.keys(data).some(key => !['country', 'website', 'token', 'consent'].includes(key))) return reply(400, 'Invalid form.');
      if (data.consent !== true) return reply(400, 'Please agree to the spam check before submitting.');
      const country = data.country ?? '';
      if (typeof country !== 'string' || (country !== '' && !countryCodes.includes(country))) return reply(400, 'Please select a country or region.');
      const countryName = country ? new Intl.DisplayNames(['en'], {type:'region'}).of(country) : 'Not specified';
      if (typeof data.token !== 'string' || !data.token || data.token.length > 2048) return reply(400, 'Please complete the spam check.');
      // One atomic Postgres budget, shared across instances. No IPs or visitor IDs.
      const budget = await fetcher(get('SUPABASE_URL') + '/rest/v1/rpc/leafchef_web_consume_interest_budget', {
        method: 'POST', signal: AbortSignal.timeout(10000),
        headers: {apikey:get('SUPABASE_SERVICE_ROLE_KEY'), Authorization:'Bearer ' + get('SUPABASE_SERVICE_ROLE_KEY'), 'Content-Type':'application/json'},
        body: '{}'
      });
      if (!budget.ok) return reply(503, 'The interest form is temporarily unavailable.');
      const admitted = await budget.json();
      if (admitted === false) { headers['Retry-After'] = '3600'; return reply(429, 'The interest form is busy. Please try again later.'); }
      if (admitted !== true) return reply(503, 'The interest form is temporarily unavailable.');
      const check = await fetcher('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST', signal: AbortSignal.timeout(10000), headers: {'Content-Type':'application/json'},
        body: JSON.stringify({secret: get('LEAFCHEF_TURNSTILE_SECRET_KEY'), response: data.token})
      });
      if (!check.ok) return reply(502, 'The spam check is temporarily unavailable.');
      const validation = await check.json();
      if (!validation.success || validation.hostname !== new URL(allowed).hostname || validation.action !== 'interest') return reply(400, 'Please repeat the spam check.');
      const sent = await fetcher('https://api.brevo.com/v3/smtp/email', {
        method:'POST', signal:AbortSignal.timeout(10000),
        headers:{'api-key':get('LEAFCHEF_BREVO_API_KEY'), 'Content-Type':'application/json', accept:'application/json'},
        body:JSON.stringify({
          sender:{name:'LeafChef', email:get('LEAFCHEF_BREVO_SENDER_EMAIL')},
          to:[{email:get('LEAFCHEF_INTEREST_TO_EMAIL')}],
          subject:'Someone is interested in LeafChef', tags:['leafchef-interest'],
          textContent:'A visitor expressed interest in LeafChef.\n\nCountry/region (self-selected): ' + countryName + '\n\nNo visitor email or precise location was requested. This is a submission, not a verified unique visitor.'
        })
      });
      if (!sent.ok) return reply(502, 'We could not send your interest. Please try again later.');
      return reply(200, 'Thank you! Your interest has been sent to the LeafChef creator.');
    } catch {
      // Never log visitor input, secrets, captcha tokens or provider error bodies.
      return reply(502, 'We could not confirm your submission. Please try again later.');
    }
  };
}
