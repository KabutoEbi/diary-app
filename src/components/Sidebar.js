import React from "react";

const Sidebar = ({
  yearList,
  openYears,
  toggleYear,
  entries,
  scrollToMonth,
  user,
  setShowStats,
  setShowLogin,
  setUser,
  signOut,
  auth,
}) => (
  <div className="hidden md:flex mr-6 bg-white rounded-lg shadow p-4 flex-col gap-2 min-w-[140px] self-start mt-10"
       style={{ position: "sticky", top: "88px" }}>
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
                    return d.getFullYear() === Number(year);
                  })
                  .map(entry => (new Date(entry.createdAt?.seconds ? entry.createdAt.seconds * 1000 : entry.createdAt)).getMonth() + 1);
                const uniqueMonths = Array.from(new Set(months)).sort((a, b) => b - a);
                return uniqueMonths.map(month => (
                  <button
                    key={month}
                    className="text-blue-700 hover:underline text-left px-2 py-1 rounded hover:bg-blue-100"
                    onClick={() => scrollToMonth(`${Number(year)}-${Number(month)}`)}
                  >
                    {month}月
                  </button>
                ));
              })()}
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
);

export default Sidebar;