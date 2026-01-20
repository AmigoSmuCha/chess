# [NÁZEV TVÉHO PROJEKTU]

> A high-performance, self-learning web-based chess arena where computers battle at high depths, and you can intervene at any moment.

![Project Screenshot](path/to/screenshot.png) ## ♟️ About The Project

This is an HTML/JS based chess interface designed for **Computer vs. Computer (CvC)** simulation and analysis. Unlike standard chess bots, this system is designed to build a persistent memory of "perfect moves".

The system runs matches in the background using the **Stockfish** engine. Every time a best move is calculated at **Depth 32**, it is stored in `brain.js`. Over time, the system builds a massive library of pre-calculated moves, allowing for instant playback of complex lines without recalculation.

### ✨ Key Features

* **🤖 CvC Automation:** Infinite Computer vs. Computer matches.
* **🧠 Hive Mind Memory:** Moves calculated at Depth 32 are cached in `brain.js`. The engine gets faster and "smarter" the longer it runs.
* **🎮 Human Intervention:** You can pause the bot at any time, take control, and play a move yourself. The bot will then resume from your new position.
* **⚡ Local Execution:** Runs entirely on your machine using your local hardware resources.

## 🛠️ Installation & Setup

Since this project relies on the powerful Stockfish engine, you need to manually add the engine executable to the project folder.

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/tvoje-jmeno/nazev-projektu.git](https://github.com/tvoje-jmeno/nazev-projektu.git)
    cd nazev-projektu
    ```

2.  **Download Stockfish:**
    Go to the [official Stockfish website](https://stockfishchess.org/download/) and download the version compatible with your OS (AVX2 version recommended for best performance).

3.  **Place the Engine:**
    * Extract the downloaded zip.
    * Rename the executable file to `stockfish` (or `stockfish.exe` on Windows).
    * Move the file into the root folder (or the `/engine` folder if one exists) of this project.

4.  **Run the Project:**
    Simply open `index.html` in your modern web browser.

## 📖 Usage Guide

### The "Brain" (Memory System)
The project utilizes `brain.js` as a JSON-based memory storage.
* **Learning:** When the engine calculates a move at **Depth 32**, it saves the FEN string and the best move to the file.
* **Recall:** If the current board position exists in `brain.js`, the engine plays the move *instantly* without using CPU power.
* **Background Play:** You can leave the tab open in the background. The bots will continue to play and populate the memory file.

### Intervening (Human Move)
1.  Watch the bots play.
2.  Click the **"Stop"** or **"Pause"** button.
3.  Drag and drop pieces to make your own move.
4.  Resume the game to see how the bot handles your disruption.

## 💻 Recommended Specifications

Calculating chess moves at **Depth 32** is computationally expensive. For the best experience (and to prevent your browser from lagging), the following specs are recommended:

| Component | Minimum | Recommended |
| :--- | :--- | :--- |
| **CPU** | Quad-Core (i5 / Ryzen 5) | 8-Core+ (i7 / Ryzen 7) with AVX2 support |
| **RAM** | 8 GB | 16 GB+ (Hash tables require memory) |
| **Browser** | Chrome / Firefox / Edge | Chromium-based browser (V8 engine) |
| **Storage** | HDD | SSD (For faster read/write of brain.js) |

## 🤝 Contributing

Contributions are welcome! If you have a `brain.js` file with a lot of pre-calculated Depth 32 moves, feel free to submit a Pull Request to merge our "brains".

## 📄 License

Distributed under the MIT License.
