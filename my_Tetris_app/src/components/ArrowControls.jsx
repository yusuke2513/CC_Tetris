import React from "react";

// propsに "movable" を追加
const ArrowControls = ({ onLeft, onRight, onDown, movable, styles }) => {
    // movableが未定義の場合のエラーを防ぐためのデフォルト値
    const canMove = movable || { left: false, right: false, down: false };

    // 無効時のスタイルを定義
    const disabledStyle = {
        backgroundColor: "#cccccc", // グレーアウト
        cursor: "not-allowed", // マウスカーソルを変更
    };

    return (
        <div>
            <div style={styles.controlsWrapper}>
                {/* --- 左ボタン --- */}
                <button
                    // canMove.leftがfalseの時に無効化
                    disabled={!canMove.left}
                    // 有効/無効に応じてスタイルを切り替え
                    style={canMove.left ? styles.arrowButton : { ...styles.arrowButton, ...disabledStyle }}
                    onClick={onLeft}
                >
                    ←
                </button>

                {/* --- 右ボタン --- */}
                <button
                    // canMove.rightがfalseの時に無効化
                    disabled={!canMove.right}
                    // 有効/無効に応じてスタイルを切り替え
                    style={canMove.right ? styles.arrowButton : { ...styles.arrowButton, ...disabledStyle }}
                    onClick={onRight}
                >
                    →
                </button>
            </div>

            <div style={styles.controlsBottom}>
                {/* --- 下ボタン --- */}
                <button
                    // canMove.downがfalseの時に無効化
                    disabled={!canMove.down}
                    // 有効/無効に応じてスタイルを切り替え
                    style={canMove.down ? styles.arrowButton : { ...styles.arrowButton, ...disabledStyle }}
                    onClick={onDown}
                >
                    ↓
                </button>
            </div>
        </div>
    );
};

export default ArrowControls;
