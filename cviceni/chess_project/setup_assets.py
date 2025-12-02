import os
import urllib.request

# --- CONFIGURATION ---
# We define where we want the files and where to get them from.
ASSETS = [
    {
        "url": "https://code.jquery.com/jquery-3.5.1.min.js",
        "path": "static/js/jquery-3.5.1.min.js"
    },
    {
        "url": "https://cdnjs.cloudflare.com/ajax/libs/chess.js/0.10.3/chess.min.js",
        "path": "static/js/chess.js" # Renaming for simplicity
    },
    {
        "url": "https://unpkg.com/@chrisoakman/chessboardjs@1.0.0/dist/chessboard-1.0.0.min.js",
        "path": "static/js/chessboard-1.0.0.min.js"
    },
    {
        "url": "https://unpkg.com/@chrisoakman/chessboardjs@1.0.0/dist/chessboard-1.0.0.min.css",
        "path": "static/css/chessboard-1.0.0.min.css"
    }
]

def download_assets():
    print(">>> INITIALIZING ASSET DOWNLOADER...")
    
    # 1. Create Directories if they don't exist
    for folder in ["static/js", "static/css"]:
        if not os.path.exists(folder):
            os.makedirs(folder)
            print(f"[+] Created directory: {folder}")

    # 2. Download Files
    for asset in ASSETS:
        print(f"[*] Downloading {asset['path']}...")
        try:
            urllib.request.urlretrieve(asset['url'], asset['path'])
            print(f"    -> Success")
        except Exception as e:
            print(f"    [!] FAILED: {e}")

    print("\n>>> SETUP COMPLETE.")
    print("Note: Piece images are NOT included in this script.")
    print("To fix images, see the instructions below.")

if __name__ == "__main__":
    download_assets()
