"use client";
import { useState, useEffect } from "react";
import LottoRow from "./components/LottoRow";
import lottoData from "../data/lotto.json";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

//공 색깔
const getBallColor = (num) => {
  if (num <= 10) return "bg-yellow-400 text-black";
  if (num <= 20) return "bg-blue-500 text-white";
  if (num <= 30) return "bg-red-500 text-white";
  if (num <= 40) return "bg-gray-500 text-white";
  return "bg-green-500 text-white";
};

const formatMoney = (amount) => {
  return amount.toLocaleString() + "원";
};

export default function Home() {
  const lottoDB = lottoData;
  const [openTooltipIndex, setOpenTooltipIndex] = useState(null);

  // 랜덤 번호 생성
  const generateRandomNumbers = (gameIndex) => {
    const nums = new Set();

    while (nums.size < 6) {
      nums.add(Math.floor(Math.random() * 45) + 1);
    }

    const sorted = Array.from(nums).sort((a, b) => a - b);

    const newGames = [...games];
    newGames[gameIndex] = sorted.map((n) => String(n));
    setGames(newGames);
  };

  // 전체 랜덤 생성
  const generateAllRandom = () => {
    const newGames = [];

    for (let i = 0; i < games.length; i++) {
      const nums = new Set();

      while (nums.size < 6) {
        nums.add(Math.floor(Math.random() * 45) + 1);
      }

      const sorted = Array.from(nums).sort((a, b) => a - b);
      newGames.push(sorted.map((n) => String(n)));
    }

    setGames(newGames);
  };

  // 한 줄 = 로또 6개
  const [games, setGames] = useState([["", "", "", "", "", ""]]);

  const [results, setResults] = useState([]);

  useEffect(() => {
    const savedGames = localStorage.getItem("lottoGames");
    const savedResults = localStorage.getItem("lottoResults");

    if (savedGames) {
      setGames(JSON.parse(savedGames));
    }

    if (savedResults) {
      setResults(JSON.parse(savedResults));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("lottoGames", JSON.stringify(games));
  }, [games]);

  useEffect(() => {
    localStorage.setItem("lottoResults", JSON.stringify(results));
  }, [results]);

  // 줄 추가
  const addGame = () => {
    if (games.length >= 5) return;
    setGames([...games, ["", "", "", "", "", ""]]);
  };

  // 줄 삭제
  const removeGame = (index) => {
    const currentRow = games[index];

    // 1️⃣ 전부 빈칸인지 확인
    const isEmpty = currentRow.every((n) => n === "");

    // 2️⃣ 전부 빈칸이면 → 줄 삭제
    if (isEmpty) {
      if (games.length === 1) return; // 최소 1줄 유지
      const newGames = [...games];
      newGames.splice(index, 1);
      setGames(newGames);
    }
    // 3️⃣ 하나라도 입력되어 있으면 → 초기화
    else {
      const newGames = [...games];
      newGames[index] = ["", "", "", "", "", ""];
      setGames(newGames);
    }
  };

  // 결과 계산 함수
  const checkResult = () => {
    // ✅ 유효성 검사
    for (let i = 0; i < games.length; i++) {
      const row = games[i];

      if (row.some((n) => n === "")) {
        alert("번호를 모두 입력해주세요.");
        return;
      }

      const nums = row.map((n) => parseInt(n));

      if (nums.some((n) => n < 1 || n > 45)) {
        alert("번호는 1~45 사이여야 합니다.");
        return;
      }

      const unique = new Set(nums);
      if (unique.size !== 6) {
        alert("같은 번호를 중복 입력할 수 없습니다.");
        return;
      }
    }

    // ✅ 자동 오름차순 정렬
    const sortedGames = games.map((row) =>
      [...row]
        .map((n) => parseInt(n))
        .sort((a, b) => a - b)
        .map((n) => String(n)),
    );

    setGames(sortedGames);

    const newResults = [];

    sortedGames.forEach((numbers) => {
      const userNums = numbers.map((n) => parseInt(n));

      let bestRank = 6;
      let bestRounds = [];

      // 🔎 전체 회차 탐색
      lottoDB.forEach((draw) => {
        let matchCount = 0;

        draw.numbers.forEach((num) => {
          if (userNums.includes(num)) matchCount++;
        });

        let rank = 6;

        if (matchCount === 6) rank = 1;
        else if (matchCount === 5 && userNums.includes(draw.bonus)) rank = 2;
        else if (matchCount === 5) rank = 3;
        else if (matchCount === 4) rank = 4;
        else if (matchCount === 3) rank = 5;

        if (rank < bestRank) {
          bestRank = rank;
          bestRounds = [draw];
        } else if (rank === bestRank) {
          bestRounds.push(draw);
        }
      });

      // ❌ 낙첨
      if (bestRank === 6 || bestRounds.length === 0) {
        newResults.push({ rank: "낙첨", extraCount: 0 });
        return;
      }

      // ✅ 가장 최근 회차 선택
      const latest = bestRounds.reduce((a, b) => (a.round > b.round ? a : b));

      const bestRound = latest.round;
      const bestNumbers = latest.numbers;
      const bestBonus = latest.bonus;
      const bestMatches = userNums.filter((n) => latest.numbers.includes(n));

      let prizeAmount = 0;

      if (bestRank === 1) prizeAmount = latest.firstPrize;
      else if (bestRank === 2) prizeAmount = latest.secondPrize;
      else if (bestRank === 3) prizeAmount = latest.thirdPrize;
      else if (bestRank === 4) prizeAmount = 50000;
      else if (bestRank === 5) prizeAmount = 5000;

      // ⭐ 추가된 부분
      const extraRounds = bestRounds
        .filter((d) => d.round !== bestRound)
        .map((d) => {
          let prize = 0;

          if (bestRank === 1) prize = d.firstPrize;
          else if (bestRank === 2) prize = d.secondPrize;
          else if (bestRank === 3) prize = d.thirdPrize;
          else if (bestRank === 4) prize = 50000;
          else if (bestRank === 5) prize = 5000;

          return {
            round: d.round,
            numbers: d.numbers,
            bonus: d.bonus,
            prizeAmount: prize,
          };
        });

      newResults.push({
        rank: `${bestRank}등`,
        round: bestRound,
        numbers: bestNumbers,
        bonus: bestBonus,
        matches: bestMatches,
        userNums: userNums,
        prizeAmount: prizeAmount,
        extraCount: extraRounds.length,
        extraRounds: extraRounds,
        bonusMatch: userNums.includes(bestBonus),
      });
    });

    setResults(newResults);
  };

  const getTopNumbers = () => {
    const count = {};

    // 1~45 초기화
    for (let i = 1; i <= 45; i++) {
      count[i] = 0;
    }

    // 전체 회차 순회
    lottoDB.forEach((draw) => {
      draw.numbers.forEach((num) => {
        count[num]++;
      });
    });

    // 배열로 변환 후 정렬
    const sorted = Object.entries(count)
      .map(([num, freq]) => ({
        number: parseInt(num),
        frequency: freq,
      }))
      .sort((a, b) => b.frequency - a.frequency);

    return sorted.slice(0, 10);
  };

  const getLeastNumbers = () => {
    const count = {};

    // 1~45 초기화
    for (let i = 1; i <= 45; i++) {
      count[i] = 0;
    }

    // 전체 회차 순회
    lottoDB.forEach((draw) => {
      draw.numbers.forEach((num) => {
        count[num]++;
      });
    });

    // 배열 변환 후 오름차순 정렬 (적게 나온 순)
    const sorted = Object.entries(count)
      .map(([num, freq]) => ({
        number: parseInt(num),
        frequency: freq,
      }))
      .sort((a, b) => a.frequency - b.frequency);

    return sorted.slice(0, 10);
  };

  const getNotAppearedInRecent = (recentCount = 20) => {
    if (lottoDB.length === 0) return [];

    // 최신 회차 기준 정렬 (round 큰 순)
    const sortedByLatest = [...lottoDB].sort((a, b) => b.round - a.round);

    const recentDraws = sortedByLatest.slice(0, recentCount);

    const appeared = new Set();

    recentDraws.forEach((draw) => {
      draw.numbers.forEach((num) => {
        appeared.add(num);
      });
    });

    const result = [];

    for (let i = 1; i <= 45; i++) {
      if (!appeared.has(i)) {
        result.push(i);
      }
    }

    return result;
  };
  const getFrequencyData = () => {
    const count = {};

    for (let i = 1; i <= 45; i++) {
      count[i] = 0;
    }

    lottoDB.forEach((draw) => {
      draw.numbers.forEach((num) => {
        count[num]++;
      });
    });

    return Object.entries(count).map(([num, freq]) => ({
      number: parseInt(num),
      frequency: freq,
    }));
  };

  return (
    <main className="container mx-auto max-w-5xl px-4">
      <h1 className="title">내 번호는 몇등일까?</h1>
      <p className="desc">
        로또 번호 6개를 입력하면 역대 회차 기준 최고 성적을 알려드립니다.
      </p>

      <div className="flex gap-3 mb-6">
        <button
          className="addBtn btnBase disabled:opacity-40"
          onClick={addGame}
          disabled={games.length >= 5}
        >
          + 번호추가
        </button>

        <button
          className="addBtn btnBase"
          style={{ background: "#7c3aed" }} // 보라색으로 바꾸고 싶으면
          onClick={generateAllRandom}
        >
          전체 자동
        </button>
      </div>

      <div className="gameList">
        {games.map((game, gameIndex) => (
          <LottoRow
            key={gameIndex}
            game={game}
            gameIndex={gameIndex}
            games={games}
            setGames={setGames}
            removeGame={removeGame}
            generateRandomNumbers={generateRandomNumbers}
          />
        ))}
      </div>

      <button className="resultBtn btnBase" onClick={checkResult}>
        결과 확인하기
      </button>

      <div className="mt-8 space-y-6">
        {results.map((r, i) => (
          <div key={i} className="bg-white p-4 rounded-xl shadow">
            <div className="font-bold text-lg mb-2 flex items-center gap-2 flex-wrap">
              <span>
                {i + 1}번 번호 → {r.rank}
              </span>

              {r.round && (
                <span className="text-blue-500 font-semibold">
                  {r.round}회차
                </span>
              )}

              {r.prizeAmount > 0 && (
                <div className="text-sm text-emerald-600 font-semibold">
                  💰 {formatMoney(r.prizeAmount)}
                </div>
              )}

              {r.extraCount > 0 && (
                <div className="relative group inline-block">
                  <span className="text-gray-500 text-sm">
                    외 {r.extraCount}회 당첨
                  </span>

                  <button
                    className="ml-1 text-blue-500 font-bold"
                    onClick={() =>
                      setOpenTooltipIndex(openTooltipIndex === i ? null : i)
                    }
                  >
                    (+)
                  </button>

                  {/* 🔵 PC: hover */}
                  <div className="hidden md:group-hover:block absolute left-0 mt-2 bg-white shadow-xl border rounded-xl p-4 text-sm z-50 max-h-64 overflow-y-auto md:w-[400px] w-[90vw]">
                    {r.extraRounds.map((item, idx) => (
                      <div key={idx} className="mb-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-blue-600">
                            {item.round}회차
                          </span>
                          <span className="text-xs text-emerald-600 font-semibold">
                            💰 {formatMoney(item.prizeAmount)}
                          </span>
                        </div>

                        <div className="flex gap-1 items-center flex-nowrap">
                          {item.numbers.map((num, j) => {
                            const isMatch = r.userNums.includes(num);

                            return (
                              <div
                                key={j}
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                                ${
                                  isMatch
                                    ? getBallColor(num)
                                    : "bg-gray-200 text-gray-400 opacity-50"
                                }`}
                              >
                                {num}
                              </div>
                            );
                          })}

                          <span className="mx-1">+</span>

                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                            ${
                              r.userNums.includes(item.bonus)
                                ? getBallColor(item.bonus)
                                : "bg-gray-200 text-gray-400 opacity-50"
                            }`}
                          >
                            {item.bonus}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 🟢 모바일: 클릭 */}
                  {openTooltipIndex === i && (
                    <div className="md:hidden absolute left-0 mt-2 bg-white shadow-xl border rounded-xl p-4 text-sm z-50 max-h-64 overflow-y-auto w-[90vw] max-w-[400px]">
                      {r.extraRounds.map((item, idx) => (
                        <div key={idx} className="mb-3">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-blue-600">
                              {item.round}회차
                            </span>
                            <span className="text-xs text-emerald-600 font-semibold">
                              💰 {formatMoney(item.prizeAmount)}
                            </span>
                          </div>

                          <div className="flex gap-1 items-center flex-nowrap">
                            {item.numbers.map((num, j) => {
                              const isMatch = r.userNums.includes(num);

                              return (
                                <div
                                  key={j}
                                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                                  ${
                                    isMatch
                                      ? getBallColor(num)
                                      : "bg-gray-200 text-gray-400 opacity-50"
                                  }`}
                                >
                                  {num}
                                </div>
                              );
                            })}

                            <span className="mx-1">+</span>

                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                              ${
                                r.userNums.includes(item.bonus)
                                  ? getBallColor(item.bonus)
                                  : "bg-gray-200 text-gray-400 opacity-50"
                              }`}
                            >
                              {item.bonus}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {r.numbers && (
              <div className="flex gap-2 items-center">
                {r.numbers.map((num, idx) => {
                  const isMatch = r.matches.includes(num);

                  return (
                    <div
                      key={idx}
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold
                      ${isMatch ? getBallColor(num) : "bg-gray-200 text-gray-400 opacity-40"}`}
                    >
                      {num}
                    </div>
                  );
                })}

                <span className="mx-2">+</span>

                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold
                      ${
                        r.bonusMatch
                          ? getBallColor(r.bonus)
                          : "bg-gray-200 text-gray-400 opacity-40"
                      }`}
                >
                  {r.bonus}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">
          🔥 역대 가장 많이 나온 번호 TOP 10
        </h2>

        <div className="flex flex-wrap gap-4">
          {getTopNumbers().map((item, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${getBallColor(item.number)}`}
              >
                {item.number}
              </div>

              <span className="text-sm text-gray-600 mt-1">
                {item.frequency}회
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">
          🔥 역대 가장 적게 나온 번호 TOP 10
        </h2>

        <div className="flex flex-wrap gap-4">
          {getLeastNumbers().map((item, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${getBallColor(item.number)}`}
              >
                {item.number}
              </div>

              <span className="text-sm text-gray-600 mt-1">
                {item.frequency}회
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">🚫 최근 20회 미출현 번호</h2>

        <div className="grid grid-cols-5 md:grid-cols-10 gap-4">
          {getNotAppearedInRecent(20).map((num, idx) => (
            <div
              key={idx}
              className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${getBallColor(num)}`}
            >
              {num}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12 bg-white rounded-2xl shadow-lg w-full">
        <div className="p-4 md:p-20 flex justify-center">
          <h2 className="text-2xl font-bold">📊 번호별 출현 횟수 그래프</h2>
        </div>

        <div className="h-[300px] md:h-[380px] w-full px-4 md:px-8 pb-8">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={getFrequencyData()}
              margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
            >
              <XAxis dataKey="number" />
              <YAxis width={40} />
              <Tooltip />
              <Bar dataKey="frequency" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </main>
  );
}
