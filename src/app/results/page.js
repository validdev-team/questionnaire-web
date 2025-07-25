'use client';

import { useState, useEffect } from 'react';
import { doc, onSnapshot, collection, getDocs } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

export default function ResultsPage() {
  const [results, setResults] = useState(null);
  const [questionsMap, setQuestionsMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch questions once
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

    // Live results listener
    const unsubscribe = onSnapshot(
      doc(db, 'results', 'live'),
      (docSnap) => {
        if (docSnap.exists()) {
          setResults(docSnap.data());
        } else {
          setResults(null); // Will use fallback to zero below
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error listening to results/live:', err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  if (loading || Object.keys(questionsMap).length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Fallback results object with 0s
  const effectiveResults = results || { totalResponses: 0 };

  const totalResponses = effectiveResults.totalResponses || 0;

  // Grouped results with fallback to zero votes
  const groupedResults = {};
  Object.entries(questionsMap).forEach(([questionId, questionData]) => {
    groupedResults[questionId] = questionData.choices.map((_, i) => ({
      choiceIndex: i,
      voteCount: effectiveResults[`${questionId}c${i + 1}`] || 0,
    }));
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
                      {choices.map(({ choiceIndex, voteCount }) => {
                        const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
                        const choiceText = questionData?.choices?.[choiceIndex]?.text || `Choice ${choiceIndex + 1}`;

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
