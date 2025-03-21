# METAGRAPH
**Method Exploration, Tool And Graph Renderer for Alkanes Protocol Handling**

<div align="center">
  <img src="public/vite.svg" alt="METAGRAPH Logo" width="100" />
  <p><i>Illuminating Bitcoin's metastructures, one UTXO at a time</i></p>
</div>

## Vision

METAGRAPH is an educational endeavor focused on Bitcoin and its metastructures, dedicated to making the implicit explicit. Bitcoin's blockchain contains complex patterns and structures that exist beyond simple transactions, yet these remain opaque to most developers and users.

Our primary focus is on Alkanes metaprotocol, which contains some of the deepest and most intricate event patterns embedded within UTXOs. While these patterns drive significant blockchain functionality, they're often only visible at the most granular level of analysis.

**METAGRAPH aims to:**
- Reveal the hidden chains of events within Bitcoin transactions
- Provide intuitive visualization of metaprotocol operations
- Create an interactive playground for exploring Alkanes functionality
- Build educational tools that demystify complex Bitcoin operations
- Bridge the gap between protocol theory and practical implementation

By making these structures and patterns explicit, we hope to accelerate innovation and understanding in the Bitcoin development ecosystem.

## What is METAGRAPH?

METAGRAPH is an interactive, developer-friendly playground and documentation hub designed specifically to facilitate exploration, testing, and integration of Alkanes metaprotocol and Sandshrew API methods on the Bitcoin blockchain. It leverages the Oyl SDK for business logic and interaction with Bitcoin.

The application provides:
- Interactive API testing with real-time feedback
- Seamless switching between mainnet and local development environments
- Visual representation of transaction execution traces
- Token exploration and visualization capabilities
- Wallet integration for testing with real transactions
- Comprehensive documentation of Alkanes capabilities

## Getting Started

### Prerequisites

- Node.js v16+ (v20+ recommended)
- npm or yarn package manager
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Bitcoin wallet extension (Unisat, Leather, etc.) for wallet functionality

### Installation

1. Clone the repository:
```bash
git clone https://github.com/JinMaa/METAGRAPH.git
cd METAGRAPH
```

2. Install dependencies:
```bash
npm install
# or
yarn
```

3. Configure environment variables:
```bash
cp .env.template .env
```
Edit the `.env` file to add your Sandshrew API key if needed.

### Running the Application

#### Development Mode

```bash
npm run dev
# or
yarn dev
```

This will start the development server at `http://localhost:5173`.

#### Production Build

```bash
npm run build
# or
yarn build
```

This will generate optimized assets in the `dist` directory.

To preview the production build:
```bash
npm run preview
# or
yarn preview
```

## Key Features

- **Endpoint Toggle**: Switch between Production and Local environments with real-time health status indication
- **API Method Exploration**: Interactive forms for exploring and testing Alkanes API methods
- **Transaction Tracing**: Detailed visualization of transaction execution
- **Token Explorer**: Interactive exploration of Alkanes tokens with visual representation
- **Wallet Integration**: Connect to Bitcoin wallets to test with real transactions
- **Comprehensive Documentation**: Detailed documentation of all API methods

## Architecture

METAGRAPH is built as a single-page application (SPA) using React, with a focus on direct interaction with Bitcoin blockchain APIs through the Oyl SDK and wallet functionality through the LaserEyes package.

Key technical components:
- **Frontend**: React, React Router
- **Build Tool**: Vite
- **Bitcoin SDK**: Oyl SDK for blockchain interaction
- **Wallet Integration**: LaserEyes package for Bitcoin wallet connectivity
- **Node.js Compatibility**: Custom shims for browser environment

## Network Support

The application supports multiple Bitcoin networks:
- **Mainnet**: Production Bitcoin network
- **Regtest**: Local testing environment
- **Oylnet**: Official Alkanes community Regtest

## Contributing

We welcome contributions to METAGRAPH! Whether you're interested in fixing bugs, adding features, or improving documentation, your help is appreciated.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Dee](https://github.com/Sprimage)
- The Bitcoin developer community
- Oyl SDK team for their powerful Bitcoin development toolkit
- LaserEyes package for wallet integration capabilities
- All contributors who have helped shape this project

---

<div align="center">
  <p>METAGRAPH - Making the implicit explicit in Bitcoin's metastructures</p>
</div>
