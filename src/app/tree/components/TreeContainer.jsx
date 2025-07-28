"use client"
import { useState, useRef, useEffect } from 'react';
import LeafSegment from './LeafSegment';
import RootCircle from './RootCircle';
import LoadingTree from './LoadingTree';

const TreeContainer = ({ totalVotes, totalLeafCount, totalRootCount, leafData, rootData, isInitialLoad }) => {
    const [activeAnimations, setActiveAnimations] = useState([]);
    const [animationQueue, setAnimationQueue] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Check if we have all required data
    useEffect(() => {
        if (leafData && rootData && totalVotes !== undefined) {
            setIsLoading(false);
        }
    }, [leafData, rootData, totalVotes]);
    
    const previousLeafDataRef = useRef({});
    const previousRootDataRef = useRef({});
    
    // Configuration for animation limits - INCREASED FOR BETTER PERFORMANCE
    const MAX_CONCURRENT_ANIMATIONS = 4; // Increased from 4
    const ANIMATION_DURATION = 1000; // Reduced from 2000ms
    const QUEUE_PROCESS_INTERVAL = 300; // Process queue every 300ms instead of on every change
    
    // Timing configuration for when water reaches different elements
    const WATER_TIMING = {
        leaf: 600, // Reduced from 900ms
        root: 500   // Reduced from 800ms
    };

    // QUEUE OPTIMIZATION: Merge animations with same elementId and type
    const optimizeQueue = (queue) => {
        if (queue.length <= 1) return queue;
        
        // Group by elementId and type
        const grouped = {};
        
        queue.forEach(animation => {
            const key = `${animation.type}-${animation.elementId}`;
            if (!grouped[key]) {
                grouped[key] = {
                    ...animation,
                    netCountChanged: 0,
                    mergedAnimations: []
                };
            }
            grouped[key].netCountChanged += animation.netCountChanged;
            grouped[key].mergedAnimations.push(animation.id);
        });
        
        // Convert back to array and filter out zero changes
        return Object.values(grouped).filter(anim => anim.netCountChanged > 0);
    };

    // FASTER QUEUE PROCESSING: Process multiple animations at once
    const processQueueBatch = () => {
        if (animationQueue.length === 0) return;
        
        // Optimize queue first
        const optimizedQueue = optimizeQueue(animationQueue);
        
        // Calculate how many we can process
        const availableSlots = MAX_CONCURRENT_ANIMATIONS - activeAnimations.length;
        if (availableSlots <= 0) return;
        
        // Take up to availableSlots animations
        const batchToProcess = optimizedQueue.slice(0, availableSlots);
        const remainingQueue = optimizedQueue.slice(availableSlots);
        
        // Update queue with remaining items
        setAnimationQueue(remainingQueue);
        
        // Process the batch
        batchToProcess.forEach(animation => {
            // Add to active animations
            setActiveAnimations(prev => [...prev, animation]);

            // Schedule the bounce animation to trigger when water reaches the element
            const bounceTimeout = setTimeout(() => {
                triggerElementBounce(animation.elementId, animation.type, animation.netCountChanged);
            }, WATER_TIMING[animation.type]);

            // Store the timeout ID
            animation.bounceTimeoutId = bounceTimeout;

            // Auto-remove animation after it finishes
            const cleanupTimeout = setTimeout(() => {
                setActiveAnimations(prev => {
                    const updated = prev.filter(a => a.id !== animation.id);
                    // Clear the bounce timeout if animation is removed early
                    if (animation.bounceTimeoutId) {
                        clearTimeout(animation.bounceTimeoutId);
                    }
                    return updated;
                });
            }, ANIMATION_DURATION);

            // Store cleanup timeout ID
            animation.cleanupTimeoutId = cleanupTimeout;
        });
    };

    // Process queue at regular intervals instead of on every change
    useEffect(() => {
        const interval = setInterval(processQueueBatch, QUEUE_PROCESS_INTERVAL);
        return () => clearInterval(interval);
    }, [animationQueue, activeAnimations]);

    // Function to trigger bounce on specific leaf/root
    const triggerElementBounce = (elementId, type, netCountChanged) => {
        // Create a custom event to communicate with individual components
        const event = new CustomEvent('triggerBounce', {
            detail: { 
                elementId, 
                type,
                netCountChanged,
                timestamp: Date.now()
            }
        });
        window.dispatchEvent(event);
    };

    // OPTIMIZED: Batch new animations before adding to queue
    useEffect(() => {
        if (!leafData || !rootData || isInitialLoad) return;

        const newAnimations = [];

        // Check leaves for new votes
        leafData.forEach(leaf => {
            const previousCount = previousLeafDataRef.current[leaf.id]?.currentCount ?? leaf.currentCount;
            if (leaf.currentCount > previousCount) {
                const actualChange = leaf.currentCount - previousCount;
                newAnimations.push({
                    id: `leaf-${leaf.id}-${Date.now()}-${Math.random()}`,
                    file: leaf.animationFile,
                    type: 'leaf',
                    elementId: leaf.id,
                    netCountChanged: actualChange,
                    createdAt: Date.now()
                });
            }
        });

        // Check roots for new votes
        rootData.forEach(root => {
            const previousCount = previousRootDataRef.current[root.id]?.currentCount ?? root.currentCount;
            if (root.currentCount > previousCount) {
                const actualChange = root.currentCount - previousCount;
                newAnimations.push({
                    id: `root-${root.id}-${Date.now()}-${Math.random()}`,
                    file: root.animationFile,
                    type: 'root',
                    elementId: root.id,
                    netCountChanged: actualChange,
                    createdAt: Date.now()
                });
            }
        });

        // OPTIMIZATION: Pre-merge new animations before adding to queue
        if (newAnimations.length > 0) {
            const preOptimizedAnimations = optimizeQueue(newAnimations);
            setAnimationQueue(prev => {
                // Merge with existing queue and optimize again
                const combinedQueue = [...prev, ...preOptimizedAnimations];
                return optimizeQueue(combinedQueue);
            });
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

    if (isLoading) {
        return <LoadingTree />;
    }

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
                    />
                </div>
            ))}

            {/* Render all root circles with API data - z-40 */}
            {rootData && rootData.map(root => (
                <div key={root.id} className="z-40">
                    <RootCircle
                        root={root}
                        totalRootCount={totalRootCount}
                    />
                </div>
            ))}

            {/* Enhanced Debug info - z-100 (always visible) */}
            {process.env.NODE_ENV === 'development' && (
                <div className="absolute top-6 left-6 px-4 py-2 bg-black bg-opacity-50 text-white text-sm z-100">
                    <div>Active Animations: {activeAnimations.length}/{MAX_CONCURRENT_ANIMATIONS}</div>
                    <div>Queued Animations: {animationQueue.length}</div>
                    <div>Total Leaf Count: {totalLeafCount}</div>
                    <div>Total Root Count: {totalRootCount}</div>
                    <div className="text-yellow-300">Queue Process Interval: {QUEUE_PROCESS_INTERVAL}ms</div>
                    {activeAnimations.length > 0 && (
                        <div className="mt-2 text-xs">
                            <div>Current animations:</div>
                            {activeAnimations.map(anim => (
                                <div key={anim.id} className="text-yellow-300">
                                    {anim.type} {anim.elementId} (+{anim.netCountChanged})
                                    {anim.mergedAnimations && anim.mergedAnimations.length > 1 && (
                                        <span className="text-green-300"> [merged {anim.mergedAnimations.length}]</span>
                                    )}
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