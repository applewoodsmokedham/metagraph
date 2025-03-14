# Contributing to Runestone Visualizer

Thank you for your interest in contributing to the Runestone Visualizer project! This document provides guidelines and instructions for contributing to make the process smooth and effective.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
  - [Development Environment](#development-environment)
  - [Running the Project](#running-the-project)
- [Contributing Process](#contributing-process)
  - [Creating Issues](#creating-issues)
  - [Making Changes](#making-changes)
  - [Pull Requests](#pull-requests)
- [Coding Standards](#coding-standards)
- [API Integration Guidelines](#api-integration-guidelines)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

Please be respectful and considerate of others when contributing to this project. We strive to foster an inclusive and welcoming community. Any form of harassment or disrespectful behavior is not tolerated.

## Getting Started

### Development Environment

1. **Prerequisites**:
   - Node.js v16+
   - npm or yarn
   - Git

2. **Clone the Repository**:
   ```bash
   git clone https://github.com/JinMaa/METHANE.git
   cd METHANE
   ```

3. **Install Dependencies**:
   ```bash
   npm install
   ```

### Running the Project

1. **Create Environment File**:
   - Copy `.EXAMPLE.env` to `.env`
   - Update with your configuration

2. **Build the Project**:
   ```bash
   npm run build
   ```

3. **Start the Server**:
   ```bash
   npm start
   ```

4. **Development Mode**:
   ```bash
   npm run dev
   ```

## Contributing Process

### Creating Issues

Before starting work on a new feature or bug fix, please check the existing issues to avoid duplicating efforts. If your contribution doesn't fit within an existing issue, please create a new one.

When creating issues, include:
- Clear description of the problem or enhancement
- Steps to reproduce (for bugs)
- Expected behavior
- Screenshots if applicable
- Environment details

### Making Changes

1. **Create a Branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```
   or
   ```bash
   git checkout -b fix/issue-description
   ```

2. **Make Your Changes**:
   - Follow the coding standards
   - Keep changes focused on the specific issue
   - Add comments for complex logic

3. **Commit Your Changes**:
   ```bash
   git commit -m "Description of the changes"
   ```

### Pull Requests

1. **Push Your Branch**:
   ```bash
   git push origin your-branch-name
   ```

2. **Create a Pull Request**:
   - Fill out the PR template
   - Link to any relevant issues
   - Describe what the changes do and why they're needed

3. **Code Review**:
   - Be open to feedback and make requested changes
   - Participate in discussion about your code

4. **Merging**:
   - A maintainer will merge your PR when it's approved
   - Your PR should pass all CI checks before merging

## Coding Standards

- **JavaScript/TypeScript**:
  - Use ES6+ features
  - Follow camelCase for variables and functions
  - Use PascalCase for classes and components
  - Use descriptive names for functions and variables

- **HTML/CSS**:
  - Use semantic HTML
  - Follow BEM naming convention for CSS classes
  - Make sure UI is responsive and accessible

- **Comments**:
  - Add comments for complex logic
  - Use JSDoc-style comments for functions

## API Integration Guidelines

When working with the Metashrew API:

1. **Request Format**:
   - Follow the exact field order: `method`, `params`, `id`, `jsonrpc`
   - Use simple numerical IDs (0, 1) instead of timestamps

2. **Headers**:
   - Only include `Content-Type: application/json`
   - Do NOT include `X-Sandshrew-Project-ID` header

3. **Error Handling**:
   - Implement proper error catching
   - Add fallbacks for primary API methods
   - Parse string responses with `parseInt()` when needed

## Testing

- Write tests for new features
- Run existing tests before submitting a PR
- Update tests when modifying existing functionality

## Documentation

- Update the README.md with any new features
- Document functions and classes with JSDoc comments
- Update the memory bank documentation when applicable

Thank you for contributing to the Runestone Visualizer project!
