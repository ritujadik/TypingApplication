const { countWords } = require('./normalizeText');

function getPassageByWordCountUtil(text) {
  const words = countWords(text);

  if (words >= 1000) {
    return 1000;
  }

  if (words >= 500) {
    return 500;
  }

  if (words >= 300) {
    return 300;
  }

  if (words >= 200) {
    return 200;
  }

  throw new Error(
    `Word count too low. Minimum 200 words required. Got ${words}`
  );
}

module.exports = { getPassageByWordCountUtil };
