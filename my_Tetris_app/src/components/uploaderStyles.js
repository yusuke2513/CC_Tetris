const styles = {
    // App 全体を中央揃えにするラッパー
    appContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        minHeight: "100vh",
        padding: "24px",
        boxSizing: "border-box",
    },
    // 親コンテナ：中央に配置され、縦に伸びすぎないようにする
    container: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        width: "100%",
        padding: "24px",
        boxSizing: "border-box",
    },
    // ImageUploader 内で上部エリアを使いたい場合の小さいラッパー
    topCenter: {
        display: "flex",
        justifyContent: "center",
        width: "100%",
        marginBottom: "12px",
    },
    // 中央左 / 中央右 / 下部中央 の絶対配置は App レベルで使わないようにするが
    // 必要なら個別にスタイルを調整できるよう残しておく（ただし非絶対）
    centerLeft: {
        display: "flex",
        justifyContent: "flex-start",
    },
    centerRight: {
        display: "flex",
        justifyContent: "flex-end",
    },
    bottomCenter: {
        display: "flex",
        justifyContent: "center",
    },
    // 元々のアップロードボタンのスタイル（レスポンシブ）
    uploadButton: {
        padding: "10px 20px",
        fontSize: "16px",
        borderRadius: "8px",
        border: "none",
        backgroundColor: "#007bff",
        color: "white",
        cursor: "pointer",
        width: "100%",
        maxWidth: "320px",
        lineHeight: "1.5",
        whiteSpace: "nowrap",
    },
    // 新しい矢印ボタン用のスタイル
    arrowButton: {
        width: "60px",
        height: "60px",
        borderRadius: "50%", // 円形にする
        border: "none",
        backgroundColor: "rgba(0, 0, 0, 0.5)", // 半透明の黒
        color: "white",
        fontSize: "24px",
        cursor: "pointer",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
    previewContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
    },
    fileName: {
        marginBottom: "16px",
        color: "#333",
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        padding: "8px",
        borderRadius: "4px",
        wordBreak: "break-all",
    },
    // フロー配置用の ArrowControls スタイル（App レベルで使用）
    controlsWrapper: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "24px",
        marginTop: "16px",
    },
    controlsBottom: {
        display: "flex",
        justifyContent: "center",
        marginTop: "8px",
    },
};

export default styles;
