// ============================================================================
// TREE CONFIGURATION - MODIFY THESE TO MATCH YOUR ASSETS AND LAYOUT
// ============================================================================

// Leaf positions and data - Update coordinates to match your tree design
export const LEAF_CONFIG = [
    {
        id: "leaf_1",
        zIndex: 105,
        x: 375,
        y: 400,
        question: "Skills-based Hiring Techniques and Practices",
        initialCount: 0,
        svgFile: "1_Leaf.svg",
        animationFile: "1.webm"
    },
    {
        id: "leaf_2",
        zIndex: 104,
        x: 450,
        y: 315,
        question: "Skills Gaps and Learning Need Analysis (TNA)",
        initialCount: 0,
        svgFile: "2_Leaf.svg",
        animationFile: "2.webm"
    },
    {
        id: "leaf_3",
        zIndex: 103,
        x: 300,
        y: 260,
        question: "Career Progression Pathway and Competency Framework ",
        initialCount: 0,
        svgFile: "3_Leaf.svg",
        animationFile: "3.webm"
    },
    {
        id: "leaf_4",
        zIndex: 102,
        x: 465,
        y: 215,
        question: "Job Redesign & Reskilling",
        initialCount: 0,
        svgFile: "4_Leaf.svg",
        animationFile: "4.webm"
    },
    {
        id: "leaf_5",
        zIndex: 101,
        x: 600,
        y: 165,
        question: "On-the-Job Training (OJT)",
        initialCount: 0,
        svgFile: "5_Leaf.svg",
        animationFile: "5.webm"
    },
    {
        id: "leaf_6",
        zIndex: 102,
        x: 750,
        y: 200,
        question: "Digital & AI-enabled Learning",
        initialCount: 0,
        svgFile: "6_Leaf.svg",
        animationFile: "6.webm"
    },
    {
        id: "leaf_7",
        zIndex: 103,
        x: 900,
        y: 250,
        question: "Learning from Global and Local Best Practices",
        initialCount: 0,
        svgFile: "7_Leaf.svg",
        animationFile: "7.webm"
    },
    {
        id: "leaf_8",
        zIndex: 104,
        x: 780,
        y: 310,
        question: "Mentoring & Coaching",
        initialCount: 0,
        svgFile: "8_Leaf.svg",
        animationFile: "8.webm"
    },
    {
        id: "leaf_9",
        zIndex: 105,
        x: 825,
        y: 400,
        question: "Lean & Process Improvement",
        initialCount: 0,
        svgFile: "9_Leaf.svg",
        animationFile: "9.webm"
    }
];

// Root problems configuration - Update these positions and text
export const ROOT_CONFIG = [
    {
        id: "root_A",
        zIndex: 110, // Higher z-index for roots to appear above leaves
        x: 210,
        y: 585,
        question: "Attracting right and skilled talent",
        initialCount: 0,
        svgFile: "Circle-No Shadow.svg",
        animationFile: "A.webm"
    },
    {
        id: "root_B",
        zIndex: 111,
        x: 380,
        y: 600,
        question: "Lack of Structured Training Plan for workforce development",
        initialCount: 0,
        svgFile: "Circle-No Shadow.svg",
        animationFile: "B.webm"
    },
    {
        id: "root_C",
        zIndex: 112,
        x: 560,
        y: 600,
        question: "Unsure how to develop and implement On-the-Job Training (OJT)",
        initialCount: 0,
        svgFile: "Circle-No Shadow.svg",
        animationFile: "C.webm"
    },
    {
        id: "root_D",
        zIndex: 113,
        x: 750,
        y: 600,
        question: "Downtime due to training that disrupts daily operations",
        initialCount: 0,
        svgFile: "Circle-No Shadow.svg",
        animationFile: "D.webm"
    },
    {
        id: "root_E",
        zIndex: 114,
        x: 920,
        y: 585,
        question: "Adapting digital and AI technology for workplace learning",
        initialCount: 0,
        svgFile: "Circle-No Shadow.svg",
        animationFile: "E.webm"
    }
];