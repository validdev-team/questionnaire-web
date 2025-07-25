'use client';

import { useState, useEffect } from 'react';

export default function UserQuestionnaire() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [error, setError] = useState('');

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

  const handleReset = () => {
    setAnswers(prev => ({
      ...prev,
      [questions[currentQuestionIndex].id]: []
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          answers
        }),
      });
      console.log("response: ", answers)
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
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-md shadow p-8 text-center">
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
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-md shadow p-8 text-center">
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

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswers = answers[currentQuestion?.id] || [];
  const hasAnswers = currentAnswers.length > 0; // Check if any options are selected

  return (
    <main className="min-h-screen flex items-center justify-center bg-white text-[#0F0251]">
      <div className="mx-auto px-4 my-auto min-w-full md:min-w-xl max-w-md">
        {/* Previous button */}
        {currentQuestionIndex > 0 && (
          <button
            onClick={handlePreviousQuestion}
            className="mb-4 w-8 h-8 bg-[#0F0251] text-white rounded-full flex items-center justify-center transition-colors duration-200 flex-shrink-0"
          >
            <img 
              src="/left-button.svg" 
              alt="Previous" 
              className="w-8 h-8"
            />
          </button>
        )}

        {/* Question Header */}
        <div className="mb-8">
          <p className="text-sm mb-2">
            Question {currentQuestionIndex + 1}/{questions.length}
          </p>
          <h2 className="text-2xl font-bold leading-tight">
            {currentQuestion.question}
          </h2>
        </div>

        {/* Answer Options Grid */}
        <div className="grid grid-cols-3 gap-2 mb-8 auto-rows-fr">
          {currentQuestion.choices?.map((choice, index) => {
            const isSelected = currentAnswers.includes(index);
            return (
              <button
                key={index}
                onClick={() => handleAnswerChange(currentQuestion.id, index)}
                className={`p-3 rounded-md border-1 transition-all duration-200 aspect-square flex items-center justify-center border-[#0F0251] ${
                  isSelected
                    ? 'bg-[#0F0251] text-white'
                    : 'bg-white'
                }`}
              >
                <span className="text-xs text-center leading-tight">
                  {choice.text}
                </span>
              </button>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          <button
            onClick={handleReset}
            className={`flex-1 py-3 px-6 border-1 rounded-lg transition-colors duration-200 ${
              hasAnswers
                ? 'border-[#0F0251] bg-white text-[#0F0251]'
                : 'border-[#989898] text-[#989898]'
            }`}
          >
            Reset
          </button>
          
          <div className="flex gap-2 flex-1">
            <button
              onClick={handleNextQuestion}
              disabled={submitting || !hasAnswers}
              className={`flex-1 py-3 px-6 rounded-lg border-1 transition-colors duration-200 ${
                submitting
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : hasAnswers
                  ? currentQuestionIndex === questions.length - 1
                    ? 'bg-[#2A51FE] text-white border-[#2A51FE]'
                    : 'bg-[#0F0251] text-white border-[#0F0251]'
                  : 'bg-[#7E7E7E] text-white border-[#7E7E7E] cursor-not-allowed'
              }`}
            >
              {submitting
                ? 'Submitting...'
                : currentQuestionIndex === questions.length - 1
                ? 'Submit'
                : 'Next Question'
              }
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}