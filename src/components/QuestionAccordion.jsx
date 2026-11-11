import React, { useState } from 'react';
import { 
  Bookmark, 
  Check, 
  Image as ImageIcon, 
  FileText, 
  BookOpen, 
  Code, 
  Lightbulb, 
  Copy, 
  CheckCheck, 
  ArrowLeft, 
  ArrowRight, 
  PanelLeftOpen,
  Layers,
  Sparkles,
  Clock,
  CheckCircle2,
  ListChecks,
  Code2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import InfographicViewer from './InfographicViewer';

export default function QuestionAccordion({
  activeQuestion,
  allFilteredQuestions = [],
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
  // Dual view mode: 'full' (comprehensive vertical guide) | 'tabbed' (single tab focus)
  const [viewMode, setViewMode] = useState('full');
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
      <div className="empty-study-placeholder">
        <div className="placeholder-illustration">📚</div>
        <h3 className="placeholder-title">Select a Question to Begin</h3>
        <p className="placeholder-desc">
          Choose any concept from the syllabus on the left to read the full guide, examine the visual infographic, and inspect code examples.
        </p>
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
      try {
        confetti({
          particleCount: 55,
          spread: 60,
          origin: { y: 0.25, x: 0.75 }
        });
      } catch (e) {
        // Safe fallback if canvas-confetti is not loaded
      }
    }
    onToggleComplete(activeQuestion.id);
  };

  const hasImage = Boolean(activeQuestion.imageId || activeQuestion.infographicData);
  const codeSnippet = activeQuestion.example || activeQuestion.code || '';
  const hasCode = Boolean(codeSnippet.trim());
  const takeawaysList = activeQuestion.takeaways && activeQuestion.takeaways.length > 0
    ? activeQuestion.takeaways.filter(Boolean)
    : [];

  // Difficulty badge styling helper
  const getDifficultyClass = (diff) => {
    const d = (diff || '').toLowerCase();
    if (d.includes('basic') || d.includes('easy')) return 'diff-badge-basics';
    if (d.includes('intermed') || d.includes('medium')) return 'diff-badge-intermediate';
    if (d.includes('adv') || d.includes('hard')) return 'diff-badge-advanced';
    if (d.includes('cod')) return 'diff-badge-coding';
    return 'diff-badge-default';
  };

  return (
    <div className="study-guide-container">
      {/* 1. Header Toolbar: Breadcrumb + Reopen Pill + View Switcher + Bookmark + Complete */}
      <div className="study-guide-header">
        <div className="study-breadcrumb-wrap">
          {!isLeftPanelOpen && onToggleLeftPanel && (
            <button
              type="button"
              className="btn-open-syllabus-pill"
              onClick={onToggleLeftPanel}
              title="Open Syllabus (Left Panel)"
            >
              <PanelLeftOpen size={14} />
              <span>Show Questions</span>
            </button>
          )}
          <span className="crumb-section-tag">{section?.name || 'Section'}</span>
          <span className="crumb-divider">/</span>
          <span className="crumb-topic-tag">{topic?.name || activeQuestion.difficulty || 'General'}</span>
        </div>

        <div className="study-header-actions">
          {/* Dual View Mode Toggle: Full Guide vs Tabbed */}
          <div className="view-mode-pill-group" title="Switch layout mode">
            <button
              type="button"
              className={`btn-view-toggle ${viewMode === 'full' ? 'active' : ''}`}
              onClick={() => setViewMode('full')}
            >
              <BookOpen size={14} />
              <span>Full Guide</span>
            </button>
            <button
              type="button"
              className={`btn-view-toggle ${viewMode === 'tabbed' ? 'active' : ''}`}
              onClick={() => setViewMode('tabbed')}
            >
              <Layers size={14} />
              <span>Tabs</span>
            </button>
          </div>

          {/* Bookmark Button */}
          <button
            type="button"
            className={`btn-study-action ${isBookmarked ? 'active-bookmark' : ''}`}
            onClick={() => onToggleBookmark(activeQuestion.id)}
            title={isBookmarked ? "Remove Bookmark" : "Save to Bookmarks"}
          >
            <Bookmark size={16} fill={isBookmarked ? "currentColor" : "none"} />
            <span className="btn-label-desktop">{isBookmarked ? "Saved" : "Save"}</span>
          </button>

          {/* Mark Complete Button */}
          <button
            type="button"
            className={`btn-study-complete ${isCompleted ? 'completed' : ''}`}
            onClick={handleCompleteClick}
            title={isCompleted ? "Mark as in-progress" : "Mark as completed"}
          >
            <Check size={15} />
            <span>{isCompleted ? 'Completed' : 'Mark Complete'}</span>
          </button>
        </div>
      </div>

      {/* 2. Question Hero Section */}
      <div className="question-hero-card">
        <div className="question-hero-meta">
          <span className={`diff-badge-pill ${getDifficultyClass(activeQuestion.difficulty)}`}>
            {activeQuestion.difficulty || 'Basics'}
          </span>
          <span className="meta-info-pill">
            <Clock size={12} />
            <span>3 min study</span>
          </span>
          {isCompleted && (
            <span className="meta-completed-pill">
              <CheckCircle2 size={12} />
              <span>Learned</span>
            </span>
          )}
        </div>

        <h1 className="question-hero-title">
          {activeQuestion.question}
        </h1>
      </div>

      {/* 3. Main Study Content: Full Guide Mode vs Tabbed Mode */}
      {viewMode === 'full' ? (
        /* ================= FULL STUDY GUIDE MODE ================= */
        <div className="full-study-stream">
          {/* Section A: Concise Interview Answer Callout */}
          <section className="study-section-card answer-callout-card">
            <div className="section-card-header">
              <div className="section-icon-wrap indigo">
                <Lightbulb size={18} />
              </div>
              <div>
                <h3 className="section-card-title">Quick Interview Answer</h3>
                <p className="section-card-subtitle">Crisp, verbal definition to speak directly in an interview</p>
              </div>
            </div>
            <div className="answer-callout-body">
              <p className="answer-callout-text">
                {activeQuestion.shortAnswer || activeQuestion.explanation || 'Detailed architectural explanation below.'}
              </p>
            </div>
          </section>

          {/* Section B: Visual Architecture & Flowchart Infographic */}
          {hasImage && (
            <section className="study-section-card visual-diagram-card">
              <div className="section-card-header">
                <div className="section-icon-wrap blue">
                  <ImageIcon size={18} />
                </div>
                <div>
                  <h3 className="section-card-title">Visual Architecture & Flowchart</h3>
                  <p className="section-card-subtitle">High-resolution diagram illustrating the core end-to-end mechanism</p>
                </div>
              </div>
              <div className="infographic-embed-wrap">
                <InfographicViewer question={activeQuestion} />
              </div>
            </section>
          )}

          {/* Section C: Detailed Technical Explanation */}
          {activeQuestion.explanation && (
            <section className="study-section-card explanation-card">
              <div className="section-card-header">
                <div className="section-icon-wrap purple">
                  <BookOpen size={18} />
                </div>
                <div>
                  <h3 className="section-card-title">In-Depth Technical Breakdown</h3>
                  <p className="section-card-subtitle">Architectural considerations, edge cases, and design trade-offs</p>
                </div>
              </div>
              <div className="explanation-readable-body">
                {activeQuestion.explanation.split('\n\n').map((paragraph, idx) => (
                  <p key={idx} className="prose-paragraph">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          )}

          {/* Section D: Production Code / Query Example */}
          {hasCode && (
            <section className="study-section-card code-section-card">
              <div className="section-card-header">
                <div className="section-icon-wrap cyan">
                  <Code2 size={18} />
                </div>
                <div className="code-title-group">
                  <h3 className="section-card-title">Production Code & Implementation</h3>
                  <p className="section-card-subtitle">Real-world PySpark / Python / SQL snippet</p>
                </div>
                <button
                  type="button"
                  className="btn-copy-code-pill"
                  onClick={handleCopyCode}
                  title="Copy code snippet"
                >
                  {copiedCode ? <CheckCheck size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>
              <div className="clean-code-container">
                <pre className="clean-code-pre">
                  <code>{codeSnippet}</code>
                </pre>
              </div>
            </section>
          )}

          {/* Section E: Key Interview Takeaways & Red Flags */}
          {takeawaysList.length > 0 && (
            <section className="study-section-card takeaways-card">
              <div className="section-card-header">
                <div className="section-icon-wrap emerald">
                  <ListChecks size={18} />
                </div>
                <div>
                  <h3 className="section-card-title">Key Interview Takeaways</h3>
                  <p className="section-card-subtitle">Essential points interviewers evaluate and common red flags</p>
                </div>
              </div>
              <ul className="takeaways-clean-checklist">
                {takeawaysList.map((item, idx) => (
                  <li key={idx} className="takeaway-clean-item">
                    <div className="takeaway-check-badge">
                      <Check size={13} />
                    </div>
                    <span className="takeaway-clean-text">{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      ) : (
        /* ================= FOCUSED TABBED MODE ================= */
        <div className="tabbed-study-container">
          {/* Tabs Navigation Header */}
          <div className="clean-tabs-nav">
            <button
              type="button"
              className={`clean-tab-btn ${activeTab === 'image' ? 'active' : ''}`}
              onClick={() => setActiveTab('image')}
            >
              <ImageIcon size={15} />
              <span>Infographic</span>
            </button>
            <button
              type="button"
              className={`clean-tab-btn ${activeTab === 'answer' ? 'active' : ''}`}
              onClick={() => setActiveTab('answer')}
            >
              <Lightbulb size={15} />
              <span>Quick Answer</span>
            </button>
            <button
              type="button"
              className={`clean-tab-btn ${activeTab === 'explanation' ? 'active' : ''}`}
              onClick={() => setActiveTab('explanation')}
            >
              <BookOpen size={15} />
              <span>Explanation</span>
            </button>
            <button
              type="button"
              className={`clean-tab-btn ${activeTab === 'example' ? 'active' : ''}`}
              onClick={() => setActiveTab('example')}
            >
              <Code2 size={15} />
              <span>Code Example</span>
            </button>
            <button
              type="button"
              className={`clean-tab-btn ${activeTab === 'takeaways' ? 'active' : ''}`}
              onClick={() => setActiveTab('takeaways')}
            >
              <ListChecks size={15} />
              <span>Takeaways</span>
            </button>
          </div>

          {/* Tab Pane Body */}
          <div className="clean-tab-content-pane">
            {activeTab === 'image' && (
              <div className="tab-pane-box">
                <InfographicViewer question={activeQuestion} />
              </div>
            )}

            {activeTab === 'answer' && (
              <div className="tab-pane-box">
                <div className="answer-callout-body">
                  <h4 className="tab-pane-heading">Interview Quick Definition:</h4>
                  <p className="answer-callout-text">
                    {activeQuestion.shortAnswer || activeQuestion.explanation || 'See the Explanation tab for full details.'}
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'explanation' && (
              <div className="tab-pane-box">
                <h4 className="tab-pane-heading">In-Depth Technical Concept:</h4>
                <div className="explanation-readable-body">
                  {(activeQuestion.explanation || 'No detailed explanation provided for this question.').split('\n\n').map((para, idx) => (
                    <p key={idx} className="prose-paragraph">{para}</p>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'example' && (
              <div className="tab-pane-box">
                <div className="code-header-row">
                  <h4 className="tab-pane-heading">Code Example:</h4>
                  <button
                    type="button"
                    className="btn-copy-code-pill"
                    onClick={handleCopyCode}
                  >
                    {copiedCode ? <CheckCheck size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>
                <div className="clean-code-container">
                  <pre className="clean-code-pre">
                    <code>{codeSnippet || '# No code snippet provided for this question'}</code>
                  </pre>
                </div>
              </div>
            )}

            {activeTab === 'takeaways' && (
              <div className="tab-pane-box">
                <h4 className="tab-pane-heading">Key Takeaways Checklist:</h4>
                <ul className="takeaways-clean-checklist">
                  {takeawaysList.length > 0 ? (
                    takeawaysList.map((item, idx) => (
                      <li key={idx} className="takeaway-clean-item">
                        <div className="takeaway-check-badge">
                          <Check size={13} />
                        </div>
                        <span className="takeaway-clean-text">{item}</span>
                      </li>
                    ))
                  ) : (
                    <li className="takeaway-clean-item">
                      <span className="takeaway-clean-text">No takeaways provided.</span>
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Previous and Next Question Navigation Footer */}
      <footer className="study-footer-nav">
        <button
          type="button"
          className="study-nav-card prev-card"
          disabled={!prevQuestion}
          onClick={() => prevQuestion && onSelectQuestion(prevQuestion)}
        >
          <ArrowLeft size={18} className="nav-arrow" />
          <div className="nav-card-text">
            <span className="nav-card-sub">Previous Question</span>
            <span className="nav-card-title">
              {prevQuestion ? prevQuestion.question : 'At beginning of section'}
            </span>
          </div>
        </button>

        <div className="study-nav-counter-pill">
          <span>{currentIndex >= 0 ? `${currentIndex + 1} / ${allFilteredQuestions.length}` : ''}</span>
        </div>

        <button
          type="button"
          className="study-nav-card next-card"
          disabled={!nextQuestion}
          onClick={() => nextQuestion && onSelectQuestion(nextQuestion)}
        >
          <div className="nav-card-text align-right">
            <span className="nav-card-sub">Next Question</span>
            <span className="nav-card-title">
              {nextQuestion ? nextQuestion.question : 'You completed all questions!'}
            </span>
          </div>
          <ArrowRight size={18} className="nav-arrow" />
        </button>
      </footer>
    </div>
  );
}
