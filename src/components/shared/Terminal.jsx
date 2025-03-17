import React, { useState, useEffect } from 'react';
import TerminalCodeBlock from './TerminalCodeBlock';

// Helper function to format cURL commands with line breaks
const formatCurlCommand = (curlCommand) => {
  if (!curlCommand || !curlCommand.startsWith('curl')) return curlCommand;
  
  // Replace spaces with newlines and backslashes at logical breakpoints
  return curlCommand
    // After curl command
    .replace(/^(curl\s+)/, '$1\\\n  ')
    // Before each flag (-X, -H, --data, etc.)
    .replace(/\s+(-[a-zA-Z]|\-\-[a-zA-Z\-]+)/g, ' \\\n  $1')
    // Before the URL (http/https)
    .replace(/\s+(https?:\/\/[^\s]+)$/g, ' \\\n  $1');
};

/**
 * Terminal Component
 *
 * A VSCode-inspired terminal component with tabs for different code examples
 * and animation effects that mimic an integrated terminal.
 *
 * @param {Object} props
 * @param {Object} props.examples - Object containing different code examples (request, response, curl)
 * @param {Object} props.languages - Object mapping example types to their languages
 * @param {boolean} props.animate - Whether to animate the terminal typing (default: false)
 */
const Terminal = ({
  examples = {},
  languages = {
    request: 'json',
    response: 'json',
    curl: 'bash'
  },
  animate = false
}) => {
  const [activeTab, setActiveTab] = useState('request');
  const [displayedCode, setDisplayedCode] = useState('');
  const [typing, setTyping] = useState(false);

  const exampleTypes = Object.keys(examples).filter(type => examples[type]);

  // Handle typing animation effect
  useEffect(() => {
    if (!animate || !examples[activeTab]) {
      setDisplayedCode(examples[activeTab] || '');
      return;
    }

    const code = examples[activeTab] || '';
    setDisplayedCode('');
    setTyping(true);

    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex < code.length) {
        setDisplayedCode(prev => prev + code[currentIndex]);
        currentIndex++;
      } else {
        clearInterval(typingInterval);
        setTyping(false);
      }
    }, 10); // Fast typing speed

    return () => clearInterval(typingInterval);
  }, [activeTab, animate, examples]);

  // Get the currently displayed code
  let currentCode = animate ? displayedCode : examples[activeTab] || '';
  
  // Format cURL commands for better readability while maintaining copy-pastability
  if (activeTab === 'curl' && currentCode.startsWith('curl')) {
    currentCode = formatCurlCommand(currentCode);
  }
  
  // Determine if the current tab should show a command prompt
  const showPrompt = activeTab === 'curl';
  
  // Get language for syntax highlighting
  const language = languages[activeTab] || 'javascript';

  // Get title based on active tab
  const getTitleForTab = (tab) => {
    const titles = {
      request: 'JSON-RPC Request',
      response: 'JSON-RPC Response',
      curl: 'cURL Command'
    };
    return titles[tab] || tab.charAt(0).toUpperCase() + tab.slice(1);
  };

  return (
    <div className="terminal-wrapper" style={{ marginBottom: '20px' }}>
      <div 
        className="terminal-tabs" 
        style={{
          display: 'flex',
          backgroundColor: '#252526',
          borderTopLeftRadius: '6px',
          borderTopRightRadius: '6px',
          overflow: 'hidden'
        }}
      >
        {exampleTypes.map(type => (
          <button
            key={type}
            className={`terminal-tab ${activeTab === type ? 'active' : ''}`}
            onClick={() => setActiveTab(type)}
            style={{
              padding: '8px 16px',
              border: 'none',
              backgroundColor: activeTab === type ? '#1E1E1E' : '#252526',
              color: activeTab === type ? '#FFFFFF' : '#8D8D8D',
              cursor: 'pointer',
              fontSize: '12px',
              fontFamily: "'JetBrains Mono', 'Fira Code', 'Roboto Mono', monospace",
              borderBottom: activeTab === type ? '2px solid #007ACC' : 'none',
              transition: 'background-color 0.2s, color 0.2s'
            }}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      <TerminalCodeBlock
        code={currentCode}
        language={language}
        title={getTitleForTab(activeTab)}
        showPrompt={showPrompt}
      />

      {animate && typing && (
        <div 
          className="terminal-cursor"
          style={{
            position: 'absolute',
            bottom: '12px',
            right: '12px',
            width: '8px',
            height: '16px',
            backgroundColor: '#AEAFAD',
            animation: 'blink 1s step-end infinite'
          }}
        />
      )}
      
      <style jsx>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default Terminal;