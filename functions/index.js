const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

initializeApp();
const db = getFirestore();

const COLLECTIONS = [
  'q1c1', 'q1c2', 'q1c3', 'q1c4', 'q1c5', 'q1c6', 'q1c7', 'q1c8', 'q1c9',
  'q2c1', 'q2c2', 'q2c3', 'q2c4', 'q2c5',
];

let lastRun = 0;
let finalTimer = null;

async function countVotes() {
  const result = {};

  for (const col of COLLECTIONS) {
    const snap = await db.collection(col).count().get();
    result[col] = snap.data().count;
  }

  const responsesSnap = await db.collection('responses').count().get();
  result.totalResponses = responsesSnap.data().count;

  return result;
}

exports.aggregateVotes = onDocumentCreated("responses/{id}", async () => {
  const now = Date.now();

  // If too soon since last run, skip immediate update
  if (now - lastRun >= 1000) {
    lastRun = now;

    const voteData = await countVotes();
    await db.collection('results').doc('live').set(voteData);
  }

  // Always reset a delayed final aggregation
  if (finalTimer) clearTimeout(finalTimer);

  // Run one last aggregation after 1 second of silence
  finalTimer = setTimeout(async () => {
    const finalVoteData = await countVotes();
    await db.collection('results').doc('live').set(finalVoteData);
    lastRun = Date.now();
  }, 1000);
});
