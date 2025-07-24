'use client';
import React, { useState, useRef } from 'react';

const LeafSegment = ({ leaf, onVoteReceived, totalLeafCount }) => {
    const [count, setCount] = useState(leaf.initialCount);
    const [isAnimating, setIsAnimating] = useState(false);
    const [shouldBounce, setShouldBounce] = useState(false);
    const animationRef = useRef(null);

    // Calculate leaf size based on TOTAL leaf count across all leaves
    let leafScale = Math.min(2.6 + ((count / (totalLeafCount || 1)) * 1.5), 3.6);
    if (!leafScale) {
        leafScale = 2.6;
    }
    
    // Handle new vote received
    const handleVote = (e) => {
        setCount(prev => prev + 1);
        triggerBounce();
        triggerAnimation();
        e.preventDefault();
        e.stopPropagation();
        onVoteReceived?.(leaf.id, count + 1, leaf.animationFile);
        console.log("LeafScale: ", leafScale);
    };

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
            className="absolute cursor-pointer transition-transform"
            style={{
                left: `${leaf.x}px`,
                top: `${leaf.y}px`,
                zIndex: leaf.zIndex,
                transform: `scale(${leafScale})`,
                transformOrigin: 'center center',
                zIndex: 10
            }}
            onClick={handleVote}
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
                </div>
            </div>

            {/* Custom CSS for text shadow */}
            <style jsx>{`
                .text-shadow {
                    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
                }
            `}</style>
        </div>
    );
};

export default LeafSegment;