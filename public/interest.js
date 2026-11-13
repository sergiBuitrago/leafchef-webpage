const countryCodes = ["AD", "AE", "AF", "AG", "AI", "AL", "AM", "AO", "AQ", "AR", "AS", "AT", "AU", "AW", "AX", "AZ", "BA", "BB", "BD", "BE", "BF", "BG", "BH", "BI", "BJ", "BL", "BM", "BN", "BO", "BQ", "BR", "BS", "BT", "BV", "BW", "BY", "BZ", "CA", "CC", "CD", "CF", "CG", "CH", "CI", "CK", "CL", "CM", "CN", "CO", "CR", "CU", "CV", "CW", "CX", "CY", "CZ", "DE", "DJ", "DK", "DM", "DO", "DZ", "EC", "EE", "EG", "EH", "ER", "ES", "ET", "FI", "FJ", "FK", "FM", "FO", "FR", "GA", "GB", "GD", "GE", "GF", "GG", "GH", "GI", "GL", "GM", "GN", "GP", "GQ", "GR", "GS", "GT", "GU", "GW", "GY", "HK", "HM", "HN", "HR", "HT", "HU", "ID", "IE", "IL", "IM", "IN", "IO", "IQ", "IR", "IS", "IT", "JE", "JM", "JO", "JP", "KE", "KG", "KH", "KI", "KM", "KN", "KP", "KR", "KW", "KY", "KZ", "LA", "LB", "LC", "LI", "LK", "LR", "LS", "LT", "LU", "LV", "LY", "MA", "MC", "MD", "ME", "MF", "MG", "MH", "MK", "ML", "MM", "MN", "MO", "MP", "MQ", "MR", "MS", "MT", "MU", "MV", "MW", "MX", "MY", "MZ", "NA", "NC", "NE", "NF", "NG", "NI", "NL", "NO", "NP", "NR", "NU", "NZ", "OM", "PA", "PE", "PF", "PG", "PH", "PK", "PL", "PM", "PN", "PR", "PS", "PT", "PW", "PY", "QA", "RE", "RO", "RS", "RU", "RW", "SA", "SB", "SC", "SD", "SE", "SG", "SH", "SI", "SJ", "SK", "SL", "SM", "SN", "SO", "SR", "SS", "ST", "SV", "SX", "SY", "SZ", "TC", "TD", "TF", "TG", "TH", "TJ", "TK", "TL", "TM", "TN", "TO", "TR", "TT", "TV", "TW", "TZ", "UA", "UG", "UM", "US", "UY", "UZ", "VA", "VC", "VE", "VG", "VI", "VN", "VU", "WF", "WS", "YE", "YT", "ZA", "ZM", "ZW"];
const form = document.querySelector('#interest-form');
const translateInterest = window.leafchefTranslate || (text => text);
const status = document.querySelector('#interest-status');
const fields = form.querySelector('fieldset');
const button = form.querySelector('button');
const note = document.querySelector('#interest-note');
function showStatus(message, state = 'info', focus = false) {
  status.textContent = translateInterest(message);
  status.dataset.state = state;
  if (focus) {
    status.focus({ preventScroll: true });
    status.scrollIntoView({ block: 'nearest' });
  }
}
const endpoint = 'https://vjkdmxknbtlrsnsqfayq.supabase.co/functions/v1/register-interest';
// Public anon key for the function's existing JWT gateway. Never use a service-role key.
const publicKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqa2RteGtuYnRscnNuc3FmYXlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5NjkxMDEsImV4cCI6MjEwMDU0NTEwMX0.M-3gNiQLFNEsT90YRVAmmIq8n-X_c-JuCJk79oXW6nI';
const headers = { apikey: publicKey, Authorization: `Bearer ${publicKey}` };
const interestLanguage = window.leafchefLanguage || 'en';
const regionNames = new Intl.DisplayNames([interestLanguage], {type:'region'});
const choices = countryCodes.map(code => ({code, name:regionNames.of(code)})).sort((a,b) => a.name.localeCompare(b.name, interestLanguage));
for (const choice of choices) {
  const option = document.createElement('option'); option.value = choice.code; option.textContent = choice.name;
  form.elements.country.append(option);
}
const consent = document.querySelector('#interest-consent');
let scriptLoaded = false;
let token = '';
let widget;
let submitting = false;
let submitted = false;
const submissionKey = 'leafchef.web.interest.submitted.v1';
function alreadySubmitted() {
  if (submitted) return true;
  try { submitted = window.localStorage.getItem(submissionKey) === 'true'; }
  catch { /* Storage may be blocked; preserve the in-page submission guard. */ }
  return submitted;
}
function rememberSubmission() {
  submitted = true;
  try { window.localStorage.setItem(submissionKey, 'true'); return true; }
  catch { return false; }
}
function showSubmitted(message = "You've already sent your interest. Thank you for helping LeafChef grow.", focus = false) {
  submitted = true;
  fields.disabled = true; fields.hidden = true; note.hidden = true;
  token = '';
  if (widget !== undefined) {
    try { window.turnstile.remove(widget); } catch { /* Submission stays successful. */ }
    widget = undefined;
  }
  showStatus(message, 'success', focus);
  updateButton();
}
window.addEventListener('storage', event => {
  if (event.key === submissionKey && event.newValue === 'true') showSubmitted();
});
function updateButton() {
  button.disabled = fields.disabled || !consent.checked || !token || submitting;
  button.textContent = translateInterest(submitting ? 'Sending...' : "I'm interested");
  form.setAttribute('aria-busy', String(submitting));
}
function resetChallenge() {
  token = '';
  if (widget !== undefined) window.turnstile.reset(widget);
  updateButton();
}
window.leafchefTurnstileReady = () => {
  if (!consent.checked || fields.disabled) return;
  try {
    widget = window.turnstile.render('#interest-challenge', {
      sitekey: '0x4AAAAAAF-R_WrP0qn7H4Ao', action: 'interest', language: interestLanguage,
      callback: value => { token = value; updateButton(); showStatus("Ready! Press I'm interested to send your interest."); },
      'expired-callback': () => { token = ''; updateButton(); showStatus('The spam check expired. Please complete it again.', 'error'); },
      'error-callback': () => {
        token = ''; updateButton();
        showStatus('The spam check could not load. Please refresh to try again.', 'error');
      }
    });
  } catch {
    showStatus('The spam check could not load. Please refresh to try again.', 'error');
  }
};
async function prepareForm() {
  if (alreadySubmitted()) { showSubmitted(); return; }
  try {
    const response = await fetch(endpoint, { headers, cache: 'no-store' });
    const data = await response.json();
    if (alreadySubmitted()) { showSubmitted(); return; }
    if (!response.ok) { showStatus('The interest form is temporarily unavailable. Please try again later.', 'error'); return; }
    if (data.message !== 'open') { showStatus('The interest form is not open yet. Please check back later.'); return; }
    fields.disabled = false;
    updateButton();
    showStatus('Choose a country or region if you like. The spam check loads only if you agree below.');

  } catch {
    showStatus('The interest form could not load. Please refresh to try again.', 'error');
  }
}
consent.addEventListener('change', () => {
  if (alreadySubmitted()) { showSubmitted(); return; }
  token = '';
  if (!consent.checked) {
    if (widget !== undefined) window.turnstile.remove(widget);
    widget = undefined;
    showStatus('Spam check disabled. You can still browse LeafChef or contact the creator by email.');
  } else if (window.turnstile) window.leafchefTurnstileReady();
  else if (!scriptLoaded) {
    showStatus('Loading the spam check...');
    scriptLoaded = true;
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=leafchefTurnstileReady&render=explicit';
    script.async = true;
    script.onerror = () => { showStatus('The spam check could not load. Please refresh to try again.', 'error'); };
    document.head.append(script);
  }
  updateButton();
});
form.addEventListener('submit', async event => {
  event.preventDefault();
  if (alreadySubmitted()) { showSubmitted(); return; }
  if (fields.disabled || !consent.checked || submitting || !token || !form.reportValidity()) return;
  submitting = true; updateButton();
  showStatus('Sending your interest...', 'pending', true);
  try {
    const response = await fetch(endpoint, {
      method: 'POST', signal: AbortSignal.timeout(30000), headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ country: form.elements.country.value, website: form.elements.website.value, consent: true, token })
    });
    const data = await response.json();
    if (response.ok) {
      const remembered = rememberSubmission();
      form.reset();
      const message = remembered
        ? "Thank you! Your interest has been sent. You're helping LeafChef grow."
        : "Thank you! Your interest has been sent. Your browser couldn't save this status for future visits.";
      showSubmitted(message, true);
    } else {
      resetChallenge();
      const fallback = 'Your interest could not be sent. Please try again later.';
      // Unexpected provider text must not put a translated page back into English.
      const message = data.message && (interestLanguage === 'en' || translateInterest(data.message) !== data.message) ? data.message : fallback;
      showStatus(message, 'error', true);
    }
  } catch {
    resetChallenge();
    showStatus('We could not confirm your submission. Please try again later. If it was already sent, retrying may send it twice.', 'error', true);
  } finally { submitting = false; updateButton(); }
});
prepareForm();
