'use client';

import { useState, useEffect } from 'react';
import { doc, onSnapshot, collection, getDocs } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

export default function ResultsPage() {
  const [results, setResults] = useState(null);           // result/live data
  const [questionsMap, setQuestionsMap] = useState({});   // questionID => {question, choices}
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch question labels once
    const fetchQuestions = async () => {
      const snapshot = await getDocs(collection(db, 'questions'));
      const map = {};
      snapshot.forEach(doc => {
        const data = doc.data();
        map[doc.id] = { id: doc.id, ...data };
      });
      setQuestionsMap(map);
    };

    fetchQuestions();

    // Live vote listener
    const unsubscribe = onSnapshot(doc(db, 'results', 'live'), (docSnap) => {
      if (docSnap.exists()) {
        setResults(docSnap.data());
      } else {
        console.warn('No results found.');
        setResults(null);
      }
      setLoading(false);
    }, (err) => {
      console.error('Error listening to results/live:', err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading || !results) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const totalResponses = results.totalResponses || 0;

  // Group votes by question
  const groupedResults = {};
  Object.entries(results).forEach(([key, count]) => {
    if (key === 'totalResponses') return;

    const match = key.match(/(q\d+)c(\d+)/);
    if (!match) return;

    const [_, questionId, rawChoiceIndex] = match;
    const choiceIndex = parseInt(rawChoiceIndex, 10) - 1;

    if (choiceIndex < 0) return;

    if (!groupedResults[questionId]) groupedResults[questionId] = [];

    groupedResults[questionId].push({
      choiceIndex,
      voteCount: count
    });
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Survey Results</h2>
          <div className="text-sm text-gray-500 mb-6">
            Total Responses: {totalResponses}
          </div>

          {Object.keys(groupedResults).length === 0 ? (
            <p className="text-gray-600 text-center py-8">No vote data available.</p>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedResults).map(([questionId, choices]) => {
                const totalVotes = choices.reduce((sum, c) => sum + c.voteCount, 0);
                const questionData = questionsMap[questionId];

                return (
                  <div key={questionId} className="border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      {questionData?.question || questionId}
                    </h3>

                    <div className="mb-4 text-sm text-gray-600">
                      Total Votes: {totalVotes}
                    </div>

                    <div className="space-y-3">
                      {choices.sort((a, b) => a.choiceIndex - b.choiceIndex).map(({ choiceIndex, voteCount }) => {
                        const percentage = totalVotes > 0 ? (voteCount / totalVotes * 100) : 0;
                        const choiceText = questionData?.choices?.[choiceIndex]?.text || `Choice ${choiceIndex}`;

                        return (
                          <div key={choiceIndex} className="flex items-center">
                            <div className="flex-1">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium text-gray-700">
                                  {choiceText}
                                </span>
                                <span className="text-sm text-gray-500">
                                  {voteCount} votes ({percentage.toFixed(1)}%)
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
