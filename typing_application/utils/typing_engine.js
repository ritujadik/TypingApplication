// export const analyzeTyping = (referenceText, typedText) => {
//   const clean = (word) => word.toLowerCase().replace(/[^\w]/g, "");

//   const refWords = referenceText.trim().split(/\s+/).map(clean);
//   const typedWords = typedText.trim().split(/\s+/).map(clean);

//   const n = refWords.length;
//   const m = typedWords.length;

//   // DP matrix for word-level Levenshtein distance
//   const dp = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));
//   for (let i = 0; i <= n; i++) dp[i][0] = i;
//   for (let j = 0; j <= m; j++) dp[0][j] = j;

//   for (let i = 1; i <= n; i++) {
//     for (let j = 1; j <= m; j++) {
//       if (refWords[i - 1] === typedWords[j - 1]) {
//         dp[i][j] = dp[i - 1][j - 1]; // correct
//       } else {
//         dp[i][j] =
//           1 +
//           Math.min(
//             dp[i - 1][j - 1], // substitution (wrong)
//             dp[i - 1][j],     // deletion (skipped)
//             dp[i][j - 1]      // insertion (extra)
//           );
//       }
//     }
//   }

//   // Traceback to classify mistakes
//   let i = n, j = m;
//   let correctWords = 0, wrongWords = 0, extraWords = 0, skippedWords = 0;
//   const incorrectWordPositions = [];

//   while (i > 0 && j > 0) {
//     if (refWords[i - 1] === typedWords[j - 1]) {
//       correctWords++;
//       i--; j--;
//     } else if (dp[i][j] === 1 + dp[i - 1][j - 1]) {
//       wrongWords++;
//       incorrectWordPositions.push(j - 1);
//       i--; j--;
//     } else if (dp[i][j] === 1 + dp[i - 1][j]) {
//       skippedWords++;
//       i--;
//     } else if (dp[i][j] === 1 + dp[i][j - 1]) {
//       extraWords++;
//       incorrectWordPositions.push(j - 1);
//       j--;
//     }
//   }

//   while (i > 0) skippedWords++, i--;
//   while (j > 0) extraWords++, incorrectWordPositions.push(j - 1), j--;

//   const totalIncorrect = wrongWords + extraWords + skippedWords;
//   const accuracy = n > 0 ? Math.round((correctWords / n) * 100) : 100;

//   return {
//     typedWords: typedWords.length,
//     totalWords: n,
//     correctWords,
//     wrongWords,
//     extraWords,
//     skippedWords,
//     totalIncorrect,
//     incorrectWordPositions,
//     accuracy,
//   };
// };
export const analyzeTypingLive = (referenceText, typedText, startTime) => {
  // Helper: clean words (lowercase, remove punctuation)
  const clean = (word) => word.toLowerCase().replace(/[^\w]/g, "");

  // Clean and split reference & typed words
  const refWords = referenceText
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map(clean);

  const typedWords = typedText
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map(clean);

  let correctWords = 0;
  let incorrectWords = 0;
  let extraWords = 0;
  let skippedWords = 0;
  const incorrectWordPositions = [];

  let i = 0; // index for refWords
  let j = 0; // index for typedWords

  while (i < refWords.length && j < typedWords.length) {
    if (typedWords[j] === refWords[i]) {
      // Correct word
      correctWords++;
      i++;
      j++;
    } else if (typedWords[j] === refWords[i + 1]) {
      // Skipped word in typed text
      skippedWords++;
      i++;
    } else if (typedWords[j + 1] === refWords[i]) {
      // Extra word typed
      extraWords++;
      incorrectWordPositions.push(j);
      j++;
    } else {
      // Wrong word
      incorrectWords++;
      incorrectWordPositions.push(j);
      i++;
      j++;
    }
  }

  // Count remaining typed words as extra
  while (j < typedWords.length) {
    extraWords++;
    incorrectWordPositions.push(j);
    j++;
  }

  // Count remaining reference words as skipped
  while (i < refWords.length) {
    skippedWords++;
    i++;
  }

  const totalTyped = typedWords.length;
  const totalIncorrect = incorrectWords + extraWords + skippedWords;
  const totalWords = correctWords + totalIncorrect;
  const accuracy = totalTyped > 0 ? Math.round((correctWords / totalTyped) * 100) : 0;

  // Live WPM calculation
  let wpm = 0;
  if (startTime) {
    const elapsedMinutes = (Date.now() - startTime) / 1000 / 60;
    wpm = elapsedMinutes > 0 ? Math.round(totalTyped / elapsedMinutes) : 0;
  }

  return {
    typedWords: totalTyped,
    totalWords,
    correctWords,
    incorrectWords,
    extraWords,
    skippedWords,
    totalIncorrect,
    incorrectWordPositions,
    accuracy,
    wpm,
  };
};