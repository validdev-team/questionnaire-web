'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { Edit } from 'lucide-react';

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
    try {
      const querySnapshot = await getDocs(collection(db, 'questions'));
      const questionList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setQuestions(questionList);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchResponseCount = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'responses'));
      setResponseCount(snapshot.size);
    } catch (error) {
      console.error('Error fetching response count:', error);
    }
  };

  const resetAllResponses = async () => {
    if (!window.confirm('Are you sure you want to delete all responses and reset stats?')) return;

    setResetting(true);
    try {
      const responsesSnapshot = await getDocs(collection(db, 'responses'));
      const deletePromises = responsesSnapshot.docs.map((docSnap) =>
        deleteDoc(doc(db, 'responses', docSnap.id))
      );
      await Promise.all(deletePromises);

      const questionsSnapshot = await getDocs(collection(db, 'questions'));
      const resetPromises = questionsSnapshot.docs.map((docSnap) => {
        const questionData = docSnap.data();

        const resetChoices = questionData.choices.map((choice) => ({
          ...choice,
          votes: 0,
        }));

        return updateDoc(doc(db, 'questions', docSnap.id), {
          choices: resetChoices
        });
      });

      await Promise.all(resetPromises);

      fetchQuestions();
      fetchResponseCount();
    } catch (error) {
      console.error('Error resetting data:', error);
      alert('Failed to reset responses');
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
            <button
              onClick={resetAllResponses}
              disabled={resetting}
              className={`px-4 py-2 rounded-lg ${
                resetting ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700'
              } text-white`}
            >
              {resetting ? 'Resetting...' : 'Reset Responses'}
            </button>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Edit</th>
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
                          className="text-blue-600 hover:text-blue-900"
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
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Edit Question</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Answer Choices
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
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
