'use client';
import React, { useState, useRef } from 'react';

const LeafSegment = ({ leaf, onVoteReceived }) => {
    const [count, setCount] = useState(leaf.initialCount);
    const [isAnimating, setIsAnimating] = useState(false);
    const [bounceKey, setBounceKey] = useState(0);
    const animationRef = useRef(null);

    // Calculate leaf size based on vote count (grows with more votes)
    const leafScale = 2.8 + (count / 10); // Adjust divisor to control growth rate

    // Handle new vote received
    const handleVote = () => {
        setCount(prev => prev + 1);
        triggerBounce();
        triggerAnimation();
        onVoteReceived?.(leaf.id, count + 1, leaf.animationFile);
    };

    // Trigger bounce animation by changing the key to force re-render
    const triggerBounce = () => {
        setBounceKey(prev => prev + 1);
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
            key={bounceKey}
            className="absolute cursor-pointer transition-transform"
            style={{
                left: `${leaf.x}px`,
                top: `${leaf.y}px`,
                transform: `scale(${leafScale})`,
                transformOrigin: 'center center',
            }}
            onClick={handleVote} // Remove this in production - just for testing
        >
            {/* Inner wrapper for bounce */}
            <div
                className="transition-transform"
                style={{
                    animation: bounceKey > 0 ? 'bounce-custom 0.5s ease-out' : 'none',
                    transformOrigin: 'center center',
                }}>

                {/* Static SVG Leaf and text */}
                <div className="relative w-20 h-16">
                    <img
                        src={`/svg/${leaf.svgFile}`}
                        alt={`Leaf ${leaf.id}`}
                        className="w-full h-full object-contain drop-shadow-lg"
                        onError={(e) => {
                            console.error(`Failed to load leaf SVG: ${leaf.svgFile}`);
                            e.target.style.display = 'none';
                        }}
                    />

                    {/* Text Overlay on Leaf */}
                    <div className="absolute inset-0 top-2 flex flex-col items-center justify-center text-white text-center px-1">
                        <div className="text-[4px] font-medium leading-tight mb-[1px] text-shadow">
                            {leaf.question.length > 60 ?
                                leaf.question.substring(0, 60) + '...' :
                                leaf.question
                            }
                        </div>
                        <div className="text-[6px] font-bold text-shadow">
                            {count}
                        </div>
                    </div>
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
                        console.error(`Failed to load animation: ${leaf.animationFile}`);
                        setIsAnimating(false);
                    }}
                >
                    <source src={`/animation/${leaf.animationFile}`} type="video/webm" />
                </video>
            )}
        </div>
    );
};

export default LeafSegment;