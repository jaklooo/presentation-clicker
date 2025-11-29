'use client';

import { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';

export function usePresentation(sessionId, role) {
    const [socket, setSocket] = useState(null);
    const [slideIndex, setSlideIndex] = useState(1);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const socketInstance = io();

        socketInstance.on('connect', () => {
            setIsConnected(true);
            console.log('Connected to socket server');
            if (sessionId) {
                socketInstance.emit('join-session', sessionId);
            }
        });

        socketInstance.on('slide-change', (newIndex) => {
            console.log('Received slide change:', newIndex);
            setSlideIndex(newIndex);
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, [sessionId]);

    const changeSlide = (newIndex) => {
        setSlideIndex(newIndex);
        if (socket) {
            socket.emit('slide-change', { sessionId, slideIndex: newIndex });
        }
    };

    return {
        socket,
        slideIndex,
        changeSlide,
        isConnected
    };
}
