import { NextResponse } from 'next/server';
import {
    collection,
    addDoc,
    doc,
    getDoc,
    getDocs,
    setDoc,
    writeBatch
} from 'firebase/firestore';
import { db } from '../../../../lib/firebase';

export async function POST(request) {
    try {
        const { answers } = await request.json();

        // Validate request data
        if (!answers || typeof answers !== 'object') {
            return NextResponse.json(
                { error: 'Invalid answers format' },
                { status: 400 }
            );
        }

        // Save response
        const responseRef = await addDoc(collection(db, 'responses'), {
            answers
        });

        // Start a batch write to ensure atomic updates
        const batch = writeBatch(db);

        // Aggregating vote counts and updating the 'aggregated_results' collection
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

                // Calculate total votes for aggregation
                const totalVotes = updatedChoices.reduce((sum, choice) => sum + (choice.votes || 0), 0);

                // Aggregate the result in a separate collection to avoid updating votes in `questions` directly
                const aggregatedResultRef = doc(db, 'aggregated_results', questionId);
                const aggregatedResultSnap = await getDoc(aggregatedResultRef);

                let aggregatedData = {
                    totalVotes,
                    choices: updatedChoices
                };

                if (aggregatedResultSnap.exists()) {
                    // If there's an existing aggregation, update it
                    const currentData = aggregatedResultSnap.data();
                    aggregatedData.totalVotes += currentData.totalVotes;
                    aggregatedData.choices.forEach((choice, idx) => {
                        choice.votes += currentData.choices[idx].votes;
                    });
                }

                // Add the updated aggregated data to the batch
                batch.set(aggregatedResultRef, aggregatedData);

                // Optionally, you can also update the `questions` collection with just the choices (without votes)
                // This is not strictly necessary if votes are handled entirely in `aggregated_results`
                batch.update(questionRef, {
                    choices: updatedChoices
                });
            }
        }

        // Commit the batch to apply all changes atomically
        await batch.commit();

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
