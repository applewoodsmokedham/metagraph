# API Method Page CSS Implementation

This document outlines the detailed CSS changes needed to implement the new design requirements for the METHANE API Method Page.

## 1. Font and Base Styles

First, we need to import the Roboto Mono font and update the base styles:

```css
/* Add to the top of App.css */
@import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@300;400;500;700&display=swap');

/* Update the :root CSS variables */
:root {
  /* Update existing variables */
  --color-text: #333333;
  --color-text-light: #666666;
  --color-bg-primary: #F5F5F5;  /* Update to match requirements */
  --color-bg-secondary: #FFFFFF;
  --color-border: #E0E0E0;      /* Update to lighter gray */
  --color-accent: #FF4500;      /* Update to orange from requirements */
  
  /* Update font variable to Roboto Mono */
  --font-mono: 'Roboto Mono', monospace;
  
  /* Add new variables for API method pages */
  --api-method-spacing: 20px;
  --api-method-max-width: 900px;
  --api-method-label-width: 175px;
  --api-method-heading-size: 18px;
  --api-method-text-size: 14px;
  --api-method-small-text: 12px;
  --api-method-code-bg: #333333;
  --api-method-code-text: #FFFFFF;
  --api-method-result-height: 200px;
  --api-method-result-bg: #f9f9f9;
  --api-method-note-bg: #FFF8E1;
  --api-method-note-border: #FFE082;
}

/* Update the body styling to use Roboto Mono by default for API pages */
body {
  font-family: var(--font-sans);
  font-size: 16px;
  line-height: 1.5;
  color: var(--color-text);
  background-color: var(--color-bg-primary);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Add a specific class for the API method pages to use Roboto Mono */
.api-method-page {
  font-family: var(--font-mono);
}
```

## 2. API Method Page Container

Update the container styling for the API Method Page:

```css
/* Update .api-form styles */
.api-form {
  max-width: var(--api-method-max-width);
  margin: 0 auto;
  padding: var(--api-method-spacing);
  background-color: var(--color-bg-primary);
}

/* Style for content sections */
.api-form > div {
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  padding: var(--api-method-spacing);
  margin-bottom: var(--api-method-spacing);
}
```

## 3. Method Header Section

Restructure the method header with the new design:

```css
/* Update method header styles */
.method-header {
  text-align: center;
  margin-bottom: var(--api-method-spacing);
}

.method-header h2 {
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-transform: lowercase;
}

.method-type {
  font-size: 14px;
  color: #666;
  margin-left: 10px;
  background-color: #f0f0f0;
  padding: 3px 8px;
  border-radius: 12px;
  display: inline-block;
}

.method-description {
  font-size: 14px;
  color: #333;
  margin-bottom: 20px;
  text-align: center;
}

/* Update method details to use a grid layout */
.method-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: var(--api-method-spacing);
}

/* For required parameters, span full width */
.method-details .detail-item:last-child {
  grid-column: 1 / -1;
}

.detail-item {
  display: flex;
  margin-bottom: 10px;
}

.detail-item h3 {
  font-size: var(--api-method-small-text);
  text-align: right;
  margin-top: 0;
  margin-right: 10px;
  min-width: var(--api-method-label-width);
  padding-right: 10px;
}

.detail-value {
  font-size: var(--api-method-small-text);
}
```

## 4. Examples Section

Enhance the examples section with the new styling:

```css
/* Update examples section styles */
.examples-section {
  margin-bottom: var(--api-method-spacing);
}

.examples-section h3 {
  font-size: var(--api-method-heading-size);
  text-align: center;
  margin-bottom: 15px;
}

.tabs {
  display: flex;
  justify-content: center;
  border-bottom: 1px solid #ddd;
  margin-bottom: 15px;
}

.tab {
  padding: 8px 16px;
  cursor: pointer;
  font-size: var(--api-method-text-size);
  margin: 0 5px;
  position: relative;
}

.tab.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #666;
}

.tab-content {
  background-color: var(--api-method-code-bg);
  padding: 15px;
  border-radius: 4px;
}

.code-example {
  font-family: var(--font-mono);
  font-size: var(--api-method-small-text);
  white-space: pre-wrap;
  margin: 0;
  color: var(--api-method-code-text);
}
```

## 5. Try It Section

Improve the Try It section for better form appearance:

```css
/* Update form container styles */
.form-container {
  margin-bottom: var(--api-method-spacing);
}

.form-container h3 {
  font-size: var(--api-method-heading-size);
  text-align: center;
  margin-bottom: 15px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  font-size: var(--api-method-text-size);
  margin-bottom: 5px;
  text-align: center;
}

.form-group input {
  width: 100%;
  padding: 8px;
  border: 1px solid var(--color-border);
  border-radius: 0; /* Square corners per requirements */
  font-size: var(--api-method-text-size);
  font-family: var(--font-mono);
}

.param-description {
  font-size: var(--api-method-small-text);
  color: #666;
  margin-top: 5px;
  text-align: center;
}

.form-actions {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.execute-button {
  background-color: var(--color-accent);
  color: white;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  font-size: var(--api-method-text-size);
  font-family: var(--font-mono);
  border-radius: 0; /* Square corners per requirements */
}

.execute-button:disabled {
  background-color: #ccc;
}
```

## 6. Results Section

Create a fixed-height scrollable results container:

```css
/* Update results container styles */
.results-container,
.placeholder-results {
  margin-top: var(--api-method-spacing);
  height: var(--api-method-result-height);
  overflow-y: auto;
  background-color: var(--api-method-result-bg);
  position: relative;
}

.results-container h3,
.placeholder-results h3 {
  position: sticky;
  top: 0;
  background-color: var(--api-method-result-bg);
  margin: 0;
  padding: 10px;
  font-size: var(--api-method-text-size);
  z-index: 1;
  border-bottom: 1px solid var(--color-border);
}

.results-json {
  background-color: white;
  padding: 15px;
  font-family: var(--font-mono);
  font-size: var(--api-method-small-text);
  white-space: pre-wrap;
  overflow-x: auto;
}

.placeholder-results {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #666;
  text-align: center;
}

/* Loading spinner styles */
.loading-spinner {
  display: inline-block;
  width: 50px;
  height: 50px;
  border: 3px solid #B0B0B0;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: calc(var(--api-method-result-height) - 40px);
}
```

## 7. Notes Section

Style the notes section with the required yellow background:

```css
/* Update notes section styles */
.notes-section {
  margin-top: var(--api-method-spacing);
  background-color: var(--api-method-note-bg);
  padding: 15px;
  border: 1px solid var(--api-method-note-border);
}

.notes-section h3 {
  font-size: var(--api-method-heading-size);
  text-align: center;
  margin-top: 0;
  margin-bottom: 10px;
}

.notes-content {
  font-size: var(--api-method-text-size);
  color: #333;
  text-align: center;
}
```

## 8. Error Container

Update the error container styling:

```css
/* Update error container styles */
.error-container {
  margin-top: var(--api-method-spacing);
  background-color: #ffebee;
  padding: 15px;
  border: 1px solid #ffcdd2;
  height: var(--api-method-result-height);
  overflow-y: auto;
}

.error-container h3 {
  font-size: var(--api-method-heading-size);
  text-align: center;
  margin-top: 0;
  margin-bottom: 10px;
}

.error-message {
  color: #c62828;
  font-size: var(--api-method-text-size);
  text-align: center;
}
```

## 9. Responsive Styles

Ensure the design is responsive for mobile devices:

```css
/* Add responsive adjustments */
@media (max-width: 768px) {
  /* Reduce font sizes */
  body {
    font-size: 12px;
  }
  
  .method-header h2 {
    font-size: 18px;
  }
  
  .examples-section h3,
  .form-container h3,
  .notes-section h3,
  .error-container h3 {
    font-size: 16px;
  }
  
  /* Stack method details */
  .method-details {
    grid-template-columns: 1fr;
  }
  
  /* Ensure minimum touch target size */
  .tab, 
  .execute-button,
  .form-group input {
    min-height: 44px;
    min-width: 44px;
  }
  
  /* Adjust spacing */
  .api-form {
    padding: 10px;
  }
  
  .api-form > div {
    padding: 15px;
    margin-bottom: 15px;
  }
}
```

## Implementation Strategy

To implement these changes:

1. Update `App.css` with the new styles, preserving existing functionality
2. Test the changes on the existing trace method page
3. Verify that all components render correctly with the new styles
4. Test on different screen sizes to ensure responsive behavior
5. Verify that the API response functionality still works as expected

The changes are designed to be non-breaking and should enhance the existing implementation while adhering to the new design requirements.