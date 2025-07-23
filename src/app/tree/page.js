"use client"
import React, { useEffect, useRef } from 'react';

const TreePage = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        
    }, []);

    return (
        <div>
            <canvas
                ref={canvasRef}
                id="tree"
                className="border border-black"
                width="1920"
                height="1080"
            />
        </div>
    );
};

export default TreePage;
