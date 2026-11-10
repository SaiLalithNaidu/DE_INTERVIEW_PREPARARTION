import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  ChevronRight, 
  ChevronDown, 
  Bookmark, 
  Check, 
  PanelLeftClose, 
  PanelLeftOpen 
} from 'lucide-react';
import QuestionAccordion from './QuestionAccordion';

const PAGE_SIZE = 10;

export default function SectionQuestionsView({
  section,
  allQuestions,
  topics,
  bookmarks,
  progress,
  onToggleBookmark,
  onToggleComplete
}) {
  const [selectedTopicId, setSelectedTopicId] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeQuestionId, setActiveQuestionId] = useState(null);
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);

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

  // Set default active question when list changes or loads
  useEffect(() => {
    if (filteredQuestions.length > 0) {
      // If current activeQuestionId is not in filtered list, pick the first
      const exists = filteredQuestions.some(q => q.id === activeQuestionId);
      if (!exists) {
        setActiveQuestionId(filteredQuestions[0].id);
      }
    } else {
      setActiveQuestionId(null);
    }
  }, [filteredQuestions, activeQuestionId]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredQuestions.length / PAGE_SIZE));
  const paginatedQuestions = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredQuestions.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredQuestions, currentPage]);

  // Find the currently active question object
  const activeQuestion = useMemo(() => {
    return filteredQuestions.find(q => q.id === activeQuestionId) || paginatedQuestions[0] || null;
  }, [filteredQuestions, activeQuestionId, paginatedQuestions]);

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

                  return (
                    <div
                      key={q.id}
                      className={`question-list-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleSelectQuestion(q)}
                    >
                      <div className="item-title-row">
                        <span className="item-number">{globalIndex}.</span>
                        <span className="item-text">{q.question}</span>
                      </div>

                      <div className="item-badges-row">
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
            allFilteredQuestions={filteredQuestions}
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

