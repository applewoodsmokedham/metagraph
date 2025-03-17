1. Design Template for API Methods
Design Guidelines for API Method Pages
Theme: Maintain the industrial, minimalist aesthetic with a clean, grid-based layout.

Font: Use Roboto Mono for all text to ensure a technical, consistent feel.

Color Scheme:
Background: Light gray (#F5F5F5) for the page, white (#FFFFFF) for content areas.

Text: Black (#000000) for all text except links.

Links: Classic old internet blue (#0000FF) for hyperlinks (e.g., "Home", method names), with hover effect to darker blue (#0000CD) with a subtle underline.

Status/Buttons: Orange (#FF4500) for action buttons (e.g., "Execute Trace"), green (#A7D) for success indicators if applicable.

Layout:
No Sidebar: Use a full-width, single-column layout with a fixed header.

Fixed Header: Include a fixed header with a single blue (#0000FF) "Home" link (left-aligned, 24px, bold) and optional network/block info (e.g., "Current Network: REGTEST | Block Height: 350") right-aligned in 14px black text.

Main Content: Vertically stacked sections with 16px vertical rhythm and 20px horizontal padding.

Sections:
Header Section:
Title: Method name (e.g., "trace") in bold 24px black text, centered.

Sub-info: Method Type, JSON-RPC Method, View Function, Required Parameters in 14px black text, aligned left with 5px spacing between items.

Examples Section:
Horizontal tabs ("Request", "Response", "cURL") in 14px black text, with active tab underlined in gray (#B0B0B0).

Content area: White background (#FFFFFF) with 8px padding, using Roboto Mono 12px for code examples.

Try It Section:
Input fields: One per required parameter (e.g., "txid", "vout") with 5px spacing, labeled in 14px black text, and placeholder text in gray (#999999).

Button: "Execute [Method Name]" (e.g., "Execute Trace") as a rectangular orange (#FF4500) button with 1px gray border (#E0E0E0), 10px padding, centered below inputs.

Result Section :
Appears below "Try It", displaying raw API response in a white box with Roboto Mono 12px black text and 8px padding. It has a placeholder of the request.

Notes Section:
Inconspicuous gray background (#F5F5F5), 14px black text, positioned at the bottom with 10px padding, containing method-specific notes.

Responsiveness:
Mobile (below 768px): Stack all sections vertically, reduce font sizes to 12px for body text and 18px for headings, ensure 44px tap targets for links/buttons.

Tablet (768px and above): Maintain single-column layout with adjusted 10px padding.

Accessibility: Ensure 4.5:1 contrast ratio, keyboard navigation, and ARIA labels.

Sample CSS/HTML Snippet for Template
jsx
<header style={{ position: 'fixed', top: 0, width: '100%', background: '#F5F5F5', padding: '10px', display: 'flex', justifyContent: 'space-between' }}>
  <a href="/" style={{ color: '#0000FF', fontFamily: 'Roboto Mono', fontSize: '24px', fontWeight: 'bold' }}>Home</a>
  <span style={{ color: '#000000', fontFamily: 'Roboto Mono', fontSize: '14px' }}>Current Network: REGTEST | Block Height: 350</span>
</header>

<div style={{ marginTop: '60px', padding: '20px', fontFamily: 'Roboto Mono' }}>
  <h1 style={{ color: '#000000', fontSize: '24px', fontWeight: 'bold', textAlign: 'center' }}>trace</h1>
  <div style={{ color: '#000000', fontSize: '14px', margin: '5px 0' }}>
    <p>Method Type: View Function</p>
    <p>JSON-RPC Method: metashrew_view</p>
    <p>View Function: trace</p>
    <p>Required Parameters: txid, vout</p>
  </div>

  <div style={{ margin: '16px 0', borderBottom: '1px solid #B0B0B0' }}>
    <button style={{ color: '#000000', fontSize: '14px', background: 'none', border: 'none', marginRight: '10px', cursor: 'pointer' }}>Request</button>
    <button style={{ color: '#000000', fontSize: '14px', background: 'none', border: 'none', marginRight: '10px', cursor: 'pointer' }}>Response</button>
    <button style={{ color: '#000000', fontSize: '14px', background: 'none', border: 'none', cursor: 'pointer' }}>cURL</button>
  </div>
  <div style={{ background: '#FFFFFF', padding: '8px', fontSize: '12px', color: '#000000' }}>
    {/* Example content */}
  </div>

  <div style={{ margin: '16px 0' }}>
    <h2 style={{ color: '#000000', fontSize: '18px' }}>Try It</h2>
    <label style={{ color: '#000000', fontSize: '14px', margin: '5px 0' }}>txid:</label>
    <input style={{ width: '100%', padding: '5px', fontSize: '14px', marginBottom: '5px' }} placeholder="Enter txid" />
    <label style={{ color: '#000000', fontSize: '14px', margin: '5px 0' }}>vout:</label>
    <input style={{ width: '100%', padding: '5px', fontSize: '14px', marginBottom: '5px' }} placeholder="Enter vout" />
    <button style={{ background: '#FF4500', color: '#FFFFFF', border: '1px solid #E0E0E0', padding: '10px', fontSize: '14px' }}>Execute Trace</button>
  </div>
  <div id="result" style={{ display: 'none', background: '#FFFFFF', padding: '8px', fontSize: '12px', color: '#000000', marginTop: '16px' }}>
    {/* Result will be inserted here */}
  </div>

  <div style={{ background: '#F5F5F5', padding: '10px', marginTop: '16px', color: '#000000', fontSize: '14px' }}>
    <h3 style={{ fontSize: '18px' }}>Notes</h3>
    <p>Ensure txid and vout are valid for the selected network...</p>
  </div>
</div>
