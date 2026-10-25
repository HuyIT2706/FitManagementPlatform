export interface ParsedFoodToken {
  query: string;
  weight: number;
}

export function sanitizeSpeechTranscript(input: string): string {
  if (!input || typeof input !== 'string') return '';
  const words = input.trim().replace(/\s+/g, ' ').split(' ');
  if (words.length <= 1) return input.trim();

  // Remove consecutive identical words
  const dedupedWords: string[] = [];
  for (const word of words) {
    if (!word) continue;
    const curr = word.toLowerCase();
    const lastWord = dedupedWords.length > 0 ? dedupedWords[dedupedWords.length - 1] : undefined;
    const prev = lastWord ? lastWord.toLowerCase() : null;
    if (curr !== prev) {
      dedupedWords.push(word);
    }
  }

  // Remove consecutive identical multi-word phrases (from tokens.length / 2 down to 2)
  let changed = true;
  const tokens: string[] = [...dedupedWords];
  while (changed) {
    changed = false;
    const maxPhraseLen = Math.min(30, Math.floor(tokens.length / 2));
    for (let phraseLen = maxPhraseLen; phraseLen >= 2; phraseLen--) {
      for (let i = 0; i <= tokens.length - 2 * phraseLen; i++) {
        const slice1 = tokens.slice(i, i + phraseLen);
        const slice2 = tokens.slice(i + phraseLen, i + 2 * phraseLen);
        const p1 = slice1.map((w) => w.toLowerCase()).join(' ');
        const p2 = slice2.map((w) => w.toLowerCase()).join(' ');
        if (p1 && p1 === p2) {
          tokens.splice(i + phraseLen, phraseLen);
          changed = true;
          break;
        }
      }
      if (changed) break;
    }
  }

  return tokens.join(' ').trim();
}

export function parseVietnameseFoodTokens(input: string): ParsedFoodToken[] {
  if (!input || typeof input !== 'string') return [];

  const sanitized = sanitizeSpeechTranscript(input);
  let text = sanitized.trim().toLowerCase();

  // 1. Normalize voice-to-text artifacts:
  text = text.replace(/(\d+)[.,]000(?!\d)/g, '$1g');
  text = text.replace(/(\d+)\s*k\b/gi, '$1g');
  text = text.replace(/(\d+)\s*(?:gam|gram|gr)\b/gi, '$1g');

  text = text.replace(/(\d+(?:[.,]\d+)?)\s*(?:kg|kí|ký)\b/gi, (_, p1) => {
    const val = parseFloat(p1.replace(',', '.'));
    return `${Math.round(val * 1000)}g`;
  });

  text = text.replace(/(\d+)\s*(?:lạng|lang)\b/gi, (_, p1) => `${Number(p1) * 100}g `);
  text = text.replace(/(?:^|\s+)nửa lạng(?=\s+|$)/gi, ' 50g ');

  text = text.replace(/(\d+)\s*(?:bát|chén)\b/gi, (_, p1) => `${Number(p1) * 150}g `);
  text = text.replace(/(?:^|\s+)nửa (?:bát|chén)(?=\s+|$)/gi, ' 75g ');

  text = text.replace(/(\d+)\s*(?:quả|hột|trái)\b/gi, (_, p1) => `${Number(p1) * 50}g `);
  text = text.replace(/(\d+)\s*đĩa\b/gi, (_, p1) => `${Number(p1) * 200}g `);
  text = text.replace(/(\d+)\s*tô\b/gi, (_, p1) => `${Number(p1) * 350}g `);
  text = text.replace(/(\d+)\s*(?:ly|cốc|hộp)\b/gi, (_, p1) => `${Number(p1) * 200}g `);

  // Normalize connectives & punctuation to delimiter '|'
  text = text.replace(/[,;+&\n]/g, ' | ');
  text = text.replace(/(?:^|\s+)(?:và|kèm|với|cùng)(?=\s+|$)/gi, ' | ');

  // Split by explicit delimiters first
  const subPhrases = text.split('|').map((s) => s.trim()).filter(Boolean);

  const cleanName = (s: string) =>
    s
      .replace(/^(?:\||\s|và|kèm|với)+|(?:\||\s|và|kèm|với)+$/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

  const results: ParsedFoodToken[] = [];

  for (const phrase of subPhrases) {
    // Case 1: Prefix format: e.g. "200g cơm trắng 100g ức gà sống"
    if (/^\d+\s*g\b/i.test(phrase)) {
      const regex = /(\d+)\s*g\s*([^0-9]+)/gi;
      let match: RegExpExecArray | null;
      let matchedAny = false;
      while ((match = regex.exec(phrase)) !== null) {
        matchedAny = true;
        const w = parseInt(match[1] || '100', 10);
        const name = cleanName(match[2] || '');
        if (name) {
          results.push({ query: name, weight: w });
        }
      }
      if (!matchedAny) {
        const name = cleanName(phrase);
        if (name) results.push({ query: name, weight: 100 });
      }
    }
    // Case 2: Suffix format: e.g. "cơm trắng 180g ức gà sống 180g"
    else if (/\d+\s*g\b/i.test(phrase)) {
      const regex = /([^0-9]+?)\s*(\d+)\s*g/gi;
      let match: RegExpExecArray | null;
      let matchedAny = false;
      while ((match = regex.exec(phrase)) !== null) {
        matchedAny = true;
        const name = cleanName(match[1] || '');
        const w = parseInt(match[2] || '100', 10);
        if (name) {
          results.push({ query: name, weight: w });
        }
      }
      if (!matchedAny) {
        const name = cleanName(phrase);
        if (name) results.push({ query: name, weight: 100 });
      }
    }
    // Case 3: Food name without specific weight: e.g. "cá", "cơm trắng"
    else {
      const name = cleanName(phrase);
      if (name && isNaN(Number(name))) {
        results.push({ query: name, weight: 100 });
      }
    }
  }

  // Deduplicate identical items (same query & weight)
  const uniqueResults: ParsedFoodToken[] = [];
  for (const item of results) {
    const isDup = uniqueResults.some(
      (u) =>
        u.query.trim().toLowerCase() === item.query.trim().toLowerCase() &&
        u.weight === item.weight
    );
    if (!isDup) {
      uniqueResults.push(item);
    }
  }

  return uniqueResults;
}
