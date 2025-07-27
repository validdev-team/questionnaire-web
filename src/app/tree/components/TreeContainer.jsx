"use client"
import React, { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import LeafSegment from './LeafSegment';
import RootCircle from './RootCircle';

const TreeContainer = ({ totalVotes, totalLeafCount, totalRootCount, leafData, rootData, isInitialLoad }) => {
    const [activeAnimations, setActiveAnimations] = useState([]);
    const [animationQueue, setAnimationQueue] = useState([]);
    const previousLeafDataRef = useRef({});
    const previousRootDataRef = useRef({});
    
    // Configuration for animation limits
    const MAX_CONCURRENT_ANIMATIONS = 4; // Maximum animations playing at once
    const ANIMATION_DURATION = 2000; // Duration in milliseconds
    
    // Timing configuration for when water reaches different elements
    const WATER_TIMING = {
        leaf: 1200, // Time when water reaches leaves (adjust based on your animation)
        root: 800   // Time when water reaches roots (adjust based on your animation)
    };

    // Process animation queue
    useEffect(() => {
        if (animationQueue.length > 0 && activeAnimations.length < MAX_CONCURRENT_ANIMATIONS) {
            const nextAnimation = animationQueue[0];
            
            // Move from queue to active
            setAnimationQueue(prev => prev.slice(1));
            setActiveAnimations(prev => [...prev, nextAnimation]);

            // Start the water animation immediately

            // Schedule the bounce animation to trigger when water reaches the element
            const bounceTimeout = setTimeout(() => {
                triggerElementBounce(nextAnimation.elementId, nextAnimation.type, nextAnimation.netCountChanged);
            }, WATER_TIMING[nextAnimation.type]);

            // Store the timeout ID so we can clear it if needed
            nextAnimation.bounceTimeoutId = bounceTimeout;

            // Auto-remove animation after it finishes
            const cleanupTimeout = setTimeout(() => {
                setActiveAnimations(prev => {
                    const updated = prev.filter(a => a.id !== nextAnimation.id);
                    // Clear the bounce timeout if animation is removed early
                    if (nextAnimation.bounceTimeoutId) {
                        clearTimeout(nextAnimation.bounceTimeoutId);
                    }
                    return updated;
                });
            }, ANIMATION_DURATION);

            // Store cleanup timeout ID
            nextAnimation.cleanupTimeoutId = cleanupTimeout;
        }
    }, [animationQueue, activeAnimations]);

    // Function to trigger bounce on specific leaf/root
    const triggerElementBounce = (elementId, type, netCountChanged) => {
        // Create a custom event to communicate with individual components
        const event = new CustomEvent('triggerBounce', {
            detail: { 
                elementId, 
                type,
                netCountChanged,
                timestamp: Date.now() // Add timestamp for debugging
            }
        });
        window.dispatchEvent(event);
    };

    // Check for new votes and add animations to queue
    useEffect(() => {
        if (!leafData || !rootData || isInitialLoad) return;

        const newAnimations = [];

        // Check leaves for new votes
        leafData.forEach(leaf => {
            const previousCount = previousLeafDataRef.current[leaf.id]?.currentCount ?? leaf.currentCount;
            if (leaf.currentCount > previousCount) {
                // Calculate the actual change between current and previous count
                const actualChange = leaf.currentCount - previousCount;
                // Add to queue with unique ID and actual change count
                newAnimations.push({
                    id: `leaf-${leaf.id}-${Date.now()}-${Math.random()}`,
                    file: leaf.animationFile,
                    type: 'leaf',
                    elementId: leaf.id,
                    netCountChanged: actualChange, // Use the direct difference
                    createdAt: Date.now()
                });
            }
        });

        // Check roots for new votes
        rootData.forEach(root => {
            const previousCount = previousRootDataRef.current[root.id]?.currentCount ?? root.currentCount;
            if (root.currentCount > previousCount) {
                // Calculate the actual change between current and previous count
                const actualChange = root.currentCount - previousCount;
                // Add to queue with unique ID and actual change count
                newAnimations.push({
                    id: `root-${root.id}-${Date.now()}-${Math.random()}`,
                    file: root.animationFile,
                    type: 'root',
                    elementId: root.id,
                    netCountChanged: actualChange, // Use the direct difference
                    createdAt: Date.now()
                });
            }
        });

        // Add new animations to queue
        if (newAnimations.length > 0) {
            setAnimationQueue(prev => [...prev, ...newAnimations]);
        }

        // Update previous data refs
        previousLeafDataRef.current = leafData.reduce((acc, leaf) => {
            acc[leaf.id] = { currentCount: leaf.currentCount };
            return acc;
        }, {});

        previousRootDataRef.current = rootData.reduce((acc, root) => {
            acc[root.id] = { currentCount: root.currentCount };
            return acc;
        }, {});

    }, [leafData, rootData, isInitialLoad]);

    // Cleanup timeouts on unmount
    useEffect(() => {
        return () => {
            activeAnimations.forEach(anim => {
                if (anim.bounceTimeoutId) {
                    clearTimeout(anim.bounceTimeoutId);
                }
                if (anim.cleanupTimeoutId) {
                    clearTimeout(anim.cleanupTimeoutId);
                }
            });
        };
    }, []);

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
                        onLoadedData={() => {
                        }}
                        onPlay={() => {
                        }}
                        onEnded={() => {
                            setActiveAnimations(prev => {
                                const updated = prev.filter(a => a.id !== anim.id);
                                // Clear timeouts when video ends
                                if (anim.bounceTimeoutId) {
                                    clearTimeout(anim.bounceTimeoutId);
                                }
                                if (anim.cleanupTimeoutId) {
                                    clearTimeout(anim.cleanupTimeoutId);
                                }
                                return updated;
                            });
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
                        isInitialLoad={isInitialLoad}
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
                        isInitialLoad={isInitialLoad}
                    />
                </div>
            ))}

            {/* Debug info - Remove this in production - z-100 (always visible) */}
            {process.env.NODE_ENV === 'development' && (
                <div className="absolute top-6 left-6 px-4 py-2 bg-black bg-opacity-50 text-white text-sm z-100">
                    <div>Active Animations: {activeAnimations.length}</div>
                    <div>Queued Animations: {animationQueue.length}</div>
                    <div>Total Leaf Count: {totalLeafCount}</div>
                    <div>Total Root Count: {totalRootCount}</div>
                    {activeAnimations.length > 0 && (
                        <div className="mt-2 text-xs">
                            <div>Current animations:</div>
                            {activeAnimations.map(anim => (
                                <div key={anim.id} className="text-yellow-300">
                                    {anim.type} {anim.elementId} (+{anim.netCountChanged})
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TreeContainer;