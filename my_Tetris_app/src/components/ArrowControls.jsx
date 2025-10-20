import React from "react";

// ★ 1. propsに onRotateLeft と onRotateRight を追加
const ArrowControls = ({ onLeft, onRight, onDown, onRotateLeft, onRotateRight, movable, styles }) => {
    // ★ 2. movableのデフォルト値に回転のプロパティを追加
    const canMove = movable || { left: false, right: false, down: false, rotateLeft: false, rotateRight: false };

    const disabledStyle = {
        backgroundColor: "#cccccc",
        cursor: "not-allowed",
    };

    return (
        <div>
            <div style={styles.controlsWrapper}>
                {/* --- 左回転ボタン (追加) --- */}
                <button disabled={!canMove.rotate_left} style={canMove.rotate_left ? styles.arrowButton : { ...styles.arrowButton, ...disabledStyle }} onClick={onRotateLeft}>
                    ↺
                </button>

                {/* --- 左ボタン --- */}
                <button disabled={!canMove.left} style={canMove.left ? styles.arrowButton : { ...styles.arrowButton, ...disabledStyle }} onClick={onLeft}>
                    ←
                </button>

                {/* --- 右ボタン --- */}
                <button disabled={!canMove.right} style={canMove.right ? styles.arrowButton : { ...styles.arrowButton, ...disabledStyle }} onClick={onRight}>
                    →
                </button>

                {/* --- 右回転ボタン (追加) --- */}
                <button disabled={!canMove.rotate_right} style={canMove.rotate_right ? styles.arrowButton : { ...styles.arrowButton, ...disabledStyle }} onClick={onRotateRight}>
                    ↻
                </button>
            </div>

            <div style={styles.controlsBottom}>
                {/* --- 下ボタン --- */}
                <button disabled={!canMove.down} style={canMove.down ? styles.arrowButton : { ...styles.arrowButton, ...disabledStyle }} onClick={onDown}>
                    ↓
                </button>
            </div>
        </div>
    );
};

export default ArrowControls;
