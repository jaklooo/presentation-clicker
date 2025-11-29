
'use client';

import { useState, useEffect, use, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { usePresentation } from '@/app/hooks/usePresentation';
import dynamic from 'next/dynamic';

const PDFViewer = dynamic(() => import('@/app/components/PDFViewer'), {
    ssr: false,
    loading: () => <div className="text-white">Loading PDF Viewer...</div>
});

export default function HostPage({ params }) {
    // Unwrap params using React.use()
    const { sessionId } = use(params);

    const { slideIndex, changeSlide, isConnected } = usePresentation(sessionId, 'host');
    const [file, setFile] = useState(null);
    const [numPages, setNumPages] = useState(null);
    const [remoteUrl, setRemoteUrl] = useState('');
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Fix: use useRef for container
    const presentationRef = useRef(null);

    useEffect(() => {
        // Generate remote URL based on current location
        if (typeof window !== 'undefined') {
            const protocol = window.location.protocol;
            const host = window.location.hostname;
            const port = window.location.port;

            // If we are NOT on localhost (e.g. using a tunnel), use the current URL
            if (host !== 'localhost' && host !== '127.0.0.1' && !host.startsWith('192.168.')) {
                setRemoteUrl(`${window.location.origin}/remote/${sessionId}`);
                return;
            }

            // Otherwise try to fetch local IP configuration
            fetch('/api/config')
                .then(res => res.json())
                .then(config => {
                    // Use the IP from server if available, otherwise fallback to hostname
                    const targetHost = config.ip || host;
                    const targetPort = config.port || port;
                    setRemoteUrl(`${protocol}//${targetHost}:${targetPort}/remote/${sessionId}`);
                })
                .catch(err => {
                    console.error('Failed to fetch config:', err);
                    // Fallback
                    setRemoteUrl(`${window.location.origin}/remote/${sessionId}`);
                });
        }
    }, [sessionId]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!file) return;

            if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
                changeSlide(slideIndex + 1);
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                if (slideIndex > 1) changeSlide(slideIndex - 1);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [file, slideIndex, changeSlide]);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            presentationRef.current?.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    function onFileChange(event) {
        const nextFile = event.target.files?.[0];
        if (nextFile) {
            setFile(nextFile);
        }
    }

    function onDocumentLoadSuccess({ numPages }) {
        setNumPages(numPages);
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col">
            {/* Header */}
            <div className="p-4 bg-gray-800 flex justify-between items-center shadow-md z-10">
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
                    PresentSync Host
                </h1>
                <div className="flex items-center gap-4">
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs ${isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                        {isConnected ? 'Connected' : 'Disconnected'}
                    </div>
                    <div className="text-sm text-gray-400">
                        Session: <span className="font-mono text-white">{sessionId}</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Main Content Area */}
                <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-950 overflow-y-auto">
                    {!file ? (
                        <div className="border-2 border-dashed border-gray-700 rounded-2xl p-12 text-center hover:border-blue-500 transition-colors bg-gray-900/50">
                            <input
                                type="file"
                                onChange={onFileChange}
                                accept=".pdf"
                                className="hidden"
                                id="pdf-upload"
                            />
                            <label
                                htmlFor="pdf-upload"
                                className="cursor-pointer flex flex-col items-center gap-4"
                            >
                                <div className="w-16 h-16 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold">Upload Presentation</h3>
                                    <p className="text-gray-400 mt-1">Select a PDF file to begin</p>
                                </div>
                            </label>
                        </div>
                    ) : (
                        <div
                            ref={presentationRef}
                            className={`relative shadow-2xl rounded-lg overflow-hidden bg-black flex items-center justify-center ${isFullscreen ? 'w-full h-full' : ''}`}
                        >
                            <PDFViewer
                                file={file}
                                pageNumber={slideIndex}
                                onLoadSuccess={onDocumentLoadSuccess}
                                height={isFullscreen ? window.innerHeight : window.innerHeight * 0.8}
                                className={isFullscreen ? 'h-screen flex items-center' : 'max-h-[80vh]'}
                            />

                            {/* Controls Overlay (Visible on hover or always in non-fullscreen) */}
                            <div className="absolute bottom-4 right-4 flex gap-2 z-20">
                                <button
                                    onClick={toggleFullscreen}
                                    className="bg-black/70 backdrop-blur p-2 rounded-full hover:bg-black/90 transition-colors text-white"
                                    title="Toggle Fullscreen"
                                >
                                    {isFullscreen ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 4l-5-5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                        </svg>
                                    )}
                                </button>
                                <div className="bg-black/70 backdrop-blur px-3 py-1 rounded-full text-sm font-mono flex items-center">
                                    {slideIndex} / {numPages || '--'}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar / Info Panel */}
                <div className="w-80 bg-gray-900 border-l border-gray-800 p-6 flex flex-col gap-8">
                    <div>
                        <h3 className="text-sm uppercase tracking-wider text-gray-500 font-semibold mb-4">Remote Control</h3>
                        <div className="bg-white p-4 rounded-xl aspect-square flex items-center justify-center">
                            {remoteUrl && (
                                <QRCodeSVG value={remoteUrl} size={200} />
                            )}
                        </div>
                        <p className="mt-4 text-sm text-gray-400 text-center">
                            Scan to connect remote
                        </p>
                        <div className="mt-2 p-2 bg-gray-800 rounded text-xs text-gray-500 break-all font-mono text-center">
                            {remoteUrl}
                        </div>
                    </div>

                    <div className="bg-blue-900/20 border border-blue-500/20 rounded-lg p-4">
                        <h4 className="text-blue-400 font-semibold mb-2 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Tip
                        </h4>
                        <p className="text-sm text-blue-200/80">
                            Make sure both devices are connected to the same Wi-Fi network.
                        </p>
                        <p className="text-sm text-blue-200/80 mt-2">
                            Use <strong>Arrow Keys</strong> or <strong>Spacebar</strong> to control slides.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
