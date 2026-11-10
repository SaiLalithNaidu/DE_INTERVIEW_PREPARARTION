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
  AlertCircle
} from 'lucide-react';
import { deleteImageBlob } from '../lib/store';

const PAGE_SIZE = 10;

export default function AdminQuestionManagement({
  questions = [],
  sections = [],
  topics = [],
  onAddNewClick,
  onEditClick,
  onDeleteQuestion,
  onToggleArchiveQuestion,
  onAddSection,
  onAddTopic,
  onResetSeedData,
  onExportData,
  onImportData
}) {
  const [selectedSectionId, setSelectedSectionId] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('active'); // 'active' | 'archived' | 'all'
  const [currentPage, setCurrentPage] = useState(1);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');
  const [toastMessage, setToastMessage] = useState('');

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

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredQuestions.length / PAGE_SIZE));
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredQuestions.slice(start, start + PAGE_SIZE);
  }, [filteredQuestions, currentPage]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleCreateSection = (e) => {
    e.preventDefault();
    if (!newSectionName.trim()) return;
    const id = newSectionName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    onAddSection({ id, name: newSectionName.trim(), icon: 'Layers', isStudySection: true });
    setNewSectionName('');
    setShowSectionModal(false);
    showToast('New Section created successfully!');
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
            title="Create new section"
          >
            <Layers size={15} />
            <span>+ Section</span>
          </button>

          <button
            type="button"
            className="btn-admin-primary"
            onClick={onAddNewClick}
          >
            <Plus size={16} />
            <span>+ Add Question</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar without Topic dropdown */}
      <div className="admin-filter-card">
        <div className="admin-filter-controls">
          {/* Section dropdown */}
          <div className="filter-select-group">
            <label>Section</label>
            <select
              value={selectedSectionId}
              onChange={(e) => {
                setSelectedSectionId(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">All Sections</option>
              {sections.filter(s => s.isStudySection !== false).map(s => (
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
        </div>
      </div>

      {/* Questions Data Table */}
      <div className="admin-table-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>#</th>
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

                return (
                  <tr key={q.id}>
                    <td className="row-number">{globalIndex}</td>
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

      {/* Modal: Add New Section */}
      {showSectionModal && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <div className="modal-header">
              <h3>Create New Section</h3>
              <button type="button" onClick={() => setShowSectionModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreateSection} className="modal-form">
              <div className="form-field">
                <label>Section Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Kafka, Data Modeling, Kubernetes"
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value)}
                  required
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowSectionModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  Create Section
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

