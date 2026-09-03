import { ImageResponse } from 'next/og';

export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 16,
          background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 50%, #7c3aed 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          borderRadius: 8,
          fontWeight: 900,
          letterSpacing: '-0.5px',
          fontFamily: 'sans-serif',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        }}
      >
        <span style={{ color: '#ffffff' }}>L</span>
        <span style={{ color: '#e0e7ff', fontSize: 13, marginRight: 1 }}>c</span>
        <span style={{ color: '#38bdf8' }}>V</span>
      </div>
    ),
    {
      ...size,
    }
  );
}
