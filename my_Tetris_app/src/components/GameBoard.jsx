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

// 各IDに対応する色（将来的に画像に置き換える部分）
// const blockColors = {
//     0: "#333", // 空白
//     1: "#FF0000", // 赤
//     2: "#00FF00", // 緑
//     3: "#0000FF", // 青
//     4: "#FFFF00", // 黄
//     5: "#FF00FF", // マゼンタ
// };

const GameBoard = ({ fieldData, imageCache }) => {
    // フィールド全体のスタイル
    const boardStyle = {
        display: "grid",
        // fieldData[0]が存在する場合にその長さを使い、列の数を動的に設定
        gridTemplateColumns: `repeat(${fieldData[0]?.length || 10}, 30px)`,
        border: "2px solid #777",
        backgroundColor: "#111",
    };

    return (
        <div style={boardStyle}>
            {fieldData.map((row, rowIndex) =>
                row.map((cellId, colIndex) => {
                    // キャッシュから画像URLを取得
                    const imageUrl = cellId !== -1 ? imageCache.get(cellId) : null;
                    return (
                        <div key={`${rowIndex}-${colIndex}`} style={cellStyle}>
                            {imageUrl && <img src={imageUrl} alt={`block-${cellId}`} style={{ width: "100%", height: "100%", display: "block" }} />}
                        </div>
                    );
                })
            )}
        </div>
    );
};

export default GameBoard;
