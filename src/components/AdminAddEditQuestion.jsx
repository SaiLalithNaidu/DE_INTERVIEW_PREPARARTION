import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Upload,
  Trash2,
  Image as ImageIcon,
  Bold,
  Italic,
  List,
  ListOrdered,
  Code,
  Link,
  Plus,
  X,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { saveImageBlob, getImageBlob, deleteImageBlob } from '../lib/store';
import { firebaseConfigured } from '../lib/firebaseConfig';

const MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024; // 8 MB limit per requirements
const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

export default function AdminAddEditQuestion({
  editingQuestion,
  sections = [],
  topics = [],
  onSaveQuestion,
  onAddTopic,
  onCancel
}) {
  const isEditing = Boolean(editingQuestion);

  // Available study sections (excluding Dashboard, Admin, etc.)
  const studySections = React.useMemo(() => {
    return sections.filter(s => s.isStudySection !== false && s.id !== 'dashboard' && s.id !== 'admin');
  }, [sections]);

  // Form State - Initialize sectionId to the first study section (e.g. 'python')
  const [sectionId, setSectionId] = useState(() => {
    if (editingQuestion?.sectionId) return editingQuestion.sectionId;
    const firstStudy = sections.find(s => s.isStudySection !== false && s.id !== 'dashboard' && s.id !== 'admin');
    return firstStudy ? firstStudy.id : 'python';
  });

  // Available topics for chosen section
  const availableTopics = React.useMemo(() => {
    return topics.filter(t => t.sectionId === sectionId);
  }, [topics, sectionId]);

  // Form State - Initialize topicId to the first available topic immediately on initial render
  const [topicId, setTopicId] = useState(() => {
    if (editingQuestion?.topicId) return editingQuestion.topicId;
    const initialSec = editingQuestion?.sectionId || (sections.find(s => s.isStudySection !== false && s.id !== 'dashboard')?.id || 'python');
    const matched = topics.filter(t => t.sectionId === initialSec);
    return matched[0]?.id || '';
  });

  const [questionText, setQuestionText] = useState(editingQuestion?.question || '');
  const [difficulty, setDifficulty] = useState(editingQuestion?.difficulty || 'Basics');
  const [shortAnswer, setShortAnswer] = useState(editingQuestion?.shortAnswer || '');
  const [explanation, setExplanation] = useState(editingQuestion?.explanation || '');
  const [exampleCode, setExampleCode] = useState(editingQuestion?.example || editingQuestion?.code || '');
  const [takeaways, setTakeaways] = useState(
    editingQuestion?.takeaways?.length ? editingQuestion.takeaways : ['']
  );

  // Inline topic creation state
  const [showNewTopicModal, setShowNewTopicModal] = useState(false);
  const [inlineTopicName, setInlineTopicName] = useState('');

  // Image State
  const [imageId, setImageId] = useState(editingQuestion?.imageId || null);
  const [imageUrl, setImageUrl] = useState(editingQuestion?.imageUrl || editingQuestion?.imageSrc || '');
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [imageFileToSave, setImageFileToSave] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Ensure topicId stays valid whenever section or availableTopics change
  useEffect(() => {
    if (availableTopics.length > 0) {
      if (!availableTopics.some(t => t.id === topicId)) {
        setTopicId(availableTopics[0].id);
      }
    } else {
      setTopicId(`${sectionId}-general`);
    }
  }, [availableTopics, topicId, sectionId]);

  const handleSectionChange = (newSecId) => {
    setSectionId(newSecId);
    const newTopics = topics.filter(t => t.sectionId === newSecId);
    setTopicId(newTopics[0]?.id || `${newSecId}-general`);
  };

  const handleCreateInlineTopic = (e) => {
    e.preventDefault();
    if (!inlineTopicName.trim()) return;
    const id = `${sectionId}-${inlineTopicName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    const newTopic = { id, sectionId, name: inlineTopicName.trim() };
    if (onAddTopic) {
      onAddTopic(newTopic);
    }
    setTopicId(id);
    setInlineTopicName('');
    setShowNewTopicModal(false);
  };

  // Load existing image if editing
  useEffect(() => {
    let active = true;
    if (editingQuestion?.imageId) {
      getImageBlob(editingQuestion.imageId).then(blobOrUrl => {
        if (!active) return;
        if (blobOrUrl instanceof Blob) {
          setImagePreviewUrl(URL.createObjectURL(blobOrUrl));
        } else if (typeof blobOrUrl === 'string') {
          setImagePreviewUrl(blobOrUrl);
        }
      });
    } else if (editingQuestion?.imageUrl || editingQuestion?.imageSrc) {
      const src = editingQuestion.imageUrl || editingQuestion.imageSrc;
      setImagePreviewUrl(src);
      setImageUrl(src);
    }
    return () => {
      active = false;
    };
  }, [editingQuestion]);

  // Handle Image Upload Selection
  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      setErrorMessage(`Invalid image format (${file.type}). Allowed: PNG, JPG, JPEG, WEBP.`);
      return;
    }

    // Validate Size (8 MB limit)
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setErrorMessage(`Image is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed is 8 MB.`);
      return;
    }

    setErrorMessage('');
    setImageFileToSave(file);
    setImageUrl('');
    const objectUrl = URL.createObjectURL(file);
    setImagePreviewUrl(objectUrl);
  };

  const handleRemoveImage = () => {
    setImagePreviewUrl(null);
    setImageFileToSave(null);
    setImageId(null);
    setImageUrl('');
  };

  // Reset form to clean default state
  const resetForm = () => {
    const firstStudy = sections.find(s => s.isStudySection !== false && s.id !== 'dashboard' && s.id !== 'admin');
    const defaultSecId = firstStudy ? firstStudy.id : 'python';
    setSectionId(defaultSecId);
    const matchedTopics = topics.filter(t => t.sectionId === defaultSecId);
    setTopicId(matchedTopics[0]?.id || '');
    setQuestionText('');
    setDifficulty('Basics');
    setShortAnswer('');
    setExplanation('');
    setExampleCode('');
    setTakeaways(['']);
    setImageId(null);
    setImageUrl('');
    setImagePreviewUrl(null);
    setImageFileToSave(null);
    setErrorMessage('');
  };

  // Takeaway bullet helpers
  const handleAddTakeaway = () => {
    setTakeaways(prev => [...prev, '']);
  };

  const handleTakeawayChange = (index, value) => {
    setTakeaways(prev => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
  };

  const handleRemoveTakeaway = (index) => {
    setTakeaways(prev => prev.filter((_, i) => i !== index));
  };

  // Markdown format insertion helpers for explanation
  const insertFormatting = (tagStart, tagEnd = tagStart) => {
    const textarea = document.getElementById('explanation-textarea');
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = explanation;
    const selected = text.substring(start, end);
    const replacement = `${tagStart}${selected || 'text'}${tagEnd}`;
    setExplanation(text.substring(0, start) + replacement + text.substring(end));
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tagStart.length, start + tagStart.length + (selected ? selected.length : 4));
    }, 50);
  };

  // Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!questionText.trim()) {
      setErrorMessage('Please enter the question text.');
      return;
    }
    // Short answer is not mandatory if detailed explanation is provided
    // if (!shortAnswer.trim() && !explanation.trim()) {
    //   setErrorMessage('Please provide either a short answer or a detailed explanation.');
    //   return;
    // }

    setIsSaving(true);
    setErrorMessage('');

    try {
      let finalImageId = imageId;

      // If user uploaded a new image file, write to IndexedDB
      if (imageFileToSave) {
        finalImageId = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await saveImageBlob(finalImageId, imageFileToSave);
      }

      const cleanTakeaways = takeaways.map(t => t.trim()).filter(Boolean);

      const questionData = {
        id: editingQuestion?.id || `q_${Date.now()}`,
        sectionId,
        topicId: topicId || (availableTopics[0]?.id || `${sectionId}-general`),
        question: questionText.trim(),
        difficulty,
        shortAnswer: shortAnswer.trim(),
        explanation: explanation.trim(),
        example: exampleCode.trim(),
        code: exampleCode.trim(),
        takeaways: cleanTakeaways.length > 0
          ? cleanTakeaways
          : (shortAnswer.trim() ? [shortAnswer.trim()] : (explanation.trim() ? [explanation.trim().slice(0, 160)] : [])),
        imageId: finalImageId,
        imageUrl: imageUrl.trim() || undefined,
        imageSrc: imageUrl.trim() || undefined,
        active: editingQuestion ? editingQuestion.active : true,
        createdAt: editingQuestion?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // keep existing infographicData if no uploaded image
        infographicData: (finalImageId || imageUrl.trim()) ? null : editingQuestion?.infographicData
      };

      if (onSaveQuestion) {
        onSaveQuestion(questionData);
      }
      resetForm();
      if (onCancel) {
        onCancel();
      }
    } catch (err) {
      console.error('Failed to save question image:', err);
      setErrorMessage(firebaseConfigured
        ? 'Could not save the image to Firebase Storage. Check your connection and Storage setup, then try again.'
        : 'Could not save the image to this browser. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelAction = () => {
    resetForm();
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className="admin-container add-edit-view">
      {/* Breadcrumbs & Header */}
      <div className="admin-header-row">
        <div>
          <div className="admin-breadcrumbs">
            <span>Admin</span>
            <span>/</span>
            <span>Questions</span>
            <span>/</span>
            <span className="current">{isEditing ? 'Edit Question' : 'Add Question'}</span>
          </div>
          <button
            type="button"
            className="btn-back-header"
            onClick={handleCancelAction}
          >
            <ArrowLeft size={18} />
            <span>{isEditing ? 'Edit Question' : 'Add New Question'}</span>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="form-error-banner">
          <AlertTriangle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Form Formats */}
      <form onSubmit={handleSubmit} className="add-question-grid">
        {/* Left Column: Question Details */}
        <div className="form-left-col">
          {/* Section & Topic Selection Row */}
          <div className="form-row-two-col">
            <div className="form-group flex-1">
              <label>Section *</label>
              <select
                value={sectionId}
                onChange={(e) => handleSectionChange(e.target.value)}
                required
              >
                {studySections.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group flex-1">
              <div className="label-with-action">
                <label>Topic *</label>
                <button
                  type="button"
                  className="btn-tiny-add-topic"
                  onClick={() => setShowNewTopicModal(true)}
                  title="Add a new topic for this section"
                >
                  + New Topic
                </button>
              </div>
              <select
                value={topicId}
                onChange={(e) => setTopicId(e.target.value)}
                required
              >
                {availableTopics.length === 0 ? (
                  <option value={`${sectionId}-general`}>General</option>
                ) : (
                  availableTopics.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Question Text & Difficulty */}
          <div className="form-row-two-col">
            <div className="form-group flex-2">
              <label>Question *</label>
              <input
                type="text"
                placeholder="e.g. What is Python, and why is it used in Data Engineering?"
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                required
              />
            </div>

            <div className="form-group flex-1">
              <label>Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option value="Basics">Basics</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Coding">Coding</option>
              </select>
            </div>
          </div>

          {/* Short Answer */}
          <div className="form-group">
            <div className="label-with-action">
              <label>Answer (Short)</label>
              <span className="text-subtle text-xs" style={{ fontWeight: 400 }}>
                {explanation.trim() ? '(Optional when Explanation is provided)' : '* Required if no Explanation'}
              </span>
            </div>
            <textarea
              rows={3}
              placeholder="High-level, crisp explanation suitable for a quick interview definition (optional if detailed explanation is provided)..."
              value={shortAnswer}
              onChange={(e) => setShortAnswer(e.target.value)}
            />
          </div>

          {/* Detailed Explanation with formatting toolbar */}
          <div className="form-group">
            <label>Detailed Explanation</label>
            <div className="wysiwyg-toolbar">
              <button type="button" onClick={() => insertFormatting('**', '**')} title="Bold">
                <Bold size={14} />
              </button>
              <button type="button" onClick={() => insertFormatting('*', '*')} title="Italic">
                <Italic size={14} />
              </button>
              <button type="button" onClick={() => insertFormatting('\n- ')} title="Bullet List">
                <List size={14} />
              </button>
              <button type="button" onClick={() => insertFormatting('\n1. ')} title="Numbered List">
                <ListOrdered size={14} />
              </button>
              <button type="button" onClick={() => insertFormatting('`', '`')} title="Inline Code">
                <Code size={14} />
              </button>
              <button type="button" onClick={() => insertFormatting('[', '](https://)')} title="Link">
                <Link size={14} />
              </button>
            </div>
            <textarea
              id="explanation-textarea"
              rows={5}
              placeholder="Write detailed architectural explanation, deep-dive considerations, tradeoffs..."
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
            />
          </div>

          {/* Real-Time Example Code */}
          <div className="form-group">
            <label>Real-Time Example / Code</label>
            <textarea
              rows={4}
              className="font-mono text-sm"
              placeholder="# Real-world PySpark / SQL / Python snippet"
              value={exampleCode}
              onChange={(e) => setExampleCode(e.target.value)}
            />
          </div>

          {/* Key Takeaways Dynamic Bullets */}
          <div className="form-group">
            <div className="label-with-action">
              <label>Key Interview Takeaways</label>
              <button
                type="button"
                className="btn-add-bullet"
                onClick={handleAddTakeaway}
              >
                <Plus size={13} />
                <span>Add Bullet</span>
              </button>
            </div>
            <div className="takeaways-input-list">
              {takeaways.map((point, idx) => (
                <div key={idx} className="takeaway-input-row">
                  <span className="bullet-indicator">•</span>
                  <input
                    type="text"
                    placeholder={`Takeaway bullet #${idx + 1}`}
                    value={point}
                    onChange={(e) => handleTakeawayChange(idx, e.target.value)}
                  />
                  {takeaways.length > 1 && (
                    <button
                      type="button"
                      className="btn-remove-row"
                      onClick={() => handleRemoveTakeaway(idx)}
                      title="Remove bullet"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Infographic Image Upload Panel */}
        <div className="form-right-col">
          <div className="image-upload-card">
            <label className="card-heading">Question Image</label>

            {/* Image Preview Box if image is loaded */}
            {imagePreviewUrl ? (
              <div className="image-preview-box">
                <img src={imagePreviewUrl} alt="Question Infographic" />
                <div className="preview-overlay-actions">
                  <button
                    type="button"
                    className="preview-btn delete"
                    onClick={handleRemoveImage}
                    title="Delete image"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ) : null}

            {/* Upload Drop Zone */}
            <label className="upload-dropzone">
              <Upload size={32} className="upload-icon" />
              <span className="upload-label">
                {imagePreviewUrl ? 'Replace Image' : 'Upload Image'}
              </span>
              <span className="upload-hint">(PNG, JPG, JPEG, WEBP)</span>
              <span className="upload-limit">Max size: 8 MB</span>
              <input
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleImageFileChange}
                style={{ display: 'none' }}
              />
            </label>

            {/* Direct Image URL / Public Path Input */}
            <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                Or Image URL / Path (CDN or /images/...):
              </label>
              <input
                type="text"
                placeholder="e.g. /images/python/q1.png or https://..."
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  if (e.target.value.trim()) {
                    setImagePreviewUrl(e.target.value.trim());
                    setImageFileToSave(null);
                  }
                }}
                style={{
                  fontSize: '0.8rem',
                  padding: '7px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-light)',
                  width: '100%',
                  background: '#f8fafc',
                  color: 'var(--text-main)'
                }}
              />
            </div>

            <div className="indexeddb-notice">
              <p>
                <strong>{firebaseConfigured ? 'Firebase Storage + IndexedDB:' : 'Local IndexedDB Storage:'}</strong>{' '}
                {firebaseConfigured
                  ? 'Images sync to your Firebase account and remain cached in this browser.'
                  : "Images are stored in this browser's IndexedDB without compression artifacts."}
              </p>
            </div>
          </div>

          {/* Form Action Buttons */}
          <div className="form-submit-row">
            <button
              type="button"
              className="btn-cancel-large"
              onClick={handleCancelAction}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-save-large"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Question'}
            </button>
          </div>
        </div>
      </form>

      {/* Inline Topic Creation Modal */}
      {showNewTopicModal && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <div className="modal-header">
              <h3>Add Topic to {studySections.find(s => s.id === sectionId)?.name || sectionId}</h3>
              <button type="button" onClick={() => setShowNewTopicModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreateInlineTopic} className="modal-form">
              <div className="form-field">
                <label>Topic Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Partitioning, Indexing, Joins, Architecture"
                  value={inlineTopicName}
                  onChange={(e) => setInlineTopicName(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowNewTopicModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  Add Topic
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

