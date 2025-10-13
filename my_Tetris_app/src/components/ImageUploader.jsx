import React, { useState, useRef } from 'react';
// S3Client はそのまま使用
import { S3Client } from "@aws-sdk/client-s3";
// lib-storage から Upload をインポート
import { Upload } from "@aws-sdk/lib-storage";

// --- AWS設定 (ここに自分の情報を入力) ---
const s3Config = {
  region: 'REACT_APP_AWS_REGION', // 例: 'ap-northeast-1' (東京リージョン)
  credentials: {
    accessKeyId: 'REACT_APP_AWS_ACCESS_KEY_ID',       // ★ あなたのアクセスキーID
    secretAccessKey: 'REACT_APP_AWS_SECRET_ACCESS_KEY' // ★ あなたのシークレットアクセスキー
  }
};

const BUCKET_NAME = 'cc-tetris-images'; // ★ あなたのS3バケット名

// S3クライアントのインスタンスを作成
const s3Client = new S3Client(s3Config);
// --- AWS設定ここまで ---


const ImageUploader = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  // handleUploadClick関数を lib-storage を使うように変更
  const handleUploadClick = async () => {
    if (!selectedFile) {
      alert('画像ファイルを選択してください。');
      return;
    }
    
    try {
      // lib-storageのUpload機能を使ってアップロード処理を初期化
      const FOLDER_NAME = 'before_change/';
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

      alert('アップロード完了');
      setSelectedFile(null);

    } catch (error) {
      console.error('Upload failed:', error);
      alert(`アップロードに失敗しました: ${error.message}`);
    }
  };
  
  const handleSelectButtonClick = () => {
    fileInputRef.current.click();
  };

  return (
    // （...return以下のJSXとstylesオブジェクトは変更なし...）
    <div style={styles.container}>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        ref={fileInputRef}
        style={{ display: 'none' }}
      />
      <div style={styles.topCenter}>
        {!selectedFile && (
          <button onClick={handleSelectButtonClick} style={styles.uploadButton}>
            写真をアップロード
          </button>
        )}
        {selectedFile && (
          <div style={styles.previewContainer}>
            <p style={styles.fileName}>選択中のファイル: {selectedFile.name}</p>
            <button onClick={handleUploadClick} style={styles.uploadButton}>
              この画像をアップロードする
            </button>
          </div>
        )}
      </div>
      <div style={styles.centerLeft}>
        <button style={styles.arrowButton} onClick={() => alert('「←」がクリックされました')}>
          ←
        </button>
      </div>
      <div style={styles.centerRight}>
        <button style={styles.arrowButton} onClick={() => alert('「→」がクリックされました')}>
          →
        </button>
      </div>
      <div style={styles.bottomCenter}>
        <button style={styles.arrowButton} onClick={() => alert('「↓」がクリックされました')}>
          ↓
        </button>
      </div>
    </div>
  );
};

// スタイルをまとめて定義
const styles = {
  // 親コンテナ：位置指定の基準にするため relative を設定
  container: {
    position: 'relative',
    minHeight: '100vh',
    width: '100%',
  },
  // 上部中央に配置するためのスタイル
  topCenter: {
    position: 'absolute',
    top: '1px',
    left: '150px',
    transform: 'translateX(-50%)',
  },
  // 中央左に配置するためのスタイル
  centerLeft: {
    position: 'absolute',
    bottom: '0px',
    left: '1px',
    transform: 'translateY(-50%)',
  },
  // 中央右に配置するためのスタイル
  centerRight: {
    position: 'absolute',
    bottom: '0px',
    left: '232px',
    transform: 'translateY(-50%)',
  },
  // 下部中央に配置するためのスタイル
  bottomCenter: {
    position: 'absolute',
    bottom: '32px',
    left: '145px',
    transform: 'translateX(-50%)',
  },
  // 元々のアップロードボタンのスタイル
  uploadButton: {
    padding: '12px 24px',
    fontSize: '16px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#007bff',
    color: 'white',
    cursor: 'pointer',
    width: '90%',
    minWidth: '150px', // 最小幅を設定してテキストが見切れないようにする
    maxWidth: '400px',
    lineHeight: '1.5',
    whiteSpace: 'nowrap',
  },
  // 新しい矢印ボタン用のスタイル
  arrowButton: {
    width: '60px',
    height: '60px',
    borderRadius: '50%', // 円形にする
    border: 'none',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // 半透明の黒
    color: 'white',
    fontSize: '24px',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  },
  fileName: {
    marginBottom: '16px',
    color: '#333',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: '8px',
    borderRadius: '4px',
    wordBreak: 'break-all',
  }
};

export default ImageUploader;