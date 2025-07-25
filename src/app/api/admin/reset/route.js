// app/api/responses/reset/route.js
import { NextResponse } from 'next/server';
import { db } from '../../../../../lib/firebase';
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';

export async function POST() {
    try {
        // Delete all docs from 'responses' collection
        const responseSnap = await getDocs(collection(db, 'responses'));
        const deleteResponsePromises = responseSnap.docs.map(d =>
            deleteDoc(doc(db, 'responses', d.id))
        );
        await Promise.all(deleteResponsePromises);

        // Reset votes in 'questions' collection
        // TODO: no need this anymore actualy
        const questionsSnap = await getDocs(collection(db, 'questions'));
        const resetQuestionVotesPromises = questionsSnap.docs.map((docSnap) => {
            const question = docSnap.data();
            const resetChoices = question.choices.map(c => ({ ...c, votes: 0 }));
            return updateDoc(doc(db, 'questions', docSnap.id), { choices: resetChoices });
        });
        await Promise.all(resetQuestionVotesPromises);

        // Delete all qXcY collections
        const subcollectionNames = [
            'q1c1', 'q1c2', 'q1c3', 'q1c4', 'q1c5', 'q1c6', 'q1c7', 'q1c8', 'q1c9',
            'q2c1', 'q2c2', 'q2c3', 'q2c4', 'q2c5'
        ];

        const deleteSubcollections = await Promise.all(
            subcollectionNames.map(async (name) => {
                const snap = await getDocs(collection(db, name));
                const deletes = snap.docs.map(d => 
                    deleteDoc(doc(db, name, d.id))
                );
                return Promise.all(deletes);
            })
        );

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Failed to reset' }, { status: 500 });
    }
}