import { NextResponse } from 'next/server';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../../../lib/firebase';

export async function POST(request) {
    try {
        const { answers, timestamp } = await request.json();

        // Validate request data
        if (!answers || typeof answers !== 'object') {
            return NextResponse.json(
                { error: 'Invalid answers format' },
                { status: 400 }
            );
        }

        if (!timestamp || isNaN(Date.parse(timestamp))) {
            return NextResponse.json(
                { error: 'Invalid timestamp format' },
                { status: 400 }
            );
        }

        // Save full response to 'responses' collection
        await addDoc(collection(db, 'responses'), {
            timestamp,
            answers
        });

        // For each selected choice, add a doc to qXcY
        for (const [questionId, selectedIndices] of Object.entries(answers)) {
            if (!Array.isArray(selectedIndices)) continue;

            // Convert "question1" → "q1", "question2" → "q2", etc.
            const questionNumber = questionId.replace('question', 'q');

            // Add a doc to qXcY
            for (const index of selectedIndices) {
                const choiceId = `${questionNumber}c${index + 1}`; // index is 0-based
                await addDoc(collection(db, choiceId), {
                    timestamp
                });
            }
        }

        return NextResponse.json({
            message: 'Response submitted successfully',
        });

    } catch (error) {
        console.error('Error submitting response:', error);
        return NextResponse.json(
            { error: 'Failed to submit response' },
            { status: 500 }
        );
    }
}