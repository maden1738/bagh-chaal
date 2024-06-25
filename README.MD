# Baghchal

Bagh-chaal is a strategic, two-player board game that originated in Nepal. The game is asymmetric in that one player controls four tigers and the other player controls up to twenty goats. The tigers 'hunt' the goats while the goats attempt to block the tigers' movements. In this project, game can be played in **two-player mode** or **against computer**

This repository is a Vite project configured with TypeScript. Follow the instructions below to clone and run the project.

## Prerequisites

Before you begin, ensure you have the following installed on your local machine:

-    [Node.js](https://nodejs.org/en/) (version 14 or higher)
-    [npm](https://www.npmjs.com/) (Node package manager, comes with Node.js)

## Getting Started

### 1. Clone the Repository

Clone the repository to your local machine using the following command:

```bash
git clone https://github.com/maden1738/bagh-chaal.git
```

### 2. Navigate to the Project Directory

Move into the project directory:

```bash
cd bagh-chaal
```

### 3. Install Dependencies

Install the required dependencies using npm:

```bash
npm install
```

### 4. Run the development server

Start the Vite development server:

```bash
npm run dev
```

By default, the development server will start at http://localhost:5173. Open this URL in your browser to view the project.

## Folder Structure

Here’s a brief overview of the project structure:

```

├── index.html                    # main HTML file
├── package-lock.json             # dependency integrity and version control.
├── package.json                  # npm configuration
├── public                        # static assets
│   ├── board.png
│   └── placementAudio.mp3
├── src                           # source files
│   ├── assets                    # image assets
│   │   ├── goat.png
│   │   └── tiger.png
│   ├── classes                   # classes folder
│   │   ├── Board.ts              # Board class
│   │   ├── Game.ts               # Game class
│   │   ├── Move.ts               # Move class
│   │   └── Player.ts             # Player class
│   ├── constants.ts              # constant values
│   ├── elements.ts               # element selectors
│   ├── main.ts                   # entry point
│   ├── style.css                 # CSS file
│   ├── utils                     # utilitie folder
│   │   ├── calcNumCells.ts
│   └── vite-env.d.ts             # TypeScript declaration file for Vite
└── tsconfig.json                 # TypeScript configuration

```

## Game-overview

![Bagh-chaal gameplay!](/src/assets/game-ss.png)

The computer calculates best possible move using **minimax** algorithm with **alpha-beta pruning**.

## General Rules

1. The game board is a grid of intersecting orthogonal and diagonal lines upon which pieces are placed.
2. There are 25 intersections in the board where game pieces can be placed.
3. The pieces move along the lines to adjacent intersections; one intersection at a time.
4. Tiger can move two intersections when jumping a goat over to an empty intersection.
5. All 4 Tigers start at corner positions.
6. Goats play in two phases. In 1st phase: All 20 goats must be placed turn by turn into the board. In 2nd phase: Goats move after all 20 have been placed on the board. Players alternate their moves.

## Rules for Tigers

1. The goal of the tigers is to capture five goats by jumping over them.
2. They can start capturing goats any moment after the match has started.
3. They can capture only one goat at a time.
4. A tiger cannot jump over another tiger. A tiger can only jump over one goat.
5. Tiger can jump over a goat in any direction, but it must be to an adjacent intersection following the lines drawn on the board.
6. A tiger cannot jump over a corner position goat piece.

## Winning Rules

1. Tigers win when they capture 5 goats.
2. Goats win when they block all possible legal moves of the tigers.
3. Tigers win when they block all possible legal moves of the goats (called Locked Goats)
