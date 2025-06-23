import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import '../styles/UrlStats.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const UrlStats = () => {
  const { shortCode } = useParams();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isList, setIsList] = useState(!shortCode);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const endpoint = shortCode 
          ? `${API_URL}/shorturls/${shortCode}/stats`
          : `${API_URL}/shorturls/stats`;
        
        const response = await axios.get(endpoint);
        setStats(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError('Failed to load statistics. Please try again later.');
        toast.error('Failed to load statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [shortCode]);

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading statistics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button 
          className="btn" 
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  if (isList && Array.isArray(stats)) {
    return (
      <div className="stats-container">
        <h2>URL Statistics</h2>
        <p className="stats-subtitle">View detailed statistics for your shortened URLs</p>
        
        <div className="stats-list">
          {stats.length === 0 ? (
            <div className="empty-state">
              <p>No URLs have been shortened yet.</p>
              <Link to="/" className="btn">
                Create your first short URL
              </Link>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="stats-table">
                <thead>
                  <tr>
                    <th>Short URL</th>
                    <th>Original URL</th>
                    <th>Clicks</th>
                    <th>Created</th>
                    <th>Expires</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.map((item) => (
                    <tr 
                      key={item.shortCode}
                      className="clickable-row"
                      onClick={() => navigate(`/stats/${item.shortCode}`)}
                    >
                      <td>
                        <a 
                          href={`${window.location.origin}/${item.shortCode}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {item.shortCode}
                        </a>
                      </td>
                      <td className="original-url">
                        <span>{item.originalUrl}</span>
                      </td>
                      <td>{item.clicks || 0}</td>
                      <td>{formatDate(item.createdAt)}</td>
                      <td>{item.expiresAt ? formatDate(item.expiresAt) : 'Never'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Single URL stats view
  if (stats && !Array.isArray(stats)) {
    return (
      <div className="stats-container detailed">
        <button 
          className="back-button"
          onClick={() => navigate('/stats')}
        >
          &larr; Back to All URLs
        </button>
        
        <h2>URL Statistics</h2>
        <p className="stats-subtitle">
          <a 
            href={`${window.location.origin}/${stats.shortCode}`}
            target="_blank"
            rel="noopener noreferrer"
            className="short-url"
          >
            {window.location.hostname}/{stats.shortCode}
          </a>
        </p>
        
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Clicks</h3>
            <p className="stat-value">{stats.clicks || 0}</p>
          </div>
          
          <div className="stat-card">
            <h3>Created</h3>
            <p className="stat-value">{formatDate(stats.createdAt)}</p>
          </div>
          
          <div className="stat-card">
            <h3>Expires</h3>
            <p className="stat-value">
              {stats.expiresAt ? formatDate(stats.expiresAt) : 'Never'}
            </p>
          </div>
          
          <div className="stat-card original-url-card">
            <h3>Original URL</h3>
            <a 
              href={stats.originalUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="original-url"
            >
              {stats.originalUrl}
            </a>
          </div>
        </div>
        
        {stats.clicks > 0 && (
          <div className="referrer-section">
            <h3>Top Referrers</h3>
            <div className="referrer-list">
              {stats.referrers && Object.entries(stats.referrers)
                .sort((a, b) => b[1] - a[1])
                .map(([referrer, count]) => (
                  <div key={referrer} className="referrer-item">
                    <span className="referrer-name">
                      {referrer || 'Direct / Unknown'}
                    </span>
                    <span className="referrer-count">{count} clicks</span>
                  </div>
                ))
              }
            </div>
          </div>
        )}
        
        {stats.clicks > 0 && stats.lastClickedAt && (
          <div className="last-clicked">
            <p>Last clicked: {formatDate(stats.lastClickedAt)}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="error-container">
      <p>No data available. The requested URL might have expired or been deleted.</p>
      <Link to="/" className="btn">
        Create a new short URL
      </Link>
    </div>
  );
};

export default UrlStats;
