import React from 'react';
import { Bookmark, ArrowRight, Trash2, BookOpen } from 'lucide-react';

export default function BookmarksView({
  questions = [],
  bookmarks = [],
  sections = [],
  onToggleBookmark,
  onNavigateQuestion
}) {
  const bookmarkedQuestions = questions.filter(q => bookmarks.includes(q.id) && q.active !== false);

  return (
    <div className="special-page-container">
      <div className="page-header">
        <div className="header-icon-box amber">
          <Bookmark size={24} />
        </div>
        <div>
          <h2>Bookmarked Questions ({bookmarkedQuestions.length})</h2>
          <p>Review questions you've saved for quick recall before your interview.</p>
        </div>
      </div>

      {bookmarkedQuestions.length === 0 ? (
        <div className="empty-state-box">
          <Bookmark size={48} className="empty-icon" />
          <h3>No bookmarks yet</h3>
          <p>While studying any question, click the bookmark icon to save it here for fast revision.</p>
        </div>
      ) : (
        <div className="bookmarks-grid">
          {bookmarkedQuestions.map(q => {
            const sec = sections.find(s => s.id === q.sectionId);
            return (
              <div key={q.id} className="bookmark-card">
                <div className="card-top-badges">
                  <span className="badge-section">{sec?.name || q.sectionId}</span>
                  <span className="badge-diff">{q.difficulty || 'Concept'}</span>
                  <button
                    type="button"
                    className="btn-remove-bookmark"
                    onClick={() => onToggleBookmark(q.id)}
                    title="Remove from bookmarks"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                <h3 className="bookmark-question-title">{q.question}</h3>
                <p className="bookmark-answer-snippet">{q.shortAnswer}</p>

                <div className="bookmark-card-footer">
                  <button
                    type="button"
                    className="btn-view-study"
                    onClick={() => onNavigateQuestion(q)}
                  >
                    <span>Study Infographic</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

