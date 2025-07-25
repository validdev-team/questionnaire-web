// app/api/results_old/route.js
import { NextResponse } from 'next/server';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../../lib/firebase';

export async function GET() {
    try {
        const querySnapshot = await getDocs(collection(db, 'questions'));
        const questionList = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return NextResponse.json({
            success: true,
            data: questionList
        });
    } catch (error) {
        console.error('Error fetching results:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch survey results'
            },
            { status: 500 }
        );
    }
}