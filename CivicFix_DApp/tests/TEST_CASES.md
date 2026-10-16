# CivicFix Test Plan

Run these tests against your deployed contract on Ganache or an Ethereum test network. Record the actual outcome, transaction hash or revert message, and screenshot for the report. Do not claim a test passed unless you ran it.

| ID | Test type | Setup / input | Expected result |
|---|---|---|---|
| TC-01 | Valid | Submit category `Pothole / road damage`, description with 10–500 characters, and a non-empty location | Transaction succeeds; complaint count increments; status is Submitted |
| TC-02 | Valid | Retrieve the newly created complaint with `getComplaint(id)` | Correct reporter, category, description, location, timestamps and status returned |
| TC-03 | Valid | Administrator changes a Submitted complaint to InProgress with a note | Transaction succeeds; status and updatedAt change; history gains an entry |
| TC-04 | Valid | Read `getStatusHistory(id)` after submission and update | Both initial and subsequent status entries are returned |
| TC-05 | Invalid | Submit an empty category | Reverts with `Invalid category` |
| TC-06 | Invalid | Submit an empty or fewer-than-10-character description | Reverts with `Description must be 10-500 chars` |
| TC-07 | Invalid | Submit a description longer than 500 characters | Reverts with `Description must be 10-500 chars` |
| TC-08 | Invalid | Submit an empty location or a location longer than 100 characters | Reverts with `Invalid location` |
| TC-09 | Invalid | Read complaint ID `0` or an ID greater than complaintCount | Reverts with `Complaint does not exist` |
| TC-10 | Invalid | Administrator sets the current status to the same status | Reverts with `Status unchanged` |
| TC-11 | Unauthorized | Connect a different account and call `updateComplaintStatus` | Reverts with `Only administrator` |
| TC-12 | Invalid / closed record | Resolve or reject a complaint, then try to update it again | Reverts with `Complaint is closed` |

## How to test unauthorized access

1. Deploy the contract from Ganache Account A.
2. Submit a complaint from Account A or Account B.
3. In Remix, change the selected account in the environment to Ganache Account B (which must not be the deployer).
4. Call `updateComplaintStatus` for an existing complaint.
5. Confirm the transaction reverts with `Only administrator`. Capture the revert output.
6. Return to Account A and confirm that an allowed status update succeeds.

## Results log

Fill in after running the tests:

| Test ID | Actual result | Pass / fail | Evidence filename / transaction hash |
|---|---|---|---|
| TC-01 | Pending execution | Not run | — |
| TC-02 | Pending execution | Not run | — |
| TC-03 | Pending execution | Not run | — |
| TC-04 | Pending execution | Not run | — |
| TC-05–TC-12 | Pending execution | Not run | — |
