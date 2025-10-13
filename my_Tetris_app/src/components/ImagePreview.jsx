import React from "react";

const ImagePreview = ({ file, onUpload, styles }) => {
    if (!file) return null;

    return (
        <div style={styles.previewContainer}>
            <p style={styles.fileName}>選択中のファイル: {file.name}</p>
            <button onClick={onUpload} style={styles.uploadButton}>
                この画像をアップロードする
            </button>
        </div>
    );
};

export default ImagePreview;
