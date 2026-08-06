const fs = require('fs');
const enContent = fs.readFileSync('src/lib/i18n/en.ts', 'utf8');
const esContent = fs.readFileSync('src/lib/i18n/es.ts', 'utf8');

function extractValues(content) {
  const entries = [];
  const lines = content.split('\n');
  let currentPath = [];

  for (const line of lines) {
    const trimmed = line.trim();

    const nestedMatch = trimmed.match(/^(\w+)\s*:\s*\{/);
    if (nestedMatch && !trimmed.includes('"') && !trimmed.includes("'")) {
      currentPath.push(nestedMatch[1]);
      continue;
    }

    const leafMatch = trimmed.match(/^(\w+)\s*:\s*[\"'](.*)[\"'],?\s*$/);
    if (leafMatch) {
      const fullKey = currentPath.concat(leafMatch[1]).join('.');
      const value = leafMatch[2];
      entries.push({ key: fullKey, value });
    }

    const closes = (trimmed.match(/\}/g) || []).length;
    for (let i = 0; i < closes; i++) {
      currentPath.pop();
    }
  }
  return entries;
}

const enEntries = extractValues(enContent);
const esEntries = extractValues(esContent);

const enMap = {};
enEntries.forEach(e => enMap[e.key] = e.value);
const esMap = {};
esEntries.forEach(e => esMap[e.key] = e.value);

// Find English sentences/phrases in ES that look untranslated
// Filter: value has 3+ words, contains common English words
const englishPatterns = /\b(the|and|is|in|to|for|of|a|an|your|you|with|from|at|by|on|or|add|view|no|all|are|this|that|have|has|been|was|were|can|will|should|would|could|may|might|must|shall|need|want|keep|track|manage|create|delete|edit|save|upload|download|select|enter|click|search|filter|clear|show|hide|open|close|start|stop|back|next|previous|submit|confirm|cancel|retry|loading|error|success|warning|info|details|name|type|date|time|status|email|password|phone|address|notes|file|size|total|count|list|item|page|settings|options|action|button|label|title|heading|description|message|placeholder|required|optional|invalid|valid|enabled|disabled|active|inactive|pending|completed|failed|available|unavailable|free|pro|business|individual|dealer|insurer|workshop|construction|vehicle|car|truck|motorcycle|mileage|service|maintenance|reminder|document|invoice|receipt|report|export|import|history|summary|profile|account|organization|member|role|permission|owner|driver|technician|staff|vendor|supplier|inventory|part|site|location)\b/i;

console.log('=== Likely untranslated strings in ES ===');
const issues = [];
for (const key of Object.keys(esMap)) {
  const esVal = esMap[key];
  const enVal = enMap[key];
  if (!enVal || esVal === enVal) continue;
  
  // Check if ES value contains clear English phrases (5+ words, many English words)
  const words = esVal.split(/\s+/);
  if (words.length >= 3) {
    const englishWords = esVal.match(englishPatterns);
    if (englishWords && englishWords.length >= 2) {
      // More than half the words are English
      const ratio = englishWords.length / words.length;
      if (ratio > 0.4) {
        issues.push({ key, en: enVal, es: esVal });
      }
    }
  }
}

issues.forEach(e => console.log(`  ${e.key}:\n    EN: "${e.en}"\n    ES: "${e.es}"\n`));
console.log(`Total: ${issues.length} likely untranslated`);
