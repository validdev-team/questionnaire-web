'use client';

import { useState, useEffect } from 'react';

export default function UserQuestionnaire() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await fetch('/api/questions');
      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }
      const data = await response.json();
      console.log("questions fetched: ", data)
      setQuestions(data);

    } catch (error) {
      console.error('Error fetching questions:', error);
      setError('Failed to load questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, choiceIndex) => {
    setAnswers(prev => {
      const current = prev[questionId] || [];
      if (current.includes(choiceIndex)) {
        return {
          ...prev,
          [questionId]: current.filter(idx => idx !== choiceIndex)
        };
      } else {
        return {
          ...prev,
          [questionId]: [...current, choiceIndex]
        };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitting) return;
    setSubmitting(true);

    try {
      const response = await fetch('/api/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers,
          timestamp: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit response');
      }

      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting response:', error);
      alert('There was an error submitting your response.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

    if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-red-500 text-6xl mb-4">⚠</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-green-500 text-6xl mb-4">✓</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Thank You!</h2>
            <p className="text-gray-600 mb-6">Your response has been submitted successfully.</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Submit Another Response
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Survey Questions</h2>

          {questions.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No questions available at the moment.</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {questions.map((question) => (
                <div key={question.id} className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {question.question}
                  </h3>
                  <div className="space-y-3">
                    {question.choices?.map((choice, index) => (
                      <label key={index} className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          checked={answers[question.id]?.includes(index) || false}
                          onChange={() => handleAnswerChange(question.id, index)}
                        />
                        <span className="ml-3 text-gray-700">{choice.text}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={submitting}
                  className={`w-full font-bold py-3 px-4 rounded-lg transition duration-200 ${
                    submitting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {submitting ? 'Submitting...' : 'Submit Survey'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
