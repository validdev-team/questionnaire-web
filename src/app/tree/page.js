"use client"
import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import LeafSegment from './components/LeafSegment';
import RootCircle from './components/RootCircle';
import TreeStyles from './components/TreeStyles';
import { LEAF_CONFIG, ROOT_CONFIG } from './config/treeConfig';

// ============================================================================
// MAIN TREE PAGE COMPONENT
// ============================================================================
const TreePage = () => {
    const [totalVotes, setTotalVotes] = useState(() => {
        // Calculate initial total from all leaf and root initial counts
        const leafTotal = LEAF_CONFIG.reduce((sum, leaf) => sum + leaf.initialCount, 0);
        const rootTotal = ROOT_CONFIG.reduce((sum, root) => sum + root.initialCount, 0);
        return leafTotal + rootTotal;
    });

    // Track total leaf count separately from total votes
    const [totalLeafCount, setTotalLeafCount] = useState(() => {
        return LEAF_CONFIG.reduce((sum, leaf) => sum + leaf.initialCount, 0);
    });

    // Track total root count separately from total votes
    const [totalRootCount, setTotalRootCount] = useState(() => {
        return ROOT_CONFIG.reduce((sum, root) => sum + root.initialCount, 0);
    });

    const [activeAnimations, setActiveAnimations] = useState([]);
    const [videoLoaded, setVideoLoaded] = useState(false);
    const animationRef = useRef(null);

    // Handle vote received from any leaf or root
    const handleVoteReceived = (elementId, newCount, animationFile) => {
        setTotalVotes(prev => prev + 1);

        // If this is a leaf vote, update the total leaf count
        const isLeafVote = LEAF_CONFIG.some(leaf => leaf.id === elementId);
        const isRootVote = ROOT_CONFIG.some(root => root.id === elementId);
        
        if (isLeafVote) {
            setTotalLeafCount(prev => prev + 1);
        } else if (isRootVote) {
            setTotalRootCount(prev => prev + 1);
        }

        // Trigger animation on tree trunk
        triggerTreeAnimation(animationFile);

        // Here you would typically send the vote to your backend
        console.log(`Vote received for ${elementId}, new count: ${newCount}, total votes: ${totalVotes + 1}, total leaf count: ${totalLeafCount + (isLeafVote ? 1 : 0)}, total root count: ${totalRootCount + (isRootVote ? 1 : 0)}`);
    };

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
        <div className="w-[1280px] h-[720px] relative overflow-hidden bg-gradient-to-b from-sky-200 via-sky-100 to-yellow-200">
            
            {/* Include shared styles */}
            <TreeStyles />

            {/* ============================== */}
            {/* BACKGROUND ELEMENTS */}
            {/* ============================== */}

            {/* Sky Background */}
            <div className="absolute inset-0">
                <img
                    src="/svg/Sky.svg"
                    alt="Sky background"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        console.error('Sky SVG failed to load');
                        e.target.style.display = 'none';
                    }}
                />
            </div>

            {/* Ground Layer */}
            <div className="absolute bottom-0 left-0 right-0">
                <img
                    src="/svg/Ground.svg"
                    alt="Ground"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        console.error('Ground SVG failed to load');
                        e.target.style.background = 'linear-gradient(to bottom, #DEB887, #CD853F)';
                    }}
                />
            </div>

            {/* Tree Trunk and Roots */}
            <div className="absolute h-[60%] bottom-[80px] left-0 right-0 flex items-center justify-center">
                <img
                    src="/svg/Tree Trunk-Roots.svg"
                    alt="Tree trunk and roots"
                    className="max-w-none h-full object-contain z-50"
                    onError={(e) => {
                        console.error('Tree trunk SVG failed to load');
                        e.target.style.display = 'none';
                    }}
                />
                <img
                    src="/svg/BgLeaves.svg"
                    alt="Background leaves"
                    className="absolute top-[60px] w-[800px] object-contain z-0"
                    onError={(e) => {
                        console.error('Background leaves SVG failed to load');
                        e.target.style.display = 'none';
                    }}
                />

                {/* WebM Animation Overlay - Always present but only visible when animating */}
                {activeAnimations.map(anim => (
                    <video
                        key={anim.id}
                        className="absolute h-[60%] pl-3 pb-10 object-contain pointer-events-none opacity-100"
                        style={{
                            zIndex: 50,
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

            {/* ============================== */}
            {/* UI OVERLAY ELEMENTS */}
            {/* ============================== */}

            {/* Live Counter - Top Right */}
            <div className="absolute top-6 right-12 px-6 py-4 z-50">
                <h3 className="text-gray-600 text-sm font-semibold uppercase tracking-wider">
                    LIVE COUNT
                </h3>
                <div className="text-2xl font-bold text-green-600 place-self-center">
                    {totalVotes.toLocaleString('en-US')}
                </div>
            </div>

            {/* ============================== */}
            {/* INTERACTIVE TREE ELEMENTS */}
            {/* ============================== */}

            {/* Tree Container - This holds all the interactive elements */}
            <div className="absolute inset-0 z-100" style={{
                width: '1280px',
                height: '720px',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)'
            }}>

                {/* Render all leaf segments */}
                {LEAF_CONFIG.map(leaf => (
                    <LeafSegment
                        key={leaf.id}
                        leaf={leaf}
                        onVoteReceived={handleVoteReceived}
                        totalLeafCount={totalLeafCount}
                    />
                ))}

                {/* Render all root circles */}
                {ROOT_CONFIG.map(root => (
                    <RootCircle
                        key={root.id}
                        root={root}
                        onVoteReceived={handleVoteReceived}
                        totalRootCount={totalRootCount}
                    />
                ))}
            </div>

            {/* Debug info - Remove this in production */}
            {process.env.NODE_ENV === 'development' && (
                <div className="absolute top-6 left-6 px-4 py-2 bg-black bg-opacity-50 text-white text-sm z-50">
                    <div>Active Animations: {activeAnimations.length}</div>
                    <div>Video Loaded: {videoLoaded ? 'Yes' : 'No'}</div>
                </div>
            )}

        </div>
    );
};

export default TreePage;