import { useState, useEffect } from 'react';
import api from '../services/api';

const Journal = () => {
  const [entries, setEntries] = useState([]);
  const [formData, setFormData] = useState({
    content: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expandedEntry, setExpandedEntry] = useState(null);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const response = await api.get('mental/journal/');
      setEntries(response.data);
      setLoading(false);
    } catch (error) {
      setError('Failed to load journal entries');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      content: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const response = await api.post('mental/journal/', {
        content: formData.content,
      });

      setEntries([response.data, ...entries]);
      setFormData({ content: '' });
      setSuccess('Journal entry saved!');
      setSubmitting(false);
    } catch (error) {
      setError('Failed to save journal entry');
      setSubmitting(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedEntry(expandedEntry === id ? null : id);
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="text-center">
          <p className="text-muted">Loading journal entries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1 className="mb-40">Journal</h1>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* New Entry Form */}
      <div className="journal-form-card">
        <h2>Write New Entry</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">How are you feeling today?</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              placeholder="Write your thoughts here..."
              rows="8"
              maxLength="2000"
              className="form-textarea"
            />
            <div className="journal-char-counter">
              {formData.content.length}/2000 characters
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-purple btn-full-width btn-large"
          >
            {submitting ? 'Saving...' : 'Save Entry'}
          </button>
        </form>
      </div>

      {/* Past Entries */}
      <div className="journal-entries-card">
        <h2>Past Entries ({entries.length})</h2>
        
        {entries.length === 0 ? (
          <div className="journal-empty-state">
            <p>No journal entries yet. Start writing above!</p>
          </div>
        ) : (
          <div className="journal-entries-grid">
            {entries.map((entry) => {
              const isExpanded = expandedEntry === entry.id;
              const preview = entry.content.split('\n')[0]; // Get first line
              const previewText = preview.length > 100 ? preview.substring(0, 100) + '...' : preview;
              
              return (
                <div 
                  key={entry.id} 
                  className="journal-entry-item"
                  onClick={() => toggleExpand(entry.id)}
                >
                  <div className="journal-entry-header">
                    <span className="journal-entry-date">
                      {new Date(entry.date).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                    <span className="journal-entry-length">
                      {entry.content.length} characters
                    </span>
                  </div>
                  
                  {!isExpanded ? (
                    // Collapsed view - show preview
                    <>
                      <div className="journal-entry-preview">
                        {previewText}
                      </div>
                      <div className="journal-entry-expand-hint">
                        Click to read more
                      </div>
                    </>
                  ) : (
                    // Expanded view - show full content
                    <>
                      <div className="journal-entry-content">
                        {entry.content}
                      </div>
                      <div className="journal-entry-expand-hint">
                        Click to collapse
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Journal;