// app/api/questions/route.js
import { NextResponse } from 'next/server';
import { db } from '../../../../../lib/firebase';
import { collection, getDocs, orderBy, query, setDoc, doc } from 'firebase/firestore';

export async function GET() {
    const questionsRef = collection(db, 'questions');
    const q = query(questionsRef, orderBy('sortOrder'));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        await seedDefaultQuestions();
        const newSnapshot = await getDocs(q);
        const questions = newSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return NextResponse.json({ questions });
    }

    const questions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ questions });
}

async function seedDefaultQuestions() {
    const defaultQuestions = [
        {
            id: 'q1',
            question: 'Question 1',
            sortOrder: 1,
            choices: Array.from({ length: 9 }, (_, i) => ({ text: `Option ${i + 1}` })),
        },
        {
            id: 'q2',
            question: 'Question 2',
            sortOrder: 2,
            choices: Array.from({ length: 5 }, (_, i) => ({ text: `Choice ${i + 1}` })),
        },
    ];

    for (const q of defaultQuestions) {
        await setDoc(doc(db, 'questions', q.id), {
            question: q.question,
            sortOrder: q.sortOrder,
            choices: q.choices,
        });
    }
}