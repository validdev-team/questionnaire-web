'use client';

import { useState, useEffect } from 'react';
import { doc, onSnapshot, collection, getDocs } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import Link from 'next/link';

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
          <div className="px-2 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Survey Results{' '}
              <span className="text-sm text-gray-500 ml-2">
                (Total responses: {totalResponses})
              </span>
            </h2>
            <div className="flex gap-2">
              <Link
                href="/admin"
                className="flex items-center px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white">
                <button>
                  Admin Panel
                </button>
              </Link>
              <Link
                href="/tree"
                className="flex items-center px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white">
                <button>
                  <svg width="20" height="20" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M24.57 1.56H21.58V0.26C21.58 0.117 21.463 0 21.32 0H4.68C4.537 0 4.42 0.117 4.42 0.26V1.56H1.43C1.05074 1.56 0.687014 1.71066 0.418837 1.97884C0.15066 2.24701 0 2.61074 0 2.99V7.8C0 10.4552 1.95 12.662 4.4915 13.065C4.992 16.8415 8.0275 19.8185 11.83 20.2312V23.6502H5.46C4.88475 23.6502 4.42 24.115 4.42 24.6903V25.74C4.42 25.883 4.537 26 4.68 26H21.32C21.463 26 21.58 25.883 21.58 25.74V24.6903C21.58 24.115 21.1152 23.6502 20.54 23.6502H14.17V20.2312C17.9725 19.8185 21.008 16.8415 21.5085 13.065C24.05 12.662 26 10.4552 26 7.8V2.99C26 2.61074 25.8493 2.24701 25.5812 1.97884C25.313 1.71066 24.9493 1.56 24.57 1.56ZM4.42 10.647C3.21425 10.2603 2.34 9.12925 2.34 7.8V3.9H4.42V10.647ZM23.66 7.8C23.66 9.1325 22.7857 10.2635 21.58 10.647V3.9H23.66V7.8Z" fill="white"/>
                  </svg>
                </button>
              </Link>
            </div>
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
