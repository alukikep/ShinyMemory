import { useEffect, useMemo, useState } from 'react';
import type {
  ReviewAnnotation,
  ReviewDraft,
  ReviewKind,
  ReviewStatus,
} from './types';
import { LocalReviewRepository } from './repository';

const STATUS_LABELS: Record<ReviewStatus, string> = {
  review: '待审查',
  revision: '待修改',
  approved: '已通过',
  discarded: '已废弃',
};

const KIND_LABELS: Record<ReviewKind, string> = {
  event: '事件',
  job: '工作',
};

const STATUS_TABS: Array<{ value: ReviewStatus | 'all'; label: string }> = [
  { value: 'all', label: '全部' },
  { value: 'review', label: '待审查' },
  { value: 'revision', label: '待修改' },
  { value: 'approved', label: '已通过' },
  { value: 'discarded', label: '已废弃' },
];

const repository = new LocalReviewRepository();

function formatDate(value: string): string {
  return new Date(value).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatMinute(minute: unknown): string {
  if (typeof minute !== 'number' || !Number.isFinite(minute)) return '—';
  const hours = Math.floor(minute / 60);
  const minutes = minute % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function JsonBlock({ label, value }: { label: string; value: unknown }) {
  return (
    <div className="review-json-block">
      <span>{label}</span>
      <pre>{JSON.stringify(value, null, 2)}</pre>
    </div>
  );
}

function EventPreview({ payload }: { payload: Record<string, unknown> }) {
  const choices = Array.isArray(payload.choices) ? payload.choices : [];

  return (
    <div className="review-content">
      <p className="review-content-text">
        {typeof payload.text === 'string' ? payload.text : '（缺少正文）'}
      </p>

      <div className="review-meta-grid">
        <div>
          <span>触发概率</span>
          <strong>{typeof payload.chance === 'number' ? payload.chance : '—'}</strong>
        </div>
        <div>
          <span>优先级</span>
          <strong>{typeof payload.priority === 'number' ? payload.priority : '—'}</strong>
        </div>
        <div>
          <span>只触发一次</span>
          <strong>{payload.once ? '是' : '否'}</strong>
        </div>
      </div>

      <h3>选项</h3>
      {choices.length === 0 ? (
        <p className="review-empty">没有选项</p>
      ) : (
        <div className="review-choices">
          {choices.map((choice, index) => {
            const item =
              typeof choice === 'object' && choice !== null
                ? (choice as Record<string, unknown>)
                : {};
            return (
              <article className="review-choice" key={index}>
                <header>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <strong>
                    {typeof item.label === 'string' ? item.label : '未命名选项'}
                  </strong>
                </header>
                {typeof item.hint === 'string' ? (
                  <p className="review-choice-hint">{item.hint}</p>
                ) : null}
                <p>
                  {typeof item.result === 'string'
                    ? item.result
                    : '（缺少结果文本）'}
                </p>
                {item.requires ? (
                  <JsonBlock label="requires" value={item.requires} />
                ) : null}
                {item.effects ? (
                  <JsonBlock label="effects" value={item.effects} />
                ) : null}
              </article>
            );
          })}
        </div>
      )}

      {payload.when ? <JsonBlock label="when" value={payload.when} /> : null}
      {payload.after ? <JsonBlock label="after" value={payload.after} /> : null}
    </div>
  );
}

function JobPreview({ payload }: { payload: Record<string, unknown> }) {
  return (
    <div className="review-content">
      <p className="review-content-text">
        {typeof payload.description === 'string'
          ? payload.description
          : '（缺少描述）'}
      </p>

      <div className="review-meta-grid">
        <div>
          <span>地点</span>
          <strong>{String(payload.locationId ?? '—')}</strong>
        </div>
        <div>
          <span>时间</span>
          <strong>
            {formatMinute(payload.fromMinute)}–{formatMinute(payload.toMinute)}
          </strong>
        </div>
        <div>
          <span>报酬</span>
          <strong>¥{String(payload.pay ?? '—')}</strong>
        </div>
      </div>

      {payload.effects ? <JsonBlock label="effects" value={payload.effects} /> : null}
      {payload.eventId ? (
        <JsonBlock label="eventId" value={payload.eventId} />
      ) : null}
    </div>
  );
}

function Preview({ draft }: { draft: ReviewDraft }) {
  const payload =
    typeof draft.payload === 'object' && draft.payload !== null
      ? (draft.payload as Record<string, unknown>)
      : {};

  return (
    <article className="review-preview-card">
      <header className="review-preview-head">
        <div>
          <div className="review-badges">
            <span className={`review-status status-${draft.status}`}>
              {STATUS_LABELS[draft.status]}
            </span>
            <span className="review-kind">{KIND_LABELS[draft.kind]}</span>
          </div>
          <h2>{draft.title}</h2>
          <p className="review-id">{draft.id}</p>
        </div>
        <div className="review-readonly">第一阶段 · 只读预览</div>
      </header>

      {draft.kind === 'event' ? (
        <EventPreview payload={payload} />
      ) : (
        <JobPreview payload={payload} />
      )}

      <footer className="review-preview-foot">
        <span>创建：{formatDate(draft.createdAt)}</span>
        <span>更新：{formatDate(draft.updatedAt)}</span>
      </footer>
    </article>
  );
}

function Annotations({ annotations }: { annotations: ReviewAnnotation[] }) {
  return (
    <aside className="review-notes">
      <header>
        <h2>批注</h2>
        <span>{annotations.length}</span>
      </header>
      {annotations.length === 0 ? (
        <p className="review-empty">还没有批注。</p>
      ) : (
        <div className="review-note-list">
          {annotations.map((annotation) => (
            <article
              className={`review-note ${annotation.resolved ? 'resolved' : ''}`}
              key={annotation.id}
            >
              <header>
                <span>{annotation.field ?? '整体'}</span>
                {annotation.resolved ? <small>已处理</small> : null}
              </header>
              <p>{annotation.text}</p>
              <time>{formatDate(annotation.createdAt)}</time>
            </article>
          ))}
        </div>
      )}
    </aside>
  );
}

export function ReviewApp() {
  const [drafts, setDrafts] = useState<ReviewDraft[]>([]);
  const [status, setStatus] = useState<ReviewStatus | 'all'>('review');
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    let cancelled = false;
    repository
      .list()
      .then((items) => {
        if (cancelled) return;
        setDrafts(items);
        setSelectedId((current) => {
          if (current && items.some((item) => item.id === current)) {
            return current;
          }
          const firstReview = items.find((item) => item.status === 'review');
          return firstReview?.id ?? items[0]?.id;
        });
      })
      .catch((reason: unknown) => {
        if (cancelled) return;
        setError(
          reason instanceof Error ? reason.message : '无法读取审查列表',
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const counts = useMemo(() => {
    return {
      all: drafts.length,
      review: drafts.filter((draft) => draft.status === 'review').length,
      revision: drafts.filter((draft) => draft.status === 'revision').length,
      approved: drafts.filter((draft) => draft.status === 'approved').length,
      discarded: drafts.filter((draft) => draft.status === 'discarded').length,
    };
  }, [drafts]);

  const filtered = useMemo(
    () =>
      status === 'all'
        ? drafts
        : drafts.filter((draft) => draft.status === status),
    [drafts, status],
  );
  const selected = drafts.find((draft) => draft.id === selectedId);

  return (
    <div className="review-shell">
      <header className="review-topbar">
        <div>
          <p className="review-eyebrow">SHINYMEMORY · CONTENT REVIEW</p>
          <h1>内容审查台</h1>
          <p className="review-subtitle">
            本地文件审查 · 只读预览 · 第二阶段接入编辑与批注
          </p>
        </div>
        <div className="review-topbar-actions">
          <button type="button" className="review-button ghost" disabled>
            新建草稿（第二阶段）
          </button>
        </div>
      </header>

      <main className="review-layout">
        <aside className="review-queue">
          <div className="review-tabs" role="tablist" aria-label="审查状态">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                role="tab"
                aria-selected={status === tab.value}
                className={`review-tab ${status === tab.value ? 'active' : ''}`}
                onClick={() => {
                  setStatus(tab.value);
                  const nextPool =
                    tab.value === 'all'
                      ? drafts
                      : drafts.filter((draft) => draft.status === tab.value);
                  setSelectedId(nextPool[0]?.id);
                }}
              >
                <span>{tab.label}</span>
                <strong>{counts[tab.value]}</strong>
              </button>
            ))}
          </div>

          <div className="review-queue-list">
            {loading ? <p className="review-empty">读取中…</p> : null}
            {error ? <p className="review-error">{error}</p> : null}
            {!loading && !error && filtered.length === 0 ? (
              <p className="review-empty">这个队列是空的。</p>
            ) : null}
            {filtered.map((draft) => (
              <button
                type="button"
                key={draft.id}
                className={`review-queue-item ${draft.id === selectedId ? 'active' : ''}`}
                onClick={() => setSelectedId(draft.id)}
              >
                <span className={`review-status status-${draft.status}`}>
                  {STATUS_LABELS[draft.status]}
                </span>
                <strong>{draft.title}</strong>
                <small>
                  {KIND_LABELS[draft.kind]} · {formatDate(draft.updatedAt)}
                </small>
              </button>
            ))}
          </div>
        </aside>

        <section className="review-main">
          {selected ? (
            <Preview draft={selected} />
          ) : (
            <div className="review-placeholder">
              <h2>选择一条内容</h2>
              <p>从左侧队列选择草稿后查看预览。</p>
            </div>
          )}
        </section>

        {selected ? <Annotations annotations={selected.annotations} /> : null}
      </main>
    </div>
  );
}
