'use client';
import React, { useState, useRef, useEffect } from 'react';

const RootCircle = ({ root, totalRootCount, onVoteReceived, isInitialLoad }) => {
    const [isBouncing, setIsBouncing] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const animationRef = useRef(null);
    const previousCountRef = useRef(root.currentCount || root.initialCount || 0);

    // Use the count from API data, fallback to initialCount if no currentCount
    const count = root.currentCount !== undefined ? root.currentCount : root.initialCount || 0;

    // Check for new votes and trigger animations
    useEffect(() => {
        // Don't trigger animations on initial load or if no previous data
        if (isInitialLoad || previousCountRef.current === 0) {
            previousCountRef.current = count;
            return;
        }

        if (count > previousCountRef.current) {
            triggerBounce();
            triggerAnimation();
            previousCountRef.current = count;
        }
    }, [count, isInitialLoad]);

    // Calculate root size based on individual root count relative to total
    let rootScale = Math.min(1 + ((count / (totalRootCount || 1)) * 1.5), 1.2);
    if (!rootScale || isNaN(rootScale)) {
        rootScale = 1;
    }

    // Trigger bounce animation
    const triggerBounce = () => {
        setIsBouncing(true);
        // Reset bounce after animation duration
        setTimeout(() => setIsBouncing(false), 300);
    };

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
                transition: isBouncing ? 'transform 0.5s bounce-custom' : 'transform 0.2s ease-out',
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

                {/* WebM Animation Overlay for individual root */}
                {isAnimating && root.animationFile && (
                    <video
                        ref={animationRef}
                        className="absolute inset-0 w-full h-full object-contain pointer-events-none opacity-80"
                        style={{
                            transform: 'scale(1.2)',
                            transformOrigin: 'center center'
                        }}
                        muted
                        playsInline
                        onEnded={handleAnimationEnd}
                    >
                        <source src={`/animation/${root.animationFile}`} type="video/webm" />
                        <source src={`/animation/${root.animationFile.replace('.webm', '.mp4')}`} type="video/mp4" />
                    </video>
                )}
            </div>
        </div>
    );
};

export default RootCircle;