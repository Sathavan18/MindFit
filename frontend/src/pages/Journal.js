import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  
  const navigate = useNavigate();

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
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Journal</h1>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Back to Dashboard
        </button>
      </div>

      {error && (
        <div style={{ padding: '10px', marginBottom: '15px', backgroundColor: '#ffe6e6', color: 'red', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ padding: '10px', marginBottom: '15px', backgroundColor: '#d4edda', color: '#155724', borderRadius: '4px' }}>
          {success}
        </div>
      )}

      {/* New Entry Form */}
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '30px' }}>
        <h2>Write New Entry</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              How are you feeling today?
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              placeholder="Write your thoughts here..."
              rows="6"
              style={{ 
                width: '100%', 
                padding: '10px', 
                borderRadius: '4px', 
                border: '1px solid #ddd',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
            <small style={{ color: '#666' }}>
              {formData.content.length}/2000 characters
            </small>
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#6f42c1',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: submitting ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
            }}
          >
            {submitting ? 'Saving...' : 'Save Entry'}
          </button>
        </form>
      </div>

      {/* Past Entries */}
      <div>
        <h2>Past Entries ({entries.length})</h2>
        
        {entries.length === 0 ? (
          <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '8px', border: '1px solid #ddd', textAlign: 'center' }}>
            <p style={{ color: '#666', margin: 0 }}>
              No journal entries yet. Start writing above!
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {entries.map((entry) => (
              <div 
                key={entry.id} 
                style={{ 
                  backgroundColor: 'white', 
                  padding: '20px', 
                  borderRadius: '8px', 
                  border: '1px solid #ddd',
                  cursor: 'pointer',
                  transition: 'box-shadow 0.2s'
                }}
                onClick={() => toggleExpand(entry.id)}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontWeight: 'bold', color: '#6f42c1' }}>
                    {new Date(entry.date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                  <span style={{ fontSize: '12px', color: '#666' }}>
                    {entry.content.length} characters
                  </span>
                </div>
                
                <div style={{ 
                  color: '#333',
                  lineHeight: '1.6',
                  whiteSpace: expandedEntry === entry.id ? 'pre-wrap' : 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {expandedEntry === entry.id ? entry.content : entry.content.substring(0, 150) + (entry.content.length > 150 ? '...' : '')}
                </div>
                
                {entry.content.length > 150 && (
                  <div style={{ marginTop: '10px', color: '#6f42c1', fontSize: '14px', fontWeight: 'bold' }}>
                    {expandedEntry === entry.id ? 'Click to collapse' : 'Click to read more'}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Journal;