"use client";

export default function LottoRow({
    game,
    gameIndex,
    games,
    setGames,
    removeGame,
    generateRandomNumbers
}) {

    const handleNumberChange = (gIndex, nIndex, value) => {
        // 숫자만 허용
        if (!/^\d*$/.test(value)) return;

        const newGames = [...games];
        newGames[gIndex][nIndex] = value;
        setGames(newGames);
    };

    return (
        <div className="flex items-center gap-3">
            <span className="w-10 text-right font-semibold text-gray-700">
                {gameIndex + 1}.
            </span>
            {/* 번호 6칸 */}
            <div className="flex gap-2">
                {game.map((num, numberIndex) => (
                    <input
                        key={numberIndex}
                        type="text"
                        value={num}
                        maxLength={2}
                        onChange={(e) =>
                            handleNumberChange(gameIndex, numberIndex, e.target.value)
                        }
                        className="w-12 h-12 text-center border-2 border-gray-400 rounded-xl text-lg font-bold text-black bg-white"
                    />
                ))}
            </div>

            <button
                onClick={() => generateRandomNumbers(gameIndex)}
                className="btnBase"
                style={{
                    background: "#7c3aed",
                    color: "white",
                    padding: "8px 16px"
                }}
            >
                자동
            </button>


            {/* 삭제 버튼 */}
            <button
                onClick={() => removeGame(gameIndex)}
                className="btnBase"
                style={{
                    background: "#ef4444",
                    color: "white",
                    padding: "8px 16px"
                }}
            >
                -
            </button>


        </div>
    );
}
