import React from 'react';

export default function Leaderboard({ positions, currentUserId }) {
  const sortedPositions = [...positions].sort((a, b) => {
    if (a.lap !== b.lap) return b.lap - a.lap;
    return b.position - a.position;
  });

  return (
    <div>
      <h3 className="font-racing text-lg text-neon-blue mb-3">🏆 Positions</h3>
      <div className="space-y-2">
        {sortedPositions.map((player, index) => (
          <div
            key={player.playerId}
            className={`flex items-center gap-3 p-2 rounded-lg ${
              player.playerId === currentUserId
                ? 'bg-neon-blue/20 border border-neon-blue'
                : 'bg-dark-100'
            }`}
          >
            {/* Position */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-racing ${
              index === 0 ? 'bg-yellow-500 text-dark-100' :
              index === 1 ? 'bg-gray-400 text-dark-100' :
              index === 2 ? 'bg-orange-600 text-dark-100' :
              'bg-dark-200 text-gray-400'
            }`}>
              {index + 1}
            </div>

            {/* Player Info */}
            <div className="flex-1">
              <p className="font-body text-white text-sm truncate">
                {player.username || `Player ${player.playerId?.slice(-4)}`}
                {player.playerId === currentUserId && ' (You)'}
              </p>
              <p className="font-body text-xs text-gray-400">
                Lap {player.lap} • {Math.floor(player.speed)} km/h
              </p>
            </div>

            {/* Speed Indicator */}
            <div className={`px-2 py-1 rounded text-xs font-racing ${
              player.speed > 100 ? 'bg-red-500/20 text-red-400' :
              player.speed > 70 ? 'bg-neon-yellow/20 text-neon-yellow' :
              'bg-neon-blue/20 text-neon-blue'
            }`}>
              {Math.floor(player.speed)}
            </div>
          </div>
        ))}

        {positions.length === 0 && (
          <p className="text-gray-500 font-body text-sm text-center py-4">
            Waiting for race data...
          </p>
        )}
      </div>
    </div>
  );
}