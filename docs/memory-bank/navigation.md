# Codebase Navigation Guide

This guide provides a structured approach to navigating the Alkanes Explorer codebase, helping AI agents and developers quickly locate relevant files and understand their purpose.

## Directory Structure
```
runestone-visualizer/
├── src/
│   ├── public/        # Static assets and frontend files
│   │   ├── css/       # Stylesheets
│   │   ├── js/        # Client-side JavaScript
│   │   ├── index.html # Main application page
│   │   └── ...        # Other HTML pages for different views
│   ├── services/      # API services and utilities
│   │   ├── metashrew-api.ts # Core API client
│   │   └── alkanes-trace.ts # Trace processing
│   ├── lib/           # Utility libraries
│   └── server.ts      # Main Express server
├── dist/              # Compiled TypeScript
├── docs/              # Documentation
│   └── memory-bank/   # AI-friendly codebase documentation
├── .env               # Environment variables
└── package.json       # Dependencies and scripts
```

## Core Files Reference

### Backend Core
- **[src/server.ts](file:///home/jinmaa/github/drillMethane/runestone-visualizer/src/server.ts)**: Main Express server application
  - All API endpoints are defined here
  - Static file serving configuration
  - Error handling middleware

### API Services
- **[src/services/metashrew-api.ts](file:///home/jinmaa/github/drillMethane/runestone-visualizer/src/services/metashrew-api.ts)**: Metashrew API client
  - Core function: `callMetashrewApi(method, params)`
  - Establishes connection to Metashrew API
  - Handles error scenarios

- **[src/services/alkanes-trace.ts](file:///home/jinmaa/github/drillMethane/runestone-visualizer/src/services/alkanes-trace.ts)**: Trace functionality
  - Processes trace data from API
  - Transforms data for UI consumption

### Frontend Pages
- **[src/public/index.html](file:///home/jinmaa/github/drillMethane/runestone-visualizer/src/public/index.html)**: Main landing page
  - API status display
  - Navigation to other tools
  - Error message container

- **[src/public/block-transactions.html](file:///home/jinmaa/github/drillMethane/runestone-visualizer/src/public/block-transactions.html)**: Block explorer page
  - Browse blocks and transactions
  - View block details

- **[src/public/transaction-search.html](file:///home/jinmaa/github/drillMethane/runestone-visualizer/src/public/transaction-search.html)**: Transaction search
  - Search for transactions by ID
  - Display transaction details

- **[src/public/trace.html](file:///home/jinmaa/github/drillMethane/runestone-visualizer/src/public/trace.html)**: Transaction tracer
  - View execution traces
  - Debug smart contracts

### Styling
- **[src/public/css/minimal.css](file:///home/jinmaa/github/drillMethane/runestone-visualizer/src/public/css/minimal.css)**: Core styling
  - Base layout and typography
  - Component styling
  - Status indicators

- **[src/public/css/transaction-search.css](file:///home/jinmaa/github/drillMethane/runestone-visualizer/src/public/css/transaction-search.css)**: Transaction page styling
  - Specialized styles for transaction display

### Configuration
- **[.env](file:///home/jinmaa/github/drillMethane/runestone-visualizer/.env)**: Environment variables
  - API endpoint URLs
  - Bitcoin RPC connection details

## Common Tasks Reference

### Adding a New API Method Page
1. Create new HTML file in `src/public/api-methods/`
2. Add client-side JavaScript for API interaction
3. Update navigation links in `index.html`
4. Add any required backend endpoints in `server.ts`

### Updating API Status Display
1. Modify the API status section in `src/public/index.html`
2. Update related JavaScript functions for API status fetching
3. Adjust CSS styling in `src/public/css/minimal.css`
4. Test with server running to verify changes

### Implementing a New API Method
1. Update `src/services/metashrew-api.ts` with any specific handling
2. Add API proxy endpoint in `server.ts` if needed
3. Create frontend interface in appropriate HTML file
4. Add error handling for the new method
