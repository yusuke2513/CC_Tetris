import { useState, useEffect, useCallback, useRef } from "react";

// .envファイルから定数を読み込む
const S3_BUCKET_NAME = import.meta.env.VITE_S3_BUCKET_NAME;
const AWS_REGION = import.meta.env.VITE_AWS_REGION;
const PROCESSED_SQUARES_FOLDER = import.meta.env.VITE_S3_PROCESSED_SQUARES_FOLDER;
const PROCESS_IMAGE_API_ENDPOINT = import.meta.env.VITE_PROCESS_IMAGE_API_ENDPOINT;
const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT_URL;

// S3バケットのベースURLを組み立てる
const S3_BASE_URL = `https://${S3_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com`;

// 盤面サイズは定数で一元管理
const BOARD_ROWS = 10;
const BOARD_COLS = 6;

// 空の初期盤面を生成する関数
const createEmptyBoard = () => Array.from({ length: BOARD_ROWS }, () => Array(BOARD_COLS).fill(-1));
const createEmptyDirectionBoard = () => Array.from({ length: BOARD_ROWS }, () => Array(BOARD_COLS).fill(-1));

export const useGameBoard = () => {
    const [boardData, setBoardData] = useState(createEmptyBoard());
    const [directionData, setDirectionData] = useState(createEmptyDirectionBoard());
    const [imageCache, setImageCache] = useState(new Map());
    const [currentMino, setCurrentMino] = useState(null);
    const [gameStatus, setGameStatus] = useState("initial");
    const [movable, setMovable] = useState({ left: true, right: true, down: true, rotate_right: true, rotate_left: true });
    const [score, setScore] = useState(0);
    const [isLoading, setIsLoading] = useState(false); // ◀️ 1. ローディング用のstateを追加

    // ミノの座標系を変換するヘルパー関数
    const swapMinoCoordinates = (mino) => {
        // ミノが存在しない、またはblocksがなければそのまま返す
        if (!mino || !mino.blocks) {
            return mino;
        }

        // 各ブロックのxとyを入れ替える
        const swappedBlocks = mino.blocks.map(({ x, y, ...rest }) => ({
            x: y, // yをxに
            y: x, // xをyに
            ...rest,
        }));

        return { ...mino, blocks: swappedBlocks };
    };

    // Lambdaを呼び出してゲーム状態を更新する非同期関数
    const fetchGameState = useCallback(
        async (action, newMino = null) => {
            const minoToSend = action === "init" ? newMino : currentMino;

            if (!minoToSend) {
                console.log("操作対象のミノがありません。");
                return;
            }

            const backendMino = swapMinoCoordinates(minoToSend);

            try {
                const response = await fetch(API_ENDPOINT, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        action: action,
                        board: boardData,
                        currentMino: backendMino,
                        direction: directionData,
                        score: score,
                    }),
                });

                if (!response.ok) {
                    throw new Error(`API Error: ${response.statusText}`);
                }

                const result = await response.json();
                console.log("✅ Lambdaからのレスポンス:", result);

                const frontendMino = swapMinoCoordinates(result.currentMino);

                setBoardData(result.board);
                setCurrentMino(frontendMino);
                setMovable(result.canmove);
                setGameStatus(result.gameStatus);

                if (result.direction) {
                    setDirectionData(result.direction);
                }
                if (result.score !== undefined) {
                    setScore(result.score);
                }
            } catch (error) {
                console.error("ゲーム状態の更新に失敗しました:", error);
                alert("サーバーとの通信に失敗しました。");
            }
        },
        [boardData, currentMino, directionData, score]
    );

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
    );

    const uploadAndProcessImage = useCallback(
        async (file) => {
            if (!file) return;

            setIsLoading(true);

            const reader = new FileReader();
            reader.readAsDataURL(file);

            reader.onload = async () => {
                const base64Image = reader.result;
                try {
                    const processResponse = await fetch(PROCESS_IMAGE_API_ENDPOINT, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ image: base64Image }),
                    });

                    if (!processResponse.ok) {
                        throw new Error(`API Error: ${processResponse.statusText}`);
                    }

                    const result = await processResponse.json();
                    console.log("✅ 画像処理Lambdaからのレスポンス:", result);

                    if (result.minoJson) {
                        addNewImagesToCache(result.minoJson.blocks);
                        await fetchGameState("init", result.minoJson);
                        console.log("🚀 新しいミノを盤面にセットしました！");
                    }
                } catch (error) {
                    console.error("Upload and process failed:", error);
                    alert(`処理に失敗しました: ${error.message}`);
                } finally {
                    setIsLoading(false); // ◀️ 3. 成功・失敗に関わらず通信終了！ローディング画面を非表示
                }
            };

            reader.onerror = (error) => {
                console.error("File reading failed:", error);
                alert("ファイルの読み込みに失敗しました。");
                setIsLoading(false);
            };
        },
        [fetchGameState, addNewImagesToCache]
    );

    // gameStatusを監視し、自動リクエストを送信するuseEffect
    const fetchGameStateRef = useRef(fetchGameState);
    useEffect(() => {
        fetchGameStateRef.current = fetchGameState;
    }, [fetchGameState]);

    useEffect(() => {
        if (gameStatus === "check" || gameStatus === "normalize") {
            console.log(`⚙️ 自動アクション: ${gameStatus} を実行します`);
            const timer = setTimeout(() => {
                fetchGameStateRef.current(gameStatus);
            }, 50); // わずかな遅延
            return () => clearTimeout(timer);
        }
        if (gameStatus === "gameover") {
            alert("ゲームオーバー！");
            // 将来的に全ての操作を無効化するロジックをここに追加
        }
    }, [gameStatus]);

    // テスト用のミノを盤面に出現させる関数
    const spawnTestMino = useCallback(() => {
        // S3にある test_mino_T.json のようなデータをハードコードで用意
        const testMinoShape = {
            minoId: "test-mino-T",
            shapeType: "T",
            blocks: [
                { id: 101, x: 1, y: 0 },
                { id: 102, x: 0, y: 1 },
                { id: 103, x: 1, y: 1 },
                { id: 104, x: 2, y: 1 },
            ],
        };

        // ミノの画像がキャッシュになければ追加する
        addNewImagesToCache(testMinoShape.blocks);
        // Lambdaに "init" アクションを送信
        fetchGameState("init", testMinoShape);

        alert("テストミノを出現させました！");
    }, [addNewImagesToCache, fetchGameState]);

    // このフックが提供する値と関数を返す
    return {
        boardData,
        directionData,
        imageCache,
        currentMino,
        gameStatus,
        movable,
        score,
        isLoading,
        fetchGameState,
        uploadAndProcessImage,
        spawnTestMino,
    };
};
