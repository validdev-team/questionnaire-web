// app/api/responses/count/route.js
import { NextResponse } from 'next/server';
import { db } from '../../../../../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export async function GET() {
    const snapshot = await getDocs(collection(db, 'responses'));
    return NextResponse.json({ count: snapshot.size });
}