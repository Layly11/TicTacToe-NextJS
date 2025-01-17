This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# Tic Tac Toe Game (XO)

This project is a responsive web-based Tic Tac Toe game built using **React**, **Next.js**, and **Prisma** as the backend ORM. It supports dynamic board sizes, AI mode, and game history tracking with a database.

---

## Features
- Play Tic Tac Toe with customizable board sizes (3x3, 4x4, 5x5).
- Play against AI (Minimax algorithm with alpha-beta pruning).
- Game history tracking, including winners and replay options.
- Reset and view game state.
- Persistent storage of game data using Prisma and a database.

---

## Technologies Used
- **Frontend:** React, Next.js, TailwindCSS
- **Backend:** Next.js API routes, Prisma ORM
- **Database:** SQLite (or any database supported by Prisma)

---

## Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Layly11/TicTacToe-NextJS.git
   cd tic-tac-toe

2. **Install dependencies**
    ```bash
    npm install

 3. **Set up Prisma and the database:**
   - Update prisma/schema.prisma to configure your database.
   - Run the following commands to initialize the database:
       ```bash
       npx prisma migrate dev --name init
       npx prisma generate

   4. **Start the development server:**
       ```bash
       npm run dev
   5. **Access the application: Open your browser and navigate to http://localhost:3000.**


---

# How to Run

1. Start the application: Follow the setup instructions above to start the development server.
2. Play the game:
3. Select the board size (3x3, 4x4, 5x5).
4. Choose whether to play against AI or another player.
5. Click on the board cells to make your move.
6. View game history:
7. Click the "View History" button to see the game history.
8. Replay any game from the history.
9. Reset the game:
 10. Click the "Reset Game" button to start a new game.

---

# Design and Architecture

## Frontend
- Framework: React with Next.js
- State Management: React's useState and useEffect hooks.
- Components:
    - Home: Main page to select board size and AI mode.
     - TicTacToe: Handles the game logic and rendering the board.
   - GameHistory: Displays the history of completed games.
## Backend
- Framework: Next.js API Routes
- Endpoints:
    - POST /api/tictactoe: Initializes or resets the game board.
     - PUT /api/tictactoe: Handles moves and updates the game state.
   - GET /api/history: Fetches game history.
   - DELETE /api/history: Clears game history.
 
## Database Schema
- Tables:
   - Game: Stores game metadata (ID, board size, winner, etc.).
   - Move: Tracks individual moves made during each game.

 ---

 # Algorithm Explanation
## Minimax Algorithm with Alpha-Beta Pruning
The AI uses the Minimax algorithm to determine the optimal move. Alpha-beta pruning is applied to optimize performance by reducing the number of nodes evaluated in the decision tree.

**Key Steps:**
1. Minimax Function:
- Explores all possible moves recursively to simulate game outcomes.
- Scores each move based on the likelihood of winning.
- Returns the best move for the AI.

**Alpha-Beta Pruning:**

- Eliminates branches of the decision tree that cannot influence the final decision.
- Significantly improves performance, especially for larger board sizes.
**Scoring:**
- +10: AI (O) wins.
- -10: Player (X) wins.
- 0: Draw.

**Pseudocode:**
```bash
function minimax(board, depth, isMaximizingPlayer, alpha, beta):
    if gameOver(board):
        return evaluateBoard(board)

    if isMaximizingPlayer:
        maxEval = -Infinity
        for each possibleMove:
            makeMove(board, possibleMove)
            eval = minimax(board, depth + 1, false, alpha, beta)
            undoMove(board, possibleMove)
            maxEval = max(maxEval, eval)
            alpha = max(alpha, eval)
            if beta <= alpha:
                break
        return maxEval
    else:
        minEval = +Infinity
        for each possibleMove:
            makeMove(board, possibleMove)
            eval = minimax(board, depth + 1, true, alpha, beta)
            undoMove(board, possibleMove)
            minEval = min(minEval, eval)
            beta = min(beta, eval)
            if beta <= alpha:
                break
        return minEval



