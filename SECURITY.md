# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

We take the security of Runestone Visualizer seriously. If you believe you've found a security vulnerability, please follow these steps:

1. **Do Not Disclose Publicly**: Please do not disclose the vulnerability publicly until it has been addressed.

2. **Create a Security Report**: Send a detailed report to [security@example.com](mailto:security@example.com) including:
   - A description of the vulnerability
   - Steps to reproduce the issue
   - Potential impact
   - Any suggestions for remediation

3. **Response Time**: We aim to acknowledge security reports within 48 hours and will provide an estimated timeline for a fix.

4. **Disclosure Process**: After the vulnerability has been addressed, we will publish a security advisory with details and credit your finding.

## Security Best Practices for API Usage

When using the Runestone Visualizer, follow these security guidelines:

1. **Environment Variables**: Always store sensitive API keys and credentials in `.env` files and never commit them to version control.

2. **API Key Handling**: Never hardcode API keys in client-side code. All API requests should be proxied through the server.

3. **Rate Limiting**: Implement appropriate rate limiting for API calls to prevent abuse.

4. **Input Validation**: Always validate user input before using it in API calls or database queries.

5. **CORS Configuration**: Configure CORS appropriately to restrict access to your API endpoints.

## Known Security Considerations

- The project is designed to work with the Metashrew API, which may have its own security requirements.
- API requests to blockchain data are read-only and do not modify blockchain state.
- Connection to the API is made via HTTPS.

## Security-Related Configuration

- We've removed the `X-Sandshrew-Project-ID` header from API calls as it may cause connection issues.
- All API calls use HTTPS for secure communication.
- Server-side validation is implemented for all user inputs.

## Dependency Management

The project uses npm for dependency management. Run `npm audit` regularly to check for vulnerabilities in dependencies and update them accordingly.

```bash
npm audit
npm audit fix
```

For major dependency updates or when `npm audit fix` doesn't resolve issues, manually review and update the affected packages:

```bash
npm update <package-name>
```

Thank you for helping keep Runestone Visualizer and its users safe!
