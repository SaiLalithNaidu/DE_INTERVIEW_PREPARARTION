import React, { useState, useMemo, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import FirebaseAccessScreen from './components/FirebaseAccessScreen';
import SectionQuestionsView from './components/SectionQuestionsView';
import AdminQuestionManagement from './components/AdminQuestionManagement';
import AdminAddEditQuestion from './components/AdminAddEditQuestion';
import Dashboard from './components/Dashboard';
import BookmarksView from './components/BookmarksView';
import ProgressView from './components/ProgressView';
import MockInterviewView from './components/MockInterviewView';
import QuizView from './components/QuizView';

import {
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
import { firebaseConfigured } from './lib/firebaseConfig';

export default function App() {
  // Initialize or migrate storage before reading application state.
  const [initialData] = useState(() => initializeStorageIfNeeded());

  // Application State backed by localStorage
  const [sections, setSections] = useState(initialData.sections);
  const [topics, setTopics] = useState(initialData.topics);
  const [questions, setQuestions] = useState(initialData.questions);
  const [bookmarks, setBookmarks] = useState(initialData.bookmarks);
  const [progress, setProgress] = useState(initialData.progress);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [cloudStatus, setCloudStatus] = useState(firebaseConfigured ? 'connecting' : 'local');
  const [cloudError, setCloudError] = useState('');
  const [isCloudReady, setIsCloudReady] = useState(!firebaseConfigured);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (!firebaseConfigured) return undefined;
    let active = true;
    let syncRevision = 0;
    let unsubscribe = () => {};

    const handleCloudStatus = (event) => {
      setCloudStatus(event.detail?.status || 'error');
      setCloudError(event.detail?.message || '');
    };
    window.addEventListener('dep-firebase-status', handleCloudStatus);

    Promise.all([
      import('./lib/firebase'),
      import('firebase/auth'),
      import('./lib/cloudSync')
    ]).then(([firebaseModule, authModule, cloudModule]) => {
      if (!active || !firebaseModule.auth) return;
      unsubscribe = authModule.onAuthStateChanged(firebaseModule.auth, async (user) => {
        if (!active) return;
        const currentRevision = ++syncRevision;
        setFirebaseUser(user);
        setAuthError('');

        if (!user) {
          cloudModule.disconnectCloudPersistence();
          setCloudStatus('signed-out');
          setCloudError('');
          setIsCloudReady(false);
          return;
        }

        setCloudStatus('connecting');
        setCloudError('');
        setIsCloudReady(false);

        try {
          const result = await cloudModule.syncAppDataWithFirebase(initialData, user, {
            sections: SEED_SECTIONS,
            topics: SEED_TOPICS,
            questions: SEED_QUESTIONS,
            bookmarks: ['py-q1'],
            progress: []
          });
          if (!active || currentRevision !== syncRevision) return;

          setSections(result.data.sections);
          setTopics(result.data.topics);
          setQuestions(result.data.questions);
          setBookmarks(result.data.bookmarks);
          setProgress(result.data.progress);
          setCloudStatus(result.pendingImageCount ? 'warning' : 'connected');
          setCloudError(result.pendingImageCount
            ? `${result.pendingImageCount} existing image(s) are syncing to Firebase Storage in the background.`
            : '');
          setIsCloudReady(true);
        } catch (error) {
          console.error('Firebase connection failed:', error);
          cloudModule.disconnectCloudPersistence();
          if (!active || currentRevision !== syncRevision) return;
          setCloudStatus('error');
          setCloudError(error.message || 'Firebase could not load your app data.');
          setIsCloudReady(true);
        }
      });
    }).catch((error) => {
      if (!active) return;
      console.error('Firebase modules could not be loaded:', error);
      setCloudStatus('error');
      setCloudError(error.message || 'Firebase could not be initialized.');
    });

    return () => {
      active = false;
      syncRevision += 1;
      unsubscribe();
      window.removeEventListener('dep-firebase-status', handleCloudStatus);
    };
  }, [initialData]);

  const handleFirebaseSignIn = async () => {
    setIsSigningIn(true);
    setAuthError('');
    try {
      const { signInWithGoogle } = await import('./lib/firebase');
      await signInWithGoogle();
    } catch (error) {
      setAuthError(error.message || 'Google sign-in failed.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleFirebaseSignOut = async () => {
    try {
      const { signOutFromFirebase } = await import('./lib/firebase');
      await signOutFromFirebase();
    } catch (error) {
      setCloudStatus('error');
      setCloudError(error.message || 'Could not sign out.');
    }
  };

  // Navigation State
  const [currentRoute, setCurrentRoute] = useState('section-python'); // default starts directly in Python section as shown in screenshot
  const [adminMode, setAdminMode] = useState('list'); // 'list' | 'add' | 'edit'
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [addQuestionKey, setAddQuestionKey] = useState(1);
  const [adminToast, setAdminToast] = useState('');
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
    setEditingQuestion(null);
    setAdminToast(editingQuestion ? 'Question updated successfully!' : 'Question added successfully!');
    setAdminMode('list');
  };

  const handleDeleteQuestion = (questionId) => {
    setQuestions(prev => {
      const updated = prev.filter(q => q.id !== questionId);
      setStoredData(STORAGE_KEYS.QUESTIONS, updated);
      return updated;
    });
  };

  const handleReorderQuestions = (reorderedSubset) => {
    setQuestions(prev => {
      const subsetIds = new Set(reorderedSubset.map(q => q.id));
      let subsetIndex = 0;
      const updated = prev.map(q => {
        if (subsetIds.has(q.id)) {
          return reorderedSubset[subsetIndex++];
        }
        return q;
      });
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

  const handleDeleteSection = (sectionId) => {
    // 1. Remove section
    const updatedSections = sections.filter(s => s.id !== sectionId);
    updateSections(updatedSections);

    // 2. Remove associated topics
    const updatedTopics = topics.filter(t => t.sectionId !== sectionId);
    updateTopics(updatedTopics);

    // 3. Remove associated questions
    const updatedQuestions = questions.filter(q => q.sectionId !== sectionId);
    updateQuestions(updatedQuestions);

    // 4. Redirect if currently in this section
    if (currentRoute === `section-${sectionId}`) {
      const remainingStudy = updatedSections.find(s => s.isStudySection);
      setCurrentRoute(remainingStudy ? `section-${remainingStudy.id}` : 'dashboard');
    }
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

  if (firebaseConfigured && (!firebaseUser || !isCloudReady)) {
    return (
      <FirebaseAccessScreen
        status={cloudStatus}
        error={authError || cloudError}
        busy={isSigningIn}
        onSignIn={handleFirebaseSignIn}
      />
    );
  }

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
          cloudStatus={cloudStatus}
          cloudError={cloudError}
          firebaseUser={firebaseUser}
          onFirebaseSignOut={firebaseConfigured ? handleFirebaseSignOut : undefined}
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
              onReorderQuestions={handleReorderQuestions}
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
                  externalToast={adminToast}
                  onClearExternalToast={() => setAdminToast('')}
                  onAddNewClick={() => {
                    setEditingQuestion(null);
                    setAddQuestionKey(prev => prev + 1);
                    setAdminMode('add');
                  }}
                  onEditClick={(q) => {
                    setEditingQuestion(q);
                    setAdminMode('edit');
                  }}
                  onDeleteQuestion={handleDeleteQuestion}
                  onToggleArchiveQuestion={handleToggleArchiveQuestion}
                  onReorderQuestions={handleReorderQuestions}
                  onAddSection={handleAddSection}
                  onDeleteSection={handleDeleteSection}
                  onAddTopic={handleAddTopic}
                  onResetSeedData={handleResetSeedData}
                  onExportData={handleExportData}
                  onImportData={handleImportData}
                />
              )}

              {(adminMode === 'add' || adminMode === 'edit') && (
                <AdminAddEditQuestion
                  key={editingQuestion ? `edit-${editingQuestion.id}` : `add-${addQuestionKey}`}
                  editingQuestion={editingQuestion}
                  sections={sections}
                  topics={topics}
                  onSaveQuestion={handleSaveQuestion}
                  onAddTopic={handleAddTopic}
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
