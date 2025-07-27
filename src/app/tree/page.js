"use client"
import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [questions, setQuestions] = useState(null);
    const [questionsLoaded, setQuestionsLoaded] = useState(false);

    // Fetch questions once on component mount - optimized with useCallback
    const fetchQuestions = useCallback(async () => {
        try {
            const response = await fetch('/api/questions');
            const questionsData = await response.json();
            setQuestions(questionsData);
            setQuestionsLoaded(true);
        } catch (error) {
            console.error('Error fetching questions:', error);
            setQuestionsLoaded(true);
        }
    }, []);

    useEffect(() => {
        fetchQuestions();
    }, [fetchQuestions]);

    // Optimized Firebase listener with proper dependency array
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
                        
                        // Use functional updates to avoid dependency on current state
                        setResults(prevResults => {
                            // Only store previous results after the initial load
                            if (!isInitialLoad) {
                                setPreviousResults(prevResults);
                            }
                            return newData;
                        });
                        
                        // Mark initial load as complete after first data fetch
                        if (isInitialLoad) {
                            setIsInitialLoad(false);
                        }
                    } else {
                        console.log('No live document found');
                        setResults(prevResults => {
                            if (!isInitialLoad) {
                                setPreviousResults(prevResults);
                            }
                            return null;
                        });
                        
                        if (isInitialLoad) {
                            setIsInitialLoad(false);
                        }
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
    }, []); // Empty dependency array - no more infinite re-subscriptions

    // Memoize merged configurations to prevent recalculation on every render
    const mergedLeafConfig = useMemo(() => {
        if (!questions) return LEAF_CONFIG;
        
        const q1 = questions.find(q => q.id === 'q1');
        if (!q1) return LEAF_CONFIG;

        return LEAF_CONFIG.map((leaf, index) => {
            const choice = q1.choices[index];
            return {
                ...leaf,
                question: choice ? choice.text : leaf.option,
                option: leaf.option
            };
        });
    }, [questions]);

    const mergedRootConfig = useMemo(() => {
        if (!questions) return ROOT_CONFIG;
        
        const q2 = questions.find(q => q.id === 'q2');
        if (!q2) return ROOT_CONFIG;

        return ROOT_CONFIG.map((root, index) => {
            const choice = q2.choices[index];
            return {
                ...root,
                question: choice ? choice.text : root.option,
                option: root.option
            };
        });
    }, [questions]);

    // Memoize calculated values
    const calculatedValues = useMemo(() => {
        const effectiveResults = results || { 
            totalResponses: 0,
            q1c1: 0, q1c2: 0, q1c3: 0, q1c4: 0, q1c5: 0,
            q1c6: 0, q1c7: 0, q1c8: 0, q1c9: 0,
            q2c1: 0, q2c2: 0, q2c3: 0, q2c4: 0, q2c5: 0
        };
        
        const totalResponses = effectiveResults.totalResponses || 0;

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

        const totalRootCount =
            (effectiveResults.q2c1 || 0) +
            (effectiveResults.q2c2 || 0) +
            (effectiveResults.q2c3 || 0) +
            (effectiveResults.q2c4 || 0) +
            (effectiveResults.q2c5 || 0);

        return {
            effectiveResults,
            totalResponses,
            totalLeafCount,
            totalRootCount
        };
    }, [results]);

    // Memoize leaf data with counts and netCountChanged
    const leafDataWithCounts = useMemo(() => {
        return mergedLeafConfig.map((leaf, index) => {
            const apiKey = `q1c${index + 1}`;
            const currentCount = calculatedValues.effectiveResults[apiKey] || 0;
            const previousCount = (!isInitialLoad && previousResults) 
                ? (previousResults[apiKey] || 0) 
                : currentCount;
            const hasNewVote = !isInitialLoad && currentCount > previousCount;
            const netCountChanged = currentCount - previousCount;
            
            return {
                ...leaf,
                currentCount,
                hasNewVote,
                netCountChanged
            };
        });
    }, [mergedLeafConfig, calculatedValues.effectiveResults, previousResults, isInitialLoad]);

    // Memoize root data with counts and netCountChanged
    const rootDataWithCounts = useMemo(() => {
        return mergedRootConfig.map((root, index) => {
            const apiKey = `q2c${index + 1}`;
            const currentCount = calculatedValues.effectiveResults[apiKey] || 0;
            const previousCount = (!isInitialLoad && previousResults) 
                ? (previousResults[apiKey] || 0) 
                : currentCount;
            const hasNewVote = !isInitialLoad && currentCount > previousCount;
            const netCountChanged = currentCount - previousCount;
            
            return {
                ...root,
                currentCount,
                hasNewVote,
                netCountChanged
            };
        });
    }, [mergedRootConfig, calculatedValues.effectiveResults, previousResults, isInitialLoad]);

    // Early return for loading state
    if (!questionsLoaded) {
        return (
            <div className="w-full h-screen flex items-center justify-center bg-gradient-to-b from-sky-200 via-sky-250 to-sky-300">
                <div className="text-lg font-semibold text-gray-700">Loading...</div>
            </div>
        );
    }

    return (
        <div className="w-full h-screen relative overflow-hidden bg-gradient-to-b from-sky-200 via-sky-250 to-sky-300">
            {/* Include shared styles */}
            <TreeStyles />

            {/* Sky Background - Optimized image loading */}
            <div className="absolute h-[70vh] inset-0 z-10">
                <img
                    src="/svg/Sky.svg"
                    alt="Sky background"
                    className="w-full h-full object-cover"
                    loading="eager"
                    decoding="async"
                    onError={(e) => {
                        console.error('Sky SVG failed to load');
                        e.target.style.display = 'none';
                    }}
                />
            </div>

            {/* Ground Background */}
            <div
                className="absolute h-[30vh] inset-x-0 bottom-0 z-20"
                style={{
                    background: 'linear-gradient(to bottom, #c89462, #7e644d)',
                }}
            />

            {/* Tree Container with memoized props */}
            <TreeContainer 
                className=""
                totalVotes={calculatedValues.totalResponses}
                totalLeafCount={calculatedValues.totalLeafCount}
                totalRootCount={calculatedValues.totalRootCount}
                leafData={leafDataWithCounts}
                rootData={rootDataWithCounts}
                isInitialLoad={isInitialLoad}
            />
        </div>
    );
};

export default React.memo(TreePage);