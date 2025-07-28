'use client';
import React, { useState, useRef, useEffect } from 'react';

const RootCircle = ({ root, totalRootCount }) => {
    const [isBouncing, setIsBouncing] = useState(false);
    const [clientCount, setClientCount] = useState(0);
    
    // Initialize with the actual value immediately, not null
    const initialCount = root.currentCount !== undefined ? root.currentCount : root.initialCount || 0;
    const initialCountRef = useRef(initialCount);

    // Update initialCountRef only if it hasn't been set yet
    useEffect(() => {
        if (initialCountRef.current === null || initialCountRef.current === 0) {
            const initialValue = root.initialCount || 0;
            initialCountRef.current = initialValue;
        }
    }, [root]);

    // Use the count from API data, fallback to initialCount if no currentCount
    const count = root.currentCount !== undefined ? root.currentCount : root.initialCount || 0;

    // Listen for custom bounce events from TreeContainer
    useEffect(() => {
        const handleBounceEvent = (event) => {
            const { elementId, type, netCountChanged } = event.detail;
            
            // Only bounce if this event is for this specific root
            if (type === 'root' && elementId === root.id) {
                triggerBounce(netCountChanged || 1);
                // Note: We don't trigger the individual root animation here anymore
                // The main water animation is handled by TreeContainer
            }
        };

        window.addEventListener('triggerBounce', handleBounceEvent);
        
        return () => {
            window.removeEventListener('triggerBounce', handleBounceEvent);
        };
    }, [root.id]);

    // Calculate root size based on TOTAL root count across all roots
    let rootScale = Math.min(1 + ((count / (totalRootCount || 1)) * 1.5), 1.2);
    if (!rootScale || isNaN(rootScale)) {
        rootScale = 1;
    }

    // Trigger bounce animation and increment client count by netCountChanged (only called by custom event now)
    const triggerBounce = (netCountChanged = 1) => {
        setIsBouncing(true);
        setClientCount(prevCount => prevCount + netCountChanged);
        // Reset bounce after animation duration
        setTimeout(() => setIsBouncing(false), 500); // Increased to match leaf duration
    };

    // Calculate final transform including both scale and bounce
    const finalScale = rootScale * (isBouncing ? 1.15 : 1);

    // Calculate the display count - use initialCountRef.current with fallback
    const displayCount = (initialCountRef.current || 0) + clientCount;

    return (
        <div
            className="absolute"
            style={{
                left: `${root.x}px`,
                top: `${root.y}px`,
                zIndex: root.zIndex,
                transform: `scale(${finalScale})`,
                transformOrigin: 'center center',
                transition: isBouncing ? 'transform 0.5s ease-out' : 'transform 0.2s ease-out',
            }}
        >
            {/* Static SVG Circle */}
            <div className="relative w-48 h-14">
                <img
                    src={`/svg/${root.svgFile}`}
                    alt={`Root ${root.id}`}
                    className="w-14 h-14 object-contain place-self-center drop-shadow-md mb-1"
                    onError={(e) => {
                        console.error(`Failed to load root SVG: ${root.svgFile}`);
                    }}
                />
                
                {/* Count Display */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                        {displayCount}
                    </span>
                </div>
                <div className="text-[10px] font-medium leading-tight mb-[1px] text-center px-6 text-black">
                    {root.question}
                </div>
            </div>
        </div>
    );
};

export default RootCircle;