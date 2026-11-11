import React, { useState } from 'react';
import { 
  Bookmark, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Image as ImageIcon, 
  FileText, 
  BookOpen, 
  Code, 
  Lightbulb, 
  Copy, 
  CheckCheck,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  PanelLeftOpen
} from 'lucide-react';
import confetti from 'canvas-confetti';
import InfographicViewer from './InfographicViewer';

export default function QuestionAccordion({
  activeQuestion,
  allFilteredQuestions = [],
  otherQuestions = [],
  section,
  topic,
  isBookmarked,
  isCompleted,
  onToggleBookmark,
  onToggleComplete,
  onSelectQuestion,
  isLeftPanelOpen = true,
  onToggleLeftPanel
}) {
  const [activeTab, setActiveTab] = useState('image'); // 'image' | 'answer' | 'explanation' | 'example' | 'takeaways'
  const [copiedCode, setCopiedCode] = useState(false);

  // Calculate previous and next question in list
  const currentIndex = allFilteredQuestions.findIndex(q => q.id === activeQuestion?.id);
  const prevQuestion = currentIndex > 0 ? allFilteredQuestions[currentIndex - 1] : null;
  const nextQuestion = currentIndex >= 0 && currentIndex < allFilteredQuestions.length - 1 
    ? allFilteredQuestions[currentIndex + 1] 
    : null;

  if (!activeQuestion) {
    return (
      <div className="empty-accordion-placeholder">
        <div className="placeholder-icon">📚</div>
        <h3>No Question Selected</h3>
        <p>Choose a question from the left panel to study the concept and infographic.</p>
      </div>
    );
  }

  const handleCopyCode = () => {
    const codeSnippet = activeQuestion.example || activeQuestion.code || '';
    if (codeSnippet) {
      navigator.clipboard.writeText(codeSnippet);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleCompleteClick = () => {
    if (!isCompleted) {
      // Fire subtle congratulatory confetti
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.2, x: 0.8 }
        });
      } catch (e) {
        // Safe fallback
      }
    }
    onToggleComplete(activeQuestion.id);
  };

  return (
    <div className="question-accordion-wrapper">
      {/* Top Meta Bar: Breadcrumbs + Bookmark + Mark Complete */}
      <div className="accordion-meta-bar">
        <div className="accordion-breadcrumbs">
          {!isLeftPanelOpen && onToggleLeftPanel && (
            <button
              type="button"
              className="btn-reopen-panel-pill"
              onClick={onToggleLeftPanel}
              title="Show Questions Panel"
            >
              <PanelLeftOpen size={15} />
              <span>Show Questions</span>
            </button>
          )}
          <span className="crumb-section">{section?.name || 'Section'}</span>
          <span className="crumb-sep">›</span>
          <span className="crumb-topic">{topic?.name || activeQuestion.difficulty || 'Topic'}</span>
        </div>

        <div className="accordion-meta-actions">
          {/* Bookmark Button */}
          <button
            type="button"
            className={`btn-action-icon ${isBookmarked ? 'active-bookmark' : ''}`}
            onClick={() => onToggleBookmark(activeQuestion.id)}
            title={isBookmarked ? "Remove Bookmark" : "Save Bookmark"}
          >
            <Bookmark size={18} fill={isBookmarked ? "currentColor" : "none"} />
          </button>

          {/* Mark Complete Button */}
          <button
            type="button"
            className={`btn-mark-complete ${isCompleted ? 'is-completed' : ''}`}
            onClick={handleCompleteClick}
          >
            <Check size={16} />
            <span>{isCompleted ? 'Completed' : 'Mark Complete'}</span>
          </button>
        </div>
      </div>

      {/* Primary Expanded Question Header */}
      <div className="expanded-question-card">
        <div className="expanded-header">
          <ChevronUp size={20} className="header-caret" />
          <h2 className="expanded-title">
            {activeQuestion.question}
          </h2>
        </div>

        {/* Navigation Tabs */}
        <div className="question-tabs-nav">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'image' ? 'active' : ''}`}
            onClick={() => setActiveTab('image')}
          >
            <ImageIcon size={16} />
            <span>Image</span>
          </button>

          <button
            type="button"
            className={`tab-btn ${activeTab === 'answer' ? 'active' : ''}`}
            onClick={() => setActiveTab('answer')}
          >
            <FileText size={16} />
            <span>Answer</span>
          </button>

          <button
            type="button"
            className={`tab-btn ${activeTab === 'explanation' ? 'active' : ''}`}
            onClick={() => setActiveTab('explanation')}
          >
            <BookOpen size={16} />
            <span>Explanation</span>
          </button>

          <button
            type="button"
            className={`tab-btn ${activeTab === 'example' ? 'active' : ''}`}
            onClick={() => setActiveTab('example')}
          >
            <Code size={16} />
            <span>Example</span>
          </button>

          <button
            type="button"
            className={`tab-btn ${activeTab === 'takeaways' ? 'active' : ''}`}
            onClick={() => setActiveTab('takeaways')}
          >
            <Lightbulb size={16} />
            <span>Key Takeaways</span>
          </button>
        </div>

        {/* Tab Content Display */}
        <div className="question-tab-body">
          {/* TAB 1: Image & Infographic */}
          {activeTab === 'image' && (
            <div className="tab-pane-fade">
              <InfographicViewer question={activeQuestion} />
            </div>
          )}

          {/* TAB 2: Short Answer */}
          {activeTab === 'answer' && (
            <div className="tab-pane-fade tab-answer-content">
              <div className="answer-highlight-box">
                <div className="highlight-tag">Concise Interview Answer</div>
                <p className="answer-text">
                  {activeQuestion.shortAnswer || activeQuestion.explanation || 'See the Explanation tab for full details.'}
                </p>
              </div>

              {activeQuestion.difficulty && (
                <div className="answer-meta-chips">
                  <span className="chip-tag">Difficulty: {activeQuestion.difficulty}</span>
                  <span className="chip-tag">Section: {section?.name}</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Detailed Explanation */}
          {activeTab === 'explanation' && (
            <div className="tab-pane-fade tab-explanation-content">
              <div className="explanation-prose">
                {activeQuestion.explanation?.split('\n\n').map((para, idx) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: Real-time Example & Code */}
          {activeTab === 'example' && (
            <div className="tab-pane-fade tab-example-content">
              <div className="code-viewer-container">
                <div className="code-header">
                  <span className="code-lang-label">Python / SQL Pipeline Example</span>
                  <button 
                    type="button" 
                    className="btn-copy-code"
                    onClick={handleCopyCode}
                  >
                    {copiedCode ? <CheckCheck size={14} className="text-green-500" /> : <Copy size={14} />}
                    <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>
                <pre className="code-block">
                  <code>{activeQuestion.example || activeQuestion.code || '// No code snippet provided for this question'}</code>
                </pre>
              </div>
            </div>
          )}

          {/* TAB 5: Key Takeaways */}
          {activeTab === 'takeaways' && (
            <div className="tab-pane-fade tab-takeaways-content">
              <div className="takeaways-list-card">
                <h4 className="takeaways-card-title">Essential Interview Points:</h4>
                <ul className="takeaways-checklist">
                  {activeQuestion.takeaways?.map((item, idx) => (
                    <li key={idx} className="takeaway-item">
                      <div className="takeaway-check-icon">
                        <Check size={14} />
                      </div>
                      <span className="takeaway-text">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Previous and Next Navigation Bar */}
        <div className="accordion-footer-nav">
          <button
            type="button"
            className="btn-nav-step prev"
            disabled={!prevQuestion}
            onClick={() => prevQuestion && onSelectQuestion(prevQuestion)}
          >
            <ArrowLeft size={16} />
            <span>Previous Question</span>
          </button>

          <span className="nav-step-counter">
            {currentIndex >= 0 ? `${currentIndex + 1} of ${allFilteredQuestions.length}` : ''}
          </span>

          <button
            type="button"
            className="btn-nav-step next"
            disabled={!nextQuestion}
            onClick={() => nextQuestion && onSelectQuestion(nextQuestion)}
          >
            <span>Next Question</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Subsequent Collapsed Accordion Questions in list */}
      <div className="subsequent-accordion-list">
        {otherQuestions.map((q, idx) => (
          <div
            key={q.id}
            className="collapsed-accordion-row"
            onClick={() => onSelectQuestion(q)}
          >
            <ChevronRight size={18} className="row-chevron" />
            <span className="collapsed-question-title">
              {q.question}
            </span>
            <span className="collapsed-badge-difficulty">
              {q.difficulty}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

