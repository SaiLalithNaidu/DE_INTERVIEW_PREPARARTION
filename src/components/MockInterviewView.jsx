import React, { useState, useEffect } from 'react';
import { Video, Clock, CheckCircle, ChevronRight, Play, RotateCcw, Award, Lightbulb } from 'lucide-react';

export default function MockInterviewView({ questions = [], sections = [] }) {
  const [mockSessionActive, setMockSessionActive] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [sessionQuestions, setSessionQuestions] = useState([]);
  const [timerSeconds, setTimerSeconds] = useState(120);
  const [showAnswer, setShowAnswer] = useState(false);
  const [userNotes, setUserNotes] = useState('');
  const [completedRatings, setCompletedRatings] = useState({});

  // Start new mock session: pick 5 questions from different sections
  const handleStartSession = () => {
    const active = questions.filter(q => q.active !== false);
    // Shuffle
    const shuffled = [...active].sort(() => 0.5 - Math.random()).slice(0, 5);
    setSessionQuestions(shuffled);
    setCurrentIdx(0);
    setTimerSeconds(180);
    setShowAnswer(false);
    setUserNotes('');
    setCompletedRatings({});
    setMockSessionActive(true);
  };

  // Timer countdown
  useEffect(() => {
    if (!mockSessionActive) return;
    const interval = setInterval(() => {
      setTimerSeconds(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [mockSessionActive, currentIdx]);

  const currentQ = sessionQuestions[currentIdx];

  const handleNext = () => {
    if (currentIdx < sessionQuestions.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setTimerSeconds(180);
      setShowAnswer(false);
      setUserNotes('');
    } else {
      setMockSessionActive(false);
    }
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}:${rem < 10 ? '0' : ''}${rem}`;
  };

  return (
    <div className="special-page-container">
      <div className="page-header">
        <div className="header-icon-box purple">
          <Video size={24} />
        </div>
        <div>
          <h2>Mock Technical Interview Simulator</h2>
          <p>Practice answering realistic Data Engineering interview questions under timed pressure.</p>
        </div>
      </div>

      {!mockSessionActive ? (
        <div className="mock-intro-card">
          <div className="intro-badge">
            <Award size={16} />
            <span>Interactive Round</span>
          </div>
          <h3>Simulate a 15-Minute Data Engineer Technical Screen</h3>
          <p>
            You will be asked 5 core questions spanning Python, SQL, PySpark, AWS, and Distributed Architecture. 
            Speak your answer aloud or jot notes, then check the model solution and score yourself.
          </p>

          <div className="mock-rules-grid">
            <div className="rule-item">
              <span className="rule-num">1</span>
              <div>
                <strong>3 Minutes Per Question</strong>
                <p>Simulates real interviewer follow-up pacing.</p>
              </div>
            </div>
            <div className="rule-item">
              <span className="rule-num">2</span>
              <div>
                <strong>Structured Delivery</strong>
                <p>Define concept first, discuss architecture tradeoffs, then provide real-world pipeline example.</p>
              </div>
            </div>
            <div className="rule-item">
              <span className="rule-num">3</span>
              <div>
                <strong>Self-Calibration</strong>
                <p>Compare with expert answer and key takeaways.</p>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="btn-start-mock"
            onClick={handleStartSession}
          >
            <Play size={18} />
            <span>Start Mock Interview</span>
          </button>
        </div>
      ) : (
        <div className="mock-active-session">
          {/* Progress & Timer Header */}
          <div className="session-bar">
            <div className="session-progress">
              <span>Question {currentIdx + 1} of {sessionQuestions.length}</span>
              <div className="session-dots">
                {sessionQuestions.map((_, i) => (
                  <span 
                    key={i} 
                    className={`dot ${i === currentIdx ? 'active' : i < currentIdx ? 'done' : ''}`}
                  ></span>
                ))}
              </div>
            </div>

            <div className={`session-timer ${timerSeconds < 30 ? 'warning' : ''}`}>
              <Clock size={16} />
              <span>{formatTime(timerSeconds)}</span>
            </div>
          </div>

          {/* Question Prompt */}
          <div className="mock-question-box">
            <span className="q-badge">{currentQ?.difficulty || 'Architecture'}</span>
            <h2 className="q-title">{currentQ?.question}</h2>
          </div>

          {/* Scratchpad for notes */}
          <div className="mock-scratchpad">
            <label>Your Scratchpad / Spoken Outline:</label>
            <textarea
              rows={4}
              placeholder="Outline your thoughts: 1. Core definition, 2. Cloud/Spark tradeoffs, 3. Production experience..."
              value={userNotes}
              onChange={(e) => setUserNotes(e.target.value)}
            />
          </div>

          {/* Reveal Model Answer Toggle */}
          <div className="mock-controls-row">
            <button
              type="button"
              className="btn-toggle-answer"
              onClick={() => setShowAnswer(prev => !prev)}
            >
              <Lightbulb size={16} />
              <span>{showAnswer ? 'Hide Model Answer' : 'Reveal Model Answer'}</span>
            </button>

            <button
              type="button"
              className="btn-next-question"
              onClick={handleNext}
            >
              <span>{currentIdx < sessionQuestions.length - 1 ? 'Next Question' : 'Finish Mock'}</span>
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Model Answer Drawer */}
          {showAnswer && (
            <div className="model-answer-drawer">
              <h4>Model Interview Answer:</h4>
              <p className="model-short-ans">{currentQ?.shortAnswer}</p>
              
              <div className="model-takeaways">
                <strong>Must-Mention Key Takeaways:</strong>
                <ul>
                  {currentQ?.takeaways?.map((t, idx) => (
                    <li key={idx}>✓ {t}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

