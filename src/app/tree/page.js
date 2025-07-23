"use client"
import React, { useState, useEffect, useRef } from 'react';

// ============================================================================
// CONFIGURATION SECTION - MODIFY THESE TO MATCH YOUR ASSETS AND LAYOUT
// ============================================================================

// Leaf positions and data - Update coordinates to match your tree design
const LEAF_CONFIG = [
    {
        id: 5,
        x: 600,
        y: 150,
        question: "Learning from Global and Local Best Practices",
        initialCount: 0,
        svgFile: "5_Leaf.svg",
        animationFile: "5.webm"
    },
    {
        id: 4,
        x: 465,
        y: 215,
        question: "Digital & AI-enabled Learning",
        initialCount: 0,
        svgFile: "4_Leaf.svg",
        animationFile: "4.webm"
    },
    {
        id: 6,
        x: 750,
        y: 200,
        question: "Skill-based Hiring Techniques and Practices",
        initialCount: 0,
        svgFile: "6_Leaf.svg",
        animationFile: "6.webm"
    },
    {
        id: 3,
        x: 300,
        y: 260,
        question: "On-the-Job Training (OJT)",
        initialCount: 0,
        svgFile: "3_Leaf.svg",
        animationFile: "3.webm"
    },
    {
        id: 7,
        x: 900,
        y: 250,
        question: "Skill Gaps and Learning Need Analysis (TNA)",
        initialCount: 0,
        svgFile: "7_Leaf.svg",
        animationFile: "7.webm"
    },
    {
        id: 2,
        x: 450,
        y: 315,
        question: "Job Redesign & Reskilling",
        initialCount: 0,
        svgFile: "2_Leaf.svg",
        animationFile: "2.webm"
    },
    {
        id: 8,
        x: 780,
        y: 310,
        question: "Mentoring & Coaching",
        initialCount: 0,
        svgFile: "8_Leaf.svg",
        animationFile: "8.webm"
    },
    {
        id: 1,
        x: 375, // X position from left (pixels)
        y: 400,  // Y position from top (pixels)
        question: "Career Progression Pathway and Competency Framework",
        initialCount: 0,
        svgFile: "1_Leaf.svg", // Your SVG filename
        animationFile: "1.webm" // Your WebM animation filename
    },
    {
        id: 9,
        x: 825,
        y: 400,
        question: "Lean & Process Improvement",
        initialCount: 0,
        svgFile: "9_Leaf.svg",
        animationFile: "9.webm"
    }
];

// Root problems configuration - Update these positions and text
const ROOT_CONFIG = [
    {
        id: "A",
        x: 220,
        y: 570,
        question: "Attracting right and skilled talent",
        initialCount: 0,
        svgFile: "Circle-Shadow.svg", // Using your circle SVG
        animationFile: "A.webm"
    },
    {
        id: "B",
        x: 400,
        y: 580,
        question: "Lack of Structured Training Plan for workforce development",
        initialCount: 0,
        svgFile: "Circle-Shadow.svg",
        animationFile: "B.webm"
    },
    {
        id: "C",
        x: 580,
        y: 590,
        question: "Unsure how to develop and implement On-the-Job Training (OJT)",
        initialCount: 0,
        svgFile: "Circle-Shadow.svg",
        animationFile: "C.webm"
    },
    {
        id: "D",
        x: 760,
        y: 580,
        question: "Downtime due to training that disrupts daily operations",
        initialCount: 0,
        svgFile: "Circle-Shadow.svg",
        animationFile: "D.webm"
    },
    {
        id: "E",
        x: 920,
        y: 570,
        question: "Adapting digital and AI technology for workplace learning",
        initialCount: 0,
        svgFile: "Circle-Shadow.svg",
        animationFile: "E.webm"
    }
];

// ============================================================================
// INDIVIDUAL LEAF COMPONENT - Handles single leaf rendering
// ============================================================================
const LeafSegment = ({ leaf, onVoteReceived }) => {
    const [count, setCount] = useState(leaf.initialCount);
    const [isAnimating, setIsAnimating] = useState(false);
    const [bounceKey, setBounceKey] = useState(0);
    const animationRef = useRef(null);

    // Calculate leaf size based on vote count (grows with more votes)
    const leafScale = 2.8 + (count / 10); // Adjust divisor to control growth rate

    // Handle new vote received
    const handleVote = () => {
        setCount(prev => prev + 1);
        triggerBounce();
        triggerAnimation();
        onVoteReceived?.(leaf.id, count + 1);
    };

    // Trigger bounce animation by changing the key to force re-render
    const triggerBounce = () => {
        setBounceKey(prev => prev + 1);
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
            key={bounceKey}
            className="absolute cursor-pointer transition-transform"
            style={{
                left: `${leaf.x}px`,
                top: `${leaf.y}px`,
                transform: `scale(${leafScale})`,
                transformOrigin: 'center center',
            }}
            onClick={handleVote} // Remove this in production - just for testing
        >

            {/* Inner wrapper for bounce */}
            <div
                className="transition-transform"
                style={{
                    animation: bounceKey > 0 ? 'bounce-custom 0.5s ease-out' : 'none',
                    transformOrigin: 'center center',
                }}>

                {/* Static SVG Leaf and text */}
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
            </div>

            {/* WebM Animation Overlay - Only visible when animating */}
            {isAnimating && (
                <video
                    ref={animationRef}
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                    style={{ zIndex: 10 }}
                    muted
                    playsInline
                    onEnded={handleAnimationEnd}
                    onError={(e) => {
                        console.error(`Failed to load animation: ${leaf.animationFile}`);
                        setIsAnimating(false);
                    }}
                >
                    <source src={`/animation/${leaf.animationFile}`} type="video/webm" />
                </video>
            )}
        </div>
    );
};

// ============================================================================
// ROOT CIRCLE COMPONENT - Similar to leaf but for root problems
// ============================================================================
const RootCircle = ({ root, onVoteReceived }) => {
    const [count, setCount] = useState(root.initialCount);
    const [isAnimating, setIsAnimating] = useState(false);
    const [bounceKey, setBounceKey] = useState(0);
    const animationRef = useRef(null);

    const handleVote = () => {
        setCount(prev => prev + 1);
        triggerBounce();
        triggerAnimation();
        onVoteReceived?.(root.id, count + 1);
    };

    // Trigger bounce animation by changing the key to force re-render
    const triggerBounce = () => {
        setBounceKey(prev => prev + 1);
    };

    const triggerAnimation = () => {
        if (animationRef.current && !isAnimating) {
            setIsAnimating(true);
            animationRef.current.currentTime = 0;
            animationRef.current.play();
        }
    };

    const handleAnimationEnd = () => {
        setIsAnimating(false);
    };

    return (
        <div
            key={bounceKey}
            className="absolute cursor-pointer"
            style={{
                left: `${root.x}px`,
                top: `${root.y}px`,
                transformOrigin: 'center center',
                animation: bounceKey > 0 ? 'bounce-custom 0.5s ease-out' : 'none'
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
        </div>
    );
};

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

    const [isAnimating, setIsAnimating] = useState(false);
    const [currentAnimation, setCurrentAnimation] = useState(null);
    const [videoLoaded, setVideoLoaded] = useState(false);
    const animationRef = useRef(null);

    // Preload the video when component mounts
    useEffect(() => {
        if (animationRef.current) {
            animationRef.current.load();
        }
    }, [currentAnimation]);

    // Handle vote received from any leaf or root
    const handleVoteReceived = (elementId, newCount, animationFile) => {
        setTotalVotes(prev => prev + 1);

        // Trigger animation on tree trunk
        triggerTreeAnimation(animationFile);

        // Here you would typically send the vote to your backend
        console.log(`Vote received for ${elementId}, new count: ${newCount}, total votes: ${totalVotes + 1}`);
    };

    // Trigger animation on tree trunk
    const triggerTreeAnimation = async (animationFile) => {
        if (isAnimating || !animationRef.current) return;

        try {
            setIsAnimating(true);
            setCurrentAnimation(animationFile);

            const video = animationRef.current;
            video.currentTime = 0;

            console.log(`Playing tree animation: /animation/${animationFile}`);
            await video.play();

        } catch (error) {
            console.error(`Failed to play tree animation:`, error);
            setIsAnimating(false);
        }
    };

    const handleAnimationEnd = () => {
        console.log(`Tree animation ended`);
        setIsAnimating(false);
        setCurrentAnimation(null);
    };

    const handleVideoError = (e) => {
        console.error(`Tree video error:`, e.target.error);
        setIsAnimating(false);
        setVideoLoaded(false);
        setCurrentAnimation(null);
    };

    return (
        <div className="w-[1280px] h-[720px] relative overflow-hidden bg-gradient-to-b from-sky-200 via-sky-100 to-yellow-200">

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
                        // Fallback to gradient background (already applied above)
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
                        // Fallback to brown background
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
                    src="/svg/Bg Leaves.svg"
                    alt="Background leaves"
                    className="absolute top-[60px] w-[800px] object-contain z-0"
                    onError={(e) => {
                        console.error('Background leaves SVG failed to load');
                        e.target.style.display = 'none';
                    }}
                />

                {/* WebM Animation Overlay - Plays on top of tree trunk */}
                {currentAnimation && (
                    <video
                        ref={animationRef}
                        className={`absolute inset-0 w-full h-full object-contain pointer-events-none transition-opacity duration-200 ${isAnimating ? 'opacity-100' : 'opacity-0'
                            }`}
                        style={{
                            zIndex: isAnimating ? 1001 : -1,
                            transform: 'scale(1.2)',
                            transformOrigin: 'center center'
                        }}
                        muted
                        playsInline
                        preload="auto"
                        onCanPlay={() => setVideoLoaded(true)}
                        onEnded={handleAnimationEnd}
                        onError={handleVideoError}
                    >
                        <source src={`/animation/${currentAnimation}`} type="video/webm" />
                        <source src={`/animation/${currentAnimation.replace('.webm', '.mp4')}`} type="video/mp4" />
                    </video>
                )}
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
                // Adjust these values to match your tree's actual size and position
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
                    />
                ))}

                {/* Render all root circles */}
                {ROOT_CONFIG.map(root => (
                    <RootCircle
                        key={root.id}
                        root={root}
                        onVoteReceived={handleVoteReceived}
                    />
                ))}
            </div>


            {/* ============================== */}
            {/* CUSTOM STYLES */}
            {/* ============================== */}
            <style jsx>{`
            .text-shadow {
                text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
            }

            @keyframes bounce-custom {
                0% {
                    transform: scale(1);
                }
                50% {
                    transform: scale(1.15);
                }
                100% {
                    transform: scale(1);
                }
            }

            .animate-bounce-custom {
                animation: bounce-custom 0.3s ease-out;
            }
        `}</style>
        </div>
    );
};

export default TreePage;