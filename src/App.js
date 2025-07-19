import React, { useState, useEffect } from 'react';
import  { NotebookPen, Laugh, Meh, Frown, Angry } from 'lucide-react';
import LoginPage from './components/Login_page';
import StatisticsPage from './components/Statistics_page';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './firebase';
import { collection, addDoc, getDocs, query, orderBy, where } from 'firebase/firestore';
import './App.css';

function App() {
  const [entries, setEntries] = useState([]);
  const [text, setText] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [mood, setMood] = useState('laugh');
  const [showLogin, setShowLogin] = useState(false);
  const [user, setUser] = useState(null);
  const [showStats, setShowStats] = useState(false);

  const moodOptions = [
    { label: 'うれしい', value: 'laugh', icon: <Laugh className="w-7 h-7" /> },
    { label: 'ふつう', value: 'meh', icon: <Meh className="w-7 h-7" /> },
    { label: 'かなしい', value: 'frown', icon: <Frown className="w-7 h-7" /> },
    { label: 'おこ', value: 'angry', icon: <Angry className="w-7 h-7" /> },
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetchEntries = async () => {
      const q = query(
        collection(db, 'diaryEntries'),
        where('uid', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      setEntries(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    };
    fetchEntries();
  }, [user]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    const today = new Date();
    const todayStr = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    const alreadyExists = entries.some(entry => {
      const entryDate = new Date(entry.createdAt?.seconds ? entry.createdAt.seconds * 1000 : entry.date);
      const entryStr = entryDate.getFullYear() + '-' + (entryDate.getMonth() + 1) + '-' + entryDate.getDate();
      return entryStr === todayStr;
    });
    if (alreadyExists) {
      alert('今日はすでに日記を書いています。');
      return;
    }
    await addDoc(collection(db, 'diaryEntries'), {
      uid: user.uid,
      text,
      mood,
      createdAt: new Date(),
    });
    setText('');
    setMood('laugh');
    setShowForm(false);
    const q = query(
      collection(db, 'diaryEntries'),
      where('uid', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    setEntries(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
  };

  const handleDelete = (id) => {
    setEntries(entries.filter(entry => entry.id !== id));
  };

  const ymMap = {};
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
    if (!ymMap[y]) ymMap[y] = {};
    if (!ymMap[y][m]) ymMap[y][m] = [];
    ymMap[y][m].push(entry.id);
  });
  const yearList = Object.keys(ymMap).sort((a, b) => b - a);

  const [openYears, setOpenYears] = useState({});
  const toggleYear = (year) => {
    setOpenYears(prev => ({ ...prev, [year]: !prev[year] }));
  };

  const entryRefs = {};
  entries.forEach(entry => {
    entryRefs[entry.id] = React.createRef();
  });

  const scrollToMonth = (ym) => {
    const firstId = ymMap[ym]?.[0];
    if (firstId && entryRefs[firstId]?.current) {
      entryRefs[firstId].current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (showLogin || !user) {
    return <LoginPage onLogin={u => { setUser(u); setShowLogin(false); }} />;
  }
  if (showStats) {
    return <StatisticsPage entries={entries} onBack={() => setShowStats(false)} />;
  }

  return (
    <div className="min-h-screen flex flex-row items-start justify-center bg-gray-100 relative pt-10">
      <div className="mr-6 mt-10 sticky top-10 h-fit bg-white rounded-lg shadow p-4 flex flex-col gap-2 min-w-[140px]">
        <button
          className="mb-3 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors font-semibold"
          onClick={() => setShowStats(true)}
        >
          統計ページへ
        </button>
        <div className="font-bold mb-2 text-center">年・月</div>
        {yearList.length === 0 ? (
          <div className="text-gray-400 text-sm">なし</div>
        ) : (
          yearList.map(year => (
            <div key={year}>
              <button
                className="w-full text-blue-800 font-semibold text-left px-2 py-1 rounded hover:bg-blue-50 flex items-center justify-between"
                onClick={() => toggleYear(year)}
              >
                <span>{year}年</span>
                <span className="ml-2">{openYears[year] ? '▼' : '▶'}</span>
              </button>
              {openYears[year] && (
                <div className="pl-4 flex flex-col gap-1">
                  {Object.keys(ymMap[year])
                    .sort((a, b) => b - a)
                    .map(month => (
                      <button
                        key={month}
                        className="text-blue-700 hover:underline text-left px-2 py-1 rounded hover:bg-blue-100"
                        onClick={() => scrollToMonth(`${year}-${month}`)}
                      >
                        {month}月
                      </button>
                    ))}
                </div>
              )}
            </div>
          ))
        )}
        {user ? (
          <button
            className="mt-6 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors font-semibold"
            onClick={async () => {
              await signOut(auth);
              setUser(null);
            }}
          >
            ログアウト
          </button>
        ) : (
          <button
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-semibold"
            onClick={() => setShowLogin(true)}
          >
            ログイン
          </button>
        )}
      </div>

      <div className="App max-w-xl w-full p-6 bg-white rounded-lg shadow-lg flex flex-col items-center mt-10">
        <h1 className="text-2xl font-bold mb-6">日記アプリ</h1>
        <div className="w-full flex flex-col items-center">
          {entries.length === 0 ? (
            <p className="text-gray-500">まだ日記がありません。</p>
          ) : (
            <>
              {entries.map(entry => {
                let MoodIcon = Laugh;
                if (entry.mood === 'meh') MoodIcon = Meh;
                else if (entry.mood === 'frown') MoodIcon = Frown;
                else if (entry.mood === 'angry') MoodIcon = Angry;
                return (
                  <div key={entry.id} ref={entryRefs[entry.id]} className="border border-gray-200 rounded-md p-4 mb-4 bg-gray-50 w-full max-w-lg mx-auto">
                    <div className="flex flex-row items-center justify-between w-full">
                      <div className="flex flex-row items-center flex-1 min-w-0">
                        <MoodIcon className="w-7 h-7 text-yellow-500 mr-2 shrink-0" />
                        <span className="text-base whitespace-pre-wrap break-words text-left flex-1">{entry.text}</span>
                      </div>
                      <div className="text-xs text-gray-400 text-right min-w-fit ml-4">
                        {(() => {
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
                          return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
                        })()}
                      </div>
                    </div>
                  </div>
                );
              })}
              {(() => {
                const today = new Date();
                const todayStr = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
                const alreadyExists = entries.some(entry => {
                  const entryDate = entry.createdAt?.seconds
                    ? new Date(entry.createdAt.seconds * 1000)
                    : new Date(entry.createdAt);
                  const entryStr = entryDate.getFullYear() + '-' + (entryDate.getMonth() + 1) + '-' + entryDate.getDate();
                  return entryStr === todayStr;
                });
                if (!alreadyExists) {
                  return <div className="text-blue-600 text-sm mt-4">今日はまだ日記を書いていません</div>;
                }
                return null;
              })()}
            </>
          )}
        </div>
      </div>

      <button
        className="fixed right-8 bottom-8 w-14 h-14 rounded-full bg-blue-600 text-white text-3xl shadow-lg flex items-center justify-center hover:bg-blue-700 transition-colors z-50"
        onClick={() => {
          const today = new Date();
          const todayStr = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
          const alreadyExists = entries.some(entry => {
            const entryDate = new Date(entry.createdAt?.seconds ? entry.createdAt.seconds * 1000 : entry.date);
            const entryStr = entryDate.getFullYear() + '-' + (entryDate.getMonth() + 1) + '-' + entryDate.getDate();
            return entryStr === todayStr;
          });
          if (alreadyExists) {
            alert('今日はすでに日記を書いています。');
            return;
          }
          setShowForm(true);
        }}
        title="日記を書く"
      >
        <NotebookPen />
      </button>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-lg shadow-xl p-8 min-w-[320px] max-w-[90vw] flex flex-col items-center" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">日記を書く</h2>
            <form onSubmit={handleAdd} className="w-full flex flex-col items-center">
              <div className="flex flex-row items-center mb-4 w-full">
                <label className="mr-2 text-base font-medium">表情</label>
                <div className="flex gap-2">
                  {moodOptions.map(opt => (
                    <button
                      type="button"
                      key={opt.value}
                      className={`p-1 rounded border-2 ${mood === opt.value ? 'border-blue-500 bg-blue-100' : 'border-transparent'} focus:outline-none`}
                      onClick={() => setMood(opt.value)}
                      aria-label={opt.label}
                    >
                      {opt.icon}
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                rows={4}
                className="w-full p-2 text-base border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 mb-4"
                placeholder="今日の出来事や思ったことを書いてください..."
                autoFocus
              />
              <div className="mt-4 text-right w-full">
                <button type="button" onClick={() => setShowForm(false)} className="mr-2 px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">キャンセル</button>
                <button type="submit" className="px-6 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">追加</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
