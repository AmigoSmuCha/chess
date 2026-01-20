# Michael Chess
## The Concept: "Infinite Learning"

Unlike a standard chess interface, this project is a **self-learning ecosystem**. It uses **Stockfish** to simulate Computer vs. Computer (CvC) matches. 

The core idea is the **Hive Mind Memory**:
* Every move calculated at **Depth 32** is not forgotten.
* The result is stored in `brain.js`.
* Over time, the simulation stops "thinking" and starts "remembering," making the bots effectively invincible for all cached positions.

## 🚀 Unique Features

* **🤖 Automated CvC Evolution:** Leave it running in the background. The bots will play infinitely, constantly expanding the `brain.js` database.
* **🎮 Human "Chaos" Factor:** At any point, you can pause the simulation, take control of one side, and make a manual move. See if the bot can adapt to your strategy or if it already has a "perfect" response in its memory.
* **⚡ Zero-Latency Recall:** If a position is in the "brain", the move is executed instantly without any CPU load.

## 🛠️ Setup & Local Installation

To get the Hive Mind running on your machine, follow these steps:

1.  **Clone the Repository:**
    ```bash
    git clone [https://github.com/AmigoSmuCha/chess.git](https://github.com/AmigoSmuCha/chess.git)
    cd chess/cviceni/chess_project
    ```

2.  **Add the Engine (Crucial):**
    The Stockfish engine is too heavy for Git, so you need to provide it manually:
    * Download Stockfish from [stockfishchess.org](https://stockfishchess.org/download/).
    * Place the executable into the `cviceni/chess_project/` folder.
    * Rename it to `stockfish` (Linux/Mac) or `stockfish.exe` (Windows).

3.  **Launch:**
    Open `index.html` in your browser (Chrome or Edge recommended for best JS performance).

## 📊 Recommended Specifications

Running Stockfish at **Depth 32** in a browser is heavy. To build the "brain" efficiently, we recommend:

| Hardware | Requirement |
| :--- | :--- |
| **CPU** | **High Priority:** 8-Core+ (Ryzen 7 / i7) with AVX2 support. |
| **Memory** | **8 GB RAM** minimum for large hash tables. |
| **Storage** | **SSD** is highly recommended for frequent JSON I/O operations. |

## 🤝 Community Brain
Do you have a `brain.js` file with thousands of Depth 32 moves? I'd love to merge it! Feel free to open a Pull Request with your learned data so we can build a truly global chess memory.

---
*Created by [AmigoSmuCha](https://github.com/AmigoSmuCha)*
