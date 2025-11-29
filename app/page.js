'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Home() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const startPresentation = () => {
    setIsCreating(true);
    const sessionId = Math.random().toString(36).substring(2, 9);
    router.push(`/host/${sessionId}`);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-gray-900 to-black text-white">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm flex flex-col gap-8">
        <h1 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
          PresentSync
        </h1>
        <p className="text-xl text-gray-400 text-center max-w-2xl">
          Control your PDF presentations from your phone. No internet required, just local Wi-Fi.
        </p>

        <button
          onClick={startPresentation}
          disabled={isCreating}
          className="group relative px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-full text-xl font-bold transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(37,99,235,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCreating ? 'Creating Session...' : 'Start Presentation'}
          <div className="absolute inset-0 rounded-full ring-2 ring-white/20 group-hover:ring-white/40 transition-all" />
        </button>

        <div className="mt-12 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm max-w-md w-full">
          <h3 className="text-lg font-semibold mb-2 text-blue-300">How it works:</h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-300">
            <li>Click "Start Presentation" on your computer</li>
            <li>Upload your PDF file</li>
            <li>Scan the QR code with your phone</li>
            <li>Control slides remotely!</li>
          </ol>
        </div>
      </div>
    </main>
  );
}
