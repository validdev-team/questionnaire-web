'use client';
import React, { useState, useRef } from 'react';

const RootCircle = ({ root, onVoteReceived, totalRootCount }) => {
    const [count, setCount] = useState(root.initialCount);
    const [isAnimating, setIsAnimating] = useState(false);
    const [isBouncing, setIsBouncing] = useState(false);
    const animationRef = useRef(null);

    // Calculate root size based on individual root count relative to total
    let rootScale = Math.min(1 + (count/totalRootCount), 1.2);
    if (!rootScale) {
        rootScale = 1;
    }

    const handleVote = () => {
        setCount(prev => prev + 1);
        triggerBounce();
        triggerAnimation();
        onVoteReceived?.(root.id, count + 1, root.animationFile);
        console.log("RootScale: ", rootScale);
    };

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
            className="absolute cursor-pointer"
            style={{
                left: `${root.x}px`,
                top: `${root.y}px`,
                zIndex: root.zIndex,
                transform: `scale(${finalScale})`,
                transformOrigin: 'center center',
                transition: isBouncing ? 'transform 0.5s bounce-custom' : 'transform 0.2s ease-out',
            }}
            onClick={handleVote}
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
                <div className="text-[10px] font-medium leading-tight mb-[1px] text-center px-6">
                    {root.question}
                </div>
            </div>

            {/* WebM Animation Overlay - Only visible when animating */}
            {isAnimating && (
                <video
                    ref={animationRef}
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                    style={{ zIndex: 10 }}
                    muted
                    playsInline
                    onEnded={handleAnimationEnd}
                    onError={(e) => {
                        console.error(`Failed to load animation: ${root.animationFile}`);
                        setIsAnimating(false);
                    }}
                >
                    <source src={`/animation/${root.animationFile}`} type="video/webm" />
                </video>
            )}
        </div>
    );
};

export default RootCircle;