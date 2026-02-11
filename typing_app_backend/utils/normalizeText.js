function normalizeText(text) {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\n+/g, ' ')
    .trim();
}

function countWords(text) {
  if (!text || typeof text !== 'string') return 0;
  return normalizeText(text).split(' ').length;
}

module.exports = { normalizeText, countWords };
