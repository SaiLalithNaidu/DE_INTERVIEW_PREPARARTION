import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Archive,
  RotateCcw,
  Image as ImageIcon,
  Layers,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  GripVertical,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { deleteImageBlob } from '../lib/store';

const PAGE_SIZE = 10;

const DIFFICULTY_WEIGHTS = {
  Basics: 1,
  Intermediate: 2,
  Advanced: 3,
  Coding: 4
};

export default function AdminQuestionManagement({
  questions = [],
  sections = [],
  topics = [],
  onAddNewClick,
  onEditClick,
  onDeleteQuestion,
  onToggleArchiveQuestion,
  onReorderQuestions,
  onAddSection,
  onDeleteSection,
  onAddTopic,
  onResetSeedData,
  onExportData,
  onImportData,
  externalToast = '',
  onClearExternalToast
}) {
  const [selectedSectionId, setSelectedSectionId] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('active'); // 'active' | 'archived' | 'all'
  const [sortBy, setSortBy] = useState('custom'); // 'custom' | 'alpha-asc' | 'alpha-desc' | 'diff-asc' | 'diff-desc' | 'newest' | 'oldest'
  const [currentPage, setCurrentPage] = useState(1);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Handle external toasts (e.g. question saved or updated)
  React.useEffect(() => {
    if (externalToast) {
      setToastMessage(externalToast);
      const timer = setTimeout(() => {
        setToastMessage('');
        if (onClearExternalToast) onClearExternalToast();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [externalToast, onClearExternalToast]);

  // Drag and drop state
  const [draggedQuestionId, setDraggedQuestionId] = useState(null);
  const [dragOverQuestionId, setDragOverQuestionId] = useState(null);

  // Study sections only (excluding Dashboard, Admin, etc.)
  const studySections = useMemo(() => {
    return sections.filter(s => s.isStudySection !== false && s.id !== 'dashboard' && s.id !== 'admin');
  }, [sections]);

  // Filtered questions
  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      // Section filter
      if (selectedSectionId !== 'all' && q.sectionId !== selectedSectionId) {
        return false;
      }
      // Status filter
      if (statusFilter === 'active' && q.active === false) return false;
      if (statusFilter === 'archived' && q.active !== false) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesQuestion = q.question?.toLowerCase().includes(query);
        const matchesTopic = q.topicId?.toLowerCase().includes(query);
        if (!matchesQuestion && !matchesTopic) return false;
      }
      return true;
    });
  }, [questions, selectedSectionId, statusFilter, searchQuery]);

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
    } else if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
    }
    return result;
  }, [filteredQuestions, sortBy]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedQuestions.length / PAGE_SIZE));
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return sortedQuestions.slice(start, start + PAGE_SIZE);
  }, [sortedQuestions, currentPage]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Drag and drop reordering handler
  const handleDrop = (targetQuestionId) => {
    if (!draggedQuestionId || draggedQuestionId === targetQuestionId) {
      setDraggedQuestionId(null);
      setDragOverQuestionId(null);
      return;
    }

    const currentList = [...sortedQuestions];
    const sourceIndex = currentList.findIndex(q => q.id === draggedQuestionId);
    const targetIndex = currentList.findIndex(q => q.id === targetQuestionId);

    if (sourceIndex >= 0 && targetIndex >= 0) {
      const [movedItem] = currentList.splice(sourceIndex, 1);
      currentList.splice(targetIndex, 0, movedItem);

      if (onReorderQuestions) {
        onReorderQuestions(currentList);
        showToast('Question order updated.');
      }
    }
    setDraggedQuestionId(null);
    setDragOverQuestionId(null);
  };

  // Move step up or down single position
  const handleMoveStep = (questionId, direction) => {
    const currentList = [...sortedQuestions];
    const index = currentList.findIndex(q => q.id === questionId);
    if (index < 0) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentList.length) return;

    const [moved] = currentList.splice(index, 1);
    currentList.splice(targetIndex, 0, moved);

    if (onReorderQuestions) {
      onReorderQuestions(currentList);
      showToast('Position updated.');
    }
  };

  const handleCreateSection = (e) => {
    e.preventDefault();
    if (!newSectionName.trim()) return;
    const id = newSectionName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    onAddSection({ id, name: newSectionName.trim(), icon: 'Layers', isStudySection: true });
    setNewSectionName('');
    showToast(`Section "${newSectionName.trim()}" created successfully!`);
  };

  const handleDeleteSectionPrompt = (secId, secName) => {
    const count = questions.filter(q => q.sectionId === secId).length;
    if (window.confirm(`Are you sure you want to delete section "${secName}"? This will permanently delete this section and all ${count} associated questions.`)) {
      if (onDeleteSection) {
        onDeleteSection(secId);
      }
      if (selectedSectionId === secId) {
        setSelectedSectionId('all');
      }
      showToast(`Section "${secName}" deleted.`);
    }
  };

  return (
    <div className="admin-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="admin-toast">
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Breadcrumbs & Header */}
      <div className="admin-header-row">
        <div>
          <div className="admin-breadcrumbs">
            <span>Admin</span>
            <span>/</span>
            <span className="current">Question Management</span>
          </div>
          <h1 className="admin-title">Question Management</h1>
          <p className="admin-subtitle">
            Add, edit, and manage interview questions by section.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="admin-actions-group">
          <button
            type="button"
            className="btn-admin-secondary"
            onClick={() => setShowSectionModal(true)}
            title="Manage and Delete Sections"
          >
            <Layers size={15} />
            <span>Manage Sections ({studySections.length})</span>
          </button>

          <button
            type="button"
            className="btn-admin-primary"
            onClick={onAddNewClick}
          >
            <Plus size={16} />
            <span>Add Question</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar without Topic dropdown */}
      <div className="admin-filter-card">
        <div className="admin-filter-controls">
          {/* Section dropdown + Quick Delete Section */}
          <div className="filter-select-group">
            <div className="label-with-action">
              <label>Section</label>
              {selectedSectionId !== 'all' && (
                <button
                  type="button"
                  className="btn-text-danger"
                  onClick={() => {
                    const sec = sections.find(s => s.id === selectedSectionId);
                    handleDeleteSectionPrompt(selectedSectionId, sec?.name || selectedSectionId);
                  }}
                  title="Delete this section"
                >
                  <Trash2 size={12} />
                  <span>Delete</span>
                </button>
              )}
            </div>
            <select
              value={selectedSectionId}
              onChange={(e) => {
                setSelectedSectionId(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">All Sections ({studySections.length})</option>
              {studySections.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Search input */}
          <div className="filter-search-group">
            <label>Search</label>
            <div className="search-box">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search by question..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          {/* Status filter tabs */}
          <div className="filter-select-group">
            <label>Status</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="active">Active Only</option>
              <option value="archived">Archived</option>
              <option value="all">All Statuses</option>
            </select>
          </div>

          {/* Sort Order options */}
          <div className="filter-select-group">
            <div className="label-with-action">
              <label>Sort Order</label>
              <ArrowUpDown size={12} className="text-muted" />
            </div>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="custom">Custom Order (Drag & Drop)</option>
              <option value="alpha-asc">Question (A → Z)</option>
              <option value="alpha-desc">Question (Z → A)</option>
              <option value="diff-asc">Difficulty (Basics → Adv)</option>
              <option value="diff-desc">Difficulty (Adv → Basics)</option>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Questions Data Table */}
      <div className="admin-table-card">
        {sortBy === 'custom' && (
          <div className="table-drag-hint-bar">
            <GripVertical size={14} />
            <span>Drag rows by the handle on the left to reorder questions, or use the up/down arrows.</span>
          </div>
        )}
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: '75px' }}>#</th>
              <th>Question</th>
              <th style={{ width: '130px' }}>Section</th>
              <th style={{ width: '140px' }}>Topic</th>
              <th style={{ width: '80px', textAlign: 'center' }}>Image</th>
              <th style={{ width: '90px' }}>Status</th>
              <th style={{ width: '100px', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedList.length === 0 ? (
              <tr>
                <td colSpan={7} className="empty-table-cell">
                  No questions match your filter criteria.
                </td>
              </tr>
            ) : (
              paginatedList.map((q, idx) => {
                const globalIndex = (currentPage - 1) * PAGE_SIZE + idx + 1;
                const sectionObj = sections.find(s => s.id === q.sectionId);
                const topicObj = topics.find(t => t.id === q.topicId);
                const hasImage = Boolean(q.imageId || q.infographicData);
                const isDragging = draggedQuestionId === q.id;
                const isDragOver = dragOverQuestionId === q.id;

                return (
                  <tr
                    key={q.id}
                    draggable={sortBy === 'custom'}
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', q.id);
                      e.dataTransfer.effectAllowed = 'move';
                      setDraggedQuestionId(q.id);
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'move';
                      if (dragOverQuestionId !== q.id) {
                        setDragOverQuestionId(q.id);
                      }
                    }}
                    onDragLeave={() => {
                      if (dragOverQuestionId === q.id) {
                        setDragOverQuestionId(null);
                      }
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      handleDrop(q.id);
                    }}
                    onDragEnd={() => {
                      setDraggedQuestionId(null);
                      setDragOverQuestionId(null);
                    }}
                    className={`admin-table-row ${isDragging ? 'is-dragging' : ''} ${isDragOver ? 'is-drag-over' : ''}`}
                  >
                    <td className="row-number-cell">
                      <div className="row-drag-wrapper">
                        {sortBy === 'custom' && (
                          <div className="drag-handle-grip" title="Drag to reorder">
                            <GripVertical size={14} />
                          </div>
                        )}
                        <span className="row-number">{globalIndex}</span>
                        {sortBy === 'custom' && (
                          <div className="micro-reorder-actions">
                            <button
                              type="button"
                              className="btn-micro-step"
                              disabled={globalIndex === 1}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveStep(q.id, 'up');
                              }}
                              title="Move up"
                            >
                              <ArrowUp size={11} />
                            </button>
                            <button
                              type="button"
                              className="btn-micro-step"
                              disabled={globalIndex === sortedQuestions.length}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveStep(q.id, 'down');
                              }}
                              title="Move down"
                            >
                              <ArrowDown size={11} />
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="row-question-text">
                      <span className="question-title-text">{q.question}</span>
                      <span className="question-sub-diff">{q.difficulty || 'Concept'}</span>
                    </td>
                    <td>
                      <span className="tag-section">{sectionObj?.name || q.sectionId}</span>
                    </td>
                    <td>
                      <span className="tag-topic">{topicObj?.name || q.topicId || 'General'}</span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`badge-image-icon ${hasImage ? 'has-img' : 'no-img'}`} title={hasImage ? "Has Infographic" : "No image"}>
                        <ImageIcon size={15} />
                      </span>
                    </td>
                    <td>
                      <span className={`status-pill ${q.active !== false ? 'active' : 'archived'}`}>
                        {q.active !== false ? 'Active' : 'Archived'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div className="table-actions-cell">
                        <button
                          type="button"
                          className="table-action-btn edit"
                          onClick={() => onEditClick(q)}
                          title="Edit Question"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          type="button"
                          className="table-action-btn archive"
                          onClick={() => onToggleArchiveQuestion(q.id)}
                          title={q.active !== false ? "Archive Question" : "Restore Question"}
                        >
                          {q.active !== false ? <Archive size={15} /> : <RotateCcw size={15} />}
                        </button>
                        <button
                          type="button"
                          className="table-action-btn delete"
                          onClick={() => {
                            if (window.confirm(`Delete question permanently: "${q.question}"?`)) {
                              onDeleteQuestion(q.id);
                              showToast('Question deleted');
                            }
                          }}
                          title="Delete Permanently"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Table Footer with Pagination & Export/Import Controls */}
        <div className="admin-table-footer">
          <div className="footer-left-tools">
            <span className="count-info">
              Showing {paginatedList.length} of {filteredQuestions.length} questions
            </span>
            <button
              type="button"
              className="btn-tiny-tool"
              onClick={onExportData}
              title="Export all questions and metadata to JSON"
            >
              <Download size={13} />
              <span>Export JSON</span>
            </button>
            <label className="btn-tiny-tool cursor-pointer" title="Import JSON data">
              <Upload size={13} />
              <span>Import JSON</span>
              <input
                type="file"
                accept=".json"
                style={{ display: 'none' }}
                onChange={onImportData}
              />
            </label>
            <button
              type="button"
              className="btn-tiny-tool danger"
              onClick={() => {
                if (window.confirm('Reset all questions to factory default seed data? Any custom questions not exported will be reset.')) {
                  onResetSeedData();
                  showToast('Database reset to seed data!');
                }
              }}
              title="Reset to default seed questions"
            >
              <RotateCcw size={13} />
              <span>Reset Defaults</span>
            </button>
          </div>

          {totalPages > 1 && (
            <div className="pagination-bar">
              <button
                type="button"
                className="page-nav-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              >
                ‹
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  type="button"
                  className={`page-num-btn ${currentPage === p ? 'active' : ''}`}
                  onClick={() => setCurrentPage(p)}
                >
                  {p}
                </button>
              ))}
              <button
                type="button"
                className="page-nav-btn"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              >
                ›
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Manage & Delete Sections */}
      {showSectionModal && (
        <div className="modal-backdrop">
          <div className="modal-dialog modal-dialog-wide">
            <div className="modal-header">
              <h3>Manage Sections ({studySections.length})</h3>
              <button type="button" onClick={() => setShowSectionModal(false)}>×</button>
            </div>

            {/* Quick Add Section Form */}
            <form onSubmit={handleCreateSection} className="modal-form-inline">
              <input
                type="text"
                placeholder="New section name (e.g. Kafka, dbt, Snowflake)..."
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
                required
              />
              <button type="submit" className="btn-submit">
                + Add Section
              </button>
            </form>

            {/* List of Existing Sections with Delete Option */}
            <div className="modal-sections-list">
              <label className="section-list-heading">Existing Sections ({studySections.length})</label>
              <div className="sections-scroll-container">
                {studySections.map(sec => {
                  const count = questions.filter(q => q.sectionId === sec.id).length;
                  return (
                    <div key={sec.id} className="manage-section-item">
                      <div className="manage-sec-info">
                        <span className="manage-sec-name">{sec.name}</span>
                        <span className="manage-sec-badge">{count} questions</span>
                      </div>
                      <button
                        type="button"
                        className="btn-delete-section"
                        onClick={() => handleDeleteSectionPrompt(sec.id, sec.name)}
                        title={`Delete section "${sec.name}" and all questions`}
                      >
                        <Trash2 size={15} />
                        <span>Delete</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn-cancel" onClick={() => setShowSectionModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

