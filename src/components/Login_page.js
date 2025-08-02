import React, { useState, useEffect } from 'react';
import { signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import { auth, provider } from '../firebase';

function LoginPage({ onLogin }) {
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && onLogin) {
        onLogin(user);
      }
    });
    return () => unsubscribe();
  }, [onLogin]);

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      if (onLogin) onLogin(result.user);
    } catch (err) {
      setError('Googleログインに失敗しました');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-xs flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-6">ログイン</h2>
        <button
          onClick={handleGoogleLogin}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold mb-4 flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5"><g><path fill="#4285F4" d="M24 9.5c3.54 0 6.7 1.22 9.19 3.23l6.85-6.85C35.64 2.39 30.21 0 24 0 14.82 0 6.73 5.82 2.69 14.29l7.98 6.2C12.36 13.13 17.68 9.5 24 9.5z"/><path fill="#34A853" d="M46.1 24.55c0-1.64-.15-3.22-.42-4.74H24v9.01h12.42c-.54 2.9-2.18 5.36-4.65 7.03l7.19 5.6C43.98 37.13 46.1 31.3 46.1 24.55z"/><path fill="#FBBC05" d="M9.67 28.49a14.5 14.5 0 0 1 0-9.01l-7.98-6.2A23.94 23.94 0 0 0 0 24c0 3.77.9 7.34 2.49 10.49l8.18-6z"/><path fill="#EA4335" d="M24 48c6.21 0 11.41-2.05 15.21-5.57l-7.19-5.6c-2.01 1.35-4.6 2.15-8.02 2.15-6.32 0-11.64-3.63-13.33-8.69l-8.18 6C6.73 42.18 14.82 48 24 48z"/></g></svg>
          Googleでログイン
        </button>
        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
      </div>
    </div>
  );
}

export default LoginPage;
