import React, { useEffect, useRef, useState } from 'react';

interface DeckDisplayProps {
  deckCount: number;
  discardCount: number;
}

export const DeckDisplay: React.FC<DeckDisplayProps> = ({ deckCount, discardCount }) => {
  const prevDiscard = useRef(discardCount);
  const [discardAnim, setDiscardAnim] = useState(false);

  useEffect(() => {
    if (discardCount > prevDiscard.current) {
      setDiscardAnim(true);
      const t = setTimeout(() => setDiscardAnim(false), 600);
      prevDiscard.current = discardCount;
      return () => clearTimeout(t);
    }
    prevDiscard.current = discardCount;
  }, [discardCount]);

  const deckVisible = Math.min(deckCount, 5);

  return (
    <div style={{
      display: 'flex',
      gap: '20px',
      alignItems: 'center',
    }}>
      {/* ===== 牌堆 ===== */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* 标签 */}
        <span style={{
          fontSize: '0.6rem',
          fontFamily: 'var(--font-display)',
          letterSpacing: '2px',
          color: 'rgba(0,245,255,0.5)',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
        }}>牌堆</span>

        {/* 卡牌堆叠 */}
        <div style={{ position: 'relative', width: 52, height: 70 }}>
          {/* 背景卡片（堆叠效果） */}
          {deckVisible > 1 && Array.from({ length: deckVisible - 1 }).map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: 48,
                height: 66,
                borderRadius: '6px',
                background: 'linear-gradient(135deg, rgba(0,245,255,0.1) 0%, rgba(192,132,252,0.1) 100%)',
                border: '1px solid rgba(0,245,255,0.3)',
                transform: `translate(${i * 1.5}px, ${i * -1.5}px) rotate(${i * 0.8 - 1}deg)`,
                zIndex: i,
              }}
            />
          ))}

          {/* 顶层主卡片 */}
          {deckCount > 0 ? (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: 48,
              height: 66,
              borderRadius: '6px',
              background: 'linear-gradient(135deg, #0a1a2e 0%, #1a0a3e 100%)',
              border: '1.5px solid rgba(0,245,255,0.6)',
              boxShadow: '0 0 14px rgba(0,245,255,0.25), inset 0 0 8px rgba(0,245,255,0.06)',
              zIndex: deckVisible,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}>
              {/* 扫描线 */}
              <div style={{
                position: 'absolute',
                top: '-100%',
                left: 0,
                right: 0,
                height: '200%',
                background: 'linear-gradient(180deg, transparent 0%, rgba(0,245,255,0.1) 50%, transparent 100%)',
                animation: 'scanline 3s linear infinite',
              }} />
              <div style={{
                width: 16,
                height: 16,
                border: '1.5px solid rgba(0,245,255,0.5)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(0,245,255,0.7)' }} />
              </div>
            </div>
          ) : (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: 48,
              height: 66,
              borderRadius: '6px',
              border: '1.5px dashed rgba(0,245,255,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgba(0,245,255,0.25)',
              fontSize: '0.5rem',
              fontFamily: 'var(--font-mono)',
            }}>
              EMPTY
            </div>
          )}
        </div>

        {/* 张数 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
          <span style={{
            fontSize: deckCount > 10 ? '0.9rem' : '1rem',
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            color: deckCount > 10 ? 'rgba(0,229,255,0.55)' : 'var(--neon-cyan)',
            textShadow: deckCount > 10 ? '0 0 8px rgba(0,229,255,0.3)' : '0 0 8px var(--neon-cyan)',
            lineHeight: 1,
          }}>
            {deckCount}
          </span>
          <span style={{ fontSize: '0.55rem', color: 'rgba(0,245,255,0.35)', letterSpacing: '1px' }}>张</span>
        </div>
      </div>

      {/* 分隔线 */}
      <div style={{
        width: 1,
        height: 60,
        background: 'linear-gradient(180deg, transparent, rgba(192,132,252,0.3), transparent)',
      }} />

      {/* ===== 弃牌堆 ===== */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* 标签 */}
        <span style={{
          fontSize: '0.6rem',
          fontFamily: 'var(--font-display)',
          letterSpacing: '2px',
          color: 'rgba(255,0,170,0.5)',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
        }}>弃牌</span>

        {/* 垃圾桶 */}
        <div
          className={discardAnim ? 'discard-glitch' : ''}
          style={{ position: 'relative', display: 'flex', alignItems: 'center', height: 70, flexShrink: 0 }}
        >
          <svg
            viewBox="0 0 64 72"
            width="56"
            height="74"
            fill="none"
            style={{
              filter: discardAnim
                ? 'drop-shadow(0 0 10px rgba(255,0,170,0.9))'
                : 'drop-shadow(0 0 4px rgba(255,0,170,0.35))',
            }}
          >
            {/* 桶身：撑满整个 viewBox */}
            <path d="M8 18 L14 68 L50 68 L56 18 Z" stroke={discardAnim ? '#ff00aa' : 'rgba(255,0,170,0.55)'} strokeWidth="2.5" fill="rgba(255,0,170,0.07)" strokeLinejoin="round" />
            {/* 桶口 */}
            <path d="M4 18 L60 18" stroke={discardAnim ? '#ff00aa' : 'rgba(255,0,170,0.8)'} strokeWidth="3" strokeLinecap="round" />
            {/* 斜条纹1 */}
            <line x1="20" y1="26" x2="18" y2="62" stroke="rgba(255,0,170,0.3)" strokeWidth="2" strokeLinecap="round" />
            {/* 斜条纹2 */}
            <line x1="32" y1="26" x2="30" y2="62" stroke="rgba(255,0,170,0.3)" strokeWidth="2" strokeLinecap="round" />
            {/* 斜条纹3 */}
            <line x1="44" y1="26" x2="42" y2="62" stroke="rgba(255,0,170,0.3)" strokeWidth="2" strokeLinecap="round" />
            {/* 把手 */}
            <path d="M22 18 L22 12 C22 8 27 7 32 7 C37 7 42 8 42 12 L42 18" stroke={discardAnim ? '#ff66cc' : 'rgba(255,0,170,0.5)'} strokeWidth="2.5" strokeLinecap="round" fill="none" />
            {/* 底部 */}
            <path d="M14 68 L50 68" stroke={discardAnim ? '#ff00aa' : 'rgba(255,0,170,0.35)'} strokeWidth="2.5" strokeLinecap="round" />
          </svg>

          {/* 数量徽章 */}
          {discardCount > 0 && (
            <div style={{
              position: 'absolute',
              top: -4,
              right: -8,
              background: 'rgba(255,45,149,0.9)',
              borderRadius: '50%',
              width: 18,
              height: 18,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.55rem',
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              color: '#fff',
              boxShadow: '0 0 6px rgba(255,45,149,0.7)',
              border: '1.5px solid rgba(255,45,149,1)',
            }}>
              {discardCount > 99 ? '99+' : discardCount}
            </div>
          )}

          {/* 丢牌闪烁线条 */}
          {discardAnim && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: -4,
              right: -4,
              height: 1,
              background: 'linear-gradient(90deg, transparent, rgba(255,0,170,0.8), transparent)',
              animation: 'glitchLine 0.4s ease-out',
              pointerEvents: 'none',
            }} />
          )}
        </div>

        {/* 张数 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
          {discardCount > 0 ? (
            <>
              <span style={{
                fontSize: '1rem',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                color: 'var(--neon-pink)',
                textShadow: '0 0 8px var(--neon-pink)',
                lineHeight: 1,
              }}>
                {discardCount}
              </span>
              <span style={{ fontSize: '0.55rem', color: 'rgba(255,0,170,0.35)', letterSpacing: '1px' }}>张</span>
            </>
          ) : (
            <span style={{ fontSize: '0.65rem', color: 'rgba(255,0,170,0.25)' }}>空</span>
          )}
        </div>
      </div>
    </div>
  );
};
