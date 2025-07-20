// app/api/questions/route.js
import { NextResponse } from 'next/server';
import {
    collection,
    getDocs,
} from 'firebase/firestore';
import { db } from '../../../../lib/firebase';

export async function GET() {
    try {
        const querySnapshot = await getDocs(collection(db, 'questions'));
        const questions = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return NextResponse.json(questions);
    } catch (error) {
        console.error('Error fetching questions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch questions' },
            { status: 500 }
        );
    }
}