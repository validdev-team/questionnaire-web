'use client';
import React, { useState, useRef } from 'react';

const RootCircle = ({ root, onVoteReceived }) => {
    const [count, setCount] = useState(root.initialCount);
    const [isAnimating, setIsAnimating] = useState(false);
    const [bounceKey, setBounceKey] = useState(0);
    const animationRef = useRef(null);

    const handleVote = () => {
        setCount(prev => prev + 1);
        triggerBounce();
        triggerAnimation();
        onVoteReceived?.(root.id, count + 1, root.animationFile);
    };

    // Trigger bounce animation by changing the key to force re-render
    const triggerBounce = () => {
        setBounceKey(prev => prev + 1);
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

    return (
        <div
            key={bounceKey}
            className="absolute cursor-pointer"
            style={{
                left: `${root.x}px`,
                top: `${root.y}px`,
                transformOrigin: 'center center',
                animation: bounceKey > 0 ? 'bounce-custom 0.5s ease-out' : 'none'
            }}
            onClick={handleVote}
        >
            {/* Static SVG Circle */}
            <div className="relative w-40 h-20">
                <img
                    src={`/svg/${root.svgFile}`}
                    alt={`Root ${root.id}`}
                    className="w-20 h-20 object-contain place-self-center"
                    onError={(e) => {
                        console.error(`Failed to load root SVG: ${root.svgFile}`);
                    }}
                />

                {/* Count Display */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white font-bold text-lg text-shadow">
                        {count}
                    </span>
                </div>
                <div className="text-[12px] font-medium leading-tight mb-[1px] text-center text-shadow">
                    {root.question.length > 40 ?
                        root.question.substring(0, 40) + '...' :
                        root.question
                    }
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