import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Filter,
  ChevronRight,
  Bookmark,
  Check,
  PanelLeftClose,
  PanelLeftOpen,
  GripVertical,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Sparkles,
  CheckCircle2,
  SlidersHorizontal,
  X,
  ListOrdered
} from 'lucide-react';
import QuestionAccordion from './QuestionAccordion';

const PAGE_SIZE = 12;

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
  const [isReorderMode, setIsReorderMode] = useState(false); // Clean Study Mode vs Reorder Mode

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

  const activeTopic = topics.find(t => t.id === activeQuestion?.topicId);

  // Topic count calculation helper
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

  // Section level completion stats
  const totalSectionQuestions = useMemo(() => {
    return allQuestions.filter(q => q.sectionId === section.id && q.active !== false).length;
  }, [allQuestions, section.id]);

  const completedSectionCount = useMemo(() => {
    return allQuestions.filter(q => q.sectionId === section.id && q.active !== false && progress.includes(q.id)).length;
  }, [allQuestions, section.id, progress]);

  const progressPercent = totalSectionQuestions > 0
    ? Math.round((completedSectionCount / totalSectionQuestions) * 100)
    : 0;

  const handleSelectQuestion = (q) => {
    setActiveQuestionId(q.id);
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
    <div className="section-study-view">
      {/* Top Banner: Section Header + Filter Chips + Progress Bar */}
      <div className="section-study-header">
        <div className="section-header-top">
          <div className="section-title-wrap">
            <h1 className="section-main-title">{section.name} Interview Questions</h1>
            <p className="section-main-subtitle">
              Concept-wise comprehensive interview guide with architecture diagrams, code, and explanations.
            </p>
          </div>

          <div className="section-header-stats">
            <div className="stats-metric">
              <span className="stats-num">{completedSectionCount} / {totalSectionQuestions}</span>
              <span className="stats-lbl">Learned ({progressPercent}%)</span>
            </div>
            <div className="stats-bar-track">
              <div 
                className="stats-bar-fill" 
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Topic Filter Chips (Hides 0-count topics to keep interface clean) */}
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

            {sectionTopics
              .filter(topic => getTopicCount(topic.id) > 0)
              .map(topic => (
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

            {/* Fallback difficulty chips if no specific section topics */}
            {sectionTopics.length === 0 && (
              <>
                {getTopicCount('basics') > 0 && (
                  <button
                    type="button"
                    className={`chip-pill ${selectedTopicId === 'basics' ? 'active' : ''}`}
                    onClick={() => { setSelectedTopicId('basics'); setCurrentPage(1); }}
                  >
                    Basics ({getTopicCount('basics')})
                  </button>
                )}
                {getTopicCount('advanced') > 0 && (
                  <button
                    type="button"
                    className={`chip-pill ${selectedTopicId === 'advanced' ? 'active' : ''}`}
                    onClick={() => { setSelectedTopicId('advanced'); setCurrentPage(1); }}
                  >
                    Advanced ({getTopicCount('advanced')})
                  </button>
                )}
              </>
            )}
          </div>

          {/* Toggle Panel Button */}
          <button
            type="button"
            className={`btn-toggle-panel-header ${isLeftPanelOpen ? 'open' : 'collapsed'}`}
            onClick={() => setIsLeftPanelOpen(prev => !prev)}
            title={isLeftPanelOpen ? "Hide syllabus list" : "Show syllabus list"}
          >
            {isLeftPanelOpen ? <PanelLeftClose size={15} /> : <PanelLeftOpen size={15} />}
            <span>{isLeftPanelOpen ? "Hide Syllabus" : "Show Syllabus"}</span>
          </button>
        </div>
      </div>

      {/* Main Split Layout: Left Syllabus Index & Right Comprehensive Study Pane */}
      <div className={`study-layout-grid ${!isLeftPanelOpen ? 'syllabus-collapsed' : ''}`}>
        {/* Left Column: Syllabus Card List */}
        {isLeftPanelOpen && (
          <aside className="syllabus-column">
            {/* Syllabus Top Tools: Search + Sort dropdown + Reorder mode button */}
            <div className="syllabus-tools-box">
              <div className="syllabus-search-input-wrap">
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
                    className="btn-clear-search"
                    onClick={() => setSearchQuery('')}
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              <div className="syllabus-action-subrow">
                <div className="syllabus-sort-wrap">
                  <ArrowUpDown size={12} className="sort-icon" />
                  <select
                    className="syllabus-sort-select"
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      setCurrentPage(1);
                    }}
                    title="Change question order"
                  >
                    <option value="custom">Default Order</option>
                    <option value="alpha-asc">Question (A → Z)</option>
                    <option value="alpha-desc">Question (Z → A)</option>
                    <option value="diff-asc">Difficulty (Easy → Adv)</option>
                    <option value="diff-desc">Difficulty (Adv → Easy)</option>
                    <option value="uncompleted">Uncompleted First</option>
                    <option value="bookmarked">Bookmarked First</option>
                  </select>
                </div>

                <button
                  type="button"
                  className={`btn-reorder-mode-toggle ${isReorderMode ? 'active' : ''}`}
                  onClick={() => setIsReorderMode(prev => !prev)}
                  title={isReorderMode ? "Exit reorder mode" : "Enable drag-and-drop reorder mode"}
                >
                  <ListOrdered size={13} />
                  <span>{isReorderMode ? 'Done' : 'Reorder'}</span>
                </button>
              </div>

              {/* Informational Banner when Reorder Mode is Active */}
              {isReorderMode && (
                <div className="reorder-mode-active-banner">
                  <GripVertical size={13} />
                  <span>Drag cards or use arrows to rearrange question sequence.</span>
                </div>
              )}
            </div>

            {/* List of Syllabus Question Items */}
            <div className="syllabus-scroll-container">
              {paginatedQuestions.length === 0 ? (
                <div className="syllabus-empty-state">
                  <p>No questions found matching your filter.</p>
                  {searchQuery && (
                    <button 
                      type="button" 
                      className="btn-reset-filters-link"
                      onClick={() => { setSearchQuery(''); setSelectedTopicId('all'); }}
                    >
                      Clear search filter
                    </button>
                  )}
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
                      draggable={isReorderMode}
                      onDragStart={(e) => {
                        if (!isReorderMode) return;
                        e.dataTransfer.setData('text/plain', q.id);
                        e.dataTransfer.effectAllowed = 'move';
                        setDraggedQId(q.id);
                      }}
                      onDragOver={(e) => {
                        if (!isReorderMode) return;
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
                        if (!isReorderMode) return;
                        e.preventDefault();
                        handleDropQuestion(q.id);
                      }}
                      onDragEnd={() => {
                        setDraggedQId(null);
                        setDragOverQId(null);
                      }}
                      className={`syllabus-item-card ${isSelected ? 'selected' : ''} ${isDragging ? 'is-dragging' : ''} ${isDragOver ? 'is-drag-over' : ''} ${isReorderMode ? 'in-reorder-mode' : ''}`}
                      onClick={() => handleSelectQuestion(q)}
                    >
                      {/* Left side: Reorder Handle (shown only in Reorder Mode) or Index Number */}
                      <div className="syllabus-item-prefix">
                        {isReorderMode ? (
                          <div className="syllabus-drag-grip" title="Drag to reorder">
                            <GripVertical size={14} />
                          </div>
                        ) : (
                          <span className="syllabus-index-num">{globalIndex}</span>
                        )}
                      </div>

                      {/* Main text */}
                      <div className="syllabus-item-body">
                        <span className="syllabus-item-title">{q.question}</span>
                        
                        {/* Meta indicators: Difficulty dot + status badges */}
                        <div className="syllabus-item-meta">
                          {q.difficulty && (
                            <span className="syllabus-difficulty-tag">
                              {q.difficulty}
                            </span>
                          )}
                          {isCompleted && (
                            <span className="syllabus-status-tag completed" title="Completed">
                              <Check size={11} />
                              <span>Learned</span>
                            </span>
                          )}
                          {isBookmarked && (
                            <span className="syllabus-status-tag bookmarked" title="Bookmarked">
                              <Bookmark size={11} fill="currentColor" />
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right side: Reorder Nudge Arrows (Reorder Mode) or Chevron */}
                      <div className="syllabus-item-suffix">
                        {isReorderMode ? (
                          <div className="syllabus-micro-arrows" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              className="btn-arrow-nudge"
                              disabled={globalIndex === 1}
                              onClick={() => handleMoveCard(q.id, 'up')}
                              title="Move question up"
                            >
                              <ArrowUp size={11} />
                            </button>
                            <button
                              type="button"
                              className="btn-arrow-nudge"
                              disabled={globalIndex === sortedQuestions.length}
                              onClick={() => handleMoveCard(q.id, 'down')}
                              title="Move question down"
                            >
                              <ArrowDown size={11} />
                            </button>
                          </div>
                        ) : (
                          <ChevronRight size={14} className="syllabus-chevron" />
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Pagination Footer */}
            {totalPages > 1 && (
              <div className="syllabus-pagination-bar">
                <button
                  type="button"
                  className="btn-page-nav"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  title="Previous page"
                >
                  ‹
                </button>

                <div className="page-numbers-group">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      className={`btn-page-number ${currentPage === pageNum ? 'active' : ''}`}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  className="btn-page-nav"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  title="Next page"
                >
                  ›
                </button>
              </div>
            )}
          </aside>
        )}

        {/* Right Column: Comprehensive Study Pane */}
        <main className="study-content-column">
          <QuestionAccordion
            activeQuestion={activeQuestion}
            allFilteredQuestions={sortedQuestions}
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
        </main>
      </div>
    </div>
  );
}
