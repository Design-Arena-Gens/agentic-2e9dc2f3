'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface HealthEntry {
  id: string;
  date: string;
  weight?: number;
  calories?: number;
  steps?: number;
  exercise?: string;
  duration?: number;
  notes?: string;
}

export default function Home() {
  const [entries, setEntries] = useState<HealthEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'log' | 'weight' | 'activity'>('log');

  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    weight: '',
    calories: '',
    steps: '',
    exercise: '',
    duration: '',
    notes: ''
  });

  useEffect(() => {
    const saved = localStorage.getItem('healthEntries');
    if (saved) {
      setEntries(JSON.parse(saved));
    }
  }, []);

  const saveEntry = () => {
    const newEntry: HealthEntry = {
      id: Date.now().toString(),
      date: formData.date,
      weight: formData.weight ? parseFloat(formData.weight) : undefined,
      calories: formData.calories ? parseInt(formData.calories) : undefined,
      steps: formData.steps ? parseInt(formData.steps) : undefined,
      exercise: formData.exercise || undefined,
      duration: formData.duration ? parseInt(formData.duration) : undefined,
      notes: formData.notes || undefined
    };

    const updated = [...entries, newEntry].sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    setEntries(updated);
    localStorage.setItem('healthEntries', JSON.stringify(updated));

    setFormData({
      date: format(new Date(), 'yyyy-MM-dd'),
      weight: '',
      calories: '',
      steps: '',
      exercise: '',
      duration: '',
      notes: ''
    });
  };

  const deleteEntry = (id: string) => {
    const updated = entries.filter(e => e.id !== id);
    setEntries(updated);
    localStorage.setItem('healthEntries', JSON.stringify(updated));
  };

  const weightData = entries
    .filter(e => e.weight)
    .map(e => ({
      date: format(new Date(e.date), 'MMM dd'),
      weight: e.weight
    }))
    .reverse();

  const activityData = entries
    .filter(e => e.steps || e.duration)
    .map(e => ({
      date: format(new Date(e.date), 'MMM dd'),
      steps: e.steps || 0,
      duration: e.duration || 0
    }))
    .reverse();

  const stats = {
    avgWeight: entries.filter(e => e.weight).length > 0
      ? (entries.filter(e => e.weight).reduce((sum, e) => sum + (e.weight || 0), 0) / entries.filter(e => e.weight).length).toFixed(1)
      : '-',
    totalWorkouts: entries.filter(e => e.exercise).length,
    avgSteps: entries.filter(e => e.steps).length > 0
      ? Math.round(entries.filter(e => e.steps).reduce((sum, e) => sum + (e.steps || 0), 0) / entries.filter(e => e.steps).length)
      : 0
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🏃‍♂️ Health Tracker</h1>
          <p className="text-gray-600">Track your health, sport activities, and weight</p>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm text-gray-500 mb-1">Average Weight</div>
            <div className="text-3xl font-bold text-indigo-600">{stats.avgWeight} kg</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm text-gray-500 mb-1">Total Workouts</div>
            <div className="text-3xl font-bold text-green-600">{stats.totalWorkouts}</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm text-gray-500 mb-1">Avg Steps/Day</div>
            <div className="text-3xl font-bold text-orange-600">{stats.avgSteps.toLocaleString()}</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setActiveTab('log')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'log'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Log Entry
          </button>
          <button
            onClick={() => setActiveTab('weight')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'weight'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Weight Chart
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'activity'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Activity Chart
          </button>
        </div>

        {/* Content */}
        {activeTab === 'log' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Add Entry</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => setFormData({...formData, weight: e.target.value})}
                    placeholder="e.g., 70.5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Calories</label>
                  <input
                    type="number"
                    value={formData.calories}
                    onChange={(e) => setFormData({...formData, calories: e.target.value})}
                    placeholder="e.g., 2000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Steps</label>
                  <input
                    type="number"
                    value={formData.steps}
                    onChange={(e) => setFormData({...formData, steps: e.target.value})}
                    placeholder="e.g., 10000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Exercise</label>
                  <input
                    type="text"
                    value={formData.exercise}
                    onChange={(e) => setFormData({...formData, exercise: e.target.value})}
                    placeholder="e.g., Running, Swimming, Gym"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    placeholder="e.g., 30"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder="Any additional notes..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <button
                  onClick={saveEntry}
                  className="w-full bg-indigo-600 text-white py-3 rounded-md font-semibold hover:bg-indigo-700 transition"
                >
                  Save Entry
                </button>
              </div>
            </div>

            {/* Recent Entries */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent Entries</h2>

              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {entries.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No entries yet. Start tracking!</p>
                ) : (
                  entries.map((entry) => (
                    <div key={entry.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-semibold text-gray-800">
                          {format(new Date(entry.date), 'MMMM dd, yyyy')}
                        </div>
                        <button
                          onClick={() => deleteEntry(entry.id)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Delete
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {entry.weight && (
                          <div><span className="text-gray-600">Weight:</span> <span className="font-medium">{entry.weight} kg</span></div>
                        )}
                        {entry.calories && (
                          <div><span className="text-gray-600">Calories:</span> <span className="font-medium">{entry.calories}</span></div>
                        )}
                        {entry.steps && (
                          <div><span className="text-gray-600">Steps:</span> <span className="font-medium">{entry.steps.toLocaleString()}</span></div>
                        )}
                        {entry.exercise && (
                          <div><span className="text-gray-600">Exercise:</span> <span className="font-medium">{entry.exercise}</span></div>
                        )}
                        {entry.duration && (
                          <div><span className="text-gray-600">Duration:</span> <span className="font-medium">{entry.duration} min</span></div>
                        )}
                      </div>

                      {entry.notes && (
                        <div className="mt-2 text-sm text-gray-600 italic">{entry.notes}</div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'weight' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Weight Progress</h2>
            {weightData.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No weight data yet. Add some entries!</p>
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={weightData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={['dataMin - 2', 'dataMax + 2']} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="weight" stroke="#4f46e5" strokeWidth={2} name="Weight (kg)" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Activity Progress</h2>
            {activityData.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No activity data yet. Add some entries!</p>
            ) : (
              <>
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">Daily Steps</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={activityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="steps" stroke="#ea580c" strokeWidth={2} name="Steps" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">Exercise Duration</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={activityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="duration" stroke="#16a34a" strokeWidth={2} name="Duration (min)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
