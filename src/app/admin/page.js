'use client';

import { useState, useEffect } from 'react';
import {
  updateDoc,
  doc,
} from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { Edit } from 'lucide-react';
import Link from 'next/link';

export default function AdminPanel() {
  const [questions, setQuestions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [responseCount, setResponseCount] = useState(0);

  useEffect(() => {
    fetchQuestions();
    fetchResponseCount();
  }, []);

const fetchQuestions = async () => {
  setLoading(true);
  try {
    const res = await fetch('/api/admin/questions');
    const data = await res.json();
    setQuestions(data.questions);
  } catch (err) {
    console.error('Error fetching questions:', err);
  } finally {
    setLoading(false);
  }
};

  const fetchResponseCount = async () => {
    try {
      const res = await fetch('/api/admin/count');
      const data = await res.json();
      setResponseCount(data.count);
    } catch (err) {
      console.error('Error fetching response count:', err);
    }
  };

  const resetAllResponses = async () => {
    if (!window.confirm('Are you sure you want to delete all responses and reset stats?')) return;

    setResetting(true);
    try {
      const res = await fetch('/api/admin/reset', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        await fetchQuestions();
        await fetchResponseCount();
      } else {
        alert('Failed to reset');
      }
    } catch (error) {
      console.error('Error resetting data:', error);
      alert('Error resetting responses');
    } finally {
      setResetting(false);
    }
  };


  const handleEdit = (question) => {
    setEditingQuestion(question);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingQuestion(null);
    fetchQuestions();
    fetchResponseCount();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              All Questions{' '}
              <span className="text-sm text-gray-500 ml-2">
                (Total responses: {responseCount})
              </span>
            </h2>
            <div className="flex gap-2">
              <button
                onClick={resetAllResponses}
                disabled={resetting}
                className={`px-4 py-2 rounded-lg ${
                  resetting ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700'
                } text-white`}
              >
                {resetting ? 'Resetting...' : 'Reset Responses'}
              </button>
              <Link
                href="/results"
                className="flex items-center px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white">
                <button>
                  Results
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

          {questions.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500">You have no questions configured.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Question</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. of Options</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {questions.map((question, index) => (
                    <tr key={question.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{question.question}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{question.choices?.length || 0}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEdit(question)}
                          className="bg-gray-200 hover:bg-gray-300 text-gray-600 hover:text-gray-900 p-2 rounded"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {showForm && (
          <QuestionForm
            question={editingQuestion}
            onClose={handleFormClose}
          />
        )}
      </div>
    </div>
  );
}

// --- QuestionForm component ---
function QuestionForm({ question, onClose }) {
  const [questionText, setQuestionText] = useState(question?.question || '');
  const [choices, setChoices] = useState(() => {
    const baseChoices = question?.choices || [];
    const lower = (question?.question || '').toLowerCase();

    if (lower.includes('question 1')) {
      const filled = [...baseChoices];
      while (filled.length < 9) {
        filled.push({ text: '', votes: 0 });
      }
      return filled.slice(0, 9);
    }

    if (lower.includes('question 2')) {
      const filled = [...baseChoices];
      while (filled.length < 5) {
        filled.push({ text: '', votes: 0 });
      }
      return filled.slice(0, 5);
    }

    return baseChoices;
  });

  const [saving, setSaving] = useState(false);

  const updateChoice = (index, text) => {
    const newChoices = [...choices];
    newChoices[index] = { ...newChoices[index], text };
    setChoices(newChoices);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!questionText.trim() || choices.some(c => !c.text.trim())) {
      alert('Please fill in all fields');
      return;
    }

    setSaving(true);
    
    try {
      const questionData = {
        question: questionText,
        choices
      };

      await updateDoc(doc(db, 'questions', question.id), questionData);

      onClose();
    } catch (error) {
      console.error('Error saving question:', error);
      alert('Error saving question');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="px-6 py-4">
          <h3 className="text-xl font-bold text-gray-900">Edit Question</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="pb-6 px-6">
          <div className="mb-6">
            <label className="block text-xl font-bold text-gray-900 mb-2">
              Question
            </label>
            <input
              type="text"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-xl font-bold text-gray-900 mb-2">
              Options
            </label>
            {choices.map((choice, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={choice.text}
                  onChange={(e) => updateChoice(index, e.target.value)}
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder={`Choice ${index + 1}`}
                  required
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-950 hover:bg-blue-700 rounded-md disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
