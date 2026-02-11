require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const paragraphRoutes = require('./routes/ParagraphRoutes');
const Result = require('./models/result'); // ✅ Import your result model

const app = express();

app.use(cors());
app.use(express.json());

// Connect to Database
connectDB();

// Routes
app.use('/api', authRoutes);
app.use('/api', paragraphRoutes);

// ✅ Save Typing Result Route
app.post('/api/save-result', async (req, res) => {
  try {
    const { userName, wordsTyped, accuracy, timeTaken, font, language } = req.body;

    // ------------------------
    // ✅ VALIDATION (Correct way)
    // ------------------------
    if (!userName) {
      return res.status(400).json({ message: "User name is required" });
    }

    if (wordsTyped === undefined || accuracy === undefined || timeTaken === undefined) {
      return res.status(400).json({ message: "wordsTyped, accuracy & timeTaken are required" });
    }

    // Normalize username
    const normalizedUser = userName.trim().toLowerCase();

    // ------------------------
    // Save result
    // ------------------------
    const newResult = new Result({
      userName: normalizedUser,
      wordsTyped,
      accuracy,
      timeTaken,
      font,
      language,
      createdAt: new Date(),
    });

    await newResult.save();

    return res.status(201).json({ message: "Result saved successfully!" });

  } catch (error) {
    console.error("Error saving result:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});
// Add these new routes after your existing /api/save-result

app.post('/api/send-results', async (req, res) => {
  try {
    const { userEmail, userMobile, result } = req.body;

    // Validation
    if (!result) {
      return res.status(400).json({ message: "Result data is required" });
    }

    // Get user details from database based on username
    const user = await User.findOne({ 
      $or: [
        { username: result.userName.toLowerCase() },
        { email: userEmail },
        { mobile: userMobile }
      ]
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const emailToSend = userEmail || user.email;
    const mobileToSend = userMobile || user.mobile;

    let emailSent = false;
    let smsSent = false;

    // Send email if user has email
    if (emailToSend) {
      try {
        await sendEmail(emailToSend, result);
        emailSent = true;
        console.log(`Results email sent to: ${emailToSend}`);
      } catch (emailError) {
        console.error('Error sending email:', emailError);
      }
    }

    // Send SMS if user has mobile
    if (mobileToSend) {
      try {
        await sendSMS(mobileToSend, result);
        smsSent = true;
        console.log(`Results SMS sent to: ${mobileToSend}`);
      } catch (smsError) {
        console.error('Error sending SMS:', smsError);
      }
    }

    res.json({ 
      success: true, 
      message: 'Results processed successfully',
      emailSent,
      smsSent,
      sentTo: {
        email: emailToSend,
        mobile: mobileToSend
      }
    });

  } catch (error) {
    console.error('Error sending results:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send results' 
    });
  }
});

// Helper function to send email
async function sendEmail(email, result) {
  const emailContent = `
    Typing Test Results - Professional Typing Master
    ===============================================

    Congratulations! Your typing test has been completed successfully.

    Test Details:
    -------------
    📝 Words Typed: ${result.wordsTyped}
    ⚡ WPM (Words Per Minute): ${result.wpm}
    🎯 Accuracy: ${result.accuracy}%
    ❌ Errors: ${result.errors}
    ⏱️ Time Taken: ${result.timeTaken} seconds
    📊 Exam Pattern: ${result.examPattern}
    🌐 Language: ${result.language}
    🔤 Font Used: ${result.font}
    🗓️ Date: ${new Date(result.timestamp).toLocaleString()}

    Performance Summary:
    --------------------
    ${result.accuracy >= 90 ? 'Excellent! You have outstanding typing skills.' : 
      result.accuracy >= 80 ? 'Great job! Your typing skills are very good.' :
      result.accuracy >= 70 ? 'Good effort! Keep practicing to improve.' :
      'Keep practicing! Regular practice will help improve your speed and accuracy.'}

    Tips for Improvement:
    ---------------------
    • Practice regularly for 15-20 minutes daily
    • Focus on accuracy first, then speed
    • Use proper finger positioning
    • Take breaks to avoid fatigue

    Thank you for using Professional Typing Master!

    Best regards,
    Professional Typing Master Team
  `;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .result-card { background: white; padding: 20px; margin: 10px 0; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        .metric { display: flex; justify-content: space-between; margin: 10px 0; padding: 10px; background: #f8f9fa; border-radius: 5px; }
        .tip { background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 10px 0; }
        .footer { text-align: center; padding: 20px; background: #2c3e50; color: white; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>📝 Typing Test Results</h1>
        <p>Professional Typing Master</p>
      </div>
      
      <div class="content">
        <div class="result-card">
          <h2>🎉 Test Completed Successfully!</h2>
          <p>Congratulations on completing your typing test!</p>
          
          <h3>📊 Your Results:</h3>
          <div class="metric">
            <span><strong>Words Typed:</strong></span>
            <span>${result.wordsTyped}</span>
          </div>
          <div class="metric">
            <span><strong>WPM (Words Per Minute):</strong></span>
            <span>${result.wpm}</span>
          </div>
          <div class="metric">
            <span><strong>Accuracy:</strong></span>
            <span>${result.accuracy}%</span>
          </div>
          <div class="metric">
            <span><strong>Errors:</strong></span>
            <span>${result.errors}</span>
          </div>
          <div class="metric">
            <span><strong>Time Taken:</strong></span>
            <span>${result.timeTaken} seconds</span>
          </div>
          <div class="metric">
            <span><strong>Exam Pattern:</strong></span>
            <span>${result.examPattern}</span>
          </div>
          <div class="metric">
            <span><strong>Language:</strong></span>
            <span>${result.language}</span>
          </div>
        </div>

        <div class="tip">
          <h3>💡 Performance Feedback:</h3>
          <p>
            ${result.accuracy >= 90 ? '🏆 Excellent! You have outstanding typing skills.' : 
              result.accuracy >= 80 ? '⭐ Great job! Your typing skills are very good.' :
              result.accuracy >= 70 ? '👍 Good effort! Keep practicing to improve.' :
              '💪 Keep practicing! Regular practice will help improve your speed and accuracy.'}
          </p>
        </div>

        <div class="tip">
          <h3>🚀 Tips for Improvement:</h3>
          <ul>
            <li>Practice regularly for 15-20 minutes daily</li>
            <li>Focus on accuracy first, then speed</li>
            <li>Use proper finger positioning</li>
            <li>Take breaks to avoid fatigue</li>
            <li>Try different keyboard layouts to find what works best</li>
          </ul>
        </div>
      </div>

      <div class="footer">
        <p>Thank you for using <strong>Professional Typing Master</strong></p>
        <p>Keep practicing and improving your skills!</p>
      </div>
    </body>
    </html>
  `;

  // Using nodemailer to send email
  const transporter = nodemailer.createTransport({
    service: 'gmail', // or your email service
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your Typing Test Results - Professional Typing Master',
    text: emailContent,
    html: htmlContent
  };

  await transporter.sendMail(mailOptions);
}

// Helper function to send SMS
async function sendSMS(mobile, result) {
  const smsContent = `
Typing Test Results:
Words: ${result.wordsTyped}
WPM: ${result.wpm}
Accuracy: ${result.accuracy}%
Errors: ${result.errors}
Time: ${result.timeTaken}s
Pattern: ${result.examPattern}
Well done! Keep practicing.
  `;

  // Using Twilio for SMS
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const client = require('twilio')(accountSid, authToken);

  await client.messages.create({
    body: smsContent,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: mobile
  });
}

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
