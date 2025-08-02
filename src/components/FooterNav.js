import React from "react";
import { NotebookPen, BarChart2, Calendar, LogOut } from "lucide-react";

const FooterNav = ({
  onWrite,
  onStats,
  onYm,
  onLogout,
  user,
  todayStr,
  entries,
  setShowForm,
}) => {
  const handleWrite = () => {
    const alreadyExists = entries.some(entry => {
      const entryDate = entry.createdAt?.seconds
        ? new Date(entry.createdAt.seconds * 1000)
        : new Date(entry.createdAt);
      const entryStr = entryDate.getFullYear() + '-' + (entryDate.getMonth() + 1) + '-' + entryDate.getDate();
      return entryStr === todayStr;
    });
    if (alreadyExists) {
      alert('今日はすでに日記を書いています。');
      return;
    }
    setShowForm(true);
    if (onWrite) onWrite();
  };

  return (
    <footer className="fixed bottom-0 left-0 w-full flex md:hidden bg-white border-t border-gray-200 z-50">
      <button
        className="flex-1 flex flex-col items-center py-2 text-blue-600"
        onClick={handleWrite}
      >
        <NotebookPen className="w-6 h-6" />
        <span className="text-xs">書く</span>
      </button>
      <button
        className="flex-1 flex flex-col items-center py-2 text-green-600"
        onClick={onStats}
      >
        <BarChart2 className="w-6 h-6" />
        <span className="text-xs">統計</span>
      </button>
      <button
        className="flex-1 flex flex-col items-center py-2 text-blue-700"
        onClick={onYm}
      >
        <Calendar className="w-6 h-6" />
        <span className="text-xs">年月</span>
      </button>
      {user && (
        <button
          className="flex-1 flex flex-col items-center py-2 text-gray-600"
          onClick={onLogout}
        >
          <LogOut className="w-6 h-6" />
          <span className="text-xs">ログアウト</span>
        </button>
      )}
    </footer>
  );
};

export default FooterNav;