import React, { useState, useRef } from "react";
import FileInput from "./FileInput";
import ImagePreview from "./ImagePreview";
import styles from "./uploaderStyles";

// onUploadRequestをpropsで受け取る
const ImageUploader = ({ onUploadRequest }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileChange = (file) => {
        setSelectedFile(file);
    };

    const handleUploadClick = () => {
        if (selectedFile) {
            onUploadRequest(selectedFile); // 親から渡された関数を実行
            setSelectedFile(null); // ファイル選択をリセット
        }
    };

    const handleSelectButtonClick = () => {
        fileInputRef.current.click();
    };

    return (
        <div style={styles.container}>
            <FileInput ref={fileInputRef} onFileChange={handleFileChange} />
            <div style={styles.topCenter}>
                {!selectedFile && (
                    <button onClick={handleSelectButtonClick} style={styles.uploadButton}>
                        写真をアップロード
                    </button>
                )}
                <ImagePreview file={selectedFile} onUpload={handleUploadClick} styles={styles} />
            </div>
        </div>
    );
};

export default ImageUploader;
