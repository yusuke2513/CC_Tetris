import React, { useState, useRef } from "react";
import FileInput from "./FileInput";
import ImagePreview from "./ImagePreview";
import styles from "./uploaderStyles";

// onUploadRequestをpropsで受け取る
const ImageUploader = ({ onUploadRequest, isUploadAllowed }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileChange = (file) => {
        setSelectedFile(file);
    };

    const handleUploadClick = () => {
        if (selectedFile) {
            onUploadRequest(selectedFile); // Run the function from the parent
            setSelectedFile(null); // Reset file selection
        }
    };

    const handleSelectButtonClick = () => {
        fileInputRef.current.click();
    };

    const handleCancel = () => {
        setSelectedFile(null);
    };

    // 1. Create a style for the disabled state
    const disabledStyle = {
        backgroundColor: "#cccccc", // Gray out
        cursor: "not-allowed", // Change the mouse cursor
    };

    // 2. Determine the button's style based on 'isUploadAllowed'
    const buttonStyle = isUploadAllowed ? styles.uploadButton : { ...styles.uploadButton, ...disabledStyle };

    return (
        <div style={styles.container}>
            {/* The hidden file input also needs to be disabled */}
            <FileInput ref={fileInputRef} onFileChange={handleFileChange} disabled={!isUploadAllowed} />
            <div style={styles.topCenter}>
                {!selectedFile && (
                    <button
                        onClick={handleSelectButtonClick}
                        // 3. Apply the dynamic style and disabled attribute
                        style={buttonStyle}
                        disabled={!isUploadAllowed}
                    >
                        写真をアップロード
                    </button>
                )}
                <ImagePreview file={selectedFile} onUpload={handleUploadClick} onCancel={handleCancel} styles={styles} />
            </div>
        </div>
    );
};

export default ImageUploader;
