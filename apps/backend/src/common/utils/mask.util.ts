/**
 * Utility functions to mask / redact sensitive user information (PII)
 */

export function maskEmail(email?: string | null): string {
  if (!email || !email.includes('@')) return email || '';
  const [localPart, domain] = email.split('@');
  if (!localPart) return email;
  if (localPart.length <= 2) {
    return `${localPart[0]}***@${domain}`;
  }
  const first = localPart.slice(0, 2);
  const last = localPart.slice(-1);
  return `${first}***${last}@${domain}`;
}

export function maskPhone(phone?: string | null): string {
  if (!phone) return '';
  const cleaned = phone.trim();
  if (cleaned.length < 6) return '***';
  const prefix = cleaned.slice(0, 3);
  const suffix = cleaned.slice(-3);
  return `${prefix}****${suffix}`;
}

export function maskFullName(name?: string | null): string {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    const word = parts[0];
    if (word && word.length > 2) {
      return `${word.slice(0, 2)}***`;
    }
    return '***';
  }
  const lastName = parts[parts.length - 1];
  const others = parts.slice(0, -1).join(' ');
  return `${others} ${lastName ? lastName[0] : ''}***`;
}

