# Affirm Integration Testing Suite

A comprehensive testing interface for Affirm Partner Engineers to test and validate various Affirm integration scenarios.

## Overview

This GitHub Pages site provides a robust, easy-to-use testing interface for:
- **Promotional Messaging**: Test Affirm promotional messaging components and prequalification flows
- **Direct API**: Test Direct API checkout flows, authorization, and transaction management
- **Affirm Lite**: Test Affirm Lite pop-up checkout and virtual card generation
- **Virtual Card Network (VCN)**: Test VCN integration and card management
- **Transaction Lifecycle**: Test complete transaction lifecycle from authorization to settlement
- **API Testing**: Direct API testing interface for Merchant API endpoints

## Features

- 🎯 **Clear Test Scenarios**: Well-organized test cases for each integration type
- 🔧 **Interactive Testing**: Easy-to-use forms and controls for each test scenario
- 📊 **Real-time Results**: Immediate feedback on test outcomes
- 🔐 **Environment Configuration**: Support for both Sandbox and Production environments
- 📚 **Quick Access**: Direct links to Affirm documentation

## Usage

1. Visit the site at `https://tdiipo1.github.io`
2. Navigate to the relevant test section using the top navigation
3. Fill in the test parameters
4. Click the test button to execute
5. Review the results displayed below

## Local Development

The site is built with static HTML, CSS, and JavaScript. To run locally:

1. Clone this repository
2. Open `index.html` in a web browser
3. Or use a local server:
   ```bash
   python -m http.server 8000
   ```
   Then visit `http://localhost:8000`

## Python Site Generator

A Python script (`generate_site.py`) is included for generating configuration files and validating the site structure:

```bash
python generate_site.py
```

This script can be extended to programmatically generate test scenarios or update the site.

## Documentation Links

- [Introduction to Affirm](https://docs.affirm.com/developers/docs/home-introduction)
- [Direct API Overview](https://docs.affirm.com/payments/docs/direct-api-overview)
- [Affirm Lite Integration](https://docs.affirm.com/payments/docs/affirm-lite-integration-guide)
- [Virtual Card Network Overview](https://docs.affirm.com/payments/docs/vcn-overview)
- [Solutions We Offer](https://docs.affirm.com/developers/docs/solutions-we-offer)

## File Structure

```
.
├── index.html          # Main HTML file
├── styles.css          # Styling
├── app.js              # JavaScript functionality
├── generate_site.py    # Python site generator script
└── README.md           # This file
```

## Notes

- The current implementation uses mock API responses for demonstration
- Replace the `simulateAPICall` function in `app.js` with actual API calls for production use
- API keys should be stored securely and not committed to the repository
- This is a testing tool for Partner Engineers and should not be used for production transactions

## License

Internal tool for Affirm Partner Engineering use.
