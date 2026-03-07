const express = require('express');
const router = express.Router();
const Paragraph = require('../models/Paragraph');

const { getPassageByWordCountUtil } = require('../utils/getPassageByWordCount');

router.post('/paragraph', async (req, res) => {
  try {
    const { language, text } = req.body;

    if (!language || !text) {
      return res.status(400).json({
        success: false,
        message: "Language and text are required"
      });
    }
    
    console.log("📥 Received paragraph creation request - Language:", language, "Text length:", text.length);

    // Calculate word count
    const wordCount = text.trim().split(/\s+/).length;

    // Find the highest mock number for this language
    const lastParagraph = await Paragraph.findOne({
      language
    }).sort({ mock: -1 });

    const nextMock = lastParagraph ? lastParagraph.mock + 1 : 1;

    // Create new paragraph without time and passage
    const newParagraph = new Paragraph({
      language,
      text,
      mock: nextMock,
      wordCount: wordCount
    });

    await newParagraph.save();

    res.status(201).json({
      success: true,
      message: "Paragraph created successfully",
      data: {
        id: newParagraph._id,
        language,
        mock: nextMock,
        wordCount: wordCount
      }
    });

  } catch (error) {
    console.error("❌ Paragraph API error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error: " + error.message
    });
  }
});
// Optional: API to get all paragraphs with filtering
router.get('/paragraphs/:language', async (req, res) => {   
    try {
        let { language } = req.params;
        const { mock } = req.query;
        console.log("📥 Request received - Language:", language, "Mock:", mock);

        // Clean the language parameter
        language = language.replace('}', '').trim().toLowerCase();
        
        // Build filter
        const filter = { language };
        
        // Add mock filter if provided
        if (mock && mock !== 'undefined' && mock !== '') {
            const mockNum = parseInt(mock);
            if (!isNaN(mockNum)) {
                filter.mock = mockNum;
            }
        }
        
        console.log("🔍 Database filter:", filter);

        // Get ALL paragraphs matching the language and mock
        const paragraphs = await Paragraph.find(filter);
        
        console.log("📊 Total paragraphs found:", paragraphs.length);
        
        if (!paragraphs || paragraphs.length === 0) {
            console.log("❌ No paragraphs found for filter:", filter);
            return res.status(404).json({ 
                success: false,
                error: `No paragraphs found for ${language}${mock ? ` with mock ${mock}` : ''}`
            });
        }
        
        // Format all paragraphs
        const allParagraphs = paragraphs.map(p => ({
            text: p.text,
            language: p.language,
            mock: p.mock,
            actualWords: p.text.trim().split(/\s+/).length
        }));
        
        console.log(`✅ Sending ${allParagraphs.length} paragraphs for ${language} mock ${mock || 'all'}`);
        
        res.json({ 
            success: true,
            paragraphs: allParagraphs, // Send ALL paragraphs
            count: allParagraphs.length,
            language: language,
            mock: mock || 'all'
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
router.get('/test', (req, res) => {
    res.json({ message: "Test endpoint is working!" });
});

module.exports = router;