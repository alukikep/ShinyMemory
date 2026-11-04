import { useEffect, useState } from 'react';
import { CONTENT_INDEX } from '../../core/contentIndex';
import { buildJobBoard } from '../../core/scene';
import { STAT_ABBR } from '../../core/labels';
import {
  formatCalendarDateFromDay,
  formatClock,
  getDay,
} from '../../core/time';
import type { ActionCommand, GameState, JobBoardEntry } from '../../core/types';
import { useDialogFocus } from '../hooks/useDialogFocus';
import { GameIcon } from './GameIcon';

type JobBoardProps = {
  state: GameState;
  onClose: () => void;
  onAccept: (command: ActionCommand) => void;
  onCancel: (assignmentId: string) => void;
  onRefresh: () => void;
};

/**
 * 工作面板：两级。
 *
 * 列表只看「名字 / 门槛 / 报酬」，工作再多也不会挤；
 * 点进一条才看详情和派谁去。默认只排重点偶像。
 */
export function JobBoard({
  state,
  onClose,
  onAccept,
  onCancel,
  onRefresh,
}: JobBoardProps) {
  const dialogRef = useDialogFocus<HTMLElement>();
  const board = buildJobBoard(state);
  const [detailId, setDetailId] = useState<string | undefined>();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (detailId) {
        setDetailId(undefined);
        return;
      }
      onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [detailId, onClose]);

  const detail = board.entries.find((entry) => entry.jobId === detailId);
  // 默认重点偶像；玩家可以改成别人。
  const [pickedIdolId, setPickedIdolId] = useState<string | undefined>();
  const picked =
    detail?.offers.find((offer) => offer.idolId === pickedIdolId) ??
    detail?.offers.find((offer) => offer.idolId === board.focusIdolId) ??
    detail?.offers[0];
  const selectedDate = picked?.dates.find((date) => date.available);
  const canAccept =
    Boolean(selectedDate) &&
    !board.slots.full &&
    !detail?.busyReason &&
    !picked?.locked;

  const statusOf = (entry: JobBoardEntry) =>
    entry.locked
      ? '未解锁'
      : (entry.busyReason ??
        (board.slots.full ? '已排满' : undefined));

  const activeJobs = state.jobs.map((assignment) => {
    const job = CONTENT_INDEX.jobs.get(assignment.jobId);
    const idol = CONTENT_INDEX.idols.get(assignment.idolId);
    const start =
      (assignment.day - 1) * 24 * 60 + assignment.fromMinute;
    const today = getDay(state.clock.absoluteMinutes);
    return {
      assignment,
      jobName: job?.name ?? assignment.jobId,
      idolName: idol?.name ?? assignment.idolId,
      dateLabel: `${formatCalendarDateFromDay(assignment.day, false)} · ${formatClock(assignment.fromMinute)}–${formatClock(assignment.toMinute)}`,
      occupiedLabel:
        assignment.day === today
          ? '占用至今天'
          : `占用至 ${formatCalendarDateFromDay(assignment.day, false)}`,
      cancellable: state.clock.absoluteMinutes < start,
    };
  });

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
            <h2>{detail ? detail.name : '可以接的工作'}</h2>
            <p className="shop-description">
              {detail
                ? `${detail.locationName} · ${detail.timeLabel}`
                : `可同时负责 ${board.slots.cap} 份工作。接下来会占掉她那一整天的行程；带检定的工作可能达不到要求。`}
            </p>
          </div>
          <div className="inventory-head-meta">
            <span>
              <GameIcon name="coin" size={13} /> ¥{state.money}
            </span>
            {detail ? (
              <button
                type="button"
                className="roster-close"
                onClick={() => setDetailId(undefined)}
                aria-label="返回工作列表"
              >
                返回
              </button>
            ) : null}
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

        <div className="job-slot-banner" aria-label="今日工作邀约">
          <strong>今日邀约 {board.invitations.count}/{board.invitations.limit}</strong>
          <button type="button" className="job-cancel-button"
            disabled={!board.invitations.canRefresh}
            onClick={() => { setDetailId(undefined); onRefresh(); }}>
            {board.invitations.refreshed ? '今日已刷新' : '刷新邀约（每日一次）'}
          </button>
          <span>{board.invitations.refreshed ? '明天恢复刷新次数' : board.invitations.canRefresh ? '免费，不消耗时间' : '暂无可替换邀约'}</span>
        </div>

        {activeJobs.length > 0 ? (
          <section className="job-active-list" aria-label="已排工作">
            <div className="job-slot-banner">
              <strong>
                已排工作 {board.slots.used}/{board.slots.cap}
              </strong>
              <span>
                {board.slots.full
                  ? '已排满，先完成或取消一份工作。'
                  : '完成或取消后释放名额。'}
              </span>
            </div>
            {activeJobs.map((entry) => (
              <div className="job-active-row" key={entry.assignment.id}>
                <div className="job-active-copy">
                  <strong>{entry.jobName}</strong>
                  <span>
                    {entry.idolName} · {entry.dateLabel} · {entry.occupiedLabel}
                  </span>
                </div>
                {entry.cancellable ? (
                  <button
                    type="button"
                    className="job-cancel-button"
                    onClick={() => onCancel(entry.assignment.id)}
                  >
                    取消
                  </button>
                ) : (
                  <span className="job-active-status">进行中</span>
                )}
              </div>
            ))}
          </section>
        ) : (
          <div className="job-slot-banner">
            <strong>
              已排工作 0/{board.slots.cap}
            </strong>
            <span>升级事务所工作区可以提高这个上限。</span>
          </div>
        )}

        {detail ? (
          <div className="job-detail">
            <p className="job-detail-description">{detail.description}</p>
            <div className="job-board-meta">
              <span>¥{detail.pay.toLocaleString('zh-CN')}</span>
              {detail.checkText ? <span>{detail.checkText}</span> : null}
            </div>

            {detail.locked ? (
              <p className="job-board-locked-note">未解锁</p>
            ) : detail.busyReason ? (
              <p className="job-board-locked-note">{detail.busyReason}</p>
            ) : board.slots.full ? (
              <p className="job-board-locked-note">
                已排满。先完成或取消一份已排工作，或升级事务所工作区。
              </p>
            ) : detail.offers.length === 0 ? (
              <p className="job-board-locked-note">还没有能去的偶像</p>
            ) : (
              <>
                <label className="job-board-picker">
                  <span>派谁去</span>
                  <select
                    value={picked?.idolId ?? ''}
                    aria-label="选择接工作的偶像"
                    onChange={(event) => setPickedIdolId(event.target.value)}
                  >
                    {detail.offers.map((offer) => (
                      <option
                        key={offer.idolId}
                        value={offer.idolId}
                        disabled={!offer.command}
                      >
                        {offer.idolName}
                        {offer.command
                          ? ''
                          : `（${offer.lockedReason ?? '不可用'}）`}
                      </option>
                    ))}
                  </select>
                </label>
                {picked ? (
                  <button
                    type="button"
                    className="job-board-accept"
                    disabled={!canAccept}
                    onClick={() => {
                      if (!selectedDate) return;
                      onAccept({
                        type: 'acceptJob',
                        jobId: detail.jobId,
                        day: selectedDate.day,
                        idolId: picked.idolId,
                      });
                      onClose();
                    }}
                  >
                    <strong>派 {picked.idolName} 去</strong>
                    <span>
                      {selectedDate
                        ? `${selectedDate.dayLabel} · ${detail.timeLabel}`
                        : '没有可排日期'}
                    </span>
                    {selectedDate ? <span>占用至 {selectedDate.dayLabel}</span> : null}
                    {picked.checkLabel ? <span>{picked.checkLabel}</span> : null}
                  </button>
                ) : null}
                {picked?.locked ? (
                  <p className="job-board-locked-note">
                    {picked.lockedReason ?? '属性还没到门槛'}
                  </p>
                ) : picked && !selectedDate ? (
                  <p className="job-board-locked-note">
                    {picked.lockedReason ??
                      picked.dates[0]?.reason ??
                      '未来七天没有可改期的空档'}
                  </p>
                ) : null}
              </>
            )}

            <p className="job-detail-note">
              到场可拿全额；不去的话到点按 20% 结算、不涨粉丝。
            </p>
          </div>
        ) : (
          <div className="job-board-list">
            {board.entries.length === 0 ? (
              <p className="shop-description">现在还没有工作邀约。</p>
            ) : null}
            {board.entries.map((entry) => {
              const status = statusOf(entry);
              return (
                <button
                  type="button"
                  key={entry.jobId}
                  className={`job-board-row ${status ? 'job-board-row-muted' : ''}`}
                  onClick={() => setDetailId(entry.jobId)}
                >
                  <span className="job-board-row-main">
                    <span className="job-board-row-title">
                      {entry.checkStat ? (
                        <span
                          className={`stat-badge stat-${entry.checkStat}`}
                          title={entry.checkText}
                        >
                          {STAT_ABBR[entry.checkStat]}
                        </span>
                      ) : null}
                      <strong>{entry.name}</strong>
                    </span>
                    <span className="job-board-row-sub">
                      {entry.checkText ?? '无门槛'}
                    </span>
                  </span>
                  <span className="job-board-row-side">
                    {status ? (
                      <span className="job-board-row-status">{status}</span>
                    ) : null}
                    <span className="shop-price">
                      ¥{entry.pay.toLocaleString('zh-CN')}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
