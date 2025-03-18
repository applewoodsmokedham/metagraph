# Alkanes Balance Explorer Feature Request

## Overview
We need to develop an Alkanes Balance Explorer page that allows users to view all Alkanes tokens associated with a specific address. This page should offer both automatic wallet integration and manual address entry options.

## User Story
As a METHANE user, I want to explore the Alkanes tokens associated with a specific address so that I can view token balances, names, and symbols in a clear, well-organized format.

## Requirements

### 1. Address Input Methods

#### Wallet Integration
- Automatically detect and use the connected LaserEyes wallet address
- Include a prominent button labeled "Use Connected Wallet" that populates the address field with the current wallet's address
- This button should only be active when a wallet is connected
- Display the shortened address (first 4 and last 5 characters) with a copy button using the existing clipboard functionality

#### Manual Address Input
- Provide a clean, full-width input field for manual address entry
- Include placeholder text: "Enter a Bitcoin address containing Alkanes"
- Add an information icon with a tooltip warning: "This should be a Taproot address that contains Alkanes tokens"
- Include validation to ensure the address follows the expected format for Bitcoin addresses

### 2. Results Display

#### Alkanes Token List
- Display results in a clean, tabular format with the following columns:
  - Token Name
  - Symbol
  - Balance (amount of tokens)
- Sort tokens alphabetically by name or by balance (user selectable)
- For each token row, include:
  - Visual indication (icon or color) of token type
  - Balance displayed with appropriate formatting and units
  - Optional link to view more details about the token (future enhancement)

#### Empty/Error States
- If no tokens are found, display a helpful message: "No Alkanes tokens found for this address"
- If an error occurs during the search, display an appropriate error message with potential troubleshooting steps
- Include a "Try Again" button that resets the form for error states

### 3. UX Considerations

#### Loading State
- Display a loading spinner or progress indicator while fetching token data
- Maintain the current address in the input field during loading
- Disable the search button during the loading state

#### Responsive Design
- Ensure the page works well on all device sizes
- On mobile devices, stack table columns or use a card-based alternative view
- Maintain minimum touch target sizes (44px) for all interactive elements

## Design Guidelines

The design should follow the established METHANE design principles:

### Visual Style
- Use the Roboto Mono font family throughout
- Maintain the light gray (#F5F5F5) background with white (#FFFFFF) content sections
- Use 1px light borders (#E0E0E0) to separate content sections
- Apply 20px padding within sections and 20px margins between sections
- Maintain a maximum content width of 900px, centered on the page

### Input Elements
- Input fields should have light borders and 8px padding
- Include descriptive text (12px) below each input field
- Primary action buttons should use the established button styling

### Results Display
- Use consistent table styling with the rest of the application
- Apply alternating row colors for better readability
- Maintain proper spacing between table rows and columns

## Technical Considerations

### API Integration
- Leverage the existing alkanes.js SDK functions to retrieve token data
- Handle pagination if large numbers of tokens are returned
- Implement proper error handling for network issues or API failures

### Performance
- Optimize for quick loading and responsive interaction
- Consider caching previous search results to improve user experience
- Implement debouncing on input fields to prevent excessive API calls

## Implementation Plan

1. Create the basic page structure with input methods
2. Implement the connected wallet integration
3. Add manual address input with validation
4. Create the results display component
5. Implement API integration for retrieving token data
6. Add loading states and error handling
7. Ensure responsive design works on all devices
8. Perform testing and refinement

## Success Criteria

- Users can successfully retrieve and view Alkanes tokens for both connected wallets and manually entered addresses
- The interface is clean, intuitive, and follows existing design patterns
- The page performs well with minimal loading times
- Error states provide helpful guidance for resolving issues