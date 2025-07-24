'use client';
import React, { useState } from 'react';

const LeafSegment = ({ leaf, onVoteReceived }) => {
    const [count, setCount] = useState(leaf.initialCount);

    // Calculate leaf size based on vote count (grows with more votes)
    const leafScale = 2.8 + (count / 200);
    
    // Handle new vote received
    const handleVote = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        console.log(`Leaf ${leaf.id} clicked! Sending animation: ${leaf.animationFile} to tree trunk`);
        
        const newCount = count + 1;
        setCount(newCount);
        
        // Send the vote and animation file to the parent (TreePage)
        // The animation will play on the tree trunk, not on this component
        onVoteReceived?.(leaf.id, newCount, leaf.animationFile);
    };

    return (
        <div 
            className="absolute cursor-pointer transition-transform duration-500 ease-out hover:scale-110"
            style={{
                left: `${leaf.x}px`,
                top: `${leaf.y}px`,
                transform: `scale(${leafScale})`,
                transformOrigin: 'center center',
                zIndex: 10
            }}
            onClick={handleVote}
        >
            {/* Static SVG Leaf */}
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