export const calculateTypingStats = ({
  referenceText,
  typedText,
  startTime
}) => {

  const clean = (word) =>
    word
      .toLowerCase()
      .replace(/[^\w]/g, "");

  const referenceWords = referenceText.trim().split(/\s+/);
  const typedWords = typedText.trim().split(/\s+/);

  let correctWords = 0;
  let wrongWords = 0;
  let extraWords = 0;

  const incorrectWordPositions = [];

  for (let i = 0; i < typedWords.length; i++) {

    const typed = clean(typedWords[i]);
    const reference = clean(referenceWords[i] || "");

    if (!referenceWords[i]) {
      extraWords++;
      incorrectWordPositions.push(i);
      continue;
    }

    if (typed === reference) {
      correctWords++;
    } else {
      wrongWords++;
      incorrectWordPositions.push(i);
    }

  }

  const skippedWords =
    referenceWords.length > typedWords.length
      ? referenceWords.length - typedWords.length
      : 0;

  const typedWordsCount = typedWords.length;
  const totalWordsCount = referenceWords.length;

  const timeElapsedMs =
    startTime ? new Date() - startTime : 0;

  const timeElapsedMinutes =
    timeElapsedMs / 1000 / 60;

  const wpm =
    timeElapsedMinutes > 0
      ? Math.round(typedWordsCount / timeElapsedMinutes)
      : 0;

  const totalIncorrect =
    wrongWords + extraWords + skippedWords;

  const accuracy =
    typedWordsCount > 0
      ? Math.round(
          (correctWords / typedWordsCount) * 100
        )
      : 100;

  return {
    typedWords: typedWordsCount,
    totalWords: totalWordsCount,
    correctWords,
    wrongWords,
    extraWords,
    skippedWords,
    totalIncorrect,
    incorrectWordPositions,
    accuracy,
    wpm
  };
};