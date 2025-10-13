import React from "react";
import ImageUploader from "./components/ImageUploader";
import GameBoard from "./components/GameBoard";
import ArrowControls from "./components/ArrowControls";
import styles from "./components/uploaderStyles";
import { useGameBoard } from "./hooks/useGameBoard";

function App() {
    // カスタムフックから状態と関数を取得
    const {
        boardData,
        imageCache,
        fetchGameState,
        fetchAndCacheSquares, // テスト用関数
        displayImagesOnBoard, // テスト用関数
        spawnTestMino,
    } = useGameBoard();

    // テスト用のボタンクリックハンドラ
    const handleCacheTestClick = async () => {
        const fetchedIds = await fetchAndCacheSquares();
        if (fetchedIds.length > 0) {
            displayImagesOnBoard(fetchedIds);
        }
    };

    return (
        <div style={styles.appContainer}>
            <ImageUploader />

            {/* --- ここからテスト用のボタンを追加 --- */}
            <div style={{ margin: "20px", display: "flex", gap: "10px", justifyContent: "center" }}>
                <button onClick={fetchAndCacheSquares} style={styles.uploadButton}>
                    (1) S3画像キャッシュ
                </button>
                <button onClick={() => displayImagesOnBoard(Array.from(imageCache.keys()))} style={styles.uploadButton}>
                    (2) キャッシュを表示
                </button>
                <button onClick={handleCacheTestClick} style={{ ...styles.uploadButton, backgroundColor: "#4CAF50" }}>
                    (一括) S3キャッシュ＆表示
                </button>
                <button onClick={spawnTestMino} style={{ ...styles.uploadButton, backgroundColor: "#FF9800" }}>
                    テストミノ出現
                </button>
            </div>
            {/* --- テスト用ボタンここまで --- */}

            <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
                <GameBoard fieldData={boardData} imageCache={imageCache} />
            </div>

            <ArrowControls onLeft={() => fetchGameState("left")} onRight={() => fetchGameState("right")} onDown={() => fetchGameState("down")} styles={styles} />
        </div>
    );
}

export default App;
