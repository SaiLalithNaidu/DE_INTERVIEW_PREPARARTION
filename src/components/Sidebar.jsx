import React from 'react';
import { 
  Home, 
  Database, 
  Sparkles, 
  GitFork, 
  FolderGit2, 
  Cloud, 
  Video, 
  CheckCircle2, 
  BarChart2, 
  Settings, 
  Code2, 
  Layers,
  Wrench,
  X
} from 'lucide-react';

const ICON_MAP = {
  Home,
  Code2,
  Database,
  Sparkles,
  GitFork,
  FolderGit2,
  Cloud,
  Video,
  CheckCircle2,
  BarChart2,
  Settings,
  Layers,
  Wrench
};

export default function Sidebar({
  sections = [],
  currentRoute,
  onNavigate,
  isMobileOpen,
  onCloseMobile
}) {
  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div className="sidebar-backdrop" onClick={onCloseMobile}></div>
      )}

      <aside className={`app-sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
        {/* Brand Header */}
        <div className="sidebar-brand" onClick={() => onNavigate('dashboard')}>
          <div className="brand-logo-box">
            <Layers size={22} className="brand-icon" />
          </div>
          <div className="brand-text">
            <span className="brand-title">Data Engineer</span>
            <span className="brand-subtitle">Interview Prep</span>
          </div>
          {isMobileOpen && (
            <button className="mobile-close-btn" onClick={onCloseMobile}>
              <X size={20} />
            </button>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="sidebar-nav">
          <div className="nav-group">
            {sections.map((sec) => {
              const IconComponent = ICON_MAP[sec.icon] || Layers;
              const isActive = currentRoute === sec.id || 
                (currentRoute.startsWith('section-') && currentRoute === `section-${sec.id}`);

              return (
                <button
                  key={sec.id}
                  type="button"
                  className={`nav-item-btn ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    if (sec.id === 'dashboard') {
                      onNavigate('dashboard');
                    } else if (sec.id === 'admin') {
                      onNavigate('admin');
                    } else if (sec.id === 'mock') {
                      onNavigate('mock');
                    } else if (sec.id === 'quiz') {
                      onNavigate('quiz');
                    } else if (sec.id === 'progress') {
                      onNavigate('progress');
                    } else {
                      onNavigate(`section-${sec.id}`);
                    }
                    if (isMobileOpen) onCloseMobile();
                  }}
                >
                  <div className="nav-icon-wrapper">
                    <IconComponent size={18} />
                  </div>
                  <span className="nav-item-label">{sec.name}</span>
                  {isActive && <div className="active-pill-glow"></div>}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Bottom Quick Status */}
        <div className="sidebar-footer">
          <div className="pro-tip-card">
            <div className="tip-header">
              <Sparkles size={14} className="text-yellow-400" />
              <span>Offline Ready</span>
            </div>
            <p className="tip-body">Stored in browser localStorage & IndexedDB. Zero network required.</p>
          </div>
        </div>
      </aside>
    </>
  );
}

