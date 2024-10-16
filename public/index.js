let web3;
let account;
let contract;

const contractAddress = "0x029E0BB49A1DF562511F36146197F3f916efb79f"; // Replace with your deployed contract address
const contractABI = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_sourceWallet",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "from",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "FundsAdded",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "taskIndex",
                "type": "uint256"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "completer",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "reward",
                "type": "uint256"
            }
        ],
        "name": "TaskCompleted",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "string",
                "name": "description",
                "type": "string"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "creator",
                "type": "address"
            }
        ],
        "name": "TaskCreated",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "addFunds",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_index",
                "type": "uint256"
            }
        ],
        "name": "completeTask",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "_description",
                "type": "string"
            }
        ],
        "name": "createTask",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getTasks",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "string",
                        "name": "description",
                        "type": "string"
                    },
                    {
                        "internalType": "bool",
                        "name": "isCompleted",
                        "type": "bool"
                    }
                ],
                "internalType": "struct TaskChecklist.Task[]",
                "name": "",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "sourceWallet",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "tasks",
        "outputs": [
            {
                "internalType": "string",
                "name": "description",
                "type": "string"
            },
            {
                "internalType": "bool",
                "name": "isCompleted",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "stateMutability": "payable",
        "type": "receive"
    }
];

// Function to connect the wallet
async function connectWallet() {
    if (window.ethereum) {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            account = accounts[0];
            console.log("Connected account:", account);
            document.getElementById("walletAddress").innerText = `Wallet: ${account}`;

            // Initialize Web3
            web3 = new Web3(window.ethereum);

            // Convert contract address to checksum format
            contract = new web3.eth.Contract(contractABI, contractAddress);

            // Get wallet balances
            await getWalletBalance();
            await getSourceWalletBalance();
            await getTasks();
        } catch (error) {
            console.error("Failed to connect wallet:", error);
        }
    } else {
        alert("MetaMask is not installed. Please install MetaMask to use this app.");
    }
}



async function getWalletBalance() {
    try {
        const balance = await web3.eth.getBalance(account); // Use account here
        const etherBalance = web3.utils.fromWei(balance, 'ether');
        document.getElementById("walletBalance").innerText = `Your Balance: ${etherBalance} ETH`;
    } catch (error) {
        console.error("Failed to get wallet balance:", error);
    }
}

async function getSourceWalletBalance() {
    try {
        const sourceWalletAddress = await contract.methods.sourceWallet().call(); // Ensure contract is defined
        const balance = await web3.eth.getBalance(sourceWalletAddress);
        const etherBalance = web3.utils.fromWei(balance, 'ether');
        document.getElementById("sourceWalletBalance").innerText = `Source Balance: ${etherBalance} ETH`;
    } catch (error) {
        console.error("Failed to get source wallet balance:", error);
    }
}



async function addTask() {
    const taskDescription = document.getElementById("taskInput").value.trim();
    if (!taskDescription) {
        alert("Task description cannot be empty.");
        return;
    }

    try {
        const gasEstimate = await contract.methods.createTask(taskDescription).estimateGas({ from: account });
        const result = await contract.methods.createTask(taskDescription).send({
            from: account,
            gas: Math.floor(gasEstimate * 1.2)
        });
        console.log("Task added:", taskDescription);
        document.getElementById("taskInput").value = "";
        await getTasks();
    } catch (error) {
        console.error("Failed to add task:", error);
        alert("Failed to add task: " + error.message);
    }
}

async function completeTask(taskIndex) {
    if (!account) {
        alert("Please connect your wallet first.");
        return;
    }

    try {
        // Fetch the source wallet address
        const sourceWalletAddress = await contract.methods.sourceWallet().call();

        // Check balances before the transfer
        const sourceWalletBalance = await web3.eth.getBalance(sourceWalletAddress);
        console.log("Source Wallet Balance Before:", web3.utils.fromWei(sourceWalletBalance, 'ether'));

        // Mark the task as completed in the contract
        await contract.methods.completeTask(taskIndex).send({ from: account });

        // Reward amount in wei
        const rewardAmount = web3.utils.toWei('0.1', 'ether');

        // Ensure the source wallet has enough balance
        const updatedSourceWalletBalance = await web3.eth.getBalance(sourceWalletAddress);
        console.log("Updated Source Wallet Balance:", web3.utils.fromWei(updatedSourceWalletBalance, 'ether'));

        if (Number(updatedSourceWalletBalance) < Number(rewardAmount)) {
            throw new Error("Insufficient funds in source wallet for the transfer.");
        }

        // Transfer Ether from the source wallet to the user's wallet
        const transferResult = await web3.eth.sendTransaction({
            from: sourceWalletAddress,
            to: account,
            value: rewardAmount,
            gas: 60000 // Increase gas limit if needed
        });

        console.log("Transfer Result:", transferResult);

        alert('Task completed and reward transferred successfully.');
        await getWalletBalance();
        await getSourceWalletBalance();
        await getTasks();
    } catch (error) {
        console.error('Failed to complete task:', error);
        alert('An error occurred while completing the task: ' + error.message);
    }
}




async function getTasks() {
    try {
        const tasks = await contract.methods.getTasks().call();
        const taskListDiv = document.getElementById("taskList");
        taskListDiv.innerHTML = ""; // Clear existing tasks

        // Prepend new tasks to the top
        tasks.forEach((task, index) => {
            const taskDiv = document.createElement("div");
            taskDiv.className = "task";

            const taskText = document.createElement("span");
            taskText.innerText = task.description;
            if (task.isCompleted) {
                taskText.className = "completed";
                taskText.style.textDecoration = "line-through";
            }
            taskDiv.appendChild(taskText);

            if (!task.isCompleted) {
                const completeButton = document.createElement("button");
                completeButton.innerText = "Mark as Complete";
                completeButton.onclick = () => completeTask(index);
                taskDiv.appendChild(completeButton);
            }

            // Prepend the task div to the task list
            taskListDiv.prepend(taskDiv);
        });
    } catch (error) {
        console.error("Error retrieving tasks", error);
        alert("Failed to retrieve tasks.");
    }
}



// Make sure to call connectWallet when the page loads or when a connect button is clicked
// document.addEventListener('DOMContentLoaded', connectWallet);
// or
// document.getElementById('connectButton').addEventListener('click', connectWallet);
