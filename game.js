// game.js
// Make the WebSocket connection a global variable to access it from auth.js
window.gameSocket = null;

// Wrap the game logic in a function
window.initializeGame = function(username) {
    // If a connection already exists, close it before creating a new one
    if (window.gameSocket) {
        window.gameSocket.close();
    }

    const board = $('#board');
    let playerColor = null;
    let currentTurn = 'black';
    let selectedPiece = null;

    // --- WebSocket Connection ---
    const conn = new WebSocket('wss://300e7a9d67fb.ngrok-free.app:8080');
    window.gameSocket = conn; // Store reference

    conn.onopen = function(e) {
        console.log("Connection established!");
        // Use the username from Firebase auth
        conn.send(JSON.stringify({ type: 'join', username: username }));
    };

    conn.onmessage = function(e) {
        const data = JSON.parse(e.data);
        console.log(data);

        switch (data.type) {
            case 'init':
                playerColor = data.color;
                $('#player-color').text(playerColor);
                createBoard();
                initializePieces(data.boardState);
                break;
            case 'update':
                updateBoard(data.boardState);
                currentTurn = data.turn;
                $('#turn-indicator').text(`${currentTurn.charAt(0).toUpperCase() + currentTurn.slice(1)}'s Turn`);
                if (data.winner) {
                     alert(`${data.winner.charAt(0).toUpperCase() + data.winner.slice(1)} wins!`);
                     $('#turn-indicator').text(`${data.winner.charAt(0).toUpperCase() + data.winner.slice(1)} wins!`);
                }
                break;
            case 'chat':
                $('#chat-box').append(`<div><strong>${data.from}:</strong> ${data.message}</div>`);
                $('#chat-box').scrollTop($('#chat-box')[0].scrollHeight);
                break;
            case 'error':
                alert(data.message);
                break;
            case 'start':
                $('#turn-indicator').text("Black's Turn");
                break;
        }
    };
    
    conn.onclose = function(e) {
        console.log("Connection closed.");
        $('#turn-indicator').text("Disconnected");
    };
    
    // --- Board Creation and Interaction Logic ---
    // (The rest of your game.js code remains exactly the same)
    // ... createBoard(), initializePieces(), updateBoard(), board click events, chat events ...

    function createBoard() {
        // Clear board before creating
        board.empty();
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = $('<div></div>')
                    .addClass('square')
                    .addClass((row + col) % 2 === 0 ? 'light' : 'dark')
                    .attr('data-row', row)
                    .attr('data-col', col);
                board.append(square);
            }
        }
    }

    function initializePieces(boardState) {
        $('.piece').remove();
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (boardState[row][col]) {
                    const pieceData = boardState[row][col];
                    const piece = $('<div></div>')
                        .addClass('piece')
                        .addClass(pieceData.color)
                        .toggleClass('king', pieceData.isKing);
                    $(`.square[data-row=${row}][data-col=${col}]`).append(piece);
                }
            }
        }
    }
    
    function updateBoard(boardState) {
        initializePieces(boardState); // Simple redraw
    }

    // --- Game Interaction ---
    board.off('click').on('click', '.square', function() { // use .off('click') to prevent multiple listeners
        if (currentTurn !== playerColor) return;

        const clickedSquare = $(this);

        if (selectedPiece) {
            const toRow = parseInt(clickedSquare.data('row'));
            const toCol = parseInt(clickedSquare.data('col'));
            const fromRow = parseInt(selectedPiece.parent().data('row'));
            const fromCol = parseInt(selectedPiece.parent().data('col'));

            const moveData = {
                type: 'move',
                from: { row: fromRow, col: fromCol },
                to: { row: toRow, col: toCol }
            };
            conn.send(JSON.stringify(moveData));
            
            $('.selected').removeClass('selected');
            selectedPiece = null;

        } else if (clickedSquare.find('.piece').length > 0) {
            const piece = clickedSquare.find('.piece');
            if (piece.hasClass(playerColor)) {
                $('.selected').removeClass('selected');
                piece.addClass('selected');
                selectedPiece = piece;
            }
        }
    });

    // --- Chat ---
    $('#send-chat').off('click').on('click', function() {
        const message = $('#chat-input').val();
        if (message.trim() !== '') {
            conn.send(JSON.stringify({ type: 'chat', message: message }));
            $('#chat-input').val('');
        }
    });
    
    $('#chat-input').off('keypress').on('keypress', function(e) {
        if (e.which === 13) { // Enter key
            $('#send-chat').click();
        }
    });
};
