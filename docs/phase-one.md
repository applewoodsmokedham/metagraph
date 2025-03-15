## 🚩 Phase 1: Environment Setup 

### 1️⃣ **Initialize React Project Structure**

Set up a clean, modular React project to facilitate maintainable, clear, and organized development:

**Recommended File Structure**:

```
methane-playground/
├── node_modules/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── shared/                  # Reusable components
│   │   │   ├── EndpointToggle.jsx    # Toggle between Local and Production RPC endpoints
│   │   │   ├── APIForm.jsx           # Generic interactive form component
│   │   │   └── StatusIndicator.jsx
│   │
│   ├── methods/                      # Specific forms for RPC methods
│   │   ├── TraceForm.jsx
│   │   ├── SimulateForm.jsx
│   │   ├── TraceBlockForm.jsx
│   │   └── ... 
│   │
│   └── layout/                       # UI structural components
│       ├── Header.jsx
│       ├── Footer.jsx
│       └── NavBar.jsx
│
├── pages/                            # Page-level components for routing
│   ├── Home.jsx
│   ├── APIMethodPage.jsx
│   └── NotFound.jsx
│
├── sdk/                              # Oyl SDK integration
│   ├── provider.js
│   ├── alkanes.js
│   └── index.js
│
├── utils/                            # Utility functions
│   ├── formatters.js
│   └── validators.js
│
├── routes.jsx                        # React Router configuration
├── App.jsx
├── index.jsx
├── .env                              # Endpoint configuration
├── .gitignore
├── package.json
└── vite.config.js (recommended)
```

- **Reasoning:**
  - Clear separation of concerns (components, pages, utils, sdk).
  - Scalable and modular.
  - Intuitive to navigate, reducing cognitive load.

---

### 2️⃣ **Integrate Oyl SDK**

Integrate the Oyl SDK using a dedicated wrapper module within your React app (`src/sdk`). This centralizes all blockchain interactions and facilitates easy maintenance.

**Initialize the React project with Vite and React**
Install dependencies explicitly

```bash
yarn add react-router-dom @oyl/sdk dotenv
```

 **Configure Oyl SDK Provider (Production/Local/Oylnet)**

Use `.env` files to manage the provider configuration for production and local environments securely:

Create `.env` at your project's root:

```
 VITE_SANDSHREW_PROJECT_ID=your-sandshrew-project-id
```

Create a dedicated SDK integration layer (`src/sdk`):

```javascript
// src/sdk/provider.js
import { Provider } from '@oyl/sdk';
import * as bitcoin from 'bitcoinjs-lib';

 const providers = {
    production: new Provider({
        url: 'https://mainnet.sandshrew.io',
        version: 'v2',
        projectId: import.meta.env.VITE_SANDSHREW_PROJECT_ID,
        network: bitcoin.networks.bitcoin,
        networkType: 'mainnet',
    }),

    local: new Provider({
        url: 'http://localhost:18888',
        projectId: 'regtest',
        network: bitcoin.networks.regtest,
        networkType: 'regtest',
    }),

    oylnet: new Provider({
        url: 'https://oylnet.oyl.gg',
        version: 'v2',
        projectId: 'regtest',
        network: bitcoin.networks.regtest,
        networkType: 'regtest',
    }),
 };

const getProvider = (env = 'production') => providers[env];

export default getProvider;
```

```javascript
// src/sdk/alkanes.js
import getProvider from './provider';

const alkanesProvider =  provider.alkanes;

export const traceTransaction = async (txid, blockHeight, endpoint) => {
  const provider = getProvider(endpoint);
  const result =  await alkanesProvider.trace({vout,txid})
  return result;
};

// similarly, define other Alkanes methods here
```

```javascript
// src/sdk/index.js (Central export point)
export { default as getProvider } from './provider';
export * from './alkanes';
```

- **Reasoning:**
  - Encapsulates blockchain logic neatly.
  - Simplifies import statements in UI components.
  - Improves readability and maintainability.

---




