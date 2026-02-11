require('dotenv').config();   // 👈 MUST

const mongoose = require('mongoose');
const Paragraph = require('../models/Paragraph');
const { countWords } = require('../utils/normalizeText');

const MONGO_URI = process.env.MONGO_URI;

async function cleanup() {
  if (!MONGO_URI) {
    throw new Error("❌ MONGO_URI not found in .env");
  }

  await mongoose.connect(MONGO_URI);
  console.log("✅ DB Connected");

  const paragraphs = await Paragraph.find({});
  console.log(`🔍 Total paragraphs: ${paragraphs.length}`);

  let deleted = 0;

  for (const p of paragraphs) {
    const wordCount = countWords(p.text);

    const isValid =
      [200, 300, 500, 1000].includes(p.passage) &&
      wordCount >= p.passage;

    if (!isValid) {
      await Paragraph.deleteOne({ _id: p._id });
      deleted++;

      console.log(`❌ Deleted:
      ID: ${p._id}
      Passage: ${p.passage}
      Words: ${wordCount}`);
    }
  }

  console.log(`🧹 Cleanup done. Deleted: ${deleted}`);
  process.exit();
}

cleanup();
