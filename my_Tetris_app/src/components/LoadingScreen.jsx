// components/LoadingScreen.jsx

import React from "react";

const LoadingScreen = () => {
    // スタイル定義
    const overlayStyle = {
        position: "fixed", // 画面に固定
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.7)", // 半透明の黒い背景
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000, // 他の要素より手前に表示
        color: "white",
        fontSize: "2em",
        fontFamily: "sans-serif",
    };

    return (
        <div style={overlayStyle}>
            <p>通信中...</p>
        </div>
    );
};

export default LoadingScreen;
