import React, { useMemo, useState } from 'react';
import resolveAssetUrl from '../utils/resolveAssetUrl';

/**
 * Lightweight in-card carousel for product images.
 * - Works with images as: [{ url: string, _id?: string }] OR [string]
 */
export default function ProductImageCarousel({ images = [], alt = '', height = 150 }) {
  const normalized = useMemo(() => {
    return (images || [])
      .map((x) => (typeof x === 'string' ? { url: x } : x))
      .filter((x) => x && typeof x.url === 'string' && x.url.trim().length > 0)
      .map((x) => ({ ...x, url: x.url.trim() }));
  }, [images]);

  const [idx, setIdx] = useState(0);
  const total = normalized.length;

  if (!total) return null;

  const current = normalized[Math.min(idx, total - 1)];

  const prev = (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    setIdx((v) => (v - 1 + total) % total);
  };

  const next = (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    setIdx((v) => (v + 1) % total);
  };

  return (
    <div style={{ position: 'relative', marginBottom: 10 }}>
      <img
        src={resolveAssetUrl(current.url)}
        alt={alt}
        style={{
          width: '100%',
          height,
          objectFit: 'cover',
          borderRadius: 12,
          border: '1px solid var(--border)'
        }}
      />

      {total > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="Imagen anterior"
            style={navBtn('left')}
          >
            ‹
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Imagen siguiente"
            style={navBtn('right')}
          >
            ›
          </button>

          <div style={dotsWrap}>
            {normalized.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Ir a imagen ${i + 1}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIdx(i);
                }}
                style={dot(i === idx)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function navBtn(side) {
  return {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    ...(side === 'left' ? { left: 8 } : { right: 8 }),
    width: 34,
    height: 34,
    borderRadius: 999,
    border: '1px solid var(--border)',
    background: 'rgba(255,255,255,0.92)',
    cursor: 'pointer',
    fontSize: 20,
    lineHeight: '32px',
    textAlign: 'center',
    color: '#111',
    userSelect: 'none'
  };
}

const dotsWrap = {
  position: 'absolute',
  left: 0,
  right: 0,
  bottom: 8,
  display: 'flex',
  justifyContent: 'center',
  gap: 6
};

function dot(active) {
  return {
    width: 8,
    height: 8,
    borderRadius: 999,
    border: '1px solid var(--border)',
    background: active ? 'var(--primary)' : 'rgba(255,255,255,0.92)',
    cursor: 'pointer',
    padding: 0
  };
}
