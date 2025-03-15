import React from 'react';

/**
 * Footer Component
 * 
 * Application footer with copyright and version information
 */
const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="main-footer">
      <div className="footer-content">
        <div className="copyright">
          © {currentYear} Alkanes Explorer | METHANE (Method Exploration, Testing, and Analysis eNvironment)
        </div>
        <div className="version">
          Version 0.1.0
        </div>
        <div className="links">
          <a href="https://github.com/drillMethane/METHANE" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          <span className="separator">|</span>
          <a href="#" target="_blank" rel="noopener noreferrer">
            Documentation
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;