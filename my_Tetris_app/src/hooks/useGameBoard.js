import { useState, useEffect, useCallback, useRef } from "react";

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

// 盤面サイズは定数で一元管理
const BOARD_ROWS = 5;
const BOARD_COLS = 4;

// 空の初期盤面を生成する関数
const createEmptyBoard = () => Array.from({ length: BOARD_ROWS }, () => Array(BOARD_COLS).fill(-1));

export const useGameBoard = () => {
    const [boardData, setBoardData] = useState(createEmptyBoard());
    const [imageCache, setImageCache] = useState(new Map());
    const [currentMino, setCurrentMino] = useState(null);
    // ゲームステータスなど、将来的に追加する状態

    // ▼ 新しいstateを追加
    // ゲームの終了状態を管理 (例: 'playing', 'gameover')
    const [gameStatus, setGameStatus] = useState("tttt");
    // どの方向に移動可能かを管理
    const [movable, setMovable] = useState({ left: true, right: true, down: true });

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
                        currentMino: currentMino,
                    }),
                });

                if (!response.ok) {
                    throw new Error(`API Error: ${response.statusText}`);
                }

                const result = await response.json();
                console.log("✅ Lambdaからのレスポンス:", result);

                // Lambdaからのレスポンスを元にstateを更新！
                setBoardData(result.board);
                setCurrentMino(result.currentMino);
                setMovable(result.canmove);

                // サーバーからの gameStatus を反映
                setGameStatus(result.gameStatus);
            } catch (error) {
                console.error("ゲーム状態の更新に失敗しました:", error);
                alert("サーバーとの通信に失敗しました。");
            }
        },
        [boardData, currentMino]
    ); // 依存配列にboardDataとcurrentMinoを追加

    // ▼ 2. useRefを使って、常に最新の関数を保持します
    const fetchGameStateRef = useRef(fetchGameState);
    useEffect(() => {
        fetchGameStateRef.current = fetchGameState;
    }); // 依存配列なし

    // ▼ 3. gameStatusを監視し、自動リクエストを送信するuseEffect
    useEffect(() => {
        if (gameStatus === "check" || gameStatus === "normalize") {
            console.log(`⚙️ 自動アクション: ${gameStatus} を実行します`);
            const timer = setTimeout(() => {
                // ref経由で最新の関数を呼び出す
                fetchGameStateRef.current(gameStatus);
            }, 50); // わずかな遅延でstate更新を確実にする
            return () => clearTimeout(timer);
        }
        if (gameStatus === "gameover") {
            alert("ゲームオーバー！");
            setMovable({ left: false, right: false, down: false });
        }
    }, [gameStatus]); // 依存配列はgameStatusのみ

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

        const rows = BOARD_ROWS;
        const cols = BOARD_COLS;
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
            minoId: "test-mino-T",
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
        setCurrentMino(testMinoShape);

        alert("テストミノを出現させました！");
    }, [addNewImagesToCache]); // 依存配列にaddNewImagesToCacheを追加

    // コンポーネントが最初に表示された時に一度だけゲーム状態を取得;
    useEffect(() => {
        // fetchGameState('start'); // 例えば'start'アクションで初期盤面を取得
        console.log("ゲームボードの初期化");
    }, []);

    // このフックが提供する値と関数を返す
    return {
        boardData,
        imageCache,
        currentMino,
        gameStatus, // gameStatusをエクスポート
        movable,
        fetchGameState, // ダミー
        // テスト用の関数を追加
        fetchAndCacheSquares,
        displayImagesOnBoard,
        spawnTestMino,
    };
};
