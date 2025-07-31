const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

initializeApp();
const db = getFirestore();

const COLLECTIONS = [
  'q1c1', 'q1c2', 'q1c3', 'q1c4', 'q1c5', 'q1c6', 'q1c7', 'q1c8', 'q1c9',
  'q2c1', 'q2c2', 'q2c3', 'q2c4', 'q2c5',
];

const CONTROL_DOC = db.collection('results').doc('aggregateControl');

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

exports.aggregateVotes = onDocumentCreated({region: "asia-southeast1"}, "responses/{id}", async () => {
  const controlSnap = await CONTROL_DOC.get();
  const control = controlSnap.exists ? controlSnap.data() : {};
  const now = Date.now();
  const lastRun = control.lastRun || 0;

  // Immediate aggregation if more than 1s passed
  if (now - lastRun >= 1000) {
    const voteData = await countVotes();
    await db.collection('results').doc('live').set(voteData);

    await CONTROL_DOC.set({
      lastRun: now,
      debounceScheduled: false
    }, { merge: true });

    return;
  }

  // Otherwise: schedule one final aggregation 1 second later
  if (!control.debounceScheduled) {
    // Set debounceScheduled = true
    await CONTROL_DOC.set({ debounceScheduled: true }, { merge: true });

    setTimeout(async () => {
      const voteData = await countVotes();
      await db.collection('results').doc('live').set(voteData);

      await CONTROL_DOC.set({
        lastRun: Date.now(),
        debounceScheduled: false
      }, { merge: true });
    }, 1000);
  }
});
