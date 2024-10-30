import { db, ref, set, onValue, remove, get } from './firebase-config.js';

class TicTacToe {
    constructor() {
        this.gameId = null;
        this.playerId = null;
        this.playerSymbol = null;
        this.isMyTurn = false;
        this.gameState = null;
        this.scores = {
            player1: 0,
            player2: 0,
            draws: 0
        };

        this.initializeElements();
        this.attachEventListeners();
    }

    initializeElements() {
        this.homeScreen = document.getElementById('home-screen');
        this.waitingScreen = document.getElementById('waiting-screen');
        this.gameScreen = document.getElementById('game-screen');
        this.createGameBtn = document.getElementById('create-game');
        this.joinGameBtn = document.getElementById('join-game');
        this.gameCodeInput = document.getElementById('game-code-input');
        this.gameCodeDisplay = document.getElementById('game-code-display');
        this.gameBoard = document.getElementById('game-board');
        this.player1 = document.getElementById('player1');
        this.player2 = document.getElementById('player2');
        this.playerNameInput = document.getElementById('player-name-input');
        this.themeToggle = document.getElementById('theme-toggle');
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
    }

    attachEventListeners() {
        this.createGameBtn.addEventListener('click', () => this.createGame());
        this.joinGameBtn.addEventListener('click', () => this.joinGame());
    }

    showScreen(screenId) {
        [this.homeScreen, this.waitingScreen, this.gameScreen].forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    }

    async createGame() {
        try {
            const playerName = this.playerNameInput.value.trim();
            if (!playerName) {
                this.showPopup('Error', 'Please enter your name');
                return;
            }

            this.gameId = Math.random().toString(36).substring(2, 8);
            this.playerId = 'player1';
            this.playerSymbol = 'X';

            const gameData = {
                status: 'waiting',
                players: {
                    player1: {
                        name: playerName,
                        symbol: 'X'
                    }
                },
                board: Array(9).fill(''),
                currentTurn: 'player1',
                scores: this.scores
            };

            await set(ref(db, `games/${this.gameId}`), gameData);
            this.gameCodeDisplay.textContent = this.gameId;
            this.showScreen('waiting-screen');
            this.setupGameListener();
        } catch (error) {
            console.error('Error creating game:', error);
            this.showPopup('Error', 'Failed to create game');
        }
    }

    async joinGame() {
        try {
            const playerName = this.playerNameInput.value.trim();
            if (!playerName) {
                this.showPopup('Error', 'Please enter your name');
                return;
            }

            const gameId = this.gameCodeInput.value.trim();
            if (!gameId) {
                this.showPopup('Error', 'Please enter game code');
                return;
            }

            const snapshot = await get(ref(db, `games/${gameId}`));
            if (!snapshot.exists()) {
                this.showPopup('Error', 'Game not found');
                return;
            }

            const game = snapshot.val();
            if (game.status !== 'waiting') {
                this.showPopup('Error', 'Game already started');
                return;
            }

            this.gameId = gameId;
            this.playerId = 'player2';
            this.playerSymbol = 'O';

            await set(ref(db, `games/${gameId}`), {
                ...game,
                status: 'playing',
                players: {
                    ...game.players,
                    player2: {
                        name: playerName,
                        symbol: 'O'
                    }
                }
            });

            this.showScreen('game-screen');
            this.setupGameListener();
        } catch (error) {
            console.error('Error joining game:', error);
            this.showPopup('Error', 'Failed to join game');
        }
    }

    setupGameListener() {
        onValue(ref(db, `games/${this.gameId}`), (snapshot) => {
            const game = snapshot.val();
            if (!game) return;

            this.gameState = game;

            if (game.scores) {
                this.scores = game.scores;
                this.updateScores();
            }

            if (game.status === 'playing' && this.waitingScreen.classList.contains('active')) {
                this.showScreen('game-screen');
            }

            this.updateBoard();
            this.updatePlayers();
        });
    }

    updateBoard() {
        this.gameBoard.innerHTML = '';
        this.gameState.board.forEach((value, index) => {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.textContent = value;
            cell.addEventListener('click', () => this.makeMove(index));
            this.gameBoard.appendChild(cell);
        });
    }

    updatePlayers() {
        if (!this.gameState) return;

        const isPlayer1Turn = this.gameState.currentTurn === 'player1';
        this.player1.classList.toggle('active', isPlayer1Turn);
        this.player2.classList.toggle('active', !isPlayer1Turn);

        this.isMyTurn = this.gameState.currentTurn === this.playerId;

        const player1Name = this.gameState.players.player1.name;
        const player2Name = this.gameState.players.player2?.name || 'Waiting...';

        this.player1.textContent = `${player1Name} (X)`;
        this.player2.textContent = `${player2Name} (O)`;
    }

    async makeMove(index) {
        if (!this.isMyTurn || !this.gameState || this.gameState.board[index] !== '') return;

        try {
            const newBoard = [...this.gameState.board];
            newBoard[index] = this.playerSymbol;

            await set(ref(db, `games/${this.gameId}`), {
                ...this.gameState,
                board: newBoard,
                currentTurn: this.playerId === 'player1' ? 'player2' : 'player1'
            });

            const winningLine = this.checkWin(newBoard, this.playerSymbol);
            if (winningLine) {
                this.highlightWinningCells(winningLine);
                this.scores[this.playerId]++;
                await this.updateGameWithScores();
                this.showPopup('Game Over', `${this.gameState.players[this.playerId].name} wins!`);
                return;
            }

            if (newBoard.every(cell => cell !== '')) {
                this.scores.draws++;
                await this.updateGameWithScores();
                this.showPopup('Game Over', "It's a draw!");
                return;
            }
        } catch (error) {
            console.error('Error making move:', error);
            this.showPopup('Error', 'Failed to make move');
        }
    }

    checkWin(board, symbol) {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];

        for (let line of lines) {
            if (line.every(index => board[index] === symbol)) {
                return line;
            }
        }
        return null;
    }

    highlightWinningCells(line) {
        const cells = this.gameBoard.getElementsByClassName('cell');
        line.forEach(index => {
            cells[index].classList.add('winning');
        });
    }

    showPopup(title, message) {
        const popup = document.getElementById('message-popup');
        const overlay = document.querySelector('.popup-overlay');
        const titleEl = document.getElementById('popup-title');
        const messageEl = document.getElementById('popup-message');
        const button = document.getElementById('popup-button');

        titleEl.textContent = title;
        messageEl.textContent = message;

        if (title === 'Game Over') {
            button.textContent = 'New Match';
            button.onclick = async () => {
                try {
                    await set(ref(db, `games/${this.gameId}`), {
                        ...this.gameState,
                        status: 'playing',
                        board: Array(9).fill(''),
                        currentTurn: 'player1',
                        scores: this.scores
                    });

                    const cells = this.gameBoard.getElementsByClassName('cell');
                    Array.from(cells).forEach(cell => {
                        cell.classList.remove('winning');
                    });

                    popup.classList.remove('active');
                    overlay.classList.remove('active');
                } catch (error) {
                    console.error('Error starting new match:', error);
                    messageEl.textContent = 'Failed to start new match. Please try again.';
                }
            };
        } else {
            button.textContent = 'OK';
            button.onclick = () => {
                popup.classList.remove('active');
                overlay.classList.remove('active');
            };
        }

        popup.classList.add('active');
        overlay.classList.add('active');
    }

    updateScores() {
        document.getElementById('player1-score').textContent = this.scores.player1;
        document.getElementById('player2-score').textContent = this.scores.player2;
        document.getElementById('draws-score').textContent = this.scores.draws;
        document.getElementById('total-games').textContent =
            this.scores.player1 + this.scores.player2 + this.scores.draws;
    }

    async updateGameWithScores() {
        await set(ref(db, `games/${this.gameId}/scores`), this.scores);
        this.updateScores();
    }

    toggleTheme() {
        const root = document.documentElement;
        const isLight = root.getAttribute('data-theme') === 'light';

        if (isLight) {
            root.removeAttribute('data-theme');
            this.themeToggle.textContent = '☀️';
        } else {
            root.setAttribute('data-theme', 'light');
            this.themeToggle.textContent = '🌙';
        }
    }
}

const game = new TicTacToe();
