export interface ParsedSseFrame {
  event: string;
  data: string;
}

/**
 * Parses a raw Server-Sent Events text buffer into complete frames plus any trailing partial block.
 */
export function parseSseBuffer(rawBuffer: string): {
  events: ParsedSseFrame[];
  remainder: string;
} {
  const normalized = rawBuffer.replace(/\r\n/g, '\n');
  const blocks = normalized.split('\n\n');
  const remainder = blocks.pop() ?? '';
  const events: ParsedSseFrame[] = [];

  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    let event = 'message';
    const dataLines: string[] = [];

    for (const line of block.split('\n')) {
      if (line.startsWith(':')) continue;
      if (line.startsWith('event:')) {
        event = line.slice(6).trim() || 'message';
      } else if (line.startsWith('data:')) {
        dataLines.push(line.slice(5).trimStart());
      }
    }

    if (dataLines.length > 0) {
      events.push({ event, data: dataLines.join('\n') });
    }
  }

  return { events, remainder };
}
