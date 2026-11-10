import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import SectionQuestionsView from './components/SectionQuestionsView';
import AdminQuestionManagement from './components/AdminQuestionManagement';
import AdminAddEditQuestion from './components/AdminAddEditQuestion';
import Dashboard from './components/Dashboard';
import BookmarksView from './components/BookmarksView';
import ProgressView from './components/ProgressView';
import MockInterviewView from './components/MockInterviewView';
import QuizView from './components/QuizView';

import {
  getStoredData,
  setStoredData,
  STORAGE_KEYS,
  toggleBookmarkInStore,
  toggleProgressInStore
} from './lib/store';

import {
  SEED_SECTIONS,
  SEED_TOPICS,
  SEED_QUESTIONS,
  initializeStorageIfNeeded
} from './data/seed';

export default function App() {
  // Ensure seed data is populated on first load
  useEffect(() => {
    initializeStorageIfNeeded();
  }, []);

  // Application State backed by localStorage
  const [sections, setSections] = useState(() => getStoredData(STORAGE_KEYS.SECTIONS, SEED_SECTIONS));
  const [topics, setTopics] = useState(() => getStoredData(STORAGE_KEYS.TOPICS, SEED_TOPICS));
  const [questions, setQuestions] = useState(() => getStoredData(STORAGE_KEYS.QUESTIONS, SEED_QUESTIONS));
  const [bookmarks, setBookmarks] = useState(() => getStoredData(STORAGE_KEYS.BOOKMARKS, ['py-q1']));
  const [progress, setProgress] = useState(() => getStoredData(STORAGE_KEYS.PROGRESS, []));

  // Navigation State
  const [currentRoute, setCurrentRoute] = useState('section-python'); // default starts directly in Python section as shown in screenshot
  const [adminMode, setAdminMode] = useState('list'); // 'list' | 'add' | 'edit'
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Sync to localStorage
  const updateSections = (newSections) => {
    setSections(newSections);
    setStoredData(STORAGE_KEYS.SECTIONS, newSections);
  };

  const updateTopics = (newTopics) => {
    setTopics(newTopics);
    setStoredData(STORAGE_KEYS.TOPICS, newTopics);
  };

  const updateQuestions = (newQuestions) => {
    setQuestions(newQuestions);
    setStoredData(STORAGE_KEYS.QUESTIONS, newQuestions);
  };

  // Toggle Bookmark
  const handleToggleBookmark = (questionId) => {
    const updated = toggleBookmarkInStore(questionId);
    setBookmarks(updated);
  };

  // Toggle Complete
  const handleToggleComplete = (questionId) => {
    const updated = toggleProgressInStore(questionId);
    setProgress(updated);
  };

  // Admin Question Handlers
  const handleSaveQuestion = (questionData) => {
    setQuestions(prev => {
      const index = prev.findIndex(q => q.id === questionData.id);
      let updated;
      if (index >= 0) {
        updated = [...prev];
        updated[index] = questionData;
      } else {
        updated = [questionData, ...prev];
      }
      setStoredData(STORAGE_KEYS.QUESTIONS, updated);
      return updated;
    });
    setAdminMode('list');
    setEditingQuestion(null);
  };

  const handleDeleteQuestion = (questionId) => {
    setQuestions(prev => {
      const updated = prev.filter(q => q.id !== questionId);
      setStoredData(STORAGE_KEYS.QUESTIONS, updated);
      return updated;
    });
  };

  const handleToggleArchiveQuestion = (questionId) => {
    setQuestions(prev => {
      const updated = prev.map(q => {
        if (q.id === questionId) {
          return { ...q, active: q.active === false ? true : false, updatedAt: new Date().toISOString() };
        }
        return q;
      });
      setStoredData(STORAGE_KEYS.QUESTIONS, updated);
      return updated;
    });
  };

  const handleAddSection = (newSec) => {
    updateSections([...sections, newSec]);
  };

  const handleAddTopic = (newTopic) => {
    updateTopics([...topics, newTopic]);
  };

  const handleResetSeedData = () => {
    updateSections(SEED_SECTIONS);
    updateTopics(SEED_TOPICS);
    updateQuestions(SEED_QUESTIONS);
    setBookmarks(['py-q1']);
    setProgress([]);
    setStoredData(STORAGE_KEYS.BOOKMARKS, ['py-q1']);
    setStoredData(STORAGE_KEYS.PROGRESS, []);
  };

  // Export JSON
  const handleExportData = () => {
    const exportBundle = {
      sections,
      topics,
      questions,
      bookmarks,
      progress,
      exportedAt: new Date().toISOString()
    };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(exportBundle, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `data_engineer_prep_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON
  const handleImportData = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed.sections) updateSections(parsed.sections);
        if (parsed.topics) updateTopics(parsed.topics);
        if (parsed.questions) updateQuestions(parsed.questions);
        if (parsed.bookmarks) {
          setBookmarks(parsed.bookmarks);
          setStoredData(STORAGE_KEYS.BOOKMARKS, parsed.bookmarks);
        }
        if (parsed.progress) {
          setProgress(parsed.progress);
          setStoredData(STORAGE_KEYS.PROGRESS, parsed.progress);
        }
        alert('Data imported successfully!');
      } catch (err) {
        alert('Failed to parse imported JSON file. Please ensure it is a valid backup.');
      }
    };
    reader.readAsText(file);
  };

  // Navigation Routing
  const handleNavigate = (route) => {
    setCurrentRoute(route);
    if (route === 'admin') {
      setAdminMode('list');
      setEditingQuestion(null);
    }
  };

  const handleNavigateQuestion = (q) => {
    setCurrentRoute(`section-${q.sectionId}`);
  };

  // Determine current active section object
  const currentSection = useMemo(() => {
    if (currentRoute === 'dashboard') return { id: 'dashboard', name: 'Dashboard' };
    if (currentRoute === 'admin') return { id: 'admin', name: 'Question Manage' };
    if (currentRoute === 'mock') return { id: 'mock', name: 'Mock Interview' };
    if (currentRoute === 'quiz') return { id: 'quiz', name: 'Practice & Quiz' };
    if (currentRoute === 'progress') return { id: 'progress', name: 'Progress' };
    if (currentRoute === 'bookmarks') return { id: 'bookmarks', name: 'Bookmarks' };
    if (currentRoute.startsWith('section-')) {
      const secId = currentRoute.replace('section-', '');
      return sections.find(s => s.id === secId) || { id: secId, name: secId.toUpperCase() };
    }
    return sections[0];
  }, [currentRoute, sections]);

  // Global search questions filter if query is provided in header
  const questionsToPass = useMemo(() => {
    if (!globalSearchQuery.trim()) return questions;
    const qLower = globalSearchQuery.toLowerCase();
    return questions.filter(q => 
      q.question?.toLowerCase().includes(qLower) ||
      q.shortAnswer?.toLowerCase().includes(qLower) ||
      q.explanation?.toLowerCase().includes(qLower)
    );
  }, [questions, globalSearchQuery]);

  return (
    <div className="app-layout">
      {/* Sidebar Navigation */}
      <Sidebar
        sections={sections}
        currentRoute={currentRoute}
        onNavigate={handleNavigate}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="app-main-content">
        {/* Top Header */}
        <Header
          currentSection={currentSection}
          globalSearchQuery={globalSearchQuery}
          onGlobalSearchChange={setGlobalSearchQuery}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          onNavigate={handleNavigate}
          bookmarkCount={bookmarks.length}
          progressCount={progress.length}
        />

        {/* Content Body Router */}
        <main className="main-viewport">
          {/* 1. Dashboard View */}
          {currentRoute === 'dashboard' && (
            <Dashboard
              questions={questions}
              sections={sections}
              bookmarks={bookmarks}
              progress={progress}
              onNavigateSection={(secId) => handleNavigate(`section-${secId}`)}
              onNavigateQuestion={handleNavigateQuestion}
            />
          )}

          {/* 2. Section Question Viewer View (Python, SQL, PySpark, etc.) */}
          {currentRoute.startsWith('section-') && currentSection && (
            <SectionQuestionsView
              key={currentSection.id}
              section={currentSection}
              allQuestions={questionsToPass}
              topics={topics}
              bookmarks={bookmarks}
              progress={progress}
              onToggleBookmark={handleToggleBookmark}
              onToggleComplete={handleToggleComplete}
            />
          )}

          {/* 3. Admin Area */}
          {currentRoute === 'admin' && (
            <>
              {adminMode === 'list' && (
                <AdminQuestionManagement
                  questions={questions}
                  sections={sections}
                  topics={topics}
                  onAddNewClick={() => {
                    setEditingQuestion(null);
                    setAdminMode('add');
                  }}
                  onEditClick={(q) => {
                    setEditingQuestion(q);
                    setAdminMode('edit');
                  }}
                  onDeleteQuestion={handleDeleteQuestion}
                  onToggleArchiveQuestion={handleToggleArchiveQuestion}
                  onAddSection={handleAddSection}
                  onAddTopic={handleAddTopic}
                  onResetSeedData={handleResetSeedData}
                  onExportData={handleExportData}
                  onImportData={handleImportData}
                />
              )}

              {(adminMode === 'add' || adminMode === 'edit') && (
                <AdminAddEditQuestion
                  editingQuestion={editingQuestion}
                  sections={sections}
                  topics={topics}
                  onSaveQuestion={handleSaveQuestion}
                  onCancel={() => {
                    setAdminMode('list');
                    setEditingQuestion(null);
                  }}
                />
              )}
            </>
          )}

          {/* 4. Bookmarks View */}
          {currentRoute === 'bookmarks' && (
            <BookmarksView
              questions={questions}
              bookmarks={bookmarks}
              sections={sections}
              onToggleBookmark={handleToggleBookmark}
              onNavigateQuestion={handleNavigateQuestion}
            />
          )}

          {/* 5. Progress View */}
          {currentRoute === 'progress' && (
            <ProgressView
              questions={questions}
              sections={sections}
              progress={progress}
              onResetProgress={() => {
                setProgress([]);
                setStoredData(STORAGE_KEYS.PROGRESS, []);
              }}
              onNavigateSection={(secId) => handleNavigate(`section-${secId}`)}
            />
          )}

          {/* 6. Mock Interview Simulator */}
          {currentRoute === 'mock' && (
            <MockInterviewView
              questions={questions}
              sections={sections}
            />
          )}

          {/* 7. Practice Quiz */}
          {currentRoute === 'quiz' && (
            <QuizView />
          )}
        </main>
      </div>
    </div>
  );
}
