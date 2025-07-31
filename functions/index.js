const { onDocumentCreated, onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

initializeApp();
const db = getFirestore();

const COLLECTIONS = [
  'q1c1', 'q1c2', 'q1c3', 'q1c4', 'q1c5', 'q1c6', 'q1c7', 'q1c8', 'q1c9',
  'q2c1', 'q2c2', 'q2c3', 'q2c4', 'q2c5',
];

const CONTROL_DOC = db.collection('results').doc('aggregateControl');
const RESULT_DOC = db.collection('results').doc('live');

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

// Triggered on each vote submission
exports.aggregateVotes = onDocumentCreated(
  { region: "asia-southeast1" },
  "responses/{id}",
  async () => {
    const controlSnap = await CONTROL_DOC.get();
    const control = controlSnap.exists ? controlSnap.data() : {};
    const now = Date.now();
    const lastRun = control.lastRun || 0;

    // Immediate aggregation if more than 1s passed
    if (now - lastRun >= 1000) {
      const voteData = await countVotes();
      await RESULT_DOC.set(voteData);

      await CONTROL_DOC.set({
        lastRun: now,
        debounceScheduled: false,
        debouncedAt: null
      }, { merge: true });

      return;
    }

    // Otherwise: schedule one final aggregation 1 second later
    if (!control.debounceScheduled) {
      await CONTROL_DOC.set({
        debounceScheduled: true,
        debouncedAt: now + 1000
      }, { merge: true });
    }
  }
);

// Triggered when debounce is scheduled
exports.debouncedAggregation = onDocumentUpdated(
  { region: "asia-southeast1" },
  "results/aggregateControl",
  async (event) => {
    const before = event.data?.before?.data();
    const after = event.data?.after?.data();
    if (!after || !after.debouncedAt) return;

    const now = Date.now();
    const triggerTime = after.debouncedAt;

    const wasDebouncedBefore = before?.debouncedAt || 0;

    // Only run if we just scheduled or it's time
    if ((now < triggerTime) || wasDebouncedBefore === triggerTime) return;

    const voteData = await countVotes();
    await RESULT_DOC.set(voteData);

    await CONTROL_DOC.set({
      lastRun: now,
      debounceScheduled: false,
      debouncedAt: null
    }, { merge: true });
  }
);
