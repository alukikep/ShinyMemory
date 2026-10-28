import { useEffect } from 'react';
import type { HandbookEntryView, HandbookView } from '../../core/handbook';
import { useDialogFocus } from '../hooks/useDialogFocus';
import { GameIcon } from './GameIcon';

type HandbookPanelProps = {
  view: HandbookView;
  onClose: () => void;
};

function statusLine(entry: HandbookEntryView): string | undefined {
  switch (entry.status) {
    case 'waiting':
      return entry.daysLeft && entry.daysLeft > 0
        ? `还有 ${entry.daysLeft} 天`
        : '这两天就去看看';
    case 'off-hours':
      return `明天 ${entry.timeWindowText.split('–')[0]} 之后`;
    case 'available':
      return '现在可以去';
    case 'blocked':
      return entry.reason ?? '现在还不行';
    default:
      return undefined;
  }
}

function StepLine({ entry }: { entry: HandbookEntryView }) {
  return (
    <p className="handbook-steps">
      {entry.steps.map((step) => (
        <span
          key={step.label}
          className={`handbook-step${step.done ? ' done' : ''}${step.current ? ' current' : ''}`}
        >
          {step.done ? '✓' : step.current ? '→' : '·'} {step.label}
        </span>
      ))}
    </p>
  );
}

const STATUS_LABEL: Record<HandbookEntryView['status'], string> = {
  waiting: '等候',
  'off-hours': '时段',
  available: '可前往',
  blocked: '受阻',
  done: '完成',
};

function EntryCard({ entry }: { entry: HandbookEntryView }) {
  const line = statusLine(entry);
  return (
    <article className="handbook-entry">
      <div className="handbook-entry-head">
        <p className="handbook-title">{entry.title}</p>
        <span className={`handbook-badge ${entry.status}`}>
          {STATUS_LABEL[entry.status]}
        </span>
      </div>
      <StepLine entry={entry} />
      <p className="handbook-meta">
        <GameIcon name="compass" size={12} />
        {entry.locationName} · {entry.timeWindowText}
        {line ? <span className="handbook-status-line"> · {line}</span> : null}
      </p>
    </article>
  );
}

export function HandbookPanel({ view, onClose }: HandbookPanelProps) {
  const dialogRef = useDialogFocus<HTMLElement>();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const archiveByIdol = new Map<string, HandbookEntryView[]>();
  for (const entry of view.archive) {
    const list = archiveByIdol.get(entry.idolName) ?? [];
    list.push(entry);
    archiveByIdol.set(entry.idolName, list);
  }

  return (
    <div
      className="roster-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="roster-panel handbook-panel"
        role="dialog"
        aria-modal="true"
        aria-label="手册"
        ref={dialogRef}
        tabIndex={-1}
      >
        <header className="roster-head">
          <div>
            <p className="eyebrow">HANDBOOK</p>
            <h2>制作人手册</h2>
          </div>
          <button
            type="button"
            className="roster-close"
            onClick={onClose}
            aria-label="关闭手册"
          >
            关闭
          </button>
        </header>

        {view.active.length === 0 && view.archive.length === 0 ? (
          <p className="handbook-empty">还没有值得记下的事。</p>
        ) : null}

        {view.active.length > 0 ? (
          <section className="handbook-section" aria-label="进行中">
            <h3 className="handbook-section-title">进行中</h3>
            {view.active.map((entry) => (
              <EntryCard entry={entry} key={entry.id} />
            ))}
          </section>
        ) : null}

        {view.archive.length > 0 ? (
          <section className="handbook-section" aria-label="归档">
            <h3 className="handbook-section-title">归档</h3>
            {[...archiveByIdol.entries()].map(([idolName, entries]) => (
              <details className="handbook-archive-group" key={idolName}>
                <summary>
                  {idolName}
                  <small>{entries.length}</small>
                </summary>
                {entries.map((entry) => (
                  <EntryCard entry={entry} key={entry.id} />
                ))}
              </details>
            ))}
          </section>
        ) : null}
      </section>
    </div>
  );
}
