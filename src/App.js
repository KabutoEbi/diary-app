import React, { useState, useEffect } from 'react';
import { Laugh, Meh, Frown, Angry } from 'lucide-react';
import LoginPage from './components/Login_page';
import StatisticsPage from './components/Statistics_page';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './firebase';
import { collection, addDoc, getDocs, query, orderBy, where } from 'firebase/firestore';
import './App.css';
import FooterNav from './components/FooterNav';
import Sidebar from './components/Sidebar';

function App() {
  const [entries, setEntries] = useState([]);
  const [text, setText] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [mood, setMood] = useState('laugh');
  const [showLogin, setShowLogin] = useState(false);
  const [user, setUser] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [showYmModal, setShowYmModal] = useState(false);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [open, setOpen] = useState(false);
  const [openMonth, setOpenMonth] = useState(false);
  const setShowYearDropdown = setOpen;

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
    const ymKey = `${y}-${m}`;
    if (!ymMap[ymKey]) ymMap[ymKey] = [];
    ymMap[ymKey].push(entry.id);
  });
  
  const yearSet = new Set();
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
    yearSet.add(d.getFullYear());
  });
  const yearList = Array.from(yearSet).sort((a, b) => b - a);

  const [openYears, setOpenYears] = useState({});
  const toggleYear = (year) => {
    setOpenYears(prev => ({ ...prev, [year]: !prev[year] }));
  };

  const entryRefs = React.useRef({});

  const scrollToMonth = (ym) => {
    const ids = ymMap[ym];
    if (ids && ids.length > 0) {
      const lastId = ids[0];
      if (entryRefs.current[lastId]?.current) {
        const header = document.querySelector('header');
        const headerHeight = header ? header.offsetHeight : 0;
        const bottomNav = document.querySelector('.fixed.bottom-0');
        const bottomNavHeight = (window.innerWidth < 768 && bottomNav) ? bottomNav.offsetHeight : 0;
        const el = entryRefs.current[lastId].current;
        const rect = el.getBoundingClientRect();
        const absoluteY = window.scrollY + rect.top;
        window.scrollTo({
          top: absoluteY - headerHeight - (window.innerWidth < 768 ? bottomNavHeight : 0) - 8,
          behavior: 'smooth'
        });
      }
    }
  };

  if (showLogin || !user) {
    return <LoginPage onLogin={u => { setUser(u); setShowLogin(false); }} />;
  }
  if (showStats) {
    return <StatisticsPage entries={entries} onBack={() => setShowStats(false)} />;
  }

  return (
    <div className="min-h-screen flex flex-row justify-center bg-gray-100 relative pt-10">
      <header className="fixed top-0 left-0 w-full bg-white shadow z-40 flex flex-col items-center">
        <h1 className="text-3xl font-bold pt-4">日記アプリ</h1>
        <p className="pb-2 text-sm text-gray-500">今後アプリ化する</p>
      </header>

      <Sidebar
        yearList={yearList}
        openYears={openYears}
        toggleYear={toggleYear}
        entries={entries}
        scrollToMonth={scrollToMonth}
        user={user}
        setShowStats={setShowStats}
        setShowLogin={setShowLogin}
        setUser={setUser}
        signOut={signOut}
        auth={auth}
      />

      <div className="App max-w-xl w-full p-6 bg-white rounded-lg shadow-lg flex flex-col items-center mt-10">
        <div className="w-full flex flex-col items-center">
          {entries.length === 0 ? (
            <p className="text-gray-500">まだ日記がありません。</p>
          ) : (
            <>
              {entries.map(entry => {
                let MoodIcon = Laugh;
                let moodColor = 'text-yellow-500';
                if (entry.mood === 'meh') {
                  MoodIcon = Meh;
                  moodColor = 'text-green-600';
                } else if (entry.mood === 'frown') {
                  MoodIcon = Frown;
                  moodColor = 'text-blue-500';
                } else if (entry.mood === 'angry') {
                  MoodIcon = Angry;
                  moodColor = 'text-red-500';
                }
                if (!entryRefs.current[entry.id]) {
                  entryRefs.current[entry.id] = React.createRef();
                }
                return (
                  <div key={entry.id} ref={entryRefs.current[entry.id]} className="border border-gray-200 rounded-md p-4 mb-4 bg-gray-50 w-full max-w-lg mx-auto">
                    <div className="flex flex-col md:flex-row md:items-center w-full">
                      <div className="flex flex-row items-center flex-shrink-0 min-w-0 md:mr-4">
                        <MoodIcon className={`w-7 h-7 mr-2 shrink-0 ${moodColor}`} />
                        <span className="text-xs text-gray-400 min-w-fit block md:hidden">
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
                        </span>
                      </div>
                      <span className="text-base whitespace-pre-wrap break-words text-left flex-1 mt-2 md:mt-0">
                        {entry.text}
                      </span>
                      <span className="hidden md:block text-xs text-gray-400 min-w-fit ml-4">
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
                      </span>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>

      <FooterNav
        onWrite={() => setShowForm(true)}
        onStats={() => setShowStats(true)}
        onYm={() => setShowYmModal(true)}
        onLogout={async () => {
          await signOut(auth);
          setUser(null);
        }}
        user={user}
        todayStr={
          (() => {
            const today = new Date();
            return today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
          })()
        }
        entries={entries}
        setShowForm={setShowForm}
      />

      {/* PC用右下「書く」ボタン */}
      <button
        className="hidden md:flex fixed right-8 bottom-8 w-14 h-14 rounded-full bg-blue-600 text-white text-3xl shadow-lg items-center justify-center hover:bg-blue-700 transition-colors z-50"
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
        <span className="sr-only">日記を書く</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 20h9" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.5 3.5a2.121 2.121 0 113 3L7 19.5 3 21l1.5-4L16.5 3.5z" /></svg>
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

      {showYmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50" onClick={() => setShowYmModal(false)}>
          <div className="bg-white rounded-lg shadow-xl p-8 min-w-[320px] max-w-[90vw] flex flex-col items-center" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">年月選択</h2>
            <div className="w-full flex flex-col md:flex-row gap-4 mb-4">
              {/* 年を選択 */}
              <div className="flex-1">
                <div
                  className="font-semibold mb-2 text-center cursor-pointer select-none border border-gray-300 rounded py-2 hover:bg-gray-100"
                  onClick={() => setShowYearDropdown(open => !open)}
                >
                  {selectedYear ? `${selectedYear}年` : "年を選択"}
                </div>
                {/* 年のドロップダウン */}
                {open && (
                  <div className="mt-2 w-full bg-white border border-gray-300 rounded shadow z-50">
                    {yearList.length === 0 ? (
                      <div className="text-gray-400 text-sm px-4 py-2">なし</div>
                    ) : (
                      yearList.map(year => (
                        <div
                          key={year}
                          className={`px-4 py-2 cursor-pointer hover:bg-blue-100 text-center ${selectedYear === year ? "bg-blue-600 text-white" : ""}`}
                          onClick={() => {
                            setSelectedYear(year);
                            setOpen(false);
                            setOpenMonth(false); // 月のドロップダウンも閉じる
                            setSelectedMonth(null); // 月もリセット
                          }}
                        >
                          {year}年
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
              {/* 月を選択 */}
              <div className="flex-1">
                <div
                  className="font-semibold mb-2 text-center cursor-pointer select-none border border-gray-300 rounded py-2 hover:bg-gray-100"
                  onClick={() => {
                    if (selectedYear) setOpenMonth(openMonth => !openMonth);
                  }}
                >
                  {selectedMonth ? `${selectedMonth}月` : "月を選択"}
                </div>
                {/* 月のドロップダウン */}
                {selectedYear && openMonth && (
                  <div className="mt-2 w-full bg-white border border-gray-300 rounded shadow z-50">
                    {(() => {
                      const months = entries
                        .filter(entry => {
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
                          return d.getFullYear() === Number(selectedYear);
                        })
                        .map(entry => (new Date(entry.createdAt?.seconds ? entry.createdAt.seconds * 1000 : entry.createdAt)).getMonth() + 1);
                      const uniqueMonths = Array.from(new Set(months)).sort((a, b) => b - a);
                      return uniqueMonths.length === 0 ? (
                        <div className="text-gray-400 text-sm px-4 py-2">月がありません</div>
                      ) : (
                        uniqueMonths.map(month => (
                          <div
                            key={month}
                            className={`px-4 py-2 cursor-pointer hover:bg-blue-100 text-center ${selectedMonth === month ? "bg-blue-600 text-white" : ""}`}
                            onClick={() => {
                              setSelectedMonth(month);
                              setOpenMonth(false);
                              setShowYmModal(false);
                              setTimeout(() => {
                                scrollToMonth(`${selectedYear}-${month}`);
                              }, 200); // 200msほど遅らせる
                            }}
                          >
                            {month}月
                          </div>
                        ))
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
            <button className="mt-4 px-4 py-2 rounded bg-gray-200 hover:bg-gray-300" onClick={() => setShowYmModal(false)}>閉じる</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
