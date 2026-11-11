import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  ChevronDown,
  ChevronUp,
  Bookmark,
  Check,
  PanelLeftClose,
  PanelLeftOpen,
  GripVertical,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  ListOrdered,
  X,
  FileText,
  Code2,
  Copy,
  CheckCheck,
  Eye,
  EyeOff
} from 'lucide-react';
import confetti from 'canvas-confetti';
import InfographicViewer from './InfographicViewer';

const PAGE_SIZE = 10;
const TEXT_ANSWER_SECTION_IDS = new Set(['scenario', 'projects', 'production', 'aws']);

const DIFFICULTY_WEIGHTS = {
  Basics: 1,
  Intermediate: 2,
  Advanced: 3,
  Coding: 4
};

export default function SectionQuestionsView({
  section,
  allQuestions,
  topics,
  bookmarks,
  progress,
  onToggleBookmark,
  onToggleComplete,
  onReorderQuestions
}) {
  const [selectedTopicId, setSelectedTopicId] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('custom'); // 'custom' | 'alpha-asc' | 'alpha-desc' | 'diff-asc' | 'diff-desc' | 'uncompleted' | 'bookmarked'
  const [currentPage, setCurrentPage] = useState(1);
  
  // Left-side questions panel hidden by default per user request
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(false);
  
  // Accordion state: set of open question IDs (defaults to first question open)
  const [openQuestionIds, setOpenQuestionIds] = useState(new Set());
  
  // Reorder mode state for drag-and-drop
  const [isReorderMode, setIsReorderMode] = useState(false);
  const [draggedQId, setDraggedQId] = useState(null);
  const [dragOverQId, setDragOverQId] = useState(null);

  // Expanded details drawer within accordion (for optional text explanation/code)
  const [expandedDetailsMap, setExpandedDetailsMap] = useState({});
  const [copiedCodeId, setCopiedCodeId] = useState(null);

  // Filter topics belonging to this section
  const sectionTopics = useMemo(() => {
    return topics.filter(t => t.sectionId === section.id);
  }, [topics, section.id]);

  // Filter questions belonging to this section & active filters
  const filteredQuestions = useMemo(() => {
    return allQuestions.filter(q => {
      if (q.sectionId !== section.id) return false;
      if (q.active === false) return false; // skip archived

      // Topic filter
      if (selectedTopicId !== 'all' && q.topicId !== selectedTopicId && q.difficulty?.toLowerCase() !== selectedTopicId.toLowerCase()) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesQuestion = q.question?.toLowerCase().includes(query);
        const matchesAnswer = q.shortAnswer?.toLowerCase().includes(query);
        const matchesExplanation = q.explanation?.toLowerCase().includes(query);
        if (!matchesQuestion && !matchesAnswer && !matchesExplanation) {
          return false;
        }
      }

      return true;
    });
  }, [allQuestions, section.id, selectedTopicId, searchQuery]);

  // Sorted questions based on sortBy selection
  const sortedQuestions = useMemo(() => {
    let result = [...filteredQuestions];
    if (sortBy === 'alpha-asc') {
      result.sort((a, b) => a.question.localeCompare(b.question));
    } else if (sortBy === 'alpha-desc') {
      result.sort((a, b) => b.question.localeCompare(a.question));
    } else if (sortBy === 'diff-asc') {
      result.sort((a, b) => (DIFFICULTY_WEIGHTS[a.difficulty] || 99) - (DIFFICULTY_WEIGHTS[b.difficulty] || 99));
    } else if (sortBy === 'diff-desc') {
      result.sort((a, b) => (DIFFICULTY_WEIGHTS[b.difficulty] || 99) - (DIFFICULTY_WEIGHTS[a.difficulty] || 99));
    } else if (sortBy === 'uncompleted') {
      result.sort((a, b) => {
        const aDone = progress.includes(a.id) ? 1 : 0;
        const bDone = progress.includes(b.id) ? 1 : 0;
        return aDone - bDone;
      });
    } else if (sortBy === 'bookmarked') {
      result.sort((a, b) => {
        const aMark = bookmarks.includes(a.id) ? 0 : 1;
        const bMark = bookmarks.includes(b.id) ? 0 : 1;
        return aMark - bMark;
      });
    }
    return result;
  }, [filteredQuestions, sortBy, progress, bookmarks]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(sortedQuestions.length / PAGE_SIZE));
  const paginatedQuestions = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return sortedQuestions.slice(startIndex, startIndex + PAGE_SIZE);
  }, [sortedQuestions, currentPage]);

  // Automatically expand the first question of the current page if none are open
  useEffect(() => {
    if (paginatedQuestions.length > 0) {
      setOpenQuestionIds(prev => {
        if (prev.size === 0) {
          return new Set([paginatedQuestions[0].id]);
        }
        return prev;
      });
    }
  }, [currentPage, paginatedQuestions]);

  // Topic count helper
  const getTopicCount = (topicId) => {
    if (topicId === 'all') {
      return allQuestions.filter(q => q.sectionId === section.id && q.active !== false).length;
    }
    return allQuestions.filter(q =>
      q.sectionId === section.id &&
      q.active !== false &&
      (q.topicId === topicId || q.difficulty?.toLowerCase() === topicId.toLowerCase())
    ).length;
  };

  // Toggle accordion open/close for a question
  const toggleAccordion = (questionId) => {
    setOpenQuestionIds(prev => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        // Single expand behavior: opens clicked question
        next.clear();
        next.add(questionId);
      }
      return next;
    });
  };

  // Toggle optional text/code details drawer
  const toggleDetails = (questionId, e) => {
    e.stopPropagation();
    setExpandedDetailsMap(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const handleCopyCode = (code, qId, e) => {
    e.stopPropagation();
    if (code) {
      navigator.clipboard.writeText(code);
      setCopiedCodeId(qId);
      setTimeout(() => setCopiedCodeId(null), 2000);
    }
  };

  const handleToggleCompleteWithConfetti = (qId, isCompleted, e) => {
    e.stopPropagation();
    if (!isCompleted) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.3, x: 0.7 }
        });
      } catch (err) {}
    }
    onToggleComplete(qId);
  };

  // Drag and drop handlers
  const handleDropQuestion = (targetQId) => {
    if (!draggedQId || draggedQId === targetQId) {
      setDraggedQId(null);
      setDragOverQId(null);
      return;
    }

    const currentList = [...sortedQuestions];
    const sourceIdx = currentList.findIndex(q => q.id === draggedQId);
    const targetIdx = currentList.findIndex(q => q.id === targetQId);

    if (sourceIdx >= 0 && targetIdx >= 0) {
      const [moved] = currentList.splice(sourceIdx, 1);
      currentList.splice(targetIdx, 0, moved);

      if (onReorderQuestions) {
        onReorderQuestions(currentList);
      }
    }
    setDraggedQId(null);
    setDragOverQId(null);
  };

  const handleMoveCard = (qId, direction) => {
    const currentList = [...sortedQuestions];
    const idx = currentList.findIndex(q => q.id === qId);
    if (idx < 0) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= currentList.length) return;

    const [moved] = currentList.splice(idx, 1);
    currentList.splice(targetIdx, 0, moved);

    if (onReorderQuestions) {
      onReorderQuestions(currentList);
    }
  };

  // Keyboard shortcut listener to toggle panel ([ or Ctrl+B)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setIsLeftPanelOpen(prev => !prev);
      } else if (e.key === '[') {
        e.preventDefault();
        setIsLeftPanelOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="simple-accordion-view">
      {/* 1. Slim Toolbar (No big distracting header section) */}
      <div className="simple-top-toolbar">
        {/* Left side: Topic Filter Pills */}
        <div className="simple-topic-chips-row">
          <button
            type="button"
            className={`simple-chip-pill ${selectedTopicId === 'all' ? 'active' : ''}`}
            onClick={() => {
              setSelectedTopicId('all');
              setCurrentPage(1);
            }}
          >
            All ({getTopicCount('all')})
          </button>

          {sectionTopics
            .filter(topic => getTopicCount(topic.id) > 0)
            .map(topic => (
              <button
                key={topic.id}
                type="button"
                className={`simple-chip-pill ${selectedTopicId === topic.id ? 'active' : ''}`}
                onClick={() => {
                  setSelectedTopicId(topic.id);
                  setCurrentPage(1);
                }}
              >
                {topic.name} ({getTopicCount(topic.id)})
              </button>
            ))}
        </div>

        {/* Right side: Search + Left Panel Toggle */}
        <div className="simple-toolbar-tools">
          <div className="simple-search-wrap">
            <Search size={14} className="search-icon" />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
            {searchQuery && (
              <button
                type="button"
                className="btn-clear-search-pill"
                onClick={() => setSearchQuery('')}
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Toggle Button for Left-Side Questions Panel */}
          <button
            type="button"
            className={`btn-toggle-left-questions ${isLeftPanelOpen ? 'active' : ''}`}
            onClick={() => setIsLeftPanelOpen(prev => !prev)}
            title={isLeftPanelOpen ? "Hide Questions Panel" : "Show Questions Panel"}
          >
            {isLeftPanelOpen ? <PanelLeftClose size={15} /> : <PanelLeftOpen size={15} />}
            <span>{isLeftPanelOpen ? "Hide Panel" : "Questions Panel"}</span>
          </button>
        </div>
      </div>

      {/* 2. Main Content Layout: Optional Left Panel (hidden by default) + Accordion Questions List */}
      <div className={`simple-accordion-layout ${isLeftPanelOpen ? 'with-left-panel' : 'full-width'}`}>
        {/* Optional Left Questions Panel (Hidden by default) */}
        {isLeftPanelOpen && (
          <aside className="simple-left-drawer">
            <div className="drawer-header-row">
              <span className="drawer-title">Questions List ({filteredQuestions.length})</span>
              <button
                type="button"
                className={`btn-reorder-toggle-sm ${isReorderMode ? 'active' : ''}`}
                onClick={() => setIsReorderMode(prev => !prev)}
                title="Toggle reordering"
              >
                <ListOrdered size={13} />
                <span>{isReorderMode ? 'Done' : 'Reorder'}</span>
              </button>
            </div>

            <div className="drawer-scroll-list">
              {paginatedQuestions.map((q, idx) => {
                const globalIndex = (currentPage - 1) * PAGE_SIZE + idx + 1;
                const isOpen = openQuestionIds.has(q.id);
                const isCompleted = progress.includes(q.id);
                const isBookmarked = bookmarks.includes(q.id);

                return (
                  <div
                    key={q.id}
                    className={`drawer-question-card ${isOpen ? 'active-open' : ''}`}
                    onClick={() => {
                      setOpenQuestionIds(new Set([q.id]));
                      // Scroll to question
                      const el = document.getElementById(`accordion-q-${q.id}`);
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                  >
                    <span className="drawer-q-idx">{globalIndex}.</span>
                    <span className="drawer-q-title">{q.question}</span>
                    {isCompleted && <Check size={12} className="text-emerald-500" />}
                    {isBookmarked && <Bookmark size={12} className="text-amber-500" fill="currentColor" />}
                  </div>
                );
              })}
            </div>
          </aside>
        )}

        {/* Main Accordion Stream: Simple UI displaying question with image shown below it */}
        <main className="simple-accordion-stream">
          {paginatedQuestions.length === 0 ? (
            <div className="simple-empty-card">
              <p>No questions found matching your criteria.</p>
              {searchQuery && (
                <button
                  type="button"
                  className="btn-clear-query-link"
                  onClick={() => setSearchQuery('')}
                >
                  Clear search query
                </button>
              )}
            </div>
          ) : (
            paginatedQuestions.map((q, idx) => {
              const globalIndex = (currentPage - 1) * PAGE_SIZE + idx + 1;
              const isExpanded = openQuestionIds.has(q.id);
              const isCompleted = progress.includes(q.id);
              const isBookmarked = bookmarks.includes(q.id);
              const showDetails = Boolean(expandedDetailsMap[q.id]);
              const hasCode = Boolean(q.example || q.code);
              const codeSnippet = q.example || q.code || '';
              const isTextAnswerSection = TEXT_ANSWER_SECTION_IDS.has(section.id);
              const hasOptionalDetails = Boolean(q.explanation || hasCode || q.takeaways?.length);
              const showDetailsToggle = hasOptionalDetails && (!q.answerFormat || hasCode);
              const answerText = q.shortAnswer || q.explanation || 'Answer coming soon.';

              return (
                <article
                  key={q.id}
                  id={`accordion-q-${q.id}`}
                  className={`accordion-question-item ${isExpanded ? 'is-open' : 'is-closed'}`}
                >
                  {/* Accordion Question Header: Clicking toggles expand/collapse */}
                  <header
                    className="accordion-item-header"
                    onClick={() => toggleAccordion(q.id)}
                  >
                    <div className="accordion-header-left">
                      <span className="accordion-q-number">Q{globalIndex}.</span>
                      <h2 className="accordion-q-title">{q.question}</h2>
                    </div>

                    <div className="accordion-header-right">
                      {isCompleted && (
                        <span className="badge-pill-status completed" title="Learned">
                          <Check size={12} />
                          <span>Learned</span>
                        </span>
                      )}
                      {isBookmarked && (
                        <span className="badge-pill-status bookmarked" title="Bookmarked">
                          <Bookmark size={12} fill="currentColor" />
                        </span>
                      )}
                      {q.difficulty && (
                        <span className="badge-pill-diff">
                          {q.difficulty}
                        </span>
                      )}
                      <div className="accordion-toggle-icon">
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>
                    </div>
                  </header>

                  {/* Text-only sections keep the answer directly below the question. */}
                  {isExpanded && (
                    <div className="accordion-item-body">
                      {isTextAnswerSection ? (
                        <section className="text-answer-card" style={{ '--answer-accent': section.color || '#4f46e5' }}>
                          <div className="text-answer-heading">
                            <div className="text-answer-icon"><FileText size={18} /></div>
                            <div>
                              <span>ANSWER</span>
                              <h3>Clear explanation</h3>
                            </div>
                          </div>
                          <div className="text-answer-copy">
                            {answerText.split(/\n\n+/).map((paragraph, paragraphIndex) => (
                              <p key={paragraphIndex}>{paragraph}</p>
                            ))}
                          </div>
                        </section>
                      ) : (
                        <div className="accordion-image-wrapper">
                          <InfographicViewer question={q} />
                        </div>
                      )}

                      {/* Keep study actions directly below the answer or infographic. */}
                      <div className="accordion-bottom-actions">
                        <div className="actions-left-group">
                          {showDetailsToggle && (
                            <button
                              type="button"
                              className={`btn-toggle-details ${showDetails ? 'active' : ''}`}
                              onClick={(e) => toggleDetails(q.id, e)}
                              title="Toggle detailed explanation & code snippet"
                            >
                              {showDetails ? <EyeOff size={14} /> : <Eye size={14} />}
                              <span>{showDetails ? "Hide Explanation & Code" : "Show Explanation & Code"}</span>
                            </button>
                          )}
                        </div>

                        <div className="actions-right-group">
                          {/* Bookmark Button */}
                          <button
                            type="button"
                            className={`btn-accordion-action ${isBookmarked ? 'bookmarked' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleBookmark(q.id);
                            }}
                            title={isBookmarked ? "Remove Bookmark" : "Save Bookmark"}
                          >
                            <Bookmark size={15} fill={isBookmarked ? "currentColor" : "none"} />
                            <span>{isBookmarked ? 'Saved' : 'Bookmark'}</span>
                          </button>

                          {/* Mark Complete Button */}
                          <button
                            type="button"
                            className={`btn-accordion-complete ${isCompleted ? 'completed' : ''}`}
                            onClick={(e) => handleToggleCompleteWithConfetti(q.id, isCompleted, e)}
                            title={isCompleted ? "Completed" : "Mark Complete"}
                          >
                            <Check size={15} />
                            <span>{isCompleted ? 'Completed' : 'Mark Complete'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Optional Expanded Drawer for Answer, Explanation & Code */}
                      {showDetails && (
                        <div className="accordion-details-drawer">
                          {/* Short Answer */}
                          {q.shortAnswer && (
                            <div className="drawer-section">
                              <h4 className="drawer-heading">💡 Quick Answer:</h4>
                              <p className="drawer-text">{q.shortAnswer}</p>
                            </div>
                          )}

                          {/* Detailed Explanation */}
                          {q.explanation && (
                            <div className="drawer-section">
                              <h4 className="drawer-heading">📘 Detailed Explanation:</h4>
                              <div className="drawer-explanation">
                                {q.explanation.split('\n\n').map((para, pIdx) => (
                                  <p key={pIdx}>{para}</p>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Code Snippet */}
                          {hasCode && (
                            <div className="drawer-section">
                              <div className="code-header-row">
                                <h4 className="drawer-heading">💻 Code Example:</h4>
                                <button
                                  type="button"
                                  className="btn-copy-code-sm"
                                  onClick={(e) => handleCopyCode(codeSnippet, q.id, e)}
                                >
                                  {copiedCodeId === q.id ? <CheckCheck size={13} className="text-emerald-400" /> : <Copy size={13} />}
                                  <span>{copiedCodeId === q.id ? 'Copied!' : 'Copy Code'}</span>
                                </button>
                              </div>
                              <div className="clean-code-container">
                                <pre className="clean-code-pre">
                                  <code>{codeSnippet}</code>
                                </pre>
                              </div>
                            </div>
                          )}

                          {/* Key Takeaways */}
                          {q.takeaways && q.takeaways.length > 0 && (
                            <div className="drawer-section">
                              <h4 className="drawer-heading">🎯 Key Takeaways:</h4>
                              <ul className="drawer-takeaways-list">
                                {q.takeaways.filter(Boolean).map((t, tIdx) => (
                                  <li key={tIdx} className="takeaway-bullet-item">
                                    <div className="bullet-check-badge">
                                      <Check size={11} />
                                    </div>
                                    <span>{t}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </article>
              );
            })
          )}

          {/* 3. Pagination Controls */}
          {totalPages > 1 && (
            <div className="simple-pagination-footer">
              <button
                type="button"
                className="btn-simple-page-nav"
                disabled={currentPage === 1}
                onClick={() => {
                  setCurrentPage(prev => Math.max(prev - 1, 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                ‹ Previous Page
              </button>

              <div className="page-pill-indicators">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    className={`btn-simple-page-num ${currentPage === pageNum ? 'active' : ''}`}
                    onClick={() => {
                      setCurrentPage(pageNum);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="btn-simple-page-nav"
                disabled={currentPage === totalPages}
                onClick={() => {
                  setCurrentPage(prev => Math.min(prev + 1, totalPages));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                Next Page ›
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
