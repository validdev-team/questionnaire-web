"use client"
import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

import TreeContainer from './components/TreeContainer';
import TreeStyles from './components/TreeStyles';
import { LEAF_CONFIG, ROOT_CONFIG } from './config/treeConfig';

// ============================================================================
// MAIN TREE PAGE COMPONENT
// ============================================================================
const TreePage = () => {
    const [results, setResults] = useState(null);
    const [previousResults, setPreviousResults] = useState(null);

    useEffect(() => {
        // Listen to the entire results collection for any changes
        const unsubscribe = onSnapshot(
            collection(db, 'results'),
            async (collectionSnapshot) => {
                try {
                    // When results collection changes, fetch the specific live document
                    const liveDocRef = doc(db, 'results', 'live');
                    const liveDocSnap = await getDoc(liveDocRef);
                    
                    if (liveDocSnap.exists()) {
                        const newData = liveDocSnap.data();
                        
                        // Store previous results before updating
                        setPreviousResults(results);
                        setResults(newData);
                    } else {
                        console.log('No live document found');
                        setPreviousResults(results);
                        setResults(null);
                    }
                } catch (error) {
                    console.error('Error fetching live document:', error);
                }
            },
            (error) => {
                console.error('Error listening to results collection:', error);
            }
        );

        return () => unsubscribe();
    }, [results]);

    // Fallback results object with 0s
    const effectiveResults = results || { 
        totalResponses: 0,
        q1c1: 0, q1c2: 0, q1c3: 0, q1c4: 0, q1c5: 0,
        q1c6: 0, q1c7: 0, q1c8: 0, q1c9: 0,
        q2c1: 0, q2c2: 0, q2c3: 0, q2c4: 0, q2c5: 0
    };
    
    const totalResponses = effectiveResults.totalResponses || 0;

    // Calculate total leaf count from API data
    const totalLeafCount =
        (effectiveResults.q1c1 || 0) +
        (effectiveResults.q1c2 || 0) +
        (effectiveResults.q1c3 || 0) +
        (effectiveResults.q1c4 || 0) +
        (effectiveResults.q1c5 || 0) +
        (effectiveResults.q1c6 || 0) +
        (effectiveResults.q1c7 || 0) +
        (effectiveResults.q1c8 || 0) +
        (effectiveResults.q1c9 || 0);

    // Calculate total root count from API data
    const totalRootCount =
        (effectiveResults.q2c1 || 0) +
        (effectiveResults.q2c2 || 0) +
        (effectiveResults.q2c3 || 0) +
        (effectiveResults.q2c4 || 0) +
        (effectiveResults.q2c5 || 0);

    // Create leaf data with API counts
    const leafDataWithCounts = LEAF_CONFIG.map((leaf, index) => {
        const apiKey = `q1c${index + 1}`;
        const currentCount = effectiveResults[apiKey] || 0;
        const previousCount = previousResults?.[apiKey] || 0;
        const hasNewVote = currentCount > previousCount;
        
        return {
            ...leaf,
            currentCount,
            hasNewVote
        };
    });

    // Create root data with API counts
    const rootDataWithCounts = ROOT_CONFIG.map((root, index) => {
        const apiKey = `q2c${index + 1}`;
        const currentCount = effectiveResults[apiKey] || 0;
        const previousCount = previousResults?.[apiKey] || 0;
        const hasNewVote = currentCount > previousCount;
        
        return {
            ...root,
            currentCount,
            hasNewVote
        };
    });

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
                totalVotes={totalResponses}
                totalLeafCount={totalLeafCount}
                totalRootCount={totalRootCount}
                leafData={leafDataWithCounts}
                rootData={rootDataWithCounts}
            />
        </div>
    );
};

export default TreePage;