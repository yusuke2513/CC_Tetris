import { useState, useEffect, useCallback } from "react";

import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

// .envファイルから定数を読み込む
const S3_BUCKET_NAME = import.meta.env.VITE_S3_BUCKET_NAME;
const AWS_REGION = import.meta.env.VITE_AWS_REGION;
const AWS_ACCESS_KEY_ID = import.meta.env.VITE_AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = import.meta.env.VITE_AWS_SECRET_ACCESS_KEY;
const PROCESSED_SQUARES_FOLDER = import.meta.env.VITE_S3_PROCESSED_SQUARES_FOLDER;

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT_URL;

// S3バケットのベースURLを組み立てる
const S3_BASE_URL = `https://${S3_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com`;

// S3クライアントの設定
const s3Config = {
    region: AWS_REGION,
    credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
    },
};
const s3Client = new S3Client(s3Config);

// 空の初期盤面を生成する関数
const createEmptyBoard = () => Array(15).fill(Array(11).fill(-1));

export const useGameBoard = () => {
    const [boardData, setBoardData] = useState(createEmptyBoard());
    const [imageCache, setImageCache] = useState(new Map());
    const [currentMino, setCurrentMino] = useState(null);
    // ゲームステータスなど、将来的に追加する状態

    // 新しい画像IDを受け取り、キャッシュを更新する関数
    const addNewImagesToCache = useCallback(
        (blocks) => {
            if (!blocks || blocks.length === 0) return;

            const newCache = new Map(imageCache);
            let updated = false;
            blocks.forEach((block) => {
                if (!newCache.has(block.id)) {
                    const imageUrl = `${S3_BASE_URL}/${PROCESSED_SQUARES_FOLDER}${block.id}.png`;
                    newCache.set(block.id, imageUrl);
                    updated = true;
                }
            });

            if (updated) {
                setImageCache(newCache);
            }
        },
        [imageCache]
    ); // imageCacheが更新されたら関数を再生成

    // Lambdaを呼び出してゲーム状態を更新する非同期関数
    const fetchGameState = useCallback(
        async (move) => {
            if (!currentMino && move) {
                console.log("操作対象のミノがありません。");
                return;
            }

            try {
                const response = await fetch(API_ENDPOINT, {
                    // API GatewayのURL + ルート
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        action: move, // "left", "right", "down"
                        board: boardData, // 現在の盤面
                        currentMino: currentMino, // 現在のミノ情報
                    }),
                });

                if (!response.ok) {
                    throw new Error(`API Error: ${response.statusText}`);
                }

                const result = await response.json();

                // Lambdaからのレスポンスを元にstateを更新！
                setBoardData(result.board);
                setCurrentMino(result.currentMino);
                // setGameStatus(result.status); // 必要に応じて
            } catch (error) {
                console.error("ゲーム状態の更新に失敗しました:", error);
                alert("サーバーとの通信に失敗しました。");
            }
        },
        [boardData, currentMino]
    ); // 依存配列にboardDataとcurrentMinoを追加

    const fetchAndCacheSquares = useCallback(async () => {
        try {
            const command = new ListObjectsV2Command({
                Bucket: S3_BUCKET_NAME,
                Prefix: PROCESSED_SQUARES_FOLDER,
            });

            const response = await s3Client.send(command);
            const contents = response.Contents || [];

            const newCache = new Map(imageCache);
            const fetchedIds = [];

            contents.forEach((item) => {
                // フォルダ自体はスキップ
                if (item.Key === PROCESSED_SQUARES_FOLDER) return;

                // ファイル名からIDを抽出 (例: "processed_squares/101.png" -> "101")
                const id = parseInt(item.Key.split("/").pop().split(".")[0]);

                if (!isNaN(id) && !newCache.has(id)) {
                    const imageUrl = `${S3_BASE_URL}/${item.Key}`;
                    newCache.set(id, imageUrl);
                    fetchedIds.push(id);
                }
            });

            if (fetchedIds.length > 0) {
                setImageCache(newCache);
                alert(`${fetchedIds.length}件の画像をキャッシュしました！`);
                return fetchedIds; // 取得したIDのリストを返す
            } else {
                alert("新しい画像は見つかりませんでした。");
                return [];
            }
        } catch (error) {
            console.error("S3からの画像一覧取得に失敗しました:", error);
            alert(`エラー: ${error.message}`);
            return [];
        }
    }, [imageCache]);

    // 2. キャッシュした画像IDを使って盤面に表示する関数
    const displayImagesOnBoard = useCallback((ids) => {
        if (!ids || ids.length === 0) return;

        const rows = 15;
        const cols = 11;
        const newBoard = Array.from({ length: rows }, () => Array(cols).fill(-1));

        let currentIdIndex = 0;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (currentIdIndex < ids.length) {
                    newBoard[r][c] = ids[currentIdIndex];
                    currentIdIndex++;
                } else {
                    break;
                }
            }
            if (currentIdIndex >= ids.length) break;
        }

        setBoardData(newBoard);
        alert("キャッシュした画像盤面に表示しました。");
    }, []);

    // テスト用のミノを盤面に出現させる関数
    const spawnTestMino = useCallback(() => {
        // S3にある test_mino_T.json のようなデータをハードコードで用意
        const testMinoShape = {
            minoId: "test-mino-T-01",
            blocks: [
                { id: 101, x: 1, y: 0 },
                { id: 102, x: 0, y: 1 },
                { id: 103, x: 1, y: 1 },
                { id: 104, x: 2, y: 1 },
            ],
        };

        // ミノの画像がキャッシュになければ追加する
        addNewImagesToCache(testMinoShape.blocks);

        // stateを更新して、ミノを盤面の上部中央に配置する
        setCurrentMino({
            shapeInfo: testMinoShape, // ミノの形やIDの情報
            x: 4, // 盤面上のX座標 (中央)
            y: 0, // 盤面上のY座標 (一番上)
        });

        alert("テストミノを出現させました！");
    }, [addNewImagesToCache]); // 依存配列にaddNewImagesToCacheを追加

    // コンポーネントが最初に表示された時に一度だけゲーム状態を取得
    useEffect(() => {
        // fetchGameState('start'); // 例えば'start'アクションで初期盤面を取得
        console.log("ゲームボードの初期化");
    }, []);

    // このフックが提供する値と関数を返す
    return {
        boardData,
        imageCache,
        currentMino,
        fetchGameState, // ダミー
        // テスト用の関数を追加
        fetchAndCacheSquares,
        displayImagesOnBoard,
        spawnTestMino,
    };
};
