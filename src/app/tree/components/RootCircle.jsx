'use client';
import React, { useState, useRef, useEffect } from 'react';

const RootCircle = ({ root, totalRootCount, onVoteReceived, isInitialLoad }) => {
    const [isBouncing, setIsBouncing] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const animationRef = useRef(null);
    const previousCountRef = useRef(root.currentCount || root.initialCount || 0);

    // Use the count from API data, fallback to initialCount if no currentCount
    const count = root.currentCount !== undefined ? root.currentCount : root.initialCount || 0;

    // Listen for custom bounce events from TreeContainer
    useEffect(() => {
        const handleBounceEvent = (event) => {
            const { elementId, type } = event.detail;
            
            // Only bounce if this event is for this specific root
            if (type === 'root' && elementId === root.id) {
                console.log(`Root ${root.id} received bounce event`);
                triggerBounce();
                // Note: We don't trigger the individual root animation here anymore
                // The main water animation is handled by TreeContainer
            }
        };

        window.addEventListener('triggerBounce', handleBounceEvent);
        
        return () => {
            window.removeEventListener('triggerBounce', handleBounceEvent);
        };
    }, [root.id]);

    // Update previous count reference when count changes (but don't trigger animations)
    useEffect(() => {
        previousCountRef.current = count;
    }, [count]);

    // Calculate root size based on individual root count relative to total
    let rootScale = Math.min(1 + ((count / (totalRootCount || 1)) * 1.5), 1.2);
    if (!rootScale || isNaN(rootScale)) {
        rootScale = 1;
    }

    // Trigger bounce animation (only called by custom event now)
    const triggerBounce = () => {
        setIsBouncing(true);
        // Reset bounce after animation duration
        setTimeout(() => setIsBouncing(false), 500); // Increased to match leaf duration
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

    // Calculate final transform including both scale and bounce
    const finalScale = rootScale * (isBouncing ? 1.15 : 1);

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
                        {count}
                    </span>
                </div>
                <div className="text-[10px] font-medium leading-tight mb-[1px] text-center px-6 text-black">
                    {root.question}
                </div>

                {/* Individual root animation is removed since TreeContainer handles the main animation */}
                {/* We could add this back if you want both animations, but typically you'd want one or the other */}
            </div>
        </div>
    );
};

export default RootCircle;