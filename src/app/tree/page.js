"use client"
import React, { useState } from 'react';
import TreeContainer from './components/TreeContainer';
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

    // Handle vote received from tree container
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

        // Here you would typically send the vote to your backend
        console.log(`Vote received for ${elementId}, new count: ${newCount}, total votes: ${totalVotes + 1}, total leaf count: ${totalLeafCount + (isLeafVote ? 1 : 0)}, total root count: ${totalRootCount + (isRootVote ? 1 : 0)}`);
    };

    return (
        <div className="w-full h-screen relative overflow-hidden bg-gradient-to-b from-sky-200 via-sky-250 to-sky-300">
            {/* Include shared styles */}
            <TreeStyles />

            {/* ============================== */}
            {/* RESPONSIVE BACKGROUND ELEMENTS */}
            {/* ============================== */}

            {/* Sky Background - Full screen - z-10 */}
            <div className="absolute h-[70vh] inset-0 z-10">
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

            <div
                className="absolute h-[30vh] inset-x-0 bottom-0 z-20"
                style={{
                    background: 'linear-gradient(to bottom, #c89462, #7e644d)',
                }}
            ></div>

            {/* ============================== */}
            {/* FIXED SIZE TREE CONTAINER */}
            {/* ============================== */}

            <TreeContainer 
                className=""
                onVoteReceived={handleVoteReceived}
                totalVotes={totalVotes}
                totalLeafCount={totalLeafCount}
                totalRootCount={totalRootCount}
            />
        </div>
    );
};

export default TreePage;