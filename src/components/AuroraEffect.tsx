'use client';

export default function AuroraEffect() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div
        className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full aurora-pulse"
        style={{
          background: 'radial-gradient(circle, rgba(123,104,238,0.3) 0%, transparent 70%)',
          filter: 'blur(60px)',
          animationDuration: '8s',
        }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full aurora-pulse"
        style={{
          background: 'radial-gradient(circle, rgba(65,105,225,0.25) 0%, transparent 70%)',
          filter: 'blur(60px)',
          animationDuration: '10s',
          animationDelay: '2s',
        }}
      />
    </div>
  );
}
