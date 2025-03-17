Feature Request for /api-methods/trace
Feature Specification: Trace Method Page (/api-methods/trace)
Objective:
Implement a reusable page for the "trace" API method that allows users to visualize and test transaction execution traces, serving as a template for all API methods. 
Requirements:
Design Compliance  
The developer must strictly follow the design guidelines outlined in design-guidelines-api-methods.md, ensuring:
Use of Roboto Mono for all text.

Industrial, minimalist aesthetic with a light gray (#F5F5F5) background and white (#FFFFFF) content areas.

Black (#000000) text, blue (#0000FF) links with hover effect (#0000CD), and orange (#FF4500) action buttons.

No sidebar, with a fixed header containing a single "Home" link.

Responsive design for mobile and tablet devices.

Header Section  
Display the method name "trace" in bold 24px black text, centered.

Show metadata in 14px black text, aligned left with 5px spacing:
Method Type: View Function

JSON-RPC Method: metashrew_view

View Function: trace

Required Parameters: txid (transaction ID), vout (output index)

Examples Section  
Horizontal tabs ("Request", "Response", "cURL") in 14px black text, with the active tab underlined in gray (#B0B0B0).

Content in a white background (#FFFFFF) with 8px padding, using Roboto Mono 12px black text:

Try It Section  
Provide one input box per parameter:
"txid": Text input with placeholder "bc1p2cyx5e2hgh53wxrkcvn85akge9gyvsvw7cxvhmf0h4xswd8gqtf2d5dkkn" (matching the request example).

"vout": Text input with placeholder "4" (matching the request example).

Include a centered "Execute Trace" button (orange #FF4500, 1px gray border #E0E0E0, 10px padding).


Result Section  
Static Vertical Space: The Result section must have a fixed height of 200px (regardless of content), with a vertical scrollbar if the content overflows. Style with a white background (#FFFFFF), 8px padding, and Roboto Mono 12px black text.

Placeholder: Before the "Execute Trace" button is clicked, display a placeholder matching the request example's response (same as the "Response" tab content).

Loading State: Show a gray spinner (#B0B0B0) centered in the Result section during the simulated 1-second loading delay.

Notes Section  
Inconspicuous gray background (#F5F5F5), 14px black text, 10px padding, containing method-specific notes (e.g., "Ensure txid and vout correspond to a valid transaction on the current network. The trace method returns binary trace data for the specified transaction output.").

The API RESPONSE ARE ALREADY INTEGRATED IN THE TRACE PAGE, MAKE SURE TO NOT BREAK ANY CHANGE


Implement responsive design with collapse/expand behaviors for future scalability.

Share the fixed header with the "Home" link across all pages.

Component Structure:  

ApiMethodPage/
  ├── HeaderSection/
  ├── ExamplesSection/
  │   ├── RequestTab/
  │   ├── ResponseTab/
  │   └── CurlTab/
  ├── TryItSection/
  │   ├── InputField/
  │   └── ExecuteButton/
  ├── ResultSection/
  └── NotesSection/

  Implementation Strategy:  
Create reusable styled components for each section, adhering to design-guidelines-api-methods.md.

Build tabbed examples with dynamic content switching,

Develop the "Try It" section with input validation (e.g., ensure vout is a number) and API response rendering in the Result section.

Style the Result section with a fixed height of 200px, a scrollbar for overflow, and a placeholder
Acceptance Criteria:  
The page adheres to the design-guidelines-api-methods.md for styling and layout.

The fixed header contains a "Home" link and network info.

The header displays correct "trace" method metadata.

The Examples section switches between valid Request, Response, and cURL tabs

The Try It section accepts txid and vout inputs with placeholders matching the request example.


