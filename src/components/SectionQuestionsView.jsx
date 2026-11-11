import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Filter,
  ChevronRight,
  ChevronDown,
  Bookmark,
  Check,
  PanelLeftClose,
  PanelLeftOpen,
  GripVertical,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import QuestionAccordion from './QuestionAccordion';

const PAGE_SIZE = 10;

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
  const [activeQuestionId, setActiveQuestionId] = useState(null);
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);

  // Drag and drop state
  const [draggedQId, setDraggedQId] = useState(null);
  const [dragOverQId, setDragOverQId] = useState(null);

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

  // Set default active question when list changes or loads
  useEffect(() => {
    if (sortedQuestions.length > 0) {
      const exists = sortedQuestions.some(q => q.id === activeQuestionId);
      if (!exists) {
        setActiveQuestionId(sortedQuestions[0].id);
      }
    } else {
      setActiveQuestionId(null);
    }
  }, [sortedQuestions, activeQuestionId]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(sortedQuestions.length / PAGE_SIZE));
  const paginatedQuestions = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return sortedQuestions.slice(startIndex, startIndex + PAGE_SIZE);
  }, [sortedQuestions, currentPage]);

  // Find the currently active question object
  const activeQuestion = useMemo(() => {
    return sortedQuestions.find(q => q.id === activeQuestionId) || paginatedQuestions[0] || null;
  }, [sortedQuestions, activeQuestionId, paginatedQuestions]);

  // Other questions in this paginated page to show below active question in accordion
  const subsequentQuestions = useMemo(() => {
    if (!activeQuestion) return [];
    return paginatedQuestions.filter(q => q.id !== activeQuestion.id);
  }, [paginatedQuestions, activeQuestion]);

  const activeTopic = topics.find(t => t.id === activeQuestion?.topicId);

  // Topic count pill calculation
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

  const handleSelectQuestion = (q) => {
    setActiveQuestionId(q.id);
  };

  // Drag and drop reordering handler
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

  // Move single step up/down
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
      // Don't trigger if user is typing in an input or textarea
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
    <div className="section-view-container">
      {/* Top Filter Chips & Panel Toggle Header */}
      <div className="section-toolbar-row">
        <div className="topic-filter-chips-row">
          <button
            type="button"
            className={`chip-pill ${selectedTopicId === 'all' ? 'active' : ''}`}
            onClick={() => {
              setSelectedTopicId('all');
              setCurrentPage(1);
            }}
          >
            All ({getTopicCount('all')})
          </button>

          {sectionTopics.map(topic => (
            <button
              key={topic.id}
              type="button"
              className={`chip-pill ${selectedTopicId === topic.id ? 'active' : ''}`}
              onClick={() => {
                setSelectedTopicId(topic.id);
                setCurrentPage(1);
              }}
            >
              {topic.name} ({getTopicCount(topic.id)})
            </button>
          ))}

          {/* Fallback difficulty chips if no specific topics */}
          {sectionTopics.length === 0 && (
            <>
              <button
                type="button"
                className={`chip-pill ${selectedTopicId === 'basics' ? 'active' : ''}`}
                onClick={() => { setSelectedTopicId('basics'); setCurrentPage(1); }}
              >
                Basics ({getTopicCount('basics')})
              </button>
              <button
                type="button"
                className={`chip-pill ${selectedTopicId === 'advanced' ? 'active' : ''}`}
                onClick={() => { setSelectedTopicId('advanced'); setCurrentPage(1); }}
              >
                Advanced ({getTopicCount('advanced')})
              </button>
            </>
          )}
        </div>

        {/* Toggle Button to Open/Close Left Questions Panel */}
        <button
          type="button"
          className={`btn-toggle-left-panel ${isLeftPanelOpen ? 'open' : 'collapsed'}`}
          onClick={() => setIsLeftPanelOpen(prev => !prev)}
          title={isLeftPanelOpen ? "Close left Questions panel" : "Open left Questions panel"}
        >
          {isLeftPanelOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
          <span>{isLeftPanelOpen ? "Hide Questions" : "Show Questions"}</span>
        </button>
      </div>

      {/* Main Split Layout: Left Question List & Right Accordion Detail */}
      <div className={`section-main-grid ${!isLeftPanelOpen ? 'left-panel-collapsed' : ''}`}>
        {/* Left Column: Search + Questions List + Pagination (Hidden when collapsed) */}
        {isLeftPanelOpen && (
          <div className="questions-list-column">
            <div className="questions-search-bar">
              <div className="search-input-wrap">
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search in this section..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
              <button
                type="button"
                className="btn-filter-icon"
                title="Reset Topic Filter"
                onClick={() => {
                  if (selectedTopicId !== 'all') setSelectedTopicId('all');
                }}
              >
                <Filter size={16} />
              </button>
              <button
                type="button"
                className="btn-filter-icon btn-panel-collapse-trigger"
                title="Collapse left panel"
                onClick={() => setIsLeftPanelOpen(false)}
              >
                <PanelLeftClose size={16} />
              </button>
            </div>

            {/* Questions Sorting Toolbar */}
            <div className="questions-sort-toolbar">
              <div className="sort-label-wrap">
                <ArrowUpDown size={13} className="sort-icon" />
                <span>Order:</span>
              </div>
              <select
                className="sort-select-pill"
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="custom">Custom (Drag & Drop)</option>
                <option value="alpha-asc">Question (A → Z)</option>
                <option value="alpha-desc">Question (Z → A)</option>
                <option value="diff-asc">Difficulty (Basics → Adv)</option>
                <option value="diff-desc">Difficulty (Adv → Basics)</option>
                <option value="uncompleted">Uncompleted First</option>
                <option value="bookmarked">Bookmarked First</option>
              </select>
            </div>

            {/* List of Questions */}
            <div className="questions-scrollable-list">
              {paginatedQuestions.length === 0 ? (
                <div className="no-questions-card">
                  <p>No questions found matching your filter.</p>
                </div>
              ) : (
                paginatedQuestions.map((q, idx) => {
                  const globalIndex = (currentPage - 1) * PAGE_SIZE + idx + 1;
                  const isSelected = activeQuestion?.id === q.id;
                  const isCompleted = progress.includes(q.id);
                  const isBookmarked = bookmarks.includes(q.id);
                  const isDragging = draggedQId === q.id;
                  const isDragOver = dragOverQId === q.id;

                  return (
                    <div
                      key={q.id}
                      draggable={sortBy === 'custom'}
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', q.id);
                        e.dataTransfer.effectAllowed = 'move';
                        setDraggedQId(q.id);
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'move';
                        if (dragOverQId !== q.id) {
                          setDragOverQId(q.id);
                        }
                      }}
                      onDragLeave={() => {
                        if (dragOverQId === q.id) {
                          setDragOverQId(null);
                        }
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        handleDropQuestion(q.id);
                      }}
                      onDragEnd={() => {
                        setDraggedQId(null);
                        setDragOverQId(null);
                      }}
                      className={`question-list-item ${isSelected ? 'selected' : ''} ${isDragging ? 'is-dragging-card' : ''} ${isDragOver ? 'is-drag-over-card' : ''}`}
                      onClick={() => handleSelectQuestion(q)}
                    >
                      <div className="item-title-row">
                        {sortBy === 'custom' && (
                          <div
                            className="card-drag-handle"
                            title="Drag to reorder"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <GripVertical size={14} />
                          </div>
                        )}
                        <span className="item-number">{globalIndex}.</span>
                        <span className="item-text">{q.question}</span>
                      </div>

                      <div className="item-badges-row">
                        {sortBy === 'custom' && (
                          <div className="card-micro-nudge" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              className="btn-micro-nudge"
                              disabled={globalIndex === 1}
                              onClick={() => handleMoveCard(q.id, 'up')}
                              title="Move question up"
                            >
                              <ArrowUp size={11} />
                            </button>
                            <button
                              type="button"
                              className="btn-micro-nudge"
                              disabled={globalIndex === sortedQuestions.length}
                              onClick={() => handleMoveCard(q.id, 'down')}
                              title="Move question down"
                            >
                              <ArrowDown size={11} />
                            </button>
                          </div>
                        )}

                        <div className="item-meta-left">
                          {isCompleted && (
                            <span className="badge-done" title="Completed">
                              <Check size={12} />
                            </span>
                          )}
                          {isBookmarked && (
                            <span className="badge-saved" title="Bookmarked">
                              <Bookmark size={12} fill="currentColor" />
                            </span>
                          )}
                        </div>
                        <div className="item-chevron">
                          {isSelected ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pagination-bar">
                <button
                  type="button"
                  className="page-nav-btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                >
                  ‹
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                  <button
                    key={pageNum}
                    type="button"
                    className={`page-num-btn ${currentPage === pageNum ? 'active' : ''}`}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  type="button"
                  className="page-nav-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                >
                  ›
                </button>
              </div>
            )}
          </div>
        )}

        {/* Right Column: Question Viewer Accordion */}
        <div className="questions-detail-column">
          <QuestionAccordion
            activeQuestion={activeQuestion}
            allFilteredQuestions={sortedQuestions}
            otherQuestions={subsequentQuestions}
            section={section}
            topic={activeTopic}
            isBookmarked={activeQuestion ? bookmarks.includes(activeQuestion.id) : false}
            isCompleted={activeQuestion ? progress.includes(activeQuestion.id) : false}
            onToggleBookmark={onToggleBookmark}
            onToggleComplete={onToggleComplete}
            onSelectQuestion={handleSelectQuestion}
            isLeftPanelOpen={isLeftPanelOpen}
            onToggleLeftPanel={() => setIsLeftPanelOpen(prev => !prev)}
          />
        </div>
      </div>
    </div>
  );
}

