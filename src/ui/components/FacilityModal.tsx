import { useEffect } from 'react';
import { CONTENT_INDEX } from '../../core/contentIndex';
import { getFacilityLevel } from '../../core/sim';
import type { GameState } from '../../core/types';
import { useDialogFocus } from '../hooks/useDialogFocus';
import { GameIcon } from './GameIcon';

type FacilityModalProps = {
  state: GameState;
  onClose: () => void;
  onUpgrade: (facilityId: string) => void;
};

const LEVEL_NAMES = ['初级', '中级', '高级', '顶级'];

function levelName(level: number): string {
  return LEVEL_NAMES[level] ?? `Lv${level}`;
}

export function FacilityModal({
  state,
  onClose,
  onUpgrade,
}: FacilityModalProps) {
  const dialogRef = useDialogFocus<HTMLElement>();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const facilities = [...CONTENT_INDEX.facilities.values()];

  return (
    <div
      className="roster-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="roster-panel shop-panel"
        role="dialog"
        aria-modal="true"
        aria-label="设施管理室"
        ref={dialogRef}
        tabIndex={-1}
      >
        <header className="roster-head">
          <div>
            <p className="eyebrow">FACILITY</p>
            <h2>设施管理室</h2>
            <p className="shop-description">
              练习室的三间训练房。升级后旧课程会被新课程替换。
            </p>
          </div>
          <div className="inventory-head-meta">
            <span>
              <GameIcon name="coin" size={13} /> ¥{state.money}
            </span>
            <button
              type="button"
              className="roster-close"
              onClick={onClose}
              aria-label="关闭设施管理室"
            >
              关闭
            </button>
          </div>
        </header>

        <div className="shop-list">
          {facilities.map((facility) => {
            const current = getFacilityLevel(state, facility.id);
            const next = facility.levels.find(
              (level) => level.level === current + 1,
            );
            const maxed = !next;
            const unaffordable = next ? state.money < next.cost : false;
            const reason = maxed
              ? '已满级'
              : unaffordable
                ? '金钱不足'
                : null;

            return (
              <article className="shop-item" key={facility.id}>
                <span className="shop-icon">
                  <GameIcon name="building" size={22} />
                </span>
                <div className="shop-copy">
                  <div className="shop-name-row">
                    <h3>{facility.name}</h3>
                    <span className="shop-price">
                      {levelName(current)}
                      {next ? ` → ${levelName(next.level)}` : ''}
                    </span>
                  </div>
                  <p>{facility.description}</p>
                  <div className="shop-meta">
                    {next ? (
                      <>
                        <span>费用 ¥{next.cost}</span>
                        <span>{next.description}</span>
                      </>
                    ) : (
                      <span>已经是最高等级。</span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  className="shop-buy-button"
                  disabled={Boolean(reason)}
                  onClick={() => onUpgrade(facility.id)}
                >
                  {reason ?? '升级'}
                </button>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
