import React, { useState, useRef } from "react";
// components
import FileInput from "./FileInput";
import ImagePreview from "./ImagePreview";
import styles from "./uploaderStyles";

// S3Client はそのまま使用
import { S3Client } from "@aws-sdk/client-s3";
// lib-storage から Upload をインポート
import { Upload } from "@aws-sdk/lib-storage";

// --- .envファイルから定数を読み込む ---
const AWS_REGION = import.meta.env.VITE_AWS_REGION;
const AWS_ACCESS_KEY_ID = import.meta.env.VITE_AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = import.meta.env.VITE_AWS_SECRET_ACCESS_KEY;
const BUCKET_NAME = import.meta.env.VITE_S3_BUCKET_NAME;

// --- AWS設定 ---
const s3Config = {
    region: AWS_REGION,
    credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
    },
};

// S3クライアントのインスタンスを作成
const s3Client = new S3Client(s3Config);
// --- AWS設定ここまで ---

const ImageUploader = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);

    // FileInput コンポーネントからファイルオブジェクトを受け取る
    const handleFileChange = (file) => {
        setSelectedFile(file);
    };

    // handleUploadClick関数を lib-storage を使うように変更
    const handleUploadClick = async () => {
        if (!selectedFile) {
            alert("画像ファイルを選択してください。");
            return;
        }

        try {
            // lib-storageのUpload機能を使ってアップロード処理を初期化
            const FOLDER_NAME = "before_change/";
            const uploader = new Upload({
                client: s3Client,
                params: {
                    Bucket: BUCKET_NAME,
                    Key: `${FOLDER_NAME}${Date.now()}_${selectedFile.name}`,
                    Body: selectedFile,
                    ContentType: selectedFile.type,
                },
            });

            // アップロードを実行
            await uploader.done();

            alert("アップロード完了");
            setSelectedFile(null);
        } catch (error) {
            console.error("Upload failed:", error);
            alert(`アップロードに失敗しました: ${error.message}`);
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

            {/* ArrowControls は App.jsx で表示するためここではレンダリングしない */}
        </div>
    );
};

export default ImageUploader;
