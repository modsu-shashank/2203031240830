import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import '../styles/UrlShortener.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const UrlShortener = () => {
  const [url, setUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [validity, setValidity] = useState(30);
  const [shortenedUrl, setShortenedUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validateUrl = (url) => {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch (e) {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!url) {
      setErrors(prev => ({ ...prev, url: 'Please enter a URL' }));
      return;
    }

    if (!url.match(/^https?:\/\//i)) {
      setErrors(prev => ({ ...prev, url: 'URL must start with http:// or https://' }));
      return;
    }

    if (customCode && !/^[a-zA-Z0-9]{4,20}$/.test(customCode)) {
      setErrors(prev => ({ ...prev, customCode: 'Custom code must be 4-20 alphanumeric characters' }));
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/shorturls`, {
        originalUrl: url,
        customCode: customCode || undefined,
        validity: parseInt(validity, 10) * 60 // Convert minutes to seconds
      });

      const shortUrl = `${window.location.origin}/${response.data.shortCode}`;
      setShortenedUrl(shortUrl);
      setUrl('');
      setCustomCode('');
      setValidity(30);

      toast.success('URL shortened successfully!', {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
      });

      setTimeout(() => {
        navigate(`/stats/${response.data.shortCode}`);
      }, 1000);
    } catch (error) {
      console.error('Error shortening URL:', error);
      const errorMessage = error.response?.data?.message || 'Failed to shorten URL. Please try again.';
      toast.error(errorMessage);

      if (error.response?.data?.field) {
        setErrors(prev => ({
          ...prev,
          [error.response.data.field]: errorMessage
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shortenedUrl);
    setCopied(true);
    toast.info('Copied to clipboard!');
    
    // Reset copied state after 2 seconds
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="url-shortener-container">
      <div className="url-shortener">
        <h2>URL Shortener</h2>
        <p className="subtitle">Create short, memorable links in seconds</p>

        <form onSubmit={handleSubmit} className="url-form">
          <div className="form-group">
            <input
              type="url"
              id="url"
              className={`url-input ${errors.url ? 'error' : ''}`}
              placeholder="Enter your long URL (e.g., https://example.com)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={loading}
              required
            />
            {errors.url && <div className="error-message">{errors.url}</div>}
          </div>

          <div className="form-row">
            <div className="form-group" style={{ flex: 2 }}>
              <label htmlFor="customCode">Custom Short Code (optional)</label>
              <input
                type="text"
                id="customCode"
                className={`form-control ${errors.customCode ? 'error' : ''}`}
                placeholder="my-custom-link"
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value)}
                disabled={loading}
              />
              {errors.customCode && <div className="error-message">{errors.customCode}</div>}
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="validity">Validity (minutes)</label>
              <select
                id="validity"
                className="form-control"
                value={validity}
                onChange={(e) => setValidity(e.target.value)}
                disabled={loading}
              >
                <option value="1">1 minute</option>
                <option value="5">5 minutes</option>
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="1440">1 day</option>
                <option value="525600">1 year</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className={`btn ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                <span>Processing...</span>
              </>
            ) : (
              'Shorten URL'
            )}
          </button>
        </form>

        {shortenedUrl && (
          <div className="result">
            <p>Your shortened URL:</p>
            <a href={shortenedUrl} target="_blank" rel="noopener noreferrer">
              {shortenedUrl}
            </a>
            <button
              className="copy-btn"
              onClick={handleCopy}
              disabled={!shortenedUrl}
            >
              {copied ? 'Copied!' : 'Copy URL'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UrlShortener;
