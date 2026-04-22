'use client';

interface ShareCardProps {
  name: string;
  gender: string;
  radarScores: {
    career?: number;
    love?: number;
    wealth?: number;
    health?: number;
    mentor?: number;
  };
  overall?: string;
  createdAt: string;
}

const DIMENSIONS = [
  { key: 'career', label: '事业', color: '#e74c3c' },
  { key: 'love', label: '感情', color: '#e91e63' },
  { key: 'wealth', label: '财运', color: '#f1c40f' },
  { key: 'health', label: '健康', color: '#2ecc71' },
  { key: 'mentor', label: '贵人', color: '#3498db' },
] as const;

function renderBar(value: number, color: string): string {
  const filled = Math.round(value / 10);
  const empty = 10 - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}

export default function ShareCard({ name, gender, radarScores, overall, createdAt }: ShareCardProps) {
  const year = new Date(createdAt).getFullYear();
  const genderText = gender === 'male' ? '男' : '女';

  return (
    <div
      style={{
        width: 400,
        padding: 32,
        background: 'linear-gradient(135deg, #1a1525 0%, #2d1f3d 50%, #1a1525 100%)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#fff',
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 12, color: '#d4af37', marginBottom: 8, letterSpacing: 2 }}>
          AI 命理分析报告
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 'bold', margin: 0 }}>
          {name} 的运势报告
        </h2>
        <div style={{ fontSize: 14, color: '#888', marginTop: 4 }}>
          {year}年 · {genderText} · 生肖运势
        </div>
      </div>

      {/* Radar Scores */}
      <div style={{ marginBottom: 24 }}>
        {DIMENSIONS.map(dim => {
          const score = radarScores[dim.key as keyof typeof radarScores] || 0;
          return (
            <div key={dim.key} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 14, color: dim.color }}>{dim.label}</span>
                <span style={{ fontSize: 14, fontWeight: 'bold' }}>{score}分</span>
              </div>
              <div style={{ fontSize: 12, color: '#666', letterSpacing: 1 }}>
                <span style={{ color: dim.color }}>{renderBar(score, dim.color)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Overall */}
      {overall && (
        <div
          style={{
            background: 'rgba(212, 175, 55, 0.1)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            borderRadius: 8,
            padding: 12,
            marginBottom: 16,
          }}
        >
          <div style={{ fontSize: 12, color: '#d4af37', marginBottom: 4 }}>整体运势</div>
          <p style={{ fontSize: 13, color: '#ccc', margin: 0, lineHeight: 1.5 }}>
            {overall.slice(0, 100)}{overall.length > 100 ? '...' : ''}
          </p>
        </div>
      )}

      {/* Footer */}
      <div style={{ textAlign: 'center', fontSize: 11, color: '#555' }}>
        AI命理分析 · {new Date(createdAt).toLocaleDateString('zh-CN')}
      </div>
    </div>
  );
}
