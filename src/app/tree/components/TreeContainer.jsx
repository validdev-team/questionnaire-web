"use client"
import React, { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import LeafSegment from './LeafSegment';
import RootCircle from './RootCircle';

const TreeContainer = ({ totalVotes, totalLeafCount, totalRootCount, leafData, rootData }) => {
    const [activeAnimations, setActiveAnimations] = useState([]);
    const previousLeafDataRef = useRef({});
    const previousRootDataRef = useRef({});

    // Check for new votes and trigger animations
    useEffect(() => {
        if (!leafData || !rootData) return;

        // Check leaves for new votes
        leafData.forEach(leaf => {
            const previousCount = previousLeafDataRef.current[leaf.id]?.currentCount || 0;
            if (leaf.currentCount > previousCount) {
                // Trigger animation for this leaf
                triggerTreeAnimation(leaf.animationFile);
            }
        });

        // Check roots for new votes
        rootData.forEach(root => {
            const previousCount = previousRootDataRef.current[root.id]?.currentCount || 0;
            if (root.currentCount > previousCount) {
                // Trigger animation for this root
                triggerTreeAnimation(root.animationFile);
            }
        });

        // Update previous data refs
        previousLeafDataRef.current = leafData.reduce((acc, leaf) => {
            acc[leaf.id] = { currentCount: leaf.currentCount };
            return acc;
        }, {});

        previousRootDataRef.current = rootData.reduce((acc, root) => {
            acc[root.id] = { currentCount: root.currentCount };
            return acc;
        }, {});

    }, [leafData, rootData]);

    // Trigger animation on tree trunk
    const triggerTreeAnimation = (animationFile) => {
        const newAnimation = {
            id: uuidv4(),
            file: animationFile,
        };

        setActiveAnimations(prev => [...prev, newAnimation]);

        // Auto-remove animation after it finishes (e.g., 2 seconds)
        setTimeout(() => {
            setActiveAnimations(prev => prev.filter(a => a.id !== newAnimation.id));
        }, 2000); // adjust to match actual video length
    };

    return (
        <div className="
            absolute inset-0 z-30
            w-[1280px] h-[720px]
            left-1/2 top-[50%] 
            -translate-x-1/2 -translate-y-1/2
            ">
            {/* Tree Trunk and Roots */}
            <div className="absolute h-[60%] bottom-[80px] left-0 right-0 flex items-center justify-center">
                {/* Background Leaves - z-10 (bottom layer) */}
                <img
                    src="/svg/BgLeaves.svg"
                    alt="Background leaves"
                    className="absolute top-[60px] w-[800px] object-contain z-10"
                    onError={(e) => {
                        console.error('Background leaves SVG failed to load');
                        e.target.style.display = 'none';
                    }}
                />
                
                {/* Tree Trunk - z-15 (above bg leaves, but below leaf segments) */}
                <img
                    src="/svg/Tree Trunk-Roots.svg"
                    alt="Tree trunk and roots"
                    className="max-w-none h-full object-contain z-15"
                    onError={(e) => {
                        console.error('Tree trunk SVG failed to load');
                        e.target.style.display = 'none';
                    }}
                />

                {/* WebM Animation Overlay - z-25 (above tree trunk, below leaf segments) */}
                {activeAnimations.map(anim => (
                    <video
                        key={anim.id}
                        className="absolute h-[60%] pl-3 pb-10 object-contain pointer-events-none opacity-100 z-25"
                        style={{
                            transform: 'scale(3.5)',
                            transformOrigin: 'center center'
                        }}
                        muted
                        playsInline
                        autoPlay
                        onEnded={() => {
                            setActiveAnimations(prev => prev.filter(a => a.id !== anim.id));
                        }}
                    >
                        <source src={`/animation/${anim.file}`} type="video/webm" />
                        <source src={`/animation/${anim.file.replace('.webm', '.mp4')}`} type="video/mp4" />
                    </video>
                ))}
            </div>

            {/* Live Counter - Top Right - z-90 (always on top) */}
            <div className="absolute top-6 bg-white rounded-2xl flex flex-col shadow-lg items-center right-12 px-6 py-4 z-90">
                <h3 className="text-gray-600 text-sm font-semibold uppercase tracking-wider">
                    LIVE COUNT
                </h3>
                <div className="text-2xl font-bold text-green-600 place-self-center">
                    {totalVotes.toLocaleString('en-US')}
                </div>
            </div>

            {/* Render all leaf segments with API data - z-30 */}
            {leafData && leafData.map(leaf => (
                <div key={leaf.id} className="z-30">
                    <LeafSegment
                        leaf={leaf}
                        totalLeafCount={totalLeafCount}
                        onVoteReceived={() => {}} // Placeholder since we're using API data
                    />
                </div>
            ))}

            {/* Render all root circles with API data - z-40 */}
            {rootData && rootData.map(root => (
                <div key={root.id} className="z-40">
                    <RootCircle
                        root={root}
                        totalRootCount={totalRootCount}
                        onVoteReceived={() => {}} // Placeholder since we're using API data
                    />
                </div>
            ))}

            {/* Debug info - Remove this in production - z-100 (always visible) */}
            {process.env.NODE_ENV === 'development' && (
                <div className="absolute top-6 left-6 px-4 py-2 bg-black bg-opacity-50 text-white text-sm z-100">
                    <div>Active Animations: {activeAnimations.length}</div>
                    <div>Total Leaf Count: {totalLeafCount}</div>
                    <div>Total Root Count: {totalRootCount}</div>
                </div>
            )}
        </div>
    );
};

export default TreeContainer;