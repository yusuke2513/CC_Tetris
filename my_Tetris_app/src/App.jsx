import React from "react";
import ImageUploader from "./components/ImageUploader";
import GameBoard from "./components/GameBoard";
import ArrowControls from "./components/ArrowControls";
import LoadingScreen from "./components/LoadingScreen";
import styles from "./components/uploaderStyles";
import { useGameBoard } from "./hooks/useGameBoard";
import ccdragonLogo from "./assets/ccdragon_logo.png";
import CCTETRISlogo from "./assets/CCTETRIS_logo.png";

function App() {
    // カスタムフックから必要な状態と関数のみを取得
    const { boardData, directionData, imageCache, movable, gameStatus, score, isLoading, fetchGameState, uploadAndProcessImage, spawnTestMino } = useGameBoard();

    // アップロードボタンの有効/無効を判定
    const isUploadAllowed = movable.upload || gameStatus === "initial";

    return (
        <div
            style={{
                ...styles.appContainer, // 既存のスタイルを維持
                margin: "0 auto", // 左右の余白を自動調整して中央寄せ
                maxWidth: "600px", // コンテナの最大幅を指定（お好みで調整）
                padding: "20px", // 内側の余白
            }}
        >
            {isLoading && <LoadingScreen />} {/* ◀️ 3. isLoadingがtrueの時だけ表示 */}
            {/* 画像アップロードコンポーネント */}
            <ImageUploader onUploadRequest={uploadAndProcessImage} isUploadAllowed={isUploadAllowed} />
            {/* --- スコア表示を追加 --- */}
            <div style={{ margin: "20px", textAlign: "center", fontSize: "24px", fontWeight: "bold" }}>SCORE: {score}</div>
            <div style={{ margin: "10px", textAlign: "center" }}>
                <button onClick={spawnTestMino} style={{ ...styles.uploadButton, backgroundColor: "#FF9800" }}>
                    テストミノ出現 (Debug)
                </button>
            </div>
            {/* ゲーム盤面コンポーネント */}
            <div style={styles.gameAreaWrapper}>
                {/* 盤面 */}
                <GameBoard fieldData={boardData} imageCache={imageCache} directionData={directionData} />

                {/* ロゴ画像をラッパーの中に移動 */}
                <img src={ccdragonLogo} alt="CCDRAGON Logo" style={styles.logoImage} />
                <img src={CCTETRISlogo} alt="CCTETRIS Logo" style={styles.logoImage2} />
            </div>
            {/* 操作ボタンコンポーネント */}
            <ArrowControls
                onLeft={() => fetchGameState("left")}
                onRight={() => fetchGameState("right")}
                onDown={() => fetchGameState("down")}
                // ★ ここからが追加部分
                onRotateLeft={() => fetchGameState("rotate_left")}
                onRotateRight={() => fetchGameState("rotate_right")}
                // ★ ここまで
                movable={movable}
                styles={styles}
            />
        </div>
    );
}

export default App;
