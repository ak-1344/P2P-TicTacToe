// P2P Tic-Tac-Toe Game using PeerJS

let peer = null;
let conn = null;
let isHost = false;
let mySymbol = "";
let opponentSymbol = "";
let isMyTurn = false;
let gameStarted = false;
let gameOver = false;

let Status = document.getElementById("status");
let boxes = [];
for (let i = 1; i <= 9; i++) {
    boxes.push(document.getElementById(i));
}

// Initialize the room section visibility
document.getElementById("room").style.display = "block";
document.getElementById("box").style.display = "none";

function generateRoomId() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function createRoom() {
    const roomId = generateRoomId();
    
    peer = new Peer(roomId);
    
    peer.on('open', function(id) {
        isHost = true;
        mySymbol = "X";
        opponentSymbol = "O";
        
        document.getElementById("room-info").style.display = "block";
        document.getElementById("room-id").innerText = id;
        document.getElementById("connection-status").innerText = "Waiting for opponent to join...";
        document.getElementById("create").style.display = "none";
        document.getElementById("join").style.display = "none";
        
        updatePlayerInfo();
    });
    
    peer.on('connection', function(connection) {
        conn = connection;
        setupConnection();
    });
    
    peer.on('error', function(err) {
        document.getElementById("connection-status").innerText = "Error: " + err.type;
        console.error("PeerJS error:", err);
    });
}

function joinRoom() {
    document.getElementById("join-form").style.display = "block";
    document.getElementById("create").style.display = "none";
    document.getElementById("join").style.display = "none";
}

function connectToPeer() {
    const peerId = document.getElementById("peer-id-input").value.trim().toUpperCase();
    
    if (!peerId) {
        document.getElementById("connection-status").innerText = "Please enter a Room ID";
        return;
    }
    
    peer = new Peer();
    
    peer.on('open', function() {
        isHost = false;
        mySymbol = "O";
        opponentSymbol = "X";
        
        document.getElementById("connection-status").innerText = "Connecting to room...";
        
        conn = peer.connect(peerId);
        setupConnection();
    });
    
    peer.on('error', function(err) {
        document.getElementById("connection-status").innerText = "Error: " + err.type + ". Check the Room ID.";
        console.error("PeerJS error:", err);
    });
}

function setupConnection() {
    conn.on('open', function() {
        gameStarted = true;
        document.getElementById("connection-status").innerText = "Connected! Game starting...";
        
        setTimeout(function() {
            document.getElementById("room").style.display = "none";
            document.getElementById("box").style.display = "block";
            
            if (isHost) {
                isMyTurn = true;
                Status.innerText = "Your turn (X)";
            } else {
                isMyTurn = false;
                Status.innerText = "Opponent's turn (X)";
            }
            
            updatePlayerInfo();
        }, 1000);
    });
    
    conn.on('data', function(data) {
        handleMessage(data);
    });
    
    conn.on('close', function() {
        Status.innerText = "Opponent disconnected!";
        gameStarted = false;
    });
    
    conn.on('error', function(err) {
        console.error("Connection error:", err);
        Status.innerText = "Connection error!";
    });
}

function handleMessage(data) {
    switch (data.type) {
        case 'move':
            receiveMove(data.cell);
            break;
        case 'restart':
            resetGame();
            break;
    }
}

function sendMessage(data) {
    if (conn && conn.open) {
        conn.send(data);
    }
}

function updatePlayerInfo() {
    document.getElementById("player1").innerText = isHost ? "You (X)" : "Opponent (X)";
    document.getElementById("player2").innerText = isHost ? "Opponent (O)" : "You (O)";
    
    // X is always yellow, O is always black
    document.getElementById("player1").style.color = "#ffc400";
    document.getElementById("player2").style.color = "#000000";
}

function copyRoomId() {
    const roomId = document.getElementById("room-id").innerText;
    navigator.clipboard.writeText(roomId).then(function() {
        document.getElementById("connection-status").innerText = "Room ID copied to clipboard!";
    }).catch(function() {
        document.getElementById("connection-status").innerText = "Failed to copy. Please copy manually: " + roomId;
    });
}

function cellClicked(cell) {
    if (!gameStarted) {
        Status.innerText = "Wait for opponent to connect!";
        return;
    }
    
    if (gameOver) {
        return;
    }
    
    if (!isMyTurn) {
        Status.innerText = "Not your turn!";
        return;
    }
    
    if (boxes[cell - 1].innerText !== "") {
        Status.innerText = "This cell is already taken!";
        return;
    }
    
    // Make the move
    makeMove(cell, mySymbol);
    
    // Send move to opponent
    sendMessage({ type: 'move', cell: cell });
    
    // Check for winner
    if (checkWinner(mySymbol)) {
        Status.innerText = "You won! 🎉";
        gameOver = true;
        return;
    }
    
    // Check for draw
    if (checkDraw()) {
        Status.innerText = "It's a draw!";
        gameOver = true;
        return;
    }
    
    // Switch turn
    isMyTurn = false;
    Status.innerText = "Opponent's turn (" + opponentSymbol + ")";
}

function receiveMove(cell) {
    makeMove(cell, opponentSymbol);
    
    // Check for winner
    if (checkWinner(opponentSymbol)) {
        Status.innerText = "You lost! 😢";
        gameOver = true;
        return;
    }
    
    // Check for draw
    if (checkDraw()) {
        Status.innerText = "It's a draw!";
        gameOver = true;
        return;
    }
    
    // Switch turn
    isMyTurn = true;
    Status.innerText = "Your turn (" + mySymbol + ")";
}

function makeMove(cell, symbol) {
    boxes[cell - 1].innerText = symbol;
    boxes[cell - 1].style.color = symbol === "X" ? "#ffc400" : "#000";
}

function checkWinner(symbol) {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6]             // Diagonals
    ];
    
    for (const [a, b, c] of winPatterns) {
        if (boxes[a].innerText === symbol &&
            boxes[b].innerText === symbol &&
            boxes[c].innerText === symbol) {
            return true;
        }
    }
    return false;
}

function checkDraw() {
    return boxes.every(box => box.innerText !== "");
}

function restart() {
    if (!gameStarted) {
        Status.innerText = "Wait for opponent to connect!";
        return;
    }
    
    sendMessage({ type: 'restart' });
    resetGame();
}

function resetGame() {
    boxes.forEach(box => {
        box.innerText = "";
        box.style.color = "#000";
    });
    
    gameOver = false;
    
    // Host (X) always starts
    if (isHost) {
        isMyTurn = true;
        Status.innerText = "Your turn (X)";
    } else {
        isMyTurn = false;
        Status.innerText = "Opponent's turn (X)";
    }
}