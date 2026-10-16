# CivicFix — Decentralized Civic Issue Tracker

CivicFix is an academic Ethereum DApp prototype for transparently recording public infrastructure complaints. Citizens can submit issues; the wallet that deploys the contract acts as administrator and can update complaint status. Each status update is stored in an on-chain history.

## Features

- Solidity smart contract with constructor, state variables, structs, enum, mappings, validation and events.
- HTML/CSS/JavaScript frontend.
- MetaMask wallet connection using ethers.js.
- Submit complaints and retrieve/display blockchain data.
- Administrator-only status updates.
- Status history, search and status filters.
- Tests for valid, invalid and unauthorized inputs.

## Technology

- Solidity `^0.8.20`
- Remix IDE
- Ganache local Ethereum network (or a compatible Ethereum test network)
- MetaMask
- ethers.js v6
- HTML, CSS and JavaScript

## Project structure

```text
CivicFix_DApp/
├── contracts/
│   └── CivicFix.sol
├── frontend/
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── tests/
│   └── TEST_CASES.md
└── README.md
```

## Deploy using Remix and Ganache

1. Start Ganache and create a local workspace. Note the RPC URL, chain ID and test accounts.
2. In MetaMask, add a custom network using the RPC URL and chain ID displayed by Ganache. Import a **Ganache test account** using its private key only into your local MetaMask test setup. Never use a real wallet's seed phrase or private key.
3. Open Remix IDE and create `CivicFix.sol`. Paste the source from `contracts/CivicFix.sol`.
4. In **Solidity Compiler**, choose compiler version `0.8.20` or a compatible `0.8.x` release, then compile.
5. In **Deploy & Run Transactions**, select **Injected Provider - MetaMask**. Confirm MetaMask is connected to your Ganache network.
6. Deploy `CivicFix`. The deploying account becomes the immutable administrator. Confirm the deployment transaction.
7. Copy the deployed contract address.

## Configure and run the frontend

1. Open `frontend/app.js`.
2. Set `CONTRACT_ADDRESS` to the deployed contract address.
3. The ABI is included in `app.js`. If you change the Solidity contract interface, update the ABI accordingly.
4. Serve the `frontend` directory with a local static HTTP server, for example:
   ```bash
   cd frontend
   python3 -m http.server 8000
   ```
5. Open `http://localhost:8000` in a browser with MetaMask installed.
6. Connect MetaMask and ensure it is on the same Ganache network used for deployment.
7. Submit a complaint. Approve the transaction in MetaMask, wait for confirmation, and check that the new record appears in the list.
8. To test administrator actions, use the wallet that deployed the contract. To test unauthorized access, connect a different Ganache account and attempt a status update.

> Do not open `index.html` directly using a `file://` URL; use the local HTTP server.

## Important implementation notes

- The first complaint ID is `1`; IDs increase sequentially.
- Status values are `0 = Submitted`, `1 = InProgress`, `2 = Resolved`, `3 = Rejected`.
- Only the deployer can call `updateComplaintStatus`.
- Resolved and rejected complaints are closed and cannot be updated again.
- Complaint descriptions and locations are public on-chain. Do not submit personal, confidential or sensitive data.
- The frontend uses a CDN for ethers.js and Google Fonts; an internet connection is required to load these assets.
- This is a student prototype, not a production municipal service. The administrator is the deploying wallet, not a verified government authority.

## Test cases

See [`tests/TEST_CASES.md`](tests/TEST_CASES.md) for valid, invalid and unauthorized test cases. Record actual outcomes while running tests; do not mark a test as passed until it has been executed.

## Evidence checklist

Add your own screenshots to an `evidence/` folder and link them here when ready:

- [ ] Solidity compilation success in Remix
- [ ] Contract deployment and address in Remix
- [ ] MetaMask connected to the correct network
- [ ] Successful complaint submission transaction
- [ ] Complaint data displayed in the frontend
- [ ] Successful administrator status update
- [ ] Failed invalid-input transaction or validation result
- [ ] Failed unauthorized status update from a second wallet
- [ ] Status history shown in the frontend

## Submission

Upload the complete repository to GitHub. Ensure the repository is accessible to the evaluator. Do not upload private keys, seed phrases, passwords or other credentials.

The assignment also asks for a Word document named `YourName_RegNum_BT_Assignment2.docx`, converted to PDF, containing your name, registration number, assignment title, DApp title and GitHub repository link. Replace placeholders with your actual details.
