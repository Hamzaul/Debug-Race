import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import { getProfile } from '../../services/api';
import Button from '../common/Button';
import Loading from '../common/Loading';

export default function StatsPage() {
  const navigate = useNavigate();
  const { state } = useGame();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await getProfile();
        setStats(response.data.stats);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (state.user && !state.user.isGuest) {
      fetchStats();
    } else {
      setIsLoading(false);
    }
  }, [state.user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-100">
        <Loading text="Loading stats..." />
      </div>
    );
  }

  const displayStats = stats || {
    totalRaces: 0,
    wins: 0,
    totalQuestions: 0,
    correctAnswers: 0,
    bestStreak: 0,
    averageResponseTime: 0
  };

  const winRate = displayStats.totalRaces > 0
    ? ((displayStats.wins / displayStats.totalRaces) * 100).toFixed(1)
    : 0;

  const accuracy = displayStats.totalQuestions > 0
    ? ((displayStats.correctAnswers / displayStats.totalQuestions) * 100).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen bg-dark-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-racing text-4xl text-white">📊 Your Stats</h1>
          <Button variant="secondary" onClick={() => navigate('/home')}>
            ← Back
          </Button>
        </div>

        {/* User Card */}
        <div className="bg-dark-200 rounded-lg border border-neon-blue/30 p-6 mb-8">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-neon-blue/20 flex items-center justify-center text-5xl">
              🏎️
            </div>
            <div>
              <h2 className="font-racing text-2xl text-white">{state.user?.username || 'Guest'}</h2>
              <p className="font-body text-gray-400">
                Level {state.user?.level || 1} Racer
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className="px-3 py-1 bg-neon-purple/20 text-neon-purple font-racing rounded">
                  {state.user?.xp || 0} XP
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <StatCard
            label="Total Races"
            value={displayStats.totalRaces}
            icon="🏁"
            color="neon-blue"
          />
          <StatCard
            label="Wins"
            value={displayStats.wins}
            icon="🏆"
            color="neon-yellow"
          />
          <StatCard
            label="Win Rate"
            value={`${winRate}%`}
            icon="📈"
            color="neon-green"
          />
          <StatCard
            label="Questions"
            value={displayStats.totalQuestions}
            icon="❓"
            color="neon-purple"
          />
          <StatCard
            label="Accuracy"
            value={`${accuracy}%`}
            icon="🎯"
            color="neon-green"
          />
          <StatCard
            label="Best Streak"
            value={displayStats.bestStreak}
            icon="🔥"
            color="neon-orange"
          />
        </div>

        {/* Performance Chart Placeholder */}
        <div className="bg-dark-200 rounded-lg border border-neon-blue/30 p-6 mb-8">
          <h3 className="font-racing text-xl text-neon-blue mb-4">Performance Overview</h3>
          <div className="h-48 flex items-center justify-center border border-dashed border-gray-600 rounded-lg">
            <p className="text-gray-500 font-body">
              📊 Performance charts coming soon!
            </p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-dark-200 rounded-lg border border-neon-blue/30 p-6">
          <h3 className="font-racing text-xl text-neon-blue mb-4">Recent Races</h3>
          <div className="space-y-3">
            {state.user?.isGuest ? (
              <p className="text-gray-500 font-body text-center py-4">
                Create an account to track your race history!
              </p>
            ) : (
              <p className="text-gray-500 font-body text-center py-4">
                No recent races yet. Start racing to see your history!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }) {
  const colorClasses = {
    'neon-blue': 'text-neon-blue border-neon-blue/30',
    'neon-green': 'text-neon-green border-neon-green/30',
    'neon-purple': 'text-neon-purple border-neon-purple/30',
    'neon-yellow': 'text-yellow-400 border-yellow-400/30',
    'neon-orange': 'text-orange-400 border-orange-400/30'
  };

  return (
    <div className={`bg-dark-200 rounded-lg border p-4 ${colorClasses[color]}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{icon}</span>
        <span className="font-body text-gray-400 text-sm">{label}</span>
      </div>
      <p className={`font-racing text-3xl ${colorClasses[color].split(' ')[0]}`}>
        {value}
      </p>
    </div>
  );
}