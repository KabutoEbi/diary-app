import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Laugh, Meh, Frown, Angry, ArrowLeft } from 'lucide-react';
import { Chart, LineElement, PointElement, LinearScale, CategoryScale } from 'chart.js';
Chart.register(LineElement, PointElement, LinearScale, CategoryScale);

const moodScore = { laugh: 3, meh: 2, frown: 1, angry: 0 };

function StatisticsPage({ entries, onBack }) {
  const ymSet = new Set();
  entries.forEach(entry => {
    let d;
    if (entry.createdAt) {
      if (entry.createdAt.seconds) {
        d = new Date(entry.createdAt.seconds * 1000);
      } else {
        d = new Date(entry.createdAt);
      }
    } else {
      d = new Date();
    }
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    ymSet.add(`${y}-${m}`);
  });
  const ymList = Array.from(ymSet).sort((a, b) => b.localeCompare(a));
  const [selectedYm, setSelectedYm] = useState(ymList[0] || '');

  const filteredEntries = selectedYm
    ? entries.filter(entry => {
        let d;
        if (entry.createdAt) {
          if (entry.createdAt.seconds) {
            d = new Date(entry.createdAt.seconds * 1000);
          } else {
            d = new Date(entry.createdAt);
          }
        } else {
          d = new Date();
        }
        const y = d.getFullYear();
        const m = d.getMonth() + 1;
        return `${y}-${m}` === selectedYm;
      })
    : entries;

  const moodIcons = {
    laugh: <Laugh className="w-5 h-5 text-yellow-500 mx-auto" />,
    meh: <Meh className="w-5 h-5 text-green-600 mx-auto" />,
    frown: <Frown className="w-5 h-5 text-blue-500 mx-auto" />,
    angry: <Angry className="w-5 h-5 text-red-500 mx-auto" />,
  };
  let daysInMonth = 31;
  let year = 2025, month = 7;
  if (selectedYm) {
    const [y, m] = selectedYm.split('-');
    year = Number(y);
    month = Number(m);
    daysInMonth = new Date(year, month, 0).getDate();
  }
  const dayScores = Array(daysInMonth).fill(null);
  filteredEntries.forEach(entry => {
    let d;
    if (entry.createdAt) {
      if (entry.createdAt.seconds) {
        d = new Date(entry.createdAt.seconds * 1000);
      } else {
        d = new Date(entry.createdAt);
      }
    } else {
      d = new Date();
    }
    if (d.getFullYear() === year && d.getMonth() + 1 === month) {
      const day = d.getDate();
      dayScores[day - 1] = moodScore[entry.mood];
    }
  });

  function renderStats(statsEntries, label) {
    const moodCounts = { laugh: 0, meh: 0, frown: 0, angry: 0 };
    statsEntries.forEach(e => {
      if (moodCounts[e.mood] !== undefined) moodCounts[e.mood]++;
    });
    const total = statsEntries.length;
    const moodColors = {
      laugh: 'bg-yellow-300',
      meh: 'bg-gray-400',
      frown: 'bg-blue-300',
      angry: 'bg-red-300',
    };
    return (
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">{label}</h3>
        {total === 0 ? (
          <div className="text-gray-500">データがありません</div>
        ) : (
          <ul className="space-y-2">
            {Object.keys(moodCounts).map(mood => (
              <li key={mood} className="flex items-center">
                <span className="w-10 inline-block flex items-center justify-center">{moodIcons[mood]}</span>
                <div className="flex-1 bg-gray-200 rounded h-4 mx-2 relative">
                  <div
                    className={`h-4 rounded ${moodColors[mood]}`}
                    style={{ width: `${(moodCounts[mood] / total) * 100}%` }}
                  ></div>
                </div>
                <span className="w-10 text-right">{((moodCounts[mood] / total) * 100).toFixed(1)}%</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  const data = {
    labels: dayScores.map((_, i) => i + 1),
    datasets: [
      {
        label: '感情スコア',
        data: dayScores,
        borderColor: '#3b82f6',
        backgroundColor: '#93c5fd',
        pointBackgroundColor: '#000',
        tension: 0.2,
      },
    ],
  };

  const options = {
    scales: {
      x: {
        ticks: {
          callback: function(value, index, ticks) {
            const day = this.getLabelForValue(value);
            if (day === 1) return 0;
            if (day % 5 === 0) return day;
            return '';
          },
        },
      },
      y: {
        min: 0,
        max: 3,
        ticks: {
          stepSize: 1,
          callback: function(value) {
            if (value === 3) return '良';
            if (value === 2) return '普';
            if (value === 1) return '微';
            if (value === 0) return '悪';
            return '';
          },
          padding: 2,
          font: {
            size: 10
          }
        },
        grid: {
          tickLength: 2
        }
      },
    },
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow mx-auto mt-10 max-w-3xl">
      <button
        className="mb-4 px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition-colors font-semibold flex items-center"
        onClick={onBack}
      >
        <ArrowLeft className="w-5 h-5 mr-1" /> 戻る
      </button>
      <h2 className="text-xl font-bold mb-4">感情の割合</h2>
      {ymList.length > 0 && (
        <div className="mb-6">
          <label className="mr-2 font-medium">月を選択:</label>
          <select
            className="border rounded px-2 py-1"
            value={selectedYm}
            onChange={e => setSelectedYm(e.target.value)}
          >
            {ymList.map(ym => {
              const [y, m] = ym.split('-');
              return (
                <option key={ym} value={ym}>{y}年 {m}月</option>
              );
            })}
          </select>
        </div>
      )}
      {renderStats(filteredEntries, selectedYm ? `${selectedYm.replace('-', '年 ')}月の統計` : '月の統計')}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">{selectedYm ? `${selectedYm.replace('-', '年 ')}月の感情ラインチャート` : '月の感情ラインチャート'}</h3>
        <Line data={data} options={options} className="bg-white" />
      </div>
      {renderStats(entries, '全体の統計')}
    </div>
  );
}

export default StatisticsPage;
