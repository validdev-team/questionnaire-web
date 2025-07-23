// app/api/responses/route.js
import { NextResponse } from 'next/server';
import {
    collection,
    addDoc,
    doc,
    updateDoc,
    getDoc
} from 'firebase/firestore';
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

        // Save response
        await addDoc(collection(db, 'responses'), {
            answers,
            timestamp: new Date(timestamp)
        });

        // Update vote counts
        for (const [questionId, selectedChoices] of Object.entries(answers)) {
            if (!Array.isArray(selectedChoices)) continue;

            const questionRef = doc(db, 'questions', questionId);
            const questionSnap = await getDoc(questionRef);

            if (!questionSnap.exists()) continue;

            const questionData = questionSnap.data();

            if (Array.isArray(questionData.choices)) {
                const updatedChoices = [...questionData.choices];

                // Increment votes for each choice
                selectedChoices.forEach((choiceIndex) => {
                    if (choiceIndex >= 0 && choiceIndex < updatedChoices.length) {
                        updatedChoices[choiceIndex].votes =
                            (updatedChoices[choiceIndex].votes || 0) + 1;
                    }
                });

                await updateDoc(questionRef, {
                    choices: updatedChoices
                });
            }
        }

        return NextResponse.json({
            message: 'Response submitted successfully'
        });

    } catch (error) {
        console.error('Error submitting response:', error);
        return NextResponse.json(
            { error: 'Failed to submit response' },
            { status: 500 }
        );
    }
}