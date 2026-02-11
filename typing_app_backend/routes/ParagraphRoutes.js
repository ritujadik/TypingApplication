const express = require('express');
const router = express.Router();
const Paragraph = require('../models/Paragraph');

const { getPassageByWordCountUtil } = require('../utils/getPassageByWordCount');

router.post('/paragraph', async (req, res) => {
  try {
    const { language, text, pattern, time } = req.body;

    if (!language || !text || !time) {
      return res.status(400).json({
        success: false,
        message: "Language, text and time are required"
      });
    }

    let passage;
    try {
      passage = getPassageByWordCountUtil(text);
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    const paragraphPattern = pattern || 'SSC';

    const existingParagraph = await Paragraph.findOne({
      language,
      pattern: paragraphPattern,
      time,
      passage,
      text
    });

    if (existingParagraph) {
      return res.status(409).json({
        success: false,
        message: "Paragraph already exists"
      });
    }

    const lastParagraph = await Paragraph.findOne({
      language,
      pattern: paragraphPattern,
      time,
      passage
    }).sort({ mock: -1 });

    const nextMock = lastParagraph ? lastParagraph.mock + 1 : 1;

    const newParagraph = new Paragraph({
      language,
      pattern: paragraphPattern,
      time,
      passage,
      text,
      mock: nextMock
    });

    await newParagraph.save();

    res.status(201).json({
      success: true,
      message: "Paragraph created successfully",
      data: {
        language,
        pattern: paragraphPattern,
        time,
        passage,
        mock: nextMock
      }
    });

  } catch (error) {
    console.error("❌ Paragraph API error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});
// Optional: API to get all paragraphs with filtering
router.get('/paragraphs/:language', async (req, res) => {   
    try {
        let { language } = req.params;
        const { mock, wordCount, passage, length } = req.query;

        // Clean the language parameter
        language = language.replace('}', '').trim().toLowerCase();
        
        // Determine word count from various possible parameters
        let requestedWords = 200; // Default
        if (wordCount) requestedWords = parseInt(wordCount);
        else if (passage) requestedWords = parseInt(passage);
        else if (length) requestedWords = parseInt(length);
        
        console.log("📥 Request received - Language:", language, "Mock:", mock, "Words:", requestedWords);

        // Build filter
        const filter = { language };
        
        // Add mock filter if provided
        if (mock && mock !== 'undefined' && mock !== '') {
            const mockNum = parseInt(mock);
            if (!isNaN(mockNum)) {
                filter.mock = mockNum;
            }
        }
        
        // ADD WORD COUNT FILTERING
        // Since paragraphs have varying lengths, we need to find ones close to requested length
        // We'll get all matching paragraphs and then filter by word count
        
        console.log("🔍 Database filter:", filter);

        // First get all paragraphs matching the language and mock
        const allParagraphs = await Paragraph.find(filter);
        
        console.log("📊 Total paragraphs found:", allParagraphs.length);
        
        if (!allParagraphs || allParagraphs.length === 0) {
            console.log("❌ No paragraphs found for filter:", filter);
            return res.status(404).json({ 
                success: false,
                error: `No paragraphs found for ${language}${mock ? ` with mock ${mock}` : ''}`
            });
        }
        
        // Calculate word count for each paragraph
        const paragraphsWithWordCount = allParagraphs.map(p => {
            const wordCount = p.text.trim().split(/\s+/).length;
            return {
                ...p._doc,
                actualWords: wordCount,
                wordDiff: Math.abs(wordCount - requestedWords)
            };
        });
        
        // Filter paragraphs within ±20% of requested word count
        const tolerance = requestedWords * 0.2; // 20% tolerance
        const suitableParagraphs = paragraphsWithWordCount.filter(p => 
            p.wordDiff <= tolerance
        );
        
        console.log(`📊 Suitable paragraphs (within ${tolerance.toFixed(0)} words):`, suitableParagraphs.length);
        
        // If no paragraphs within tolerance, use closest one
        let selectedParagraph;
        if (suitableParagraphs.length === 0) {
            console.log("⚠️ No paragraphs within tolerance, using closest match");
            // Find paragraph with smallest difference
            paragraphsWithWordCount.sort((a, b) => a.wordDiff - b.wordDiff);
            selectedParagraph = paragraphsWithWordCount[0];
        } else {
            // Randomly select from suitable paragraphs
            const randomIndex = Math.floor(Math.random() * suitableParagraphs.length);
            selectedParagraph = suitableParagraphs[randomIndex];
        }
        
        console.log(`✅ Sending paragraph - Words: ${selectedParagraph.actualWords} (requested: ${requestedWords})`);
        
        res.json({ 
            success: true,
            paragraph: selectedParagraph.text,
            language: selectedParagraph.language,
            mock: selectedParagraph.mock,
            actualWords: selectedParagraph.actualWords,
            requestedWords: requestedWords
        });
        
    } catch (error) {
        console.error("🚨 Server error:", error);
        res.status(500).json({ 
            success: false,
            error: "Internal server error: " + error.message 
        });
    }
});
// Get available mock tests for a language
router.get('/mocks/:language', async (req, res) => {
    try {
        const { language } = req.params;
        
        console.log("📥 Fetching available mocks for language:", language);
        
        // Get unique mock numbers for the language
        const mocks = await Paragraph.aggregate([
            { $match: { language: language } },
            { 
                $group: { 
                    _id: "$mock",
                    count: { $sum: 1 }
                } 
            },
            { $sort: { _id: 1 } }
        ]);
        
        console.log("📊 Found mock groups:", mocks.length);
        
        // Format the response
        const availableMocks = mocks.map(mock => ({
            id: mock._id,
            name: `Mock Test ${mock._id}`,
            count: mock.count
        }));
        
        res.json({
            success: true,
            language: language,
            availableMocks: availableMocks
        });
        
    } catch (error) {
        console.error("Error fetching mocks:", error);
        res.status(500).json({
            success: false,
            error: "Internal server error: " + error.message
        });
    }
});
module.exports = router;