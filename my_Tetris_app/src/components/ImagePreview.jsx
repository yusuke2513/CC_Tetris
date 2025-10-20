import React from "react";

const ImagePreview = ({ file, onUpload, onCancel, styles }) => {
    if (!file) return null;

    return (
        <div style={styles.previewContainer}>
            <p style={styles.fileName}>選択中のファイル: {file.name}</p>
            <button onClick={onUpload} style={styles.uploadButton}>
                この画像をアップロードする
            </button>
            <button onClick={onCancel} style={{ ...styles.uploadButton, backgroundColor: "#6c757d" }}>
                キャンセル
            </button>
        </div>
    );
};

export default ImagePreview;
