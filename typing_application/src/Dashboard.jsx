import React, { useState, useEffect, useRef, useCallback } from "react";
import "./App.css";
import { FontRenderer } from "./components/FontRenderer";
import ResultPage from "./components/ResultPage";
import { useAuth } from "./context/AuthContext";

function Dashboard() {
  // ✅ Safely get auth context with fallback
  let authContext;
  try {
    authContext = useAuth();
  } catch (error) {
    // Fallback for when AuthContext is not available
    authContext = {
      user: { username: "Guest", email: "guest@example.com" },
      logout: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      },
      loading: false,
    };
  }

  const { user, logout, loading } = authContext;

  // State management
  const [currentLanguage, setCurrentLanguage] = useState("hindi");
  const [currentFont, setCurrentFont] = useState("Kruti Dev 010");
  const [testType, setTestType] = useState("practice");
  const [userInput, setUserInput] = useState("");
  const [testStarted, setTestStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [currentText, setCurrentText] = useState(0);
  const [fontStatus, setFontStatus] = useState("checking");
  const [testCompleted, setTestCompleted] = useState(false);
  const [paragraphText, setParagraphText] = useState("");
  const [paragraphLoading, setParagraphLoading] = useState(false);
  const [paragraphError, setParagraphError] = useState("");
  const [showResults, setShowResults] = useState(false);

  // New dropdown states
  const [selectedTime, setSelectedTime] = useState("2 Min");
  const [selectedPassage, setSelectedPassage] = useState(200);
  const [selectedMock, setSelectedMock] = useState(1);
  const [availableMocks, setAvailableMocks] = useState([]);

  // Result data state
  const [testResults, setTestResults] = useState({
    wpm: 0,
    accuracy: 0,
    totalWords: 0,
    typedWords: 0,
    totalCharacters: 0,
    correctCharacters: 0,
    timeTaken: 0,
    errors: 0,
    date: new Date().toLocaleString(),
  });

  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const textareaRef = useRef(null);
  const forceRenderRef = useRef(false);

  // API base URL
  const API_BASE_URL = "http://localhost:5000/api";

  // All available fonts for government exams
  const allFonts = {
    hindi: [
      {
        id: "kruti-dev-010",
        name: "Kruti Dev 010",
        type: "non-unicode",
        exam: "SSC, UPSSSC, MP, Rajasthan Govt",
        style: "font-kruti-dev",
        preview: "क ख ग",
      },
      {
        id: "devlys-010",
        name: "DevLys 010",
        type: "non-unicode",
        exam: "SSC, UPSSSC",
        style: "font-devlys",
        preview: "क ख ग",
      },
      {
        id: "mangal",
        name: "Mangal",
        type: "unicode",
        exam: "All Govt Exams",
        style: "font-mangal",
        preview: "क ख ग",
      },
    ],
    english: [
      {
        id: "times-new-roman",
        name: "Times New Roman",
        type: "serif",
        exam: "SSC, Banking, All Govt",
        style: "font-times",
        preview: "Aa Bb Cc",
      },
      {
        id: "calibri",
        name: "Calibri",
        type: "sans-serif",
        exam: "Modern Exams",
        style: "font-calibri",
        preview: "Aa Bb Cc",
      },
      {
        id: "arial",
        name: "Arial",
        type: "sans-serif",
        exam: "All Exams",
        style: "font-arial",
        preview: "Aa Bb Cc",
      },
    ],
  };

  // Practice texts (fallback if API fails)
  const practiceTexts = {
    hindi: [
      {
        id: 1,
        text: "नमस्ते! यह हिंदी टाइपिंग टेस्ट है। सरकारी परीक्षाओं के लिए अभ्यास करें।",
        englishTypingEquivalent:
          "namaste! yah hindi typing test hai. sarkari parikshao ke liye abhyas karen.",
        exam: "SSC Typist Exam",
        words: 12,
      },
      {
        id: 2,
        text: "भारत का संविधान विश्व का सबसे बड़ा लिखित संविधान है। यह २६ नवम्बर १९४९ को अपनाया गया था।",
        englishTypingEquivalent:
          "bharat ka samvidhan vishv ka sabse bada likhit samvidhan hai. yah 26 november 1949 ko apnaya gaya tha.",
        exam: "UPSSSC Exam",
        words: 18,
      },
      {
        id: 3,
        text: "कंप्यूटर ऑपरेटर को हिंदी और अंग्रेजी दोनों भाषाओं में टाइपिंग आनी चाहिए। गति और शुद्धता दोनों महत्वपूर्ण हैं।",
        englishTypingEquivalent:
          "computer operator ko hindi aur angrezi dono bhashao mein typing aani chahiye. gati aur shuddhta dono mahatvpurn hain.",
        exam: "Computer Operator",
        words: 20,
      },
    ],
    english: [
      {
        id: 1,
        text: "The quick brown fox jumps over the lazy dog. This sentence contains all letters of the alphabet.",
        exam: "Basic Typing Test",
        words: 16,
      },
      {
        id: 2,
        text: "Government examinations require accurate typing skills with proper formatting and attention to detail.",
        exam: "Government Exams",
        words: 12,
      },
      {
        id: 3,
        text: "Regular practice improves typing speed and accuracy. Consistency is key to mastering any skill.",
        exam: "Practice Text",
        words: 14,
      },
    ],
  };

  // Time options
  const timeOptions = ["1 Min", "2 Min", "5 Min", "10 Min", "15 Min", "free"];

  // Passage options
  const passageOptions = [200, 300, 500, 1000];

  // Initialize
  useEffect(() => {
    fetchAvailableMocks(currentLanguage);
    fetchParagraph(
      currentLanguage,
      selectedTime,
      selectedPassage,
      selectedMock
    );

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 500);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Fetch available mocks
  const fetchAvailableMocks = async (language) => {
    try {
      const response = await fetch(`${API_BASE_URL}/mocks/${language}`);
      const data = await response.json();

      if (data.success) {
        setAvailableMocks(data.availableMocks);
        if (data.availableMocks.length > 0) {
          setSelectedMock(data.availableMocks[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching mocks:", error);
      setAvailableMocks([
        { id: 1, name: "Mock Test 1", count: 1 },
        { id: 2, name: "Mock Test 2", count: 1 },
      ]);
    }
  };

  // Fetch paragraph from API
  const fetchParagraph = async (language, time, passage, mock) => {
    try {
      setParagraphLoading(true);
      setParagraphError("");
      setParagraphText("");

      const params = new URLSearchParams({
        mock: mock || 1,
        wordCount: passage || 200,
        timestamp: new Date().getTime(),
      });

      if (time && time !== "free") {
        const timeValue = time.includes("Min") ? time.split(" ")[0] : time;
        params.append("time", `${timeValue} Min`);
      }

      const apiUrl = `${API_BASE_URL}/paragraphs/${language}?${params.toString()}`;
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (data.success && data.paragraph) {
        let finalText = data.paragraph;
        const requestedWords = passage || 200;

        const words = finalText.trim().split(/\s+/);
        if (words.length > requestedWords) {
          finalText = words.slice(0, requestedWords).join(" ");
        }

        setParagraphText(finalText);
      } else {
        setParagraphError("Failed to load paragraph from server");
        const fallbackText = generateUniqueFallback(language, passage, mock);
        setParagraphText(fallbackText);
      }
    } catch (error) {
      console.error("Error fetching paragraph:", error);
      setParagraphError("Network error. Using fallback text.");
      const fallbackText = generateUniqueFallback(
        currentLanguage,
        selectedPassage,
        selectedMock
      );
      setParagraphText(fallbackText);
    } finally {
      setParagraphLoading(false);
    }
  };

  // Generate unique fallback text based on parameters
  const generateUniqueFallback = (language, wordCount, mock) => {
    const words = wordCount || 200;
    const mockNum = mock || 1;
    const seed = `${language}-${words}-${mockNum}`;

    if (language === "hindi") {
      const baseTemplates = [
        `मॉक टेस्ट ${mockNum} (${words} शब्द): प्रतियोगी परीक्षाओं की तैयारी के लिए नियमित अभ्यास आवश्यक है। टाइपिंग गति और सटीकता दोनों का ध्यान रखना चाहिए। यह पैराग्राफ ${words} शब्दों का है और मॉक ${mockNum} के लिए तैयार किया गया है। `,
        `परीक्षा अभ्यास ${mockNum}: सरकारी नौकरियों के लिए हिंदी टाइपिंग का ज्ञान महत्वपूर्ण है। इस मॉक टेस्ट में ${words} शब्दों का पाठ दिया गया है। अभ्यास से ही सफलता मिलती है और नियमित प्रयास से गति बढ़ाई जा सकती है। `,
        `हिंदी टाइपिंग प्रैक्टिस ${mockNum}: कंप्यूटर ऑपरेटर पद के लिए ${words} शब्दों का यह पाठ अभ्यास के लिए तैयार किया गया है। शुद्धता और गति दोनों पर ध्यान दें। यह मॉक टेस्ट आपकी तैयारी में मदद करेगा। `,
      ];

      const templateIndex =
        Math.abs(
          seed.split("").reduce((a, b) => {
            a = (a << 5) - a + b.charCodeAt(0);
            return a & a;
          }, 0)
        ) % baseTemplates.length;

      const selectedTemplate = baseTemplates[templateIndex];
      const repeatedText = selectedTemplate.repeat(Math.ceil(words / 25));
      return repeatedText.split(" ").slice(0, words).join(" ");
    } else {
      const baseTemplates = [
        `Mock Test ${mockNum} (${words} words): Regular practice is essential for competitive exam preparation. Both typing speed and accuracy should be maintained. This paragraph contains ${words} words and is prepared for mock ${mockNum}. `,
        `Typing Practice ${mockNum}: Government job typing tests require consistent practice. This mock test contains ${words} words of text. Success comes with dedication and regular effort in improving your skills. `,
        `Exam Preparation ${mockNum}: Computer operator positions require proficiency in typing. This ${words}-word paragraph is designed for practice. Focus on both speed and accuracy to score well in the actual examination. `,
      ];

      const templateIndex =
        Math.abs(
          seed.split("").reduce((a, b) => {
            a = (a << 5) - a + b.charCodeAt(0);
            return a & a;
          }, 0)
        ) % baseTemplates.length;

      const selectedTemplate = baseTemplates[templateIndex];
      const repeatedText = selectedTemplate.repeat(Math.ceil(words / 25));
      return repeatedText.split(" ").slice(0, words).join(" ");
    }
  };

  // Update paragraph when settings change
  useEffect(() => {
    if (!currentLanguage || !selectedMock) return;

    fetchParagraph(
      currentLanguage,
      selectedTime,
      selectedPassage,
      selectedMock
    );

    const focusTimer = setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 500);

    return () => {
      clearTimeout(focusTimer);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentLanguage, selectedTime, selectedPassage, selectedMock]);

  // Font check when font changes
  useEffect(() => {
    checkFontsAvailability();
  }, [currentFont]);

  // Handle dropdown changes
  const handleTimeChange = (e) => {
    const value = e.target.value;
    setSelectedTime(value);

    if (testStarted) {
      if (window.confirm("Changing time will reset the test. Continue?")) {
        resetTest();
        setTimeout(() => {
          fetchParagraph(currentLanguage, value, selectedPassage, selectedMock);
        }, 100);
      } else {
        e.target.value = selectedTime;
        return;
      }
    } else {
      fetchParagraph(currentLanguage, value, selectedPassage, selectedMock);
    }
  };

  const handlePassageChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setSelectedPassage(value);

    if (testStarted) {
      if (window.confirm("Changing passage will reset the test. Continue?")) {
        resetTest();
        setTimeout(() => {
          fetchParagraph(currentLanguage, selectedTime, value, selectedMock);
        }, 100);
      } else {
        e.target.value = selectedPassage;
        return;
      }
    } else {
      fetchParagraph(currentLanguage, selectedTime, value, selectedMock);
    }
  };

  const handleMockChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setSelectedMock(value);

    if (testStarted) {
      if (window.confirm("Changing mock will reset the test. Continue?")) {
        resetTest();
        setTimeout(() => {
          fetchParagraph(currentLanguage, selectedTime, selectedPassage, value);
        }, 100);
      } else {
        e.target.value = selectedMock;
        return;
      }
    } else {
      fetchParagraph(currentLanguage, selectedTime, selectedPassage, value);
    }
  };

  // Get current font object
  const getCurrentFontObject = () => {
    const fonts =
      currentLanguage === "hindi" ? allFonts.hindi : allFonts.english;

    let foundFont = fonts.find((f) => f.name === currentFont);

    if (!foundFont) {
      foundFont = fonts.find(
        (f) => f.name.toLowerCase().trim() === currentFont.toLowerCase().trim()
      );
    }

    return foundFont || fonts[0];
  };

  // Check fonts availability
  const checkFontsAvailability = () => {
    const fontObj = getCurrentFontObject();

    const fontChecks = {
      "font-devlys": ["DevLys010", "DevLys 010", "DevLys"],
      "font-kruti-dev": ["KrutiDev010", "Kruti Dev 010", "KrutiDev"],
      "font-mangal": ["Mangal"],
      "font-times": ["Times New Roman"],
      "font-calibri": ["Calibri"],
      "font-arial": ["Arial"],
    };

    const variants = fontChecks[fontObj.style] || [fontObj.name];
    let fontAvailable = false;

    variants.forEach((variant) => {
      const isAvailable = document.fonts.check(`16px "${variant}"`);
      if (isAvailable && !fontAvailable) {
        fontAvailable = true;
        setFontStatus("available");
      }
    });

    if (!fontAvailable) {
      setFontStatus("not-available");
    }
  };

  // Handle language change
  const handleLanguageChange = (language) => {
    setCurrentLanguage(language);
    const firstFont = allFonts[language][0];
    setCurrentFont(firstFont.name);
    setCurrentText(0);
    setUserInput("");
    resetTest();
    fetchAvailableMocks(language);
    fetchParagraph(language, selectedTime, selectedPassage, selectedMock);
  };

  // Handle font change
  const handleFontChange = (fontName) => {
    setCurrentFont(fontName);
    setUserInput("");

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
      forceRenderRef.current = !forceRenderRef.current;
    }, 100);
  };

  // Start test
  const startTest = () => {
    if (testStarted) {
      if (window.confirm("Test is already running. Restart?")) {
        resetTest();
        return;
      }
    }

    setTestStarted(true);
    setTestCompleted(false);
    setShowResults(false);
    const timeInSeconds =
      selectedTime === "free" ? 0 : parseInt(selectedTime) * 60;
    setTimeLeft(timeInSeconds > 0 ? timeInSeconds : 9999);
    setUserInput("");
    setWpm(0);
    setAccuracy(100);
    startTimeRef.current = new Date();

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 100);

    alert(
      `Test started! You have ${
        selectedTime === "free" ? "unlimited" : selectedTime
      }.`
    );
  };

  // Timer effect
  useEffect(() => {
    if (testStarted && timeLeft > 0 && selectedTime !== "free") {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            endTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [testStarted, timeLeft, selectedTime]);

  // End test
  const endTest = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setTestStarted(false);
    setTestCompleted(true);
    calculateResults();
    setShowResults(true);
  };

  // Calculate results
  const calculateResults = () => {
    if (!startTimeRef.current || userInput.trim() === "") {
      const emptyResults = {
        wpm: 0,
        accuracy: 0,
        totalWords: 0,
        typedWords: 0,
        totalCharacters: 0,
        correctCharacters: 0,
        timeTaken: 0,
        errors: 0,
        date: new Date().toLocaleString(),
      };
      setWpm(0);
      setAccuracy(0);
      setTestResults(emptyResults);
      return emptyResults;
    }

    const reference = paragraphText || getCurrentPracticeText().text;
    const typed = userInput;

    let correctChars = 0;
    let errors = 0;
    const minLength = Math.min(typed.length, reference.length);

    for (let i = 0; i < minLength; i++) {
      if (typed[i] === reference[i]) {
        correctChars++;
      } else {
        errors++;
      }
    }

    if (typed.length > reference.length) {
      errors += typed.length - reference.length;
    } else if (typed.length < reference.length) {
      errors += reference.length - typed.length;
    }

    const newAccuracy =
      minLength > 0 ? Math.round((correctChars / minLength) * 100) : 100;
    setAccuracy(newAccuracy);

    const timeElapsed = (new Date() - startTimeRef.current) / 1000 / 60;
    const words = typed
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 0).length;
    const newWpm = timeElapsed > 0 ? Math.round(words / timeElapsed) : words;
    setWpm(newWpm);

    const totalWords = reference
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 0).length;

    const results = {
      wpm: newWpm,
      accuracy: newAccuracy,
      totalWords: totalWords,
      typedWords: words,
      totalCharacters: reference.length,
      correctCharacters: correctChars,
      timeTaken: timeElapsed * 60,
      errors: errors,
      date: new Date().toLocaleString(),
    };

    setTestResults(results);
    return results;
  };

  // Reset test
  const resetTest = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setTestStarted(false);
    setTestCompleted(false);
    setShowResults(false);
    const timeInSeconds =
      selectedTime === "free" ? 0 : parseInt(selectedTime) * 60;
    setTimeLeft(timeInSeconds > 0 ? timeInSeconds : 9999);
    setUserInput("");
    setWpm(0);
    setAccuracy(100);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 100);
  };

  // Handle input change
  const handleInputChange = useCallback((e) => {
    setUserInput(e.target.value);
  }, []);

  // Load practice text
  const loadPracticeText = (index) => {
    setCurrentText(index);
    setUserInput("");
    resetTest();
    setShowResults(false);
    setParagraphText(getCurrentPracticeText().text);
  };

  // Get current practice text (fallback)
  const getCurrentPracticeText = () => {
    return currentLanguage === "hindi"
      ? practiceTexts.hindi[currentText]
      : practiceTexts.english[currentText];
  };

  // Get word count
  const getWordCount = () => {
    return paragraphText.trim().split(/\s+/).length;
  };

  // Get font style class
  const getFontStyleClass = () => {
    const fontObj = getCurrentFontObject();
    return fontObj?.style || "font-kruti-dev";
  };

  // Get typing instructions
  const getTypingInstructions = () => {
    if (currentLanguage === "hindi") {
      const fontObj = getCurrentFontObject();
      if (fontObj.type === "non-unicode") {
        return "Type with English keyboard (e.g., 'namaste' for नमस्ते)";
      } else {
        return "Switch to Hindi keyboard (Win+Space) and type phonetically";
      }
    }
    return "";
  };

  // Get English typing equivalent for current Hindi text
  const getEnglishTypingEquivalent = () => {
    if (currentLanguage === "hindi" && practiceTexts.hindi[currentText]) {
      return practiceTexts.hindi[currentText].englishTypingEquivalent;
    }
    return "";
  };

  // Submit test
  const submitTest = () => {
    if (!testStarted) {
      alert("Please start the test first!");
      return;
    }

    if (window.confirm("Are you sure you want to submit the test?")) {
      endTest();
      setUserInput("");
    }
  };

  // Save results function
  const handleSaveResults = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login to save results");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/results/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          testType,
          language: currentLanguage,
          font: currentFont,
          timeDuration: selectedTime,
          passageLength: selectedPassage,
          mockTest: selectedMock,
          results: testResults,
          timestamp: new Date().toISOString(),
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert("Results saved successfully!");
      } else {
        alert("Failed to save results.");
      }
    } catch (error) {
      console.error("Error saving results:", error);
      alert("Error saving results. Please try again.");
    }
  };

  // Format time display
  const formatTime = (seconds) => {
    if (selectedTime === "free") return "∞";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Handle logout
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
      window.location.href = "/login";
    }
  };

  // ✅ Show loading while auth is loading
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="App">
      {/* Header with User Info */}
      <div className="header">
        <div className="header-content">
          <h1 style={{ textAlign: "center" }}>
            Government Exam Typing Practice
          </h1>
          <div className="user-info-header">
            <span className="welcome-user">
              Welcome,{" "}
              <strong>{user?.username || user?.email || "Guest"}</strong>
            </span>
            {user && (
              <button className="logout-btn" onClick={handleLogout}>
                🚪 Logout
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="main-container">
        {/* Result Page */}
        {showResults ? (
          <ResultPage
            results={testResults}
            currentFont={currentFont}
            currentLanguage={currentLanguage}
            testType={testType}
            selectedTime={selectedTime}
            selectedPassage={selectedPassage}
            selectedMock={selectedMock}
            onPracticeAgain={resetTest}
            onSaveResults={handleSaveResults}
          />
        ) : (
          <>
            {/* Configuration Panel */}
            <div className="configuration-panel">
              <div className="controls-row">
                <div className="control-group">
                  <label>Test Type:</label>
                  <select
                    value={testType}
                    onChange={(e) => setTestType(e.target.value)}
                    disabled={testStarted}
                  >
                    <option value="practice">Practice Test</option>
                    <option value="timed">Timed Test</option>
                    <option value="exam">Exam Simulation</option>
                  </select>
                </div>

                <div className="control-group">
                  <label>Language:</label>
                  <select
                    value={currentLanguage}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                    disabled={testStarted}
                  >
                    <option value="hindi">Hindi</option>
                    <option value="english">English</option>
                  </select>
                </div>

                <div className="control-group">
                  <label>Font:</label>
                  <select
                    value={currentFont}
                    onChange={(e) => handleFontChange(e.target.value)}
                    disabled={testStarted}
                  >
                    {(currentLanguage === "hindi"
                      ? allFonts.hindi
                      : allFonts.english
                    ).map((font) => (
                      <option key={font.id} value={font.name}>
                        {font.name} ({font.type})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* New dropdowns row */}
              <div className="controls-row dropdowns-row">
                <div className="control-group">
                  <label>Time Duration:</label>
                  <div className="select-wrapper">
                    <select
                      value={selectedTime}
                      onChange={handleTimeChange}
                      disabled={testStarted}
                      className="time-select"
                    >
                      {timeOptions.map((time) => (
                        <option key={time} value={time}>
                          {time === "free" ? "Free Practice" : time}
                        </option>
                      ))}
                    </select>
                    <div className="select-arrow">▼</div>
                  </div>
                </div>

                <div className="control-group">
                  <label>Passage Length:</label>
                  <div className="select-wrapper">
                    <select
                      value={selectedPassage}
                      onChange={handlePassageChange}
                      disabled={testStarted}
                      className="passage-select"
                    >
                      {passageOptions.map((passage) => (
                        <option key={passage} value={passage}>
                          {passage} words
                        </option>
                      ))}
                    </select>
                    <div className="select-arrow">▼</div>
                  </div>
                </div>

                <div className="control-group">
                  <label>Mock Test:</label>
                  <div className="select-wrapper">
                    <select
                      value={selectedMock}
                      onChange={handleMockChange}
                      disabled={testStarted}
                      className="mock-select"
                    >
                      {availableMocks.length > 0 ? (
                        availableMocks.map((mock) => (
                          <option key={mock.id} value={mock.id}>
                            {mock.name} ({mock.count} passages)
                          </option>
                        ))
                      ) : (
                        <option value={1}>Mock 1</option>
                      )}
                    </select>
                    <div className="select-arrow">▼</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Loading Indicator for paragraph */}
            {paragraphLoading && (
              <div className="loading-message">
                <div className="loading-spinner"></div>
                <p>Loading paragraph from server...</p>
              </div>
            )}

            {/* Error Message for paragraph */}
            {paragraphError && (
              <div className="error-message">
                <p>⚠️ {paragraphError} (Using fallback text)</p>
              </div>
            )}

            {/* Typing Instructions */}
            {currentLanguage === "hindi" && (
              <div className="typing-instructions-top">
                <div className="instructions-content">
                  <span className="instructions-icon">💡</span>
                  <span className="instructions-text">
                    <strong>Note:</strong> {getTypingInstructions()}
                    {getCurrentFontObject().type === "non-unicode" &&
                      getEnglishTypingEquivalent() && (
                        <span className="typing-example">
                          {" "}
                          Example: Type "
                          <strong>{getEnglishTypingEquivalent()}</strong>"
                        </span>
                      )}
                  </span>
                </div>
              </div>
            )}

            {/* Timer Display */}
            {testStarted && selectedTime !== "free" && (
              <div className="timer-display-top">
                <div className="timer-box">
                  <span className="timer-label">Time Remaining:</span>
                  <span className="timer-value">{formatTime(timeLeft)}</span>
                  <div className="timer-progress">
                    <div
                      className="timer-progress-bar"
                      style={{
                        width: `${
                          (timeLeft / (parseInt(selectedTime) * 60)) * 100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            {/* Main Typing Section */}
            <div className="typing-main-section">
              {/* Left side: Passage Display */}
              <div className="passage-display-section">
                <div className="section-header">
                  <h3>Type the text below:</h3>
                  <div className="section-meta">
                    <span className="meta-badge">
                      Language:{" "}
                      {currentLanguage === "hindi" ? "Hindi" : "English"}
                    </span>
                    <span className="meta-badge">Words: {getWordCount()}</span>
                    <span className="meta-badge">Font: {currentFont}</span>
                    <span className="meta-badge">Mock: {selectedMock}</span>
                  </div>
                </div>

                <div className="passage-container">
                  <FontRenderer
                    key={`paragraph-${currentLanguage}-${selectedMock}`}
                    fontType={getFontStyleClass()}
                    text={paragraphText || "Loading..."}
                    isInput={false}
                  />
                </div>
              </div>

              {/* Right side: Typing Area */}
              <div className="typing-input-section">
                <div className="section-header">
                  <h3>Your Typing:</h3>

                  {/* Control Buttons */}
                  <div className="controls-top">
                    <button
                      className={`control-btn-top start-btn ${
                        testStarted ? "active" : ""
                      }`}
                      onClick={startTest}
                    >
                      {testStarted
                        ? `⏱️ ${formatTime(timeLeft)}`
                        : "▶ Start Test"}
                    </button>

                    <button
                      className="control-btn-top submit-btn"
                      onClick={submitTest}
                      disabled={!testStarted}
                    >
                      ✓ Submit
                    </button>

                    <button
                      className="control-btn-top reset-btn"
                      onClick={resetTest}
                    >
                      ↺ Reset
                    </button>

                    <button
                      className="control-btn-top check-btn"
                      onClick={() => {
                        const results = calculateResults();
                        alert(
                          `Current Results:\nWPM: ${results.wpm}\nAccuracy: ${results.accuracy}%`
                        );
                      }}
                    >
                      📊 Check Results
                    </button>
                  </div>
                </div>

                {/* Typing Input Area */}
                <div className="typing-container">
                  <textarea
                    ref={textareaRef}
                    className={`typing-input ${getFontStyleClass()}`}
                    value={userInput}
                    onChange={handleInputChange}
                    disabled={!testStarted}
                    placeholder={
                      currentLanguage === "hindi"
                        ? getCurrentFontObject().type === "non-unicode"
                          ? "Type with English keyboard (e.g., 'namaste' for नमस्ते)"
                          : "Switch to Hindi keyboard (Win+Space) and type phonetically"
                        : "Type the text above..."
                    }
                    autoFocus
                  />
                </div>

                {/* Typing Stats */}
                <div className="typing-stats-bottom">
                  <div className="stat-item">
                    <span className="stat-label">Characters:</span>
                    <span className="stat-value">
                      {userInput.length}/{paragraphText.length}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Progress:</span>
                    <span className="stat-value">
                      {userInput.length > 0
                        ? Math.min(
                            Math.round(
                              (userInput.length / paragraphText.length) * 100
                            ),
                            100
                          )
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">WPM:</span>
                    <span className="stat-value">{wpm}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Accuracy:</span>
                    <span className="stat-value">{accuracy}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Font Status Warning */}
            {fontStatus === "not-available" && (
              <div className="warning-section">
                <div className="warning-icon">⚠️</div>
                <div className="warning-content">
                  <h4>Font Not Installed</h4>
                  <p>
                    <strong>{currentFont}</strong> is not installed on your
                    system. Please install the font for proper display.
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="footer-info">
        <p>
          © 2024 Government Exam Typing Practice | Practice with actual exam
          fonts and patterns
        </p>
      </div>
    </div>
  );
}

export default Dashboard;
