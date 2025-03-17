import React, { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

/**
 * TerminalCodeBlock Component
 *
 * A VSCode-like terminal code block with syntax highlighting, copy functionality,
 * and interactive elements that mimic an integrated terminal.
 *
 * @param {Object} props
 * @param {string} props.code - The code to display
 * @param {string} props.language - The language for syntax highlighting (default: 'javascript')
 * @param {string} props.title - Optional title for the terminal window
 * @param {boolean} props.showLineNumbers - Whether to show line numbers (default: false)
 * @param {boolean} props.showPrompt - Whether to show a command prompt (default: false)
 */
const TerminalCodeBlock = ({
  code,
  language = 'javascript',
  title = 'Terminal',
  showLineNumbers = false,
  showPrompt = false
}) => {
  const [copied, setCopied] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  // Reset the copied state after 2 seconds
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => {
        setCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  // Handle copy to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
    });
  };

  // Custom terminal theme based on VSCode Dark+ with transparent token backgrounds
  const customStyle = {
    ...vscDarkPlus,
    'pre[class*="language-"]': {
      ...vscDarkPlus['pre[class*="language-"]'],
      backgroundColor: '#1E1E1E',
      margin: 0,
      padding: '12px',
      overflow: 'auto',
      borderRadius: 0,
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Roboto Mono', monospace",
      fontSize: '13px',
      lineHeight: 1.5
    },
    'code[class*="language-"]': {
      ...vscDarkPlus['code[class*="language-"]'],
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Roboto Mono', monospace",
      fontSize: '13px',
      lineHeight: 1.5,
      backgroundColor: 'transparent'
    },
    // Make all token backgrounds transparent
    'token': {
      backgroundColor: 'transparent !important'
    },
    'keyword': {
      ...vscDarkPlus['keyword'],
      backgroundColor: 'transparent'
    },
    'string': {
      ...vscDarkPlus['string'],
      backgroundColor: 'transparent'
    },
    'number': {
      ...vscDarkPlus['number'],
      backgroundColor: 'transparent'
    },
    'boolean': {
      ...vscDarkPlus['boolean'],
      backgroundColor: 'transparent'
    },
    'property': {
      ...vscDarkPlus['property'],
      backgroundColor: 'transparent'
    },
    'operator': {
      ...vscDarkPlus['operator'],
      backgroundColor: 'transparent'
    },
    'punctuation': {
      ...vscDarkPlus['punctuation'],
      backgroundColor: 'transparent'
    },
    'comment': {
      ...vscDarkPlus['comment'],
      backgroundColor: 'transparent'
    }
  };

  // Process code with prompt if needed
  const processedCode = showPrompt ? `$ ${code}` : code;

  return (
    <div 
      className="terminal-container"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      style={{
        backgroundColor: '#1E1E1E',
        border: '1px solid #454545',
        borderRadius: '6px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        overflow: 'hidden',
        position: 'relative',
        width: '100%'
      }}
    >
      {/* Terminal Header */}
      <div 
        className="terminal-header"
        style={{
          backgroundColor: '#323233',
          padding: '6px 12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #454545'
        }}
      >
        <div 
          className="terminal-title"
          style={{
            color: '#D4D4D4',
            fontSize: '12px',
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Roboto Mono', monospace",
          }}
        >
          {title}
        </div>
        <div className="terminal-actions">
          {isHovering && (
            <button
              className="copy-button"
              onClick={handleCopy}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#D4D4D4',
                cursor: 'pointer',
                fontSize: '12px',
                padding: '2px 8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0.7,
                transition: 'opacity 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.opacity = 1}
              onMouseLeave={(e) => e.target.style.opacity = 0.7}
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          )}
        </div>
      </div>

      {/* Terminal Content */}
      <div 
        className="terminal-content"
        style={{
          maxHeight: '400px',
          overflow: 'auto'
        }}
      >
        <SyntaxHighlighter
          language={language}
          style={customStyle}
          showLineNumbers={showLineNumbers}
          wrapLines={true}
        >
          {processedCode}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export default TerminalCodeBlock;