# Feature Request: Enhanced Integrated Terminal Styling for Code Examples

## Background & Rationale

Currently, the METHANE application displays code examples with a simple black background and white text. While this provides basic readability, it lacks the rich syntax highlighting and visual cues that developers expect from modern integrated terminals. Enhancing the terminal styling will improve the developer experience by making code examples more readable, intuitive, and visually appealing.

## Objective

Implement a more sophisticated terminal-like appearance for code examples in the METHANE application, complete with syntax highlighting, command prompts, and visual distinctions between input and output that mimic the look and feel of VSCode's integrated terminal.

## Detailed Requirements

### 1. Terminal Shell Appearance
- **Terminal Header**: Add a minimal header with tabs and a title bar, similar to VSCode's terminal
- **Shell Prompt**: Include a customizable shell prompt (e.g., `$ ` for bash) before command examples
- **Font**: Use a high-quality monospaced font like 'JetBrains Mono' or 'Fira Code' that supports ligatures
- **Cursor**: Implement a blinking cursor animation for interactive examples

### 2. Syntax Highlighting
- **JSON Highlighting**: Apply proper syntax highlighting for JSON data structures with distinct colors for:
  - Keys (light blue: #9CDCFE)
  - Strings (orange: #CE9178)
  - Numbers (light green: #B5CEA8)
  - Booleans (blue: #569CD6)
  - Null values (blue: #569CD6)
  - Punctuation (white: #D4D4D4)
- **Command Highlighting**: For cURL and other commands:
  - Command names (yellow: #DCDCAA)
  - Flags/options (light blue: #9CDCFE)
  - Arguments (white: #D4D4D4)
  - Strings (orange: #CE9178)

### 3. Terminal Features
- **Line Numbers**: Optional line numbers along the left margin
- **Copy Button**: Floating copy button that appears on hover in the top-right corner
- **Command/Response Separation**: Visual distinction between commands (input) and their responses (output)
- **Terminal Scrolling**: Retain the scrollable interface with proper overflow handling
- **Selection Highlighting**: Custom selection color (blue: #264F78) when text is highlighted

### 4. Animation & Interactivity
- **Input Animation**: Subtle typing animation for interactive examples
- **Output Reveal**: Progressive reveal of command output to simulate real terminal behavior
- **Loading States**: Terminal-style spinners or progress indicators during API calls

## Technical Specifications

### 1. Implementation Technologies
- Use [Prism.js](https://prismjs.com/) or [highlight.js](https://highlightjs.org/) for syntax highlighting
- Create a custom React component `<TerminalCodeBlock>` that wraps syntax highlighted content
- Implement a custom VSCode-inspired theme for the syntax highlighter

### 2. CSS Specifications
- Base colors:
  - Terminal background: #1E1E1E (VSCode dark theme background)
  - Default text: #D4D4D4 (VSCode default text color)
  - Selection background: #264F78
  - Cursor color: #AEAFAD
- Typography:
  - Font family: 'JetBrains Mono', 'Fira Code', 'Roboto Mono', monospace
  - Font size: 13px for desktop, 11px for mobile
  - Line height: 1.5
- Terminal container:
  - Border radius: 6px
  - Border: 1px solid #454545
  - Box shadow: 0 2px 8px rgba(0, 0, 0, 0.15)

### 3. Component Structure
```jsx
<Terminal title="Example Request">
  <TerminalPrompt type="bash" />
  <TerminalCommand>curl -X POST --data '{"method":"metashrew_view","params":["trace","txid",4],"id":1,"jsonrpc":"2.0"}' https://mainnet.sandshrew.io</TerminalCommand>
  <TerminalOutput>
    <TerminalJSON>{/* JSON response here */}</TerminalJSON>
  </TerminalOutput>
</Terminal>
```

## Acceptance Criteria

- [ ] Terminal styling correctly mimics VSCode's integrated terminal appearance
- [ ] Syntax highlighting properly distinguishes different code elements
- [ ] Terminal is responsive across different screen sizes
- [ ] Copy functionality works for all code examples
- [ ] Animations and interactivity enhance the user experience without being distracting
- [ ] All existing functionality of code examples is preserved
- [ ] Performance is not significantly impacted by the styling enhancements

## Implementation Strategy

1. **Phase 1: Basic Terminal Styling**
   - Implement the terminal container and basic styling
   - Add the terminal header and tab styling
   - Create the shell prompt component

2. **Phase 2: Syntax Highlighting**
   - Integrate the chosen syntax highlighting library
   - Create a custom theme matching VSCode's color scheme
   - Implement language detection for different code types

3. **Phase 3: Interactive Features**
   - Add the copy button functionality
   - Implement selection styling
   - Create loading states and animations

4. **Phase 4: Refinement**
   - Optimize performance
   - Ensure responsive behavior
   - Add accessibility features
   - Test across different browsers

## Additional Considerations

- Consider using the [xterm.js](https://xtermjs.org/) library for a truly authentic terminal experience if more complex terminal behavior is desired
- Examine VSCode's terminal component source code for additional styling inspiration
- The design should maintain METHANE's overall aesthetic while providing a familiar developer experience

By implementing these enhancements, METHANE will provide a more authentic and user-friendly experience for developers working with API examples, making the platform more intuitive and professional.