'use client';
import React, { useState, useRef, useEffect } from 'react';

const LeafSegment = ({ leaf, totalLeafCount, onVoteReceived, isInitialLoad }) => {
    const [shouldBounce, setShouldBounce] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const animationRef = useRef(null);
    const previousCountRef = useRef(leaf.currentCount || leaf.initialCount || 0);

    // Use the count from API data, fallback to initialCount if no currentCount
    const count = leaf.currentCount !== undefined ? leaf.currentCount : leaf.initialCount || 0;

    // Listen for custom bounce events from TreeContainer
    useEffect(() => {
        const handleBounceEvent = (event) => {
            const { elementId, type } = event.detail;
            
            // Only bounce if this event is for this specific leaf
            if (type === 'leaf' && elementId === leaf.id) {
                console.log(`Leaf ${leaf.id} received bounce event`);
                triggerBounce();
                // Note: We don't trigger the individual leaf animation here anymore
                // The main water animation is handled by TreeContainer
            }
        };

        window.addEventListener('triggerBounce', handleBounceEvent);
        
        return () => {
            window.removeEventListener('triggerBounce', handleBounceEvent);
        };
    }, [leaf.id]);

    // Update previous count reference when count changes (but don't trigger animations)
    useEffect(() => {
        previousCountRef.current = count;
    }, [count]);

    // Calculate leaf size based on TOTAL leaf count across all leaves
    let leafScale = Math.min(2.6 + ((count / (totalLeafCount || 1)) * 1.5), 3.6);
    if (!leafScale || isNaN(leafScale)) {
        leafScale = 2.6;
    }

    // Trigger bounce animation (only called by custom event now)
    const triggerBounce = () => {
        setShouldBounce(true);
    };

    const handleBounceEnd = () => {
        setShouldBounce(false);
    };

    // These functions are kept for potential future use but not called automatically
    const triggerAnimation = () => {
        if (animationRef.current && !isAnimating) {
            setIsAnimating(true);
            animationRef.current.currentTime = 0;
            animationRef.current.play();
        }
    };

    const handleAnimationEnd = () => {
        setIsAnimating(false);
    };

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
                            {count}
                        </div>
                    </div>

                    {/* Individual leaf animation is removed since TreeContainer handles the main animation */}
                    {/* We could add this back if you want both animations, but typically you'd want one or the other */}
                </div>
            </div>
        </div>
    );
};

export default LeafSegment;