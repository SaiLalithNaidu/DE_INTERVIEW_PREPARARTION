import React from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  Bookmark, 
  Award, 
  ArrowRight, 
  Sparkles, 
  Code2, 
  Database, 
  Cloud, 
  GitFork, 
  FolderGit2 
} from 'lucide-react';

const SECTION_ICONS = {
  python: Code2,
  sql: Database,
  pyspark: Sparkles,
  scenario: GitFork,
  projects: FolderGit2,
  aws: Cloud
};

export default function Dashboard({
  questions = [],
  sections = [],
  bookmarks = [],
  progress = [],
  onNavigateSection,
  onNavigateQuestion
}) {
  const activeQuestions = questions.filter(q => q.active !== false);
  const totalCount = activeQuestions.length;
  const completedCount = progress.length;
  const bookmarkedCount = bookmarks.length;
  const readinessPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Study sections only
  const studySections = sections.filter(s => s.isStudySection);

  // Find next uncompleted question
  const nextQuestion = activeQuestions.find(q => !progress.includes(q.id)) || activeQuestions[0];
  const nextSection = nextQuestion ? sections.find(s => s.id === nextQuestion.sectionId) : null;

  return (
    <div className="dashboard-container">
      {/* Welcome Banner with Next Target */}
      <div className="dashboard-hero-banner">
        <div className="hero-content">
          <div className="hero-pill">
            <Sparkles size={14} className="text-yellow-300" />
            <span>Data Engineer Interview Masterclass</span>
          </div>
          <h2 className="hero-heading">Welcome Back, Engineer</h2>
          <p className="hero-sub">
            Prepare for top Big Tech, FinTech, and Data Lakehouse technical rounds with concept infographics and real-world architectures.
          </p>

          {nextQuestion && (
            <div className="resume-study-bar">
              <span className="resume-label">Continue Preparation:</span>
              <button 
                type="button" 
                className="btn-resume-question"
                onClick={() => onNavigateQuestion(nextQuestion)}
              >
                <span>{nextQuestion.question}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>

        <div className="hero-metric-radial">
          <div className="readiness-circle">
            <span className="circle-percent">{readinessPercent}%</span>
            <span className="circle-label">Ready</span>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="stats-kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-box purple">
            <BookOpen size={20} />
          </div>
          <div className="kpi-info">
            <span className="kpi-value">{totalCount}</span>
            <span className="kpi-title">Interview Questions</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box green">
            <CheckCircle2 size={20} />
          </div>
          <div className="kpi-info">
            <span className="kpi-value">{completedCount}</span>
            <span className="kpi-title">Mastered Questions</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box amber">
            <Bookmark size={20} />
          </div>
          <div className="kpi-info">
            <span className="kpi-value">{bookmarkedCount}</span>
            <span className="kpi-title">Bookmarked for Review</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box blue">
            <Award size={20} />
          </div>
          <div className="kpi-info">
            <span className="kpi-value">{studySections.length}</span>
            <span className="kpi-title">Core Disciplines</span>
          </div>
        </div>
      </div>

      {/* Section Progress Cards */}
      <div className="dashboard-section-heading">
        <h3>Interview Disciplines & Breakdown</h3>
        <p>Explore concept cards with high-definition diagrams and code examples.</p>
      </div>

      <div className="sections-grid">
        {studySections.map(sec => {
          const secQuestions = activeQuestions.filter(q => q.sectionId === sec.id);
          const secCompleted = secQuestions.filter(q => progress.includes(q.id)).length;
          const percent = secQuestions.length > 0 ? Math.round((secCompleted / secQuestions.length) * 100) : 0;
          const Icon = SECTION_ICONS[sec.id] || Code2;

          return (
            <div 
              key={sec.id} 
              className="section-card-item"
              onClick={() => onNavigateSection(sec.id)}
            >
              <div className="section-card-top">
                <div className={`sec-icon-circle ${sec.id}`}>
                  <Icon size={20} />
                </div>
                <div className="sec-meta-counts">
                  <span className="sec-count-badge">{secQuestions.length} Questions</span>
                </div>
              </div>

              <h4 className="sec-card-name">{sec.name}</h4>
              <p className="sec-card-desc">
                {sec.id === 'python' && 'OOP, Generators, Memory layout, Boto3, and PySpark internals.'}
                {sec.id === 'sql' && 'Window functions, Partition pruning, SARGable predicates, and CDC.'}
                {sec.id === 'pyspark' && 'Catalyst optimizer, Tungsten, Salting, and Data skew resolution.'}
                {sec.id === 'scenario' && 'Production pipeline failures, Idempotency, and OOM recovery.'}
                {sec.id === 'projects' && 'End-to-end Medallion batch and real-time streaming architectures.'}
                {sec.id === 'aws' && 'S3 Lakehouses, Glue Crawlers, Redshift, and Airflow orchestration.'}
                {!['python', 'sql', 'pyspark', 'scenario', 'projects', 'aws'].includes(sec.id) && 'Concepts and interview questions.'}
              </p>

              <div className="sec-progress-wrap">
                <div className="progress-bar-track">
                  <div 
                    className="progress-bar-fill" 
                    style={{ width: `${percent}%` }}
                  ></div>
                </div>
                <div className="progress-labels">
                  <span>{secCompleted} of {secQuestions.length} completed</span>
                  <span className="percent-num">{percent}%</span>
                </div>
              </div>

              <div className="sec-card-footer">
                <span className="btn-explore-link">
                  Open Section <ArrowRight size={14} />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

