import React from 'react';

export default function SpeedBar({ speed, nitro, shield }) {
  const speedPercent = Math.min((speed / 150) * 100, 100);
  const nitroPercent = Math.min(nitro, 100);

  const getSpeedColor = () => {
    if (speed > 120) return 'from-red-500 to-orange-500';
    if (speed > 80) return 'from-neon-yellow to-orange-400';
    if (speed > 50) return 'from-neon-green to-neon-yellow';
    return 'from-neon-blue to-neon-green';
  };

  return (
    <div className="bg-dark-200/90 rounded-lg p-4 backdrop-blur-sm border border-neon-blue/30">
      <div className="flex items-center gap-6">
        {/* Speed Display */}
        <div className="text-center">
          <div className="font-racing text-4xl text-white">
            {Math.floor(speed)}
          </div>
          <div className="font-body text-xs text-gray-400">km/h</div>
        </div>

        {/* Speed Bar */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="font-body text-xs text-gray-400">SPEED</span>
            <span className="font-racing text-sm text-neon-blue">{Math.floor(speedPercent)}%</span>
          </div>
          <div className="h-4 bg-dark-100 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${getSpeedColor()} transition-all duration-300 rounded-full`}
              style={{ width: `${speedPercent}%` }}
            >
              <div className="h-full w-full bg-gradient-to-r from-white/20 to-transparent animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Nitro Bar */}
        <div className="w-24">
          <div className="flex items-center justify-between mb-1">
            <span className="font-body text-xs text-neon-purple">NITRO</span>
            <span className="font-racing text-sm text-neon-purple">{nitroPercent}%</span>
          </div>
          <div className="h-4 bg-dark-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-neon-purple to-neon-pink transition-all duration-300 rounded-full"
              style={{ width: `${nitroPercent}%` }}
            />
          </div>
        </div>

        {/* Power-up Indicators */}
        <div className="flex gap-2">
          {nitro > 0 && (
            <div className="w-10 h-10 rounded-full bg-neon-purple/30 border-2 border-neon-purple flex items-center justify-center animate-pulse">
              <span className="text-lg">⚡</span>
            </div>
          )}
          {shield && (
            <div className="w-10 h-10 rounded-full bg-neon-blue/30 border-2 border-neon-blue flex items-center justify-center animate-pulse">
              <span className="text-lg">🛡️</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}