import { getCompanyInfo } from './company-info';

export type TrivialIntent = 'greeting' | 'thanks' | 'contact' | 'mission';

// Lowercase, drop punctuation, collapse whitespace so "Good morning!" == "good morning".
const normalize = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const GREETING_RE =
  /^(hi+|hel+o+|hey+|hlo|hlw|salam|salaam|assalam[ou ]*alaikum|assalamualaikum|asalam[ou ]*alaikum|aoa|good (morning|afternoon|evening|night)|how are you( doing)?|how r u|whats up|what is up|who are you|who r u|greetings)$/;

const THANKS_RE = /^(thanks|thank you|thankyou|thx|tysm|shukriya|shukran|jazak ?allah( khair)?)$/;

const MISSION_RE =
  /^(what(?: s| is)? (your|the) mission|your mission|what do you do|what is combine foundation|about combine foundation|who is combine foundation|tell me about (yourself|combine foundation))$/;

const CONTACT_RE =
  /(contact|email|e mail|phone|number|call|address|location|where (are|is) combine|\breach combine|talk to (someone|combine)|office)/;

// Anything asking for real detail should go to the model/tools instead.
const DETAILED_RE =
  /course|event|project|program|enroll|batch|admission|register|webinar|scholarship|donate|volunteer|\bfee|price|timing|schedule|job|career|vacanc|intern|\bhiring|position|apply/;

export function matchTrivialIntent(raw: string): TrivialIntent | null {
  const text = normalize(raw);
  if (!text || text.length > 60) return null;

  if (GREETING_RE.test(text)) return 'greeting';
  if (THANKS_RE.test(text)) return 'thanks';

  if (!DETAILED_RE.test(text)) {
    if (MISSION_RE.test(text)) return 'mission';
    if (CONTACT_RE.test(text)) return 'contact';
  }

  return null;
}

export async function buildTrivialReply(intent: TrivialIntent): Promise<string> {
  if (intent === 'greeting') {
    return 'Hello and welcome to Combine Foundation! How can I help you with our programs, courses, or events today?';
  }
  if (intent === 'thanks') {
    return 'You are very welcome! Feel free to ask if you need anything else about Combine Foundation.';
  }
  if (intent === 'mission') {
    const { organization } = await getCompanyInfo();
    return `Combine Foundation is the social impact arm of ${organization.parentCompany}, based in Pakistan. Our mission is ${organization.mission} Our focus areas are ${organization.focusAreas.join(', ')}.`;
  }

  try {
    const info = await getCompanyInfo();
    const contact = info.organization.contact;
    return `You can reach Combine Foundation at ${contact.email}, by phone at ${contact.phone}, or online at ${contact.website}. Our office is at ${contact.address}.`;
  } catch {
    return 'You can reach Combine Foundation at info@combinefoundation.org or by phone at 03208686644.';
  }
}
