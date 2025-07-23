'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

export default function ResultsPage() {
  const [questions, setQuestions] = useState([]);
  const [totalResponses, setTotalResponses] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Real-time listener for aggregated results
    const unsubscribeAggregatedResults = onSnapshot(collection(db, 'aggregated_results'), (snapshot) => {
      const aggregatedResults = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setQuestions(aggregatedResults);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching realtime aggregated results:', error);
      setError('Failed to fetch aggregated results');
      setLoading(false);
    });

    // Real-time listener for total responses (number of documents in responses collection)
    const unsubscribeResponses = onSnapshot(collection(db, 'responses'), (snapshot) => {
      setTotalResponses(snapshot.size); // Update totalResponses whenever a new response is added
    }, (error) => {
      console.error('Error fetching realtime total responses:', error);
      setError('Failed to fetch total responses');
    });

    // Clean up listeners on unmount
    return () => {
      unsubscribeAggregatedResults();
      unsubscribeResponses();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Survey Results</h2>

          {error && (
            <p className="text-red-500 text-center py-8">{error}</p>
          )}

          <div className="text-center text-sm text-gray-600 mb-6">
            <span className="font-bold">Total Responses:</span> {totalResponses}
          </div>

          {questions.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No survey data available.</p>
          ) : (
            <div className="space-y-8">
              {questions.map((question) => {
                const totalVotes = question.choices?.reduce((sum, choice) => sum + (choice.votes || 0), 0) || 0;

                return (
                  <div key={question.id} className="border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      {question.question}
                    </h3>

                    <div className="mb-4 text-sm text-gray-600">
                      Total Votes: {totalVotes}
                    </div>

                    <div className="space-y-3">
                      {question.choices?.map((choice, index) => {
                        const percentage = totalVotes > 0 ? ((choice.votes || 0) / totalVotes * 100) : 0;

                        return (
                          <div key={index} className="flex items-center">
                            <div className="flex-1">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium text-gray-700">
                                  {choice.text}
                                </span>
                                <span className="text-sm text-gray-500">
                                  {choice.votes || 0} votes ({percentage.toFixed(1)}%)
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
