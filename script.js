let player1 = {
    name: "Player 1",
    symbol: "X",
};
let player2 = {
    name: "Player 2",
    symbol: "O",
};
let currentPlayer = player1;
let Status = document.getElementById("status");
Status.innerText = currentPlayer.name + "'s turn";
let boxes = [];
for(let i = 1; i <= 9; i++){
    boxes.push(document.getElementById(i));
}

function createRoom(){}
function joinRoom(){}

function cellClicked(cell){
    if(checkWinner()) return;
    if(boxes[cell-1].innerText === ""){
        boxes[cell-1].innerText = currentPlayer.symbol;
        boxes[cell-1].style.color = currentPlayer === player1 ? "#ffc400" : "#000";
        if(checkWinner()) return;
        currentPlayer = currentPlayer === player1 ? player2 : player1;
        Status.innerText = currentPlayer.name + "'s turn";
    } else {
        Status.innerText = "This cell is already taken";
    }
}

function checkWinner(){
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6]             // Diagonals
    ];
    for(const [a, b, c] of winPatterns){
        if(boxes[a].innerText === boxes[b].innerText && 
           boxes[b].innerText === boxes[c].innerText && 
           boxes[a].innerText !== ""){
            Status.innerText = currentPlayer.name + " is the winner!";
            return true;
        }
    }
    if(boxes.every(box => box.innerText !== "")){
        Status.innerText = "It's a draw!";
        return true;
    }
    return false;
}

function restart(){
    boxes.forEach(box => {
        box.innerText = "";
        box.style.color = "#000";
    });
    currentPlayer = player1;
    Status.innerText = currentPlayer.name + "'s turn";
} 
    // The code above is a simple implementation of a Tic Tac Toe game. It has two players, player1 and player2, and a currentPlayer variable that keeps track of the current player. The Status variable is used to display the current player's turn. The boxes array contains references to the nine cells of the game board.