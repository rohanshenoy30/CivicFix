// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title CivicFix - Transparent civic issue tracking
/// @notice Citizens can report public issues; only the administrator can change status.
contract CivicFix {
    enum Status { Submitted, InProgress, Resolved, Rejected }

    struct Complaint {
        uint256 id;
        address reporter;
        string category;
        string description;
        string location;
        Status status;
        uint256 createdAt;
        uint256 updatedAt;
    }

    struct StatusUpdate {
        Status status;
        address updatedBy;
        uint256 timestamp;
        string note;
    }

    address public immutable administrator;
    uint256 public complaintCount;

    mapping(uint256 => Complaint) private complaints;
    mapping(uint256 => StatusUpdate[]) private statusHistory;

    event ComplaintSubmitted(
        uint256 indexed complaintId,
        address indexed reporter,
        string category,
        string location,
        uint256 timestamp
    );
    event ComplaintStatusUpdated(
        uint256 indexed complaintId,
        Status oldStatus,
        Status newStatus,
        address indexed updatedBy,
        string note,
        uint256 timestamp
    );

    modifier onlyAdministrator() {
        require(msg.sender == administrator, "Only administrator");
        _;
    }

    constructor() {
        administrator = msg.sender;
    }

    function submitComplaint(
        string calldata category,
        string calldata description,
        string calldata location
    ) external returns (uint256) {
        require(bytes(category).length > 0 && bytes(category).length <= 40, "Invalid category");
        require(bytes(description).length >= 10 && bytes(description).length <= 500, "Description must be 10-500 chars");
        require(bytes(location).length > 0 && bytes(location).length <= 100, "Invalid location");

        complaintCount += 1;
        uint256 id = complaintCount;
        complaints[id] = Complaint({
            id: id,
            reporter: msg.sender,
            category: category,
            description: description,
            location: location,
            status: Status.Submitted,
            createdAt: block.timestamp,
            updatedAt: block.timestamp
        });

        statusHistory[id].push(StatusUpdate({
            status: Status.Submitted,
            updatedBy: msg.sender,
            timestamp: block.timestamp,
            note: "Complaint submitted"
        }));

        emit ComplaintSubmitted(id, msg.sender, category, location, block.timestamp);
        return id;
    }

    function updateComplaintStatus(
        uint256 complaintId,
        Status newStatus,
        string calldata note
    ) external onlyAdministrator {
        require(complaintId > 0 && complaintId <= complaintCount, "Complaint does not exist");
        require(bytes(note).length <= 200, "Note too long");

        Complaint storage complaint = complaints[complaintId];
        Status oldStatus = complaint.status;
        require(oldStatus != newStatus, "Status unchanged");
        require(oldStatus != Status.Resolved && oldStatus != Status.Rejected, "Complaint is closed");

        complaint.status = newStatus;
        complaint.updatedAt = block.timestamp;
        statusHistory[complaintId].push(StatusUpdate({
            status: newStatus,
            updatedBy: msg.sender,
            timestamp: block.timestamp,
            note: note
        }));

        emit ComplaintStatusUpdated(
            complaintId, oldStatus, newStatus, msg.sender, note, block.timestamp
        );
    }

    function getComplaint(uint256 complaintId) external view returns (Complaint memory) {
        require(complaintId > 0 && complaintId <= complaintCount, "Complaint does not exist");
        return complaints[complaintId];
    }

    function getStatusHistory(uint256 complaintId) external view returns (StatusUpdate[] memory) {
        require(complaintId > 0 && complaintId <= complaintCount, "Complaint does not exist");
        return statusHistory[complaintId];
    }

    function getComplaintIds() external view returns (uint256[] memory ids) {
        ids = new uint256[](complaintCount);
        for (uint256 i = 1; i <= complaintCount; i++) {
            ids[i - 1] = i;
        }
    }
}
