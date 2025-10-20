import React from "react";

// 各マスのスタイル
const cellStyle = {
    width: "30px",
    height: "30px",
    border: "1px solid #555",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#333",
    color: "white",
    fontSize: "12px",
};

const GameBoard = ({ fieldData, directionData, imageCache }) => {
    // フィールド全体のスタイル
    const boardStyle = {
        display: "grid",
        // fieldData[0]が存在する場合にその長さを使い、列の数を動的に設定
        gridTemplateColumns: `repeat(${fieldData[0]?.length || 10}, 30px)`,
        border: "2px solid #777",
        backgroundColor: "#111",
    };

    const getRotationStyle = (directionValue) => {
        const degrees = (directionValue || 0) * 90;
        return {
            transform: `rotate(${degrees}deg)`,
            transition: "transform 0.2s ease-in-out", // スムーズな回転アニメーション（任意）
        };
    };

    return (
        <div style={boardStyle}>
            {fieldData.map((row, rowIndex) =>
                row.map((cellId, colIndex) => {
                    // キャッシュから画像URLを取得
                    const imageUrl = cellId !== -1 ? imageCache.get(cellId) : null;
                    const direction = directionData[rowIndex]?.[colIndex] ?? 0;
                    return (
                        <div key={`${rowIndex}-${colIndex}`} style={cellStyle}>
                            {imageUrl && <img src={imageUrl} alt={`block-${cellId}`} style={{ width: "100%", height: "100%", ...getRotationStyle(direction), display: "block" }} />}
                        </div>
                    );
                })
            )}
        </div>
    );
};

export default GameBoard;
