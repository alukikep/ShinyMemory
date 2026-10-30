import { useEffect } from 'react';
import { buildJobBoard } from '../../core/scene';
import type { ActionCommand, GameState } from '../../core/types';
import { useDialogFocus } from '../hooks/useDialogFocus';
import { GameIcon } from './GameIcon';

type JobBoardProps = {
  state: GameState;
  onClose: () => void;
  onAccept: (command: ActionCommand) => void;
};

/**
 * 工作面板：事务所的接活入口。
 *
 * 每份工作列出"谁能去、哪天、成功率"，多偶像时自然变成派活界面；
 * 没解锁的工作也显示出来，让玩家知道该往哪个方向交涉。
 */
export function JobBoard({ state, onClose, onAccept }: JobBoardProps) {
  const dialogRef = useDialogFocus<HTMLElement>();
  const board = buildJobBoard(state);

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
        className="roster-panel job-board-panel"
        role="dialog"
        aria-modal="true"
        aria-label="可以接的工作"
        ref={dialogRef}
        tabIndex={-1}
      >
        <header className="roster-head">
          <div>
            <p className="eyebrow">JOBS</p>
            <h2>可以接的工作</h2>
            <p className="shop-description">
              接下来会占掉她那一整天的行程；带检定的工作可能达不到要求。
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
              aria-label="关闭工作面板"
            >
              关闭
            </button>
          </div>
        </header>

        <div className="job-board-list">
          {board.entries.length === 0 ? (
            <p className="shop-description">现在还没有工作邀约。</p>
          ) : null}
          {board.entries.map((entry) => (
            <article
              className={`job-board-card ${entry.lockedReason ? 'job-board-locked' : ''}`}
              key={entry.jobId}
            >
              <div className="job-board-main">
                <div className="job-board-title">
                  <h3>{entry.name}</h3>
                  <span className="shop-price">
                    ¥{entry.pay.toLocaleString('zh-CN')}
                  </span>
                </div>
                <p>{entry.description}</p>
                <div className="job-board-meta">
                  <span>{entry.locationName}</span>
                  <span>{entry.timeLabel}</span>
                  {entry.checkText ? <span>{entry.checkText}</span> : null}
                </div>
              </div>

              {entry.lockedReason ? (
                <p className="job-board-locked-note">未解锁：{entry.lockedReason}</p>
              ) : (
                <div className="job-board-offers">
                  {entry.offers.map((offer) => (
                    <button
                      type="button"
                      key={offer.idolId}
                      className="job-board-accept"
                      disabled={!offer.command}
                      onClick={() => {
                        if (!offer.command) return;
                        onAccept(offer.command);
                        onClose();
                      }}
                    >
                      <strong>派 {offer.idolName} 去</strong>
                      <span>{offer.dayLabel}</span>
                      {offer.checkLabel ? <span>{offer.checkLabel}</span> : null}
                    </button>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
