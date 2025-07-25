// app/api/responses/reset/route.js
import { NextResponse } from 'next/server';
import { db } from '../../../../../lib/firebase';
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';

export async function POST() {
    try {
        // Delete responses
        const responseSnap = await getDocs(collection(db, 'responses'));
        const deletePromises = responseSnap.docs.map(d => deleteDoc(doc(db, 'responses', d.id)));
        await Promise.all(deletePromises);

        // Reset votes in questions
        const questionsSnap = await getDocs(collection(db, 'questions'));
        const resetPromises = questionsSnap.docs.map((docSnap) => {
            const question = docSnap.data();
            const resetChoices = question.choices.map(c => ({ ...c, votes: 0 }));
            return updateDoc(doc(db, 'questions', docSnap.id), { choices: resetChoices });
        });
        await Promise.all(resetPromises);

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Failed to reset' }, { status: 500 });
    }
}