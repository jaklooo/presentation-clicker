'use client';

import { use, useEffect, useState } from 'react';
import { usePresentation } from '@/app/hooks/usePresentation';
import { motion } from 'framer-motion';

export default function RemotePage({ params }) {
    const { sessionId } = use(params);
    const { slideIndex, changeSlide, isConnected } = usePresentation(sessionId, 'remote');
    const [direction, setDirection] = useState(0);

    const handleNext = () => {
        if (navigator.vibrate) navigator.vibrate(50);
        changeSlide(slideIndex + 1);
        setDirection(1);
    };

    const handlePrev = () => {
        if (slideIndex > 1) {
            if (navigator.vibrate) navigator.vibrate(50);
            changeSlide(slideIndex - 1);
            setDirection(-1);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            {/* Status Bar */}
            <div className="px-6 py-4 flex justify-between items-center bg-gray-900 border-b border-gray-800">
                <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-red-500'}`} />
                    <span className="text-sm font-medium text-gray-300">{isConnected ? 'Connected' : 'Connecting...'}</span>
                </div>
                <div className="text-sm font-mono text-gray-500">Slide {slideIndex}</div>
            </div>

            {/* Controls */}
            <div className="flex-1 flex flex-col p-6 gap-6">
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleNext}
                    className="flex-1 bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl flex items-center justify-center shadow-lg shadow-blue-900/20 relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    <div className="flex flex-col items-center gap-4 z-10">
                        <svg className="w-24 h-24 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <span className="text-2xl font-bold tracking-wider uppercase">Next</span>
                    </div>
                </motion.button>

                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handlePrev}
                    className="h-32 bg-gray-800 rounded-2xl flex items-center justify-center shadow-lg active:bg-gray-700 transition-colors"
                >
                    <div className="flex items-center gap-3 text-gray-400">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span className="text-lg font-medium uppercase tracking-wide">Previous</span>
                    </div>
                </motion.button>
            </div>

            {/* Footer */}
            <div className="p-6 pt-0 text-center text-gray-600 text-xs">
                Session: {sessionId}
            </div>
        </div>
    );
}
