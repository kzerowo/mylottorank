"use client";

export default function LottoRow({
  game,
  gameIndex,
  games,
  setGames,
  removeGame,
  generateRandomNumbers,
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
      <div className="flex gap-2 flex-wrap">
        {game.map((num, numberIndex) => (
          <input
            key={numberIndex}
            type="text"
            value={num}
            maxLength={2}
            onChange={(e) =>
              handleNumberChange(gameIndex, numberIndex, e.target.value)
            }
            className="w-10 h-10 md:w-12 md:h-12 text-center border-2 border-gray-400 rounded-xl text-sm md:text-lg font-bold text-black bg-white"
          />
        ))}
      </div>

      <button
        onClick={() => generateRandomNumbers(gameIndex)}
        className="btnBase text-sm md:text-base px-3 py-1.5 md:px-4 md:py-2"
        style={{
          background: "#7c3aed",
          color: "white",
        }}
      >
        자동
      </button>

      <button
        onClick={() => removeGame(gameIndex)}
        className="btnBase text-sm md:text-base px-3 py-1.5 md:px-4 md:py-2"
        style={{
          background: "#ef4444",
          color: "white",
        }}
      >
        -
      </button>
    </div>
  );
}
