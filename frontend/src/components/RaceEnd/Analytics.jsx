import React from 'react';

export default function Analytics({ result }) {
  if (!result) {
    return (
      <p className="text-center text-gray-400 py-8">No analytics available</p>
    );
  }

  const { stats, suggestedLevel, topicPerformance } = result;

  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 80) return 'text-neon-green';
    if (accuracy >= 60) return 'text-neon-yellow';
    return 'text-red-500';
  };

  const getPerformanceBar = (correct, total) => {
    const percent = total > 0 ? (correct / total) * 100 : 0;
    return (
      <div className="flex-1 h-2 bg-dark-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${
            percent >= 80 ? 'bg-neon-green' :
            percent >= 60 ? 'bg-neon-yellow' :
            'bg-red-500'
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Performance Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-dark-100 rounded-lg p-4 text-center">
          <p className="font-body text-gray-400 text-sm mb-1">Accuracy</p>
          <p className={`font-racing text-3xl ${getAccuracyColor(stats.accuracy * 100)}`}>
            {(stats.accuracy * 100).toFixed(0)}%
          </p>
        </div>
        <div className="bg-dark-100 rounded-lg p-4 text-center">
          <p className="font-body text-gray-400 text-sm mb-1">Avg Response</p>
          <p className="font-racing text-3xl text-neon-blue">
            {stats.averageResponseTime.toFixed(1)}s
          </p>
        </div>
        <div className="bg-dark-100 rounded-lg p-4 text-center">
          <p className="font-body text-gray-400 text-sm mb-1">Best Streak</p>
          <p className="font-racing text-3xl text-neon-purple">
            {stats.bestStreak}🔥
          </p>
        </div>
        <div className="bg-dark-100 rounded-lg p-4 text-center">
          <p className="font-body text-gray-400 text-sm mb-1">Questions</p>
          <p className="font-racing text-3xl text-white">
            {stats.correctAnswers}/{stats.totalQuestions}
          </p>
        </div>
      </div>

      {/* Topic Performance */}
      {topicPerformance && Object.keys(topicPerformance).length > 0 && (
        <div>
          <h4 className="font-racing text-lg text-neon-blue mb-4">Topic Breakdown</h4>
          <div className="space-y-3">
            {Object.entries(topicPerformance).map(([topic, data]) => (
              <div key={topic} className="flex items-center gap-4">
                <span className="font-body text-white w-32 truncate capitalize">{topic}</span>
                {getPerformanceBar(data.correct, data.total)}
                <span className="font-racing text-sm text-gray-400 w-16 text-right">
                  {data.correct}/{data.total}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggested Level */}
      <div className="bg-neon-purple/20 border border-neon-purple rounded-lg p-4">
        <h4 className="font-racing text-lg text-neon-purple mb-2">💡 Recommendation</h4>
        <p className="font-body text-gray-300">
          Based on your performance, we suggest trying{' '}
          <span className="text-white font-semibold">Level {suggestedLevel}</span>
          {suggestedLevel > result.race?.settings?.level
            ? ' for a greater challenge!'
            : suggestedLevel < result.race?.settings?.level
            ? ' to build more confidence.'
            : ' - you\'re at the right level!'}
        </p>
      </div>

      {/* Weaknesses */}
      {topicPerformance && (
        <div>
          <h4 className="font-racing text-lg text-neon-yellow mb-3">⚠️ Areas to Improve</h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(topicPerformance)
              .filter(([_, data]) => data.total > 0 && (data.correct / data.total) < 0.6)
              .map(([topic]) => (
                <span
                  key={topic}
                  className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full font-body text-sm capitalize"
                >
                  {topic}
                </span>
              ))}
            {Object.entries(topicPerformance)
              .filter(([_, data]) => data.total > 0 && (data.correct / data.total) < 0.6)
              .length === 0 && (
              <span className="text-neon-green font-body">
                Great job! No weak areas detected! 🎉
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
