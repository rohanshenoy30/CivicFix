# CivicFix — Decentralized Civic Issue Tracker

CivicFix is a decentralized application (DApp) prototype for reporting public-infrastructure issues and transparently tracking their progress. Complaints and status updates are stored by a Solidity smart contract on an Ethereum-compatible blockchain. The frontend lets citizens submit reports, browse on-chain records, search/filter complaints, and inspect each complaint's status history. The wallet that deploys the contract is the administrator and is authorized to update complaint statuses.

> **Academic prototype:** Developed for Blockchain Technology (CSE4444), Assignment 2. CivicFix runs against a local Ganache development blockchain and is not a production municipal service. Use test accounts and non-sensitive sample information only.

## Features

- Submit civic complaints with category, description, and location.
- Validate complaint fields in the frontend and smart contract.
- Store complaint IDs, reporter addresses, categories, descriptions, locations, timestamps, status, and status history on-chain.
- Retrieve and display complaints and aggregate counts from the blockchain.
- Search reports and filter by status.
- Restrict status updates to the contract-deploying administrator.
- Connect MetaMask and submit transactions through ethers.js v6.
- Inspect contract functions and transaction results in Remix IDE.

## Technology stack

- **Smart contract:** Solidity `^0.8.20`
- **IDE / deployment:** Remix IDE 2.6.7 and Ganache
- **Wallet:** MetaMask
- **Frontend:** HTML, CSS, JavaScript
- **Ethereum library:** ethers.js v6 (CDN)
- **Local server:** Python `http.server`

## Repository structure

```text
CivicFix_DApp/
├── contracts/CivicFix.sol
├── frontend/
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── tests/TEST_CASES.md
├── evidence/
│   ├── 01-frontend-home.png
│   ├── 02-complaint-history-admin-desk.png
│   ├── 03-complaint-history.png
│   ├── 04-metamask-transaction-request.png
│   ├── 05-successful-complaint-transaction.png
│   ├── 06-remix-contract-interaction.png
│   └── 07-live-dashboard-three-reports.png
└── README.md
```

## Smart contract overview

`CivicFix.sol` defines an administrator, complaint counter, complaint records, status-history records, read functions, and events for submissions and status changes.

### Status values

| Value | Status |
|---:|---|
| `0` | Submitted |
| `1` | InProgress |
| `2` | Resolved |
| `3` | Rejected |

### Validation and permissions

- Category: 1–40 characters.
- Description: 10–500 characters.
- Location: 1–100 characters.
- Complaint IDs must refer to existing records.
- Only the deploying administrator can update complaint status.
- A status cannot be changed to its current value.
- Resolved and rejected complaints are closed and cannot be updated again.
- Status history records the status, updating address, timestamp, and note.

## Deployment configuration

The contract was compiled in Remix and deployed to the local Ganache workspace used for CivicFix.

| Setting | Value |
|---|---|
| MetaMask network | `Ganache CivicFix` |
| RPC URL | `http://127.0.0.1:7545` |
| Chain / Network ID | `5777` |
| Ganache hardfork | `Merge` |
| Remix EVM version | `paris` |
| Contract | `CivicFix` |
| Deployed contract address | **Replace with the full address copied from Remix** |

> **Important:** Use the full address of the CivicFix contract deployed on Ganache. The Remix VM deployment is a different chain and its address must not be reused. Set the same Ganache address in `frontend/app.js` as `CONTRACT_ADDRESS` before running the frontend.

## Run the DApp locally

### 1. Start Ganache

1. Open Ganache and start the `CIVICFIX` workspace.
2. Verify that the RPC URL is `http://127.0.0.1:7545` and the network ID is `5777`.
3. Keep Ganache running while using CivicFix.

### 2. Configure MetaMask

1. Add a custom network named `Ganache CivicFix` with RPC URL `http://127.0.0.1:7545`, chain ID `5777`, and currency symbol `ETH`.
2. Import a Ganache-provided test account if necessary.
3. Select `Ganache CivicFix` and verify that the account has Ganache test ETH.
4. Never use a real wallet's private key or recovery phrase for local development, and never commit credentials to GitHub.

### 3. Compile and deploy in Remix

1. Open [Remix IDE](https://remix.ethereum.org/).
2. Open `contracts/CivicFix.sol`.
3. Compile with a compatible Solidity `0.8.x` compiler and set EVM version to `paris` to match the Ganache Merge-era hardfork.
4. In **Deploy & Run Transactions**, choose **Browser Extension** / MetaMask.
5. Confirm Remix and MetaMask both use `Ganache CivicFix` and the intended test account.
6. Deploy `CivicFix` and confirm the deployment in MetaMask.
7. Copy the full deployed contract address and configure the frontend.

### 4. Configure and run the frontend

In `frontend/app.js`, set the contract address near the top:

```javascript
const CONTRACT_ADDRESS = "PASTE_FULL_GANACHE_DEPLOYED_ADDRESS_HERE";
```

The contract ABI is included in `app.js` and must match `CivicFix.sol`.

From the project directory, run:

```bash
cd frontend
python3 -m http.server 8000
```

Open [http://localhost:8000](http://localhost:8000) in a browser with MetaMask installed. Keep Ganache and the terminal running. Do not open `index.html` directly through a `file://` URL.

### 5. Use CivicFix

1. Click **Connect MetaMask** and approve the connection only when MetaMask shows the intended Ganache network.
2. Confirm the displayed wallet address is the intended test account.
3. Select a category and enter a location and description of 10–500 characters.
4. Click **Submit report** and confirm the transaction in MetaMask.
5. Verify that the report appears in **Recent reports** and the total count updates.
6. Use **View history** to inspect a report's history.
7. Use **Administrator desk** with the wallet that deployed the contract to update a report's status.

## Testing

Manual testing of the DApp workflow was performed during development. The screenshots show successful complaint submissions, on-chain retrieval, wallet interaction, status history, and a dashboard showing three reports with one in progress. The test plan also covers invalid input, invalid state transitions, and unauthorized status updates. Record exact revert messages and transaction hashes in `tests/TEST_CASES.md` if required by the evaluator.

| Test ID | Scenario | Result summary |
|---|---|---|
| TC-01 | Submit a valid complaint | Successful; the UI displayed reports `#1`, `#2`, and `#3` after transactions. |
| TC-02 | Retrieve a complaint from the contract | Contract interaction returned complaint fields in Remix. |
| TC-03 | Administrator updates a complaint status | Dashboard displayed one report as `In progress`, indicating the status-update workflow was exercised. |
| TC-04 | Read complaint status history | UI displayed the `Submitted` history entry for a report. |
| TC-05 | Empty category | Validation test case covered by the test plan. |
| TC-06 | Description shorter than 10 characters | Validation test case covered by the test plan. |
| TC-07 | Description longer than 500 characters | Validation test case covered by the test plan. |
| TC-08 | Empty or overlong location | Validation test case covered by the test plan. |
| TC-09 | Nonexistent complaint ID | Invalid-ID test case covered by the test plan. |
| TC-10 | Set a complaint to its current status | Invalid-transition test case covered by the test plan. |
| TC-11 | Non-administrator attempts a status update | Authorization test case covered by the test plan. |
| TC-12 | Update a resolved/rejected complaint | Closed-record test case covered by the test plan. |

The smart contract enforces the validation and authorization rules above. For formal submission evidence, include screenshots or Remix transaction/revert output for the negative test cases and keep the results log consistent with the tests actually executed.

## Screenshots / evidence

### 1. Frontend home page

![CivicFix frontend home page](evidence/01-frontend-home.png)

### 2. Complaint history and administrator desk

![Complaint history and administrator desk](evidence/02-complaint-history-admin-desk.png)

### 3. Complaint status history in the UI

![Complaint history showing the Submitted event](evidence/03-complaint-history.png)

### 4. MetaMask transaction request

![MetaMask transaction request for a CivicFix action](evidence/04-metamask-transaction-request.png)

### 5. Successful complaint transaction and on-chain records

![Successful complaint transaction and records displayed in CivicFix](evidence/05-successful-complaint-transaction.png)

### 6. Remix contract interaction and returned data

![Remix contract interaction showing calls and complaint data](evidence/06-remix-contract-interaction.png)

### 7. Dashboard after multiple submissions and status update

![CivicFix dashboard showing three reports and one in progress](evidence/07-live-dashboard-three-reports.png)

## Security and privacy notes

- Never commit private keys, seed phrases, passwords, or wallet exports.
- Use only Ganache test accounts and test ETH.
- Complaint descriptions and locations are public on-chain; do not enter personal, confidential, or sensitive information.
- The administrator is the deploying wallet, not a verified government authority.
- The frontend loads ethers.js and Google Fonts from CDNs, so an internet connection may be required for those assets.

