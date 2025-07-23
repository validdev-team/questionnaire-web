import { NextResponse } from 'next/server';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../../lib/firebase';

export async function GET() {
    try {
        // Fetch aggregated results from the aggregated_results collection
        const querySnapshot = await getDocs(collection(db, 'aggregated_results'));
        
        // Collect results for each question
        const resultList = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return NextResponse.json({
            success: true,
            data: resultList
        });
    } catch (error) {
        console.error('Error fetching aggregated results:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch survey results'
            },
            { status: 500 }
        );
    }
}
