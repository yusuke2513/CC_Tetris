import React, { useState, useRef } from 'react';

const ImageUploader = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  // （...関数の部分は変更なし...）
  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUploadClick = async () => {
    if (!selectedFile) {
      alert('画像ファイルを選択してください。');
      return;
    }
    try {
      const res = await fetch('http://localhost:3001/get-presigned-url', {
        method: 'POST',
        body: JSON.stringify({ filename: selectedFile.name }),
        headers: { 'Content-Type': 'application/json' }
      });
      const { url } = await res.json();

      await fetch(url, {
        method: 'PUT',
        body: selectedFile,
        headers: { 'Content-Type': selectedFile.type }
      });

      alert('アップロード完了');
      setSelectedFile(null);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('アップロードに失敗しました。');
    }
  };
  
  const handleSelectButtonClick = () => {
    fileInputRef.current.click();
  };


  return (
    <div style={styles.container}>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        ref={fileInputRef}
        style={{ display: 'none' }}
      />

      {!selectedFile && (
        <button onClick={handleSelectButtonClick} style={styles.button}>
          写真を
          <br />
          アップロード
        </button>
      )}

      {selectedFile && (
        <div style={styles.previewContainer}>
          <p style={styles.fileName}>選択中のファイル: {selectedFile.name}</p>
          <button onClick={handleUploadClick} style={styles.button}>
            この画像をアップロードする
          </button>
        </div>
      )}
    </div>
  );
};

// スタイルをまとめて定義
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    minHeight: '100vh',
    paddingTop: '32px',
    width: '100%',
  },
  button: {
    padding: '12px 24px',
    fontSize: '16px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#007bff',
    color: 'white',
    cursor: 'pointer',
    width: '90%',
    maxWidth: '400px',
    lineHeight: '1.5',
    whiteSpace: 'nowrap', // ★ この一行を追加
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
    wordBreak: 'break-all',
    padding: '0 16px',
  }
};

export default ImageUploader;