'use client';
import React, { useState, useRef, useEffect } from 'react';

const LeafSegment = ({ leaf, totalLeafCount, allLeafData }) => {
    const [shouldBounce, setShouldBounce] = useState(false);
    const [clientCount, setClientCount] = useState(0);
    
    // Initialize with the actual value immediately, not null
    const initialCount = leaf.currentCount !== undefined ? leaf.currentCount : leaf.initialCount || 0;
    const initialCountRef = useRef(initialCount);

    // Update initialCountRef only if it hasn't been set yet
    useEffect(() => {
        if (initialCountRef.current === null || initialCountRef.current === 0) {
            
            const initialValue = 0;
            initialCountRef.current = initialValue;
        }
    }, [leaf]);

    // Use the count from API data, fallback to initialCount if no currentCount
    const count = leaf.currentCount !== undefined ? leaf.currentCount : leaf.initialCount || 0;

    // Listen for custom bounce events from TreeContainer
    useEffect(() => {
        const handleBounceEvent = (event) => {
            const { elementId, type, netCountChanged } = event.detail;
            
            // Only bounce if this event is for this specific leaf
            if (type === 'leaf' && elementId === leaf.id) {
                triggerBounce(netCountChanged || 1);
            }
        };

        window.addEventListener('triggerBounce', handleBounceEvent);
        
        return () => {
            window.removeEventListener('triggerBounce', handleBounceEvent);
        };
    }, [leaf.id]);

    // Calculate leaf size based on TOTAL leaf count across all leaves
    let leafScale = Math.min(2.6 + ((count / (totalLeafCount || 1)) * 1.5), 3.6);
    if (!leafScale || isNaN(leafScale)) {
        leafScale = 2.6;
    }

    // Trigger bounce animation and increment client count by netCountChanged (only called by custom event now)
    const triggerBounce = (netCountChanged = 1) => {
        setShouldBounce(true);
        setClientCount(prevCount => prevCount + netCountChanged);
    };

    const handleBounceEnd = () => {
        setShouldBounce(false);
    };

    // Calculate the display count - use initialCountRef.current with fallback
    const displayCount = initialCountRef.current + clientCount;
    
    // Calculate total votes across all leaves for this question
    // We need to use the actual current count (including client updates) for this leaf
    // and the server data for other leaves (since we don't have access to their clientCount)
    const totalLeafVotes = (allLeafData || []).reduce((sum, leafItem) => {
        if (leafItem.id === leaf.id) {
            // For this leaf, use the displayCount which includes client updates
            return sum + displayCount;
        } else {
            // For other leaves, use their current server count
            const leafDisplayCount = (leafItem.currentCount !== undefined ? leafItem.currentCount : leafItem.initialCount || 0);
            return sum + leafDisplayCount;
        }
    }, 0);
    
    // Calculate percentage: (this leaf's votes / total leaf votes) * 100
    const percentage = totalLeafVotes > 0 ? (displayCount / totalLeafVotes) * 100 : 0;

    return (
        <div
            className="absolute transition-transform"
            style={{
                left: `${leaf.x}px`,
                top: `${leaf.y}px`,
                zIndex: leaf.zIndex,
                transform: `scale(${leafScale})`,
                transformOrigin: 'center center',
            }}
        >
            {/* Inner wrapper for bounce animation */}
            <div
                className="transition-transform"
                style={{
                    animation: shouldBounce ? 'bounce-custom 0.5s ease-out' : 'none',
                    transformOrigin: 'center center',
                }}
                onAnimationEnd={handleBounceEnd}
            >
                {/* Static SVG Leaf and text */}
                <div className="relative w-20 h-16">
                    <img
                        src={`/svg/${leaf.svgFile}`}
                        alt={`Leaf ${leaf.id}`}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                            console.error(`Failed to load leaf SVG: ${leaf.svgFile}`);
                            e.target.style.display = 'none';
                        }}
                    />

                    {/* Text Overlay on Leaf */}
                    <div className="absolute inset-0 top-2 flex flex-col items-center justify-center text-white text-center px-1">
                        <div className="text-[4px] font-medium leading-tight mb-[1px] max-w-[70%] break-words">
                            {leaf.question}
                        </div>
                        <div className="text-[6px] font-bold">
                            {percentage.toFixed(1)}%
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeafSegment;