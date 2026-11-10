import React from 'react';
import { BarChart2, CheckCircle, RotateCcw, Award, Check } from 'lucide-react';

export default function ProgressView({
  questions = [],
  sections = [],
  progress = [],
  onResetProgress,
  onNavigateSection
}) {
  const activeQuestions = questions.filter(q => q.active !== false);
  const totalQuestions = activeQuestions.length;
  const completedCount = progress.length;
  const overallPct = totalQuestions > 0 ? Math.round((completedCount / totalQuestions) * 100) : 0;

  const studySections = sections.filter(s => s.isStudySection);

  return (
    <div className="special-page-container">
      <div className="page-header">
        <div className="header-icon-box green">
          <BarChart2 size={24} />
        </div>
        <div className="flex-1">
          <h2>Preparation Progress Tracker</h2>
          <p>Review your interview coverage and completed modules across all data disciplines.</p>
        </div>
        {completedCount > 0 && (
          <button
            type="button"
            className="btn-reset-progress"
            onClick={() => {
              if (window.confirm('Reset all progress markers? You can start your preparation fresh.')) {
                onResetProgress();
              }
            }}
          >
            <RotateCcw size={14} />
            <span>Reset Progress</span>
          </button>
        )}
      </div>

      {/* Summary Scorecard */}
      <div className="progress-scorecard">
        <div className="scorecard-left">
          <div className="scorecard-big-pct">{overallPct}%</div>
          <div className="scorecard-text">
            <h3>Overall Readiness Score</h3>
            <p>{completedCount} of {totalQuestions} questions completed</p>
          </div>
        </div>

        <div className="scorecard-right">
          <div className="readiness-level-badge">
            <Award size={18} />
            <span>
              {overallPct >= 80 ? 'Mastery Level' : overallPct >= 50 ? 'Intermediate Ready' : 'Foundation Level'}
            </span>
          </div>
        </div>
      </div>

      {/* Per Section Breakdown */}
      <div className="section-breakdown-list">
        <h3>Discipline Mastery Breakdown</h3>

        {studySections.map(sec => {
          const secQuestions = activeQuestions.filter(q => q.sectionId === sec.id);
          const secCompleted = secQuestions.filter(q => progress.includes(q.id)).length;
          const secPct = secQuestions.length > 0 ? Math.round((secCompleted / secQuestions.length) * 100) : 0;

          return (
            <div key={sec.id} className="discipline-row-card">
              <div className="discipline-info">
                <h4>{sec.name}</h4>
                <span className="discipline-meta">
                  {secCompleted} of {secQuestions.length} completed
                </span>
              </div>

              <div className="discipline-bar-wrap">
                <div className="discipline-track">
                  <div 
                    className="discipline-fill" 
                    style={{ width: `${secPct}%` }}
                  ></div>
                </div>
                <span className="discipline-pct-label">{secPct}%</span>
              </div>

              <button
                type="button"
                className="btn-jump-discipline"
                onClick={() => onNavigateSection(sec.id)}
              >
                Study Section
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

