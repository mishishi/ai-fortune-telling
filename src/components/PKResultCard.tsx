'use client';

interface PKResultCardProps {
  result: {
    winner: string;
    winDimensions: string[];
    loseDimensions: string[];
    summary: string;
  };
  challengerName: string;
  opponentName: string;
  isChallenger: boolean;
}

const DIMENSION_LABELS: Record<string, string> = {
  career: '事业运',
  love: '感情运',
  wealth: '财运',
  health: '健康运',
  mentor: '贵人运',
};

const DIMENSION_COLORS: Record<string, string> = {
  career: '#e74c3c',
  love: '#e91e63',
  wealth: '#f1c40f',
  health: '#2ecc71',
  mentor: '#3498db',
};

export default function PKResultCard({ result, challengerName, opponentName, isChallenger }: PKResultCardProps) {
  const myWinDims = isChallenger
    ? result.winDimensions
    : result.loseDimensions;
  const myLoseDims = isChallenger
    ? result.loseDimensions
    : result.winDimensions;

  return (
    <div className="bg-[#2a2235] rounded-xl p-6 w-full max-w-md">
      <div className="text-center mb-6">
        <div className="text-5xl mb-4">{result.winner === (isChallenger ? 'challenger' : 'opponent') ? '🏆' : '😢'}</div>
        <p className="text-xl font-bold text-white">{result.summary}</p>
      </div>

      <div className="space-y-4">
        {['career', 'love', 'wealth', 'health', 'mentor'].map(dim => {
          const isWin = myWinDims.includes(dim);
          const isLose = myLoseDims.includes(dim);
          const label = DIMENSION_LABELS[dim];
          const color = DIMENSION_COLORS[dim];

          return (
            <div key={dim} className="flex items-center justify-between">
              <span style={{ color }} className="font-medium">{label}</span>
              <div className="flex items-center gap-2">
                {isWin && <span className="text-green-400 text-sm">胜</span>}
                {isLose && <span className="text-red-400 text-sm">负</span>}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-600 text-center text-gray-400 text-sm">
        <p>{challengerName} VS {opponentName}</p>
      </div>
    </div>
  );
}