import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import Navbar from './components/Navbar';
import UrlShortener from './components/UrlShortener';
import UrlStats from './components/UrlStats';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
};

function App() {
  return (
    <div className="app">
      <ScrollToTop />
      <Navbar />
      
      <main className="main-content">
        <div className="container">
          <Routes>
            <Route path="/" element={<UrlShortener />} />
            <Route path="/stats" element={<UrlStats />} />
            <Route path="/stats/:shortCode" element={<UrlStats />} />
            <Route path="*" element={<UrlShortener />} />
          </Routes>
        </div>
      </main>
      
      <footer className="footer">
        <div className="container">
          <p>© {new Date().getFullYear()} URL Shortener - A simple and fast URL shortener service</p>
          <div className="footer-links">
            <a href="/privacy" className="footer-link">Privacy</a>
            <span className="divider">•</span>
            <a href="/terms" className="footer-link">Terms</a>
            <span className="divider">•</span>
            <a 
              href="https://github.com/yourusername/url-shortener" 
              target="_blank" 
              rel="noopener noreferrer"
              className="footer-link"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
      
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        className="toast-container"
        toastClassName="toast"
        progressClassName="toast-progress"
      />
    </div>
  );
}

export default App;
