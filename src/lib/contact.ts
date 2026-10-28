import { contactEmail } from "@/data/contact";

export interface ContactMessage {
  name: string;
  email: string;
  topic: string;
  message: string;
}
export function createContactDraft({
  name,
  email,
  topic,
  message,
}: ContactMessage) {
  const subject = `AUREL enquiry: ${topic}`;
  const body = `Name: ${name.trim()}\nReply email: ${email.trim()}\n\n${message.trim()}`;
  return `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
