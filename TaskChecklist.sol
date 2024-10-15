// SPDX-License-Identifier: HAU
pragma solidity ^0.8.0;

contract TaskChecklist {
    struct Task {
        string description;
        bool isCompleted;
    }

    Task[] public tasks;

    function createTask(string memory _description) public {
        tasks.push(Task(_description, false));
    }

    function completeTask(uint _index) public {
        require(_index < tasks.length, "Task index out of bounds");
        tasks[_index].isCompleted = true;
    }

    function getTasks() public view returns (Task[] memory) {
        return tasks;
    }
}
