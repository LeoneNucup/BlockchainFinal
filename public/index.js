let web3;
let account;
let contract;

const contractAddress = "0x9383Ce1bd9947bF8154bC2aCcad3F232deCcbc1c"; // Replace with your deployed contract address
const contractABI = [
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
    }
];

async function connectWallet() {
    if (typeof window.ethereum !== 'undefined') {
        web3 = new Web3(window.ethereum);
        try {
            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
            account = accounts[0];
            document.getElementById("account").innerText = `Connected: ${account}`;

            contract = new web3.eth.Contract(contractABI, contractAddress);
            console.log("Connected to MetaMask with account:", account);
            console.log("Contract initialized:", contract);

            // Fetch the wallet balance
            getWalletBalance();

            // Fetch the task list
            getTasks();
        } catch (error) {
            console.error("Failed to connect to MetaMask:", error);
            document.getElementById("account").innerText = "Connection failed: " + error.message;
        }
    } else {
        alert("MetaMask is not installed. Please install it to use this DApp.");
        console.log("MetaMask is not detected in the browser.");
    }
}

async function getWalletBalance() {
    try {
        const balance = await web3.eth.getBalance(account);
        const etherBalance = web3.utils.fromWei(balance, 'ether');
        document.getElementById("walletBalance").innerText = `Balance: ${etherBalance} ETH`;
    } catch (error) {
        console.error("Failed to get wallet balance:", error);
    }
}

async function addTask() {
    const taskDescription = document.getElementById("taskInput").value;

    if (!taskDescription) {
        alert("Task description cannot be empty.");
        return;
    }

    try {
        if (!account) {
            alert("Please connect to MetaMask first.");
            return;
        }

        await contract.methods.createTask(taskDescription).send({ from: account });
        console.log("Task added:", taskDescription);

        document.getElementById("taskInput").value = "";
        getTasks();
    } catch (error) {
        console.error("Failed to add task:", error);
        alert("Failed to add task. Make sure you are connected to MetaMask and the contract is properly set up.");
    }
}

async function completeTask(index) {
    try {
        await contract.methods.completeTask(index).send({ from: account });
        getTasks();
    } catch (error) {
        console.error("Error completing task", error);
    }
}

async function getTasks() {
    try {
        const tasks = await contract.methods.getTasks().call();
        const taskListDiv = document.getElementById("taskList");
        taskListDiv.innerHTML = "";

        tasks.forEach((task, index) => {
            const taskDiv = document.createElement("div");
            taskDiv.className = "task";

            const taskText = document.createElement("span");
            taskText.innerText = task.description;
            if (task.isCompleted) {
                taskText.className = "completed";
            }
            taskDiv.appendChild(taskText);

            if (!task.isCompleted) {
                const completeButton = document.createElement("button");
                completeButton.innerText = "Mark as Complete";
                completeButton.onclick = () => completeTask(index);
                taskDiv.appendChild(completeButton);
            }

            taskListDiv.appendChild(taskDiv);
        });
    } catch (error) {
        console.error("Error retrieving tasks", error);
    }
}
