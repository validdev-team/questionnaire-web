'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { Trash2, Edit, Plus } from 'lucide-react';

export default function AdminPanel() {
  const [questions, setQuestions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const resetAllResponses = async () => {
    if (!window.confirm('Are you sure you want to delete all responses and reset stats?')) return;

    setResetting(true); // Start loading
    try {
      // 1. Delete all documents in "responses"
      const responsesSnapshot = await getDocs(collection(db, 'responses'));
      const deletePromises = responsesSnapshot.docs.map((docSnap) =>
        deleteDoc(doc(db, 'responses', docSnap.id))
      );
      await Promise.all(deletePromises);

      // 2. Reset vote counts and responseCount in "questions"
      const questionsSnapshot = await getDocs(collection(db, 'questions'));
      const resetPromises = questionsSnapshot.docs.map((docSnap) => {
        const questionData = docSnap.data();

        const resetChoices = questionData.choices.map((choice) => ({
          ...choice,
          votes: 0,
        }));

        return updateDoc(doc(db, 'questions', docSnap.id), {
          choices: resetChoices,
          responseCount: 0,
        });
      });

      await Promise.all(resetPromises);

      fetchQuestions(); // refresh table
    } catch (error) {
      console.error('Error resetting data:', error);
      alert('Failed to reset responses');
    } finally {
      setResetting(false); // End loading
    }
  };

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

  const deleteQuestion = async (id) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await deleteDoc(doc(db, 'questions', id));
        setQuestions(questions.filter(q => q.id !== id));
      } catch (error) {
        console.error('Error deleting question:', error);
        alert('Error deleting question');
      }
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
            <h2 className="text-xl font-semibold text-gray-900">All Questions</h2>
            <button
              onClick={resetAllResponses}
              disabled={resetting}
              className={`px-4 py-2 rounded-lg ${resetting ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700'} text-white`}
            >
              {resetting ? 'Resetting...' : 'Reset Responses'}
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Question
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. of Responses</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {questions.map((question, index) => (
                    <tr key={question.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{question.question}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{question.choices?.length || 0}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{question.responseCount || 0}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEdit(question)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteQuestion(question.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
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

function QuestionForm({ question, onClose }) {
  const [questionText, setQuestionText] = useState(question?.question || '');
  const [choices, setChoices] = useState(question?.choices || [{ text: '', votes: 0 }]);
  const [saving, setSaving] = useState(false);

  const addChoice = () => {
    setChoices([...choices, { text: '', votes: 0 }]);
  };

  const removeChoice = (index) => {
    if (choices.length > 1) {
      setChoices(choices.filter((_, i) => i !== index));
    }
  };

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
        choices: choices,
        responseCount: question?.responseCount || 0
      };

      if (question) {
        await updateDoc(doc(db, 'questions', question.id), questionData);
      } else {
        await addDoc(collection(db, 'questions'), questionData);
      }
      
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
          <h3 className="text-lg font-medium text-gray-900">
            {question ? 'Edit Question' : 'Add New Question'}
          </h3>
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
              placeholder="Enter your question"
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
                {choices.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeChoice(index)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addChoice}
              className="text-blue-600 hover:text-blue-900 text-sm flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              Add Choice
            </button>
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
              {saving ? 'Saving...' : question ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}