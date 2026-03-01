import React from 'react';

export default function Podium({ results }) {
  const topThree = results.slice(0, 3);
  
  // Reorder for visual display: 2nd, 1st, 3rd
  const displayOrder = [topThree[1], topThree[0], topThree[2]].filter(Boolean);

  const getPodiumHeight = (rank) => {
    switch (rank) {
      case 1: return 'h-40';
      case 2: return 'h-32';
      case 3: return 'h-24';
      default: return 'h-20';
    }
  };

  const getPodiumColor = (rank) => {
    switch (rank) {
      case 1: return 'from-yellow-400 to-yellow-600';
      case 2: return 'from-gray-300 to-gray-500';
      case 3: return 'from-orange-400 to-orange-600';
      default: return 'from-gray-600 to-gray-800';
    }
  };

  const getMedal = (rank) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '';
    }
  };

  return (
    <div>
      {/* Podium Display */}
      <div className="flex items-end justify-center gap-4 mb-8 h-64">
        {displayOrder.map((result, index) => (
          <div key={result?.user?._id || index} className="flex flex-col items-center">
            {/* Player Info */}
            <div className="text-center mb-2">
              <div className="text-4xl mb-1">{getMedal(result?.rank)}</div>
              <div className="w-16 h-16 rounded-full bg-dark-100 flex items-center justify-center text-3xl mb-2">
                🏎️
              </div>
              <p className="font-racing text-white text-sm truncate max-w-[100px]">
                {result?.user?.username}
              </p>
            </div>

            {/* Podium Block */}
            <div 
              className={`w-24 ${getPodiumHeight(result?.rank)} bg-gradient-to-t ${getPodiumColor(result?.rank)} rounded-t-lg flex items-center justify-center`}
            >
              <span className="font-racing text-3xl text-dark-100">{result?.rank}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Full Results Table */}
      <div className="mt-8">
        <h3 className="font-racing text-lg text-neon-blue mb-4">Full Results</h3>
        <div className="space-y-2">
          {results.map((result) => (
            <div
              key={result.user._id}
              className="flex items-center gap-4 p-3 bg-dark-100 rounded-lg"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-racing ${
                result.rank === 1 ? 'bg-yellow-500 text-dark-100' :
                result.rank === 2 ? 'bg-gray-400 text-dark-100' :
                result.rank === 3 ? 'bg-orange-500 text-dark-100' :
                'bg-dark-200 text-gray-400'
              }`}>
                {result.rank}
              </div>
              <div className="flex-1">
                <p className="font-body text-white">{result.user.username}</p>
              </div>
              <div className="text-right">
                <p className="font-racing text-neon-green">{result.stats.accuracy.toFixed(0)}%</p>
                <p className="font-body text-xs text-gray-400">accuracy</p>
              </div>
              <div className="text-right">
                <p className="font-racing text-neon-blue">{result.stats.averageResponseTime.toFixed(1)}s</p>
                <p className="font-body text-xs text-gray-400">avg time</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}