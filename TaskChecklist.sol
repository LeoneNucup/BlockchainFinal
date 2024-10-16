// SPDX-License-Identifier: HAU
pragma solidity ^0.8.0;

contract TaskChecklist {
    address public sourceWallet;
    struct Task {
        string description;
        bool isCompleted;
    }

    Task[] public tasks;

    event TaskCreated(string description, address indexed creator);
    event TaskCompleted(uint256 indexed taskIndex, address indexed completer, uint256 reward);

    constructor(address _sourceWallet) {
        sourceWallet = _sourceWallet; // Set the source wallet address during contract deployment
    }

    // Function to create a task
    function createTask(string memory _description) public {
        tasks.push(Task(_description, false));
        emit TaskCreated(_description, msg.sender);
    }

    // Function to mark a task as completed
    function completeTask(uint _index) public {
        require(_index < tasks.length, "Task index out of bounds");
        require(!tasks[_index].isCompleted, "Task already completed");

        tasks[_index].isCompleted = true;

        uint256 reward = 0.1 ether; // Reward for completing a task

        emit TaskCompleted(_index, msg.sender, reward);
    }

    function getTasks() public view returns (Task[] memory) {
        return tasks;
    }
}
