'use client';
import React, { useState } from 'react';

const RootCircle = ({ root, onVoteReceived }) => {
    const [count, setCount] = useState(root.initialCount);

    const handleVote = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        console.log(`Root ${root.id} clicked! Sending animation: ${root.animationFile} to tree trunk`);
        
        const newCount = count + 1;
        setCount(newCount);
        
        // Send the vote and animation file to the parent (TreePage)
        // The animation will play on the tree trunk, not on this component
        onVoteReceived?.(root.id, newCount, root.animationFile);
    };

    return (
        <div 
            className="absolute cursor-pointer hover:scale-105 transition-transform duration-200"
            style={{
                left: `${root.x}px`,
                top: `${root.y}px`,
                zIndex: 10
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

            {/* Custom CSS for text shadow */}
            <style jsx>{`
                .text-shadow {
                    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
                }
            `}</style>
        </div>
    );
};

export default RootCircle;