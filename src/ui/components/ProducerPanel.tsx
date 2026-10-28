import { useEffect } from 'react';
import { RANK_CURVE } from '../../core/growth';
import { PRODUCER_STAT_LABELS } from '../../core/labels';
import {
  PRODUCER_STAT_KEYS,
  staminaCapForRank,
  staminaCostMultiplierForRank,
} from '../../core/producer';
import type { GameState } from '../../core/types';
import { useDialogFocus } from '../hooks/useDialogFocus';
import { GameIcon } from './GameIcon';

type ProducerPanelProps = {
  state: GameState;
  onClose: () => void;
};

export function ProducerPanel({ state, onClose }: ProducerPanelProps) {
  const dialogRef = useDialogFocus<HTMLElement>();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div
      className="roster-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="roster-panel producer-panel"
        role="dialog"
        aria-modal="true"
        aria-label="制作人属性"
        ref={dialogRef}
        tabIndex={-1}
      >
        <header className="roster-head">
          <div>
            <p className="eyebrow">PRODUCER</p>
            <h2>制作人属性</h2>
          </div>
          <button
            type="button"
            className="roster-close"
            onClick={onClose}
            aria-label="关闭制作人属性"
          >
            关闭
          </button>
        </header>

        <p className="producer-lead">
          制作人属性对所有偶像全局生效，不随切换偶像变化。
        </p>

        <div className="producer-list">
          {PRODUCER_STAT_KEYS.map((key) => {
            const attribute = state.producer[key];
            const maxed = attribute.rank === attribute.maxRank;
            const needed = RANK_CURVE[attribute.rank];
            const percent = maxed
              ? 100
              : Math.max(0, Math.min(100, (attribute.exp / needed) * 100));
            return (
              <article className="producer-card" key={key}>
                <div className="stat-line">
                  <span className="stat-name">
                    <GameIcon name="star" size={12} />
                    {PRODUCER_STAT_LABELS[key]}
                  </span>
                  <span className="stat-value">
                    {attribute.rank}
                    {maxed ? (
                      <small> / MAX</small>
                    ) : (
                      <small>
                        {' '}
                        · {attribute.exp} / {needed}
                      </small>
                    )}
                  </span>
                </div>
                <div className="bar">
                  <div className="bar-fill" style={{ width: `${percent}%` }} />
                </div>
                <p className="producer-detail-line">
                  {key === 'stamina'
                    ? `体力上限 ${staminaCapForRank(attribute.rank)} · 行动消耗 ×${staminaCostMultiplierForRank(attribute.rank).toFixed(2)}`
                    : '工作收入倍率 ×1.0 – ×1.5'}
                </p>
              </article>
            );
          })}
        </div>

        <p className="producer-note">
          属性对所有偶像全局生效。体能决定体力上限与行动消耗倍率，摄影决定只吃制作人属性的工作收入。
        </p>
      </section>
    </div>
  );
}
