'use client';
import React, { useState, useRef, useEffect } from 'react';

const LeafSegment = ({ leaf, totalLeafCount, onVoteReceived, isInitialLoad }) => {
    const [shouldBounce, setShouldBounce] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const animationRef = useRef(null);
    const previousCountRef = useRef(leaf.currentCount || leaf.initialCount || 0);

    // Use the count from API data, fallback to initialCount if no currentCount
    const count = leaf.currentCount !== undefined ? leaf.currentCount : leaf.initialCount || 0;

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

    // Calculate leaf size based on TOTAL leaf count across all leaves
    let leafScale = Math.min(2.6 + ((count / (totalLeafCount || 1)) * 1.5), 3.6);
    if (!leafScale || isNaN(leafScale)) {
        leafScale = 2.6;
    }

    // Trigger bounce animation
    const triggerBounce = () => {
        setShouldBounce(true);
    };

    const handleBounceEnd = () => {
        setShouldBounce(false);
    };

    // Trigger WebM animation when vote is received
    const triggerAnimation = () => {
        if (animationRef.current && !isAnimating) {
            setIsAnimating(true);
            animationRef.current.currentTime = 0;
            animationRef.current.play();
        }
    };

    // Reset animation state when WebM finishes playing
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

                    {/* WebM Animation Overlay for individual leaf */}
                    {isAnimating && leaf.animationFile && (
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
                            <source src={`/animation/${leaf.animationFile}`} type="video/webm" />
                            <source src={`/animation/${leaf.animationFile.replace('.webm', '.mp4')}`} type="video/mp4" />
                        </video>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LeafSegment;