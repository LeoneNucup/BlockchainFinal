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
        sourceWallet = _sourceWallet;
    }


    function createTask(string memory _description) public {
        require(msg.sender == sourceWallet, "Only the source wallet can create tasks");
        tasks.push(Task(_description, false));
        emit TaskCreated(_description, msg.sender);
    }


    function completeTask(uint256 _index) public {
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
