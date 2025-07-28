'use client';
import React, { useState, useRef, useEffect } from 'react';

const LeafSegment = ({ leaf, totalLeafCount }) => {
    const [shouldBounce, setShouldBounce] = useState(false);
    const [clientCount, setClientCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    
    // Initialize with null - will be set when data is available
    const initialCountRef = useRef(null);

    // Update initialCountRef and loading state when leaf data is available
    useEffect(() => {
        // Check if we have a valid initialCount (number) - this comes from TreePage
        if (typeof leaf.initialCount === 'number') {
            initialCountRef.current = leaf.initialCount;
            setIsLoading(false);
        } else {
            // Still loading - no valid initialCount available yet
            setIsLoading(true);
        }
    }, [leaf.initialCount]);

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
    const count = leaf.currentCount !== undefined ? leaf.currentCount : (leaf.initialCount || 0);
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
    const displayCount = (initialCountRef.current || 0) + clientCount;

    // Show loading state if data isn't ready
    if (isLoading) {
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
                <div className="relative w-20 h-16">
                    <img
                        src={`/svg/${leaf.svgFile}`}
                        alt={`Leaf ${leaf.id}`}
                        className="w-full h-full object-contain opacity-50"
                        onError={(e) => {
                            console.error(`Failed to load leaf SVG: ${leaf.svgFile}`);
                            e.target.style.display = 'none';
                        }}
                    />
                    {/* Loading indicator */}
                    <div className="absolute inset-0 top-2 flex flex-col items-center justify-center text-white text-center px-1">
                        <div className="text-[4px] font-medium leading-tight mb-[1px] max-w-[70%] break-words">
                            {leaf.question}
                        </div>
                        <div className="text-[6px] font-bold animate-pulse">
                            ...
                        </div>
                    </div>
                </div>
            </div>
        );
    }

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
                            {displayCount}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeafSegment;