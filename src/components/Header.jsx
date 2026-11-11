import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  Menu, 
  Code2, 
  Database, 
  Sparkles, 
  GitFork, 
  FolderGit2, 
  Cloud, 
  CheckCircle2, 
  BarChart2, 
  Settings, 
  Video,
  Layers,
  Bookmark
} from 'lucide-react';

const ICON_MAP = {
  python: Code2,
  sql: Database,
  pyspark: Sparkles,
  scenario: GitFork,
  projects: FolderGit2,
  aws: Cloud,
  mock: Video,
  quiz: CheckCircle2,
  progress: BarChart2,
  admin: Settings,
  dashboard: Layers
};

const TEXT_ANSWER_SECTION_IDS = new Set(['scenario', 'projects', 'production', 'aws']);

export default function Header({
  currentSection,
  globalSearchQuery,
  onGlobalSearchChange,
  onOpenMobileMenu,
  onNavigate,
  bookmarkCount = 0,
  progressCount = 0
}) {
  const [showNotifications, setShowNotifications] = useState(false);

  const getSectionTitle = () => {
    if (!currentSection) return 'Data Engineer Interview Prep';
    if (currentSection.id === 'dashboard') return 'Candidate Dashboard';
    if (currentSection.id === 'admin') return 'Question Management';
    if (currentSection.id === 'mock') return 'AI Mock Interview Simulator';
    if (currentSection.id === 'quiz') return 'Practice Quizzes & Assessments';
    if (currentSection.id === 'progress') return 'Preparation Progress Tracker';
    return `${currentSection.name} Interview Questions`;
  };

  const getSectionSubtitle = () => {
    if (!currentSection || currentSection.id === 'dashboard') {
      return 'Track your interview readiness, completed modules, and bookmarked questions.';
    }
    if (currentSection.id === 'admin') {
      return 'Add, edit, and manage interview questions by section and topic.';
    }
    if (TEXT_ANSWER_SECTION_IDS.has(currentSection.id)) {
      return 'Read clear, question-specific answers and track your preparation.';
    }
    return 'Practice concept-wise questions with images and real-time explanations.';
  };

  const SectionIcon = ICON_MAP[currentSection?.id] || Layers;

  return (
    <header className="app-header">
      {/* Left: Mobile Toggle + Section Header */}
      <div className="header-left">
        <button 
          type="button" 
          className="mobile-hamburger-btn" 
          onClick={onOpenMobileMenu}
          aria-label="Open Navigation"
        >
          <Menu size={20} />
        </button>

        <div className="header-title-wrapper">
          <div className="title-row">
            <div className={`section-brand-icon ${currentSection?.id || 'default'}`}>
              <SectionIcon size={22} />
            </div>
            <h1 className="section-title">{getSectionTitle()}</h1>
          </div>
          <p className="section-subtitle">{getSectionSubtitle()}</p>
        </div>
      </div>

      {/* Right: Global Search + Notifications + Profile */}
      <div className="header-right">
        {/* Global Search Bar */}
        <div className="header-search-bar">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search questions..."
            value={globalSearchQuery}
            onChange={(e) => onGlobalSearchChange(e.target.value)}
          />
        </div>

        {/* Quick Bookmarks shortcut */}
        <button 
          type="button" 
          className="header-icon-btn" 
          title={`Bookmarked Questions (${bookmarkCount})`}
          onClick={() => onNavigate('bookmarks')}
        >
          <Bookmark size={18} />
          {bookmarkCount > 0 && <span className="icon-badge">{bookmarkCount}</span>}
        </button>

        {/* Notification Bell */}
        <div className="notification-dropdown-wrap">
          <button 
            type="button" 
            className="header-icon-btn" 
            title="Notifications"
            onClick={() => setShowNotifications(prev => !prev)}
          >
            <Bell size={18} />
            <span className="bell-dot"></span>
          </button>

          {showNotifications && (
            <div className="notifications-popover">
              <div className="popover-header">
                <h4>System Notifications</h4>
              </div>
              <div className="popover-list">
                <div className="popover-item">
                  <span className="pop-icon">🚀</span>
                  <div>
                    <p className="pop-msg">Offline Storage Ready</p>
                    <span className="pop-time">IndexedDB + localStorage active</span>
                  </div>
                </div>
                <div className="popover-item">
                  <span className="pop-icon">💡</span>
                  <div>
                    <p className="pop-msg">322+ DE Target Bank</p>
                    <span className="pop-time">You can add your custom questions anytime</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Avatar */}
        <div className="user-profile-avatar" title="Data Engineer Candidate (SK)">
          <span>SK</span>
        </div>
      </div>
    </header>
  );
}

