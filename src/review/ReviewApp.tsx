import { useEffect, useMemo, useState } from 'react';
import type {
  ReviewAnnotation,
  ReviewDraft,
  ReviewKind,
  ReviewStatus,
} from './types';
import { CONTENT_INDEX } from '../core/contentIndex';
import { PENDING_CHAPTERS } from '../core/content/chapters';
import { CHAPTER_SOURCES } from '../core/content/chapterSources';
import { walkDialogue } from '../core/dialogueWalk';
import type { DialogueNode } from '../core/types';
import { LocalReviewRepository, ReviewApiError } from './repository';
import { ReviewEditor } from './ReviewEditor';

const STATUS_LABELS: Record<ReviewStatus, string> = {
  review: '待审查',
  revision: '待修改',
  approved: '已通过',
  discarded: '已废弃',
};

const KIND_LABELS: Record<ReviewKind, string> = {
  activity: '行动',
  event: '事件',
  job: '工作',
  dialogue: '对话',
  story: '剧情链',
  item: '物品',
  shop: '商店',
  topic: '话题',
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

function ActivityPreview({ payload }: { payload: Record<string, unknown> }) {
  const cost =
    typeof payload.cost === 'object' && payload.cost !== null
      ? (payload.cost as Record<string, unknown>)
      : {};
  const texts = Array.isArray(payload.resultTexts)
    ? payload.resultTexts.filter((text): text is string => typeof text === 'string')
    : [];
  const locations = Array.isArray(payload.locations)
    ? payload.locations.map(String).join('、')
    : '所有地点';

  return (
    <div className="review-content">
      <p className="review-content-text">
        {typeof payload.description === 'string' && payload.description
          ? payload.description
          : '（缺少描述）'}
      </p>

      <div className="review-meta-grid">
        <div>
          <span>类型</span>
          <strong>{String(payload.kind ?? '—')}</strong>
        </div>
        <div>
          <span>时长</span>
          <strong>{String(payload.durationMinutes ?? '—')} 分钟</strong>
        </div>
        <div>
          <span>地点</span>
          <strong>{locations}</strong>
        </div>
        <div>
          <span>消耗</span>
          <strong>
            体力 {String(cost.stamina ?? 0)} · ¥{String(cost.money ?? 0)}
          </strong>
        </div>
      </div>

      {payload.check ? <JsonBlock label="check" value={payload.check} /> : null}
      {payload.effects ? <JsonBlock label="effects" value={payload.effects} /> : null}
      {payload.failureEffects ? (
        <JsonBlock label="failureEffects" value={payload.failureEffects} />
      ) : null}
      {payload.requires ? (
        <JsonBlock label="requires" value={payload.requires} />
      ) : null}

      <h3>结果文本</h3>
      {texts.length === 0 ? (
        <p className="review-empty">没有结果文本</p>
      ) : (
        texts.map((text, index) => (
          <p className="review-content-text" key={index}>
            {text}
          </p>
        ))
      )}
    </div>
  );
}


function TopicPreview({ payload }: { payload: Record<string, unknown> }) {
  const actorId = String(payload.actorId ?? '');
  const actor = CONTENT_INDEX.actors.get(actorId);
  return (
    <div className="review-preview">
      <dl className="review-facts">
        <div>
          <dt>角色</dt>
          <dd>{actor?.name ?? actorId}</dd>
        </div>
        <div>
          <dt>标签</dt>
          <dd>{String(payload.label ?? '')}</dd>
        </div>
        <div>
          <dt>冷却</dt>
          <dd>
            {payload.cooldownMinutes
              ? `${payload.cooldownMinutes} 分钟`
              : payload.once
                ? '只触发一次'
                : '无'}
          </dd>
        </div>
      </dl>
      <blockquote className="review-quote">
        {String(payload.text ?? '')}
      </blockquote>
    </div>
  );
}

function ItemPreview({ payload }: { payload: Record<string, unknown> }) {
  const gift = typeof payload.gift === 'object' && payload.gift !== null
    ? (payload.gift as Record<string, unknown>)
    : undefined;
  const preferences = Array.isArray(gift?.preferences)
    ? (gift!.preferences as Array<Record<string, unknown>>)
    : [];
  return (
    <div className="review-content">
      <p className="review-content-text">
        {typeof payload.description === 'string' && payload.description
          ? payload.description
          : '（缺少描述）'}
      </p>
      <div className="review-meta-grid">
        <div>
          <span>类别</span>
          <strong>{String(payload.category ?? '—')}</strong>
        </div>
        <div>
          <span>价格</span>
          <strong>¥{String(payload.price ?? '—')}</strong>
        </div>
        <div>
          <span>限购</span>
          <strong>{String(payload.maxPurchases ?? '不限')}</strong>
        </div>
      </div>
      {gift ? (
        <>
          <h3>赠送效果</h3>
          <p className="review-content-text">
            默认信任 tier {String(gift.defaultTrustTier ?? '—')}
          </p>
          {preferences.length > 0 ? (
            <ul className="review-content-text">
              {preferences.map((preference, index) => (
                <li key={index}>
                  {String(preference.idolId)} · tier {String(preference.trustTier)}
                  {typeof preference.reaction === 'string'
                    ? ` · ${preference.reaction}`
                    : ''}
                </li>
              ))}
            </ul>
          ) : null}
        </>
      ) : null}
      {payload.shopId ? <JsonBlock label="shopId" value={payload.shopId} /> : null}
    </div>
  );
}

function ShopPreview({ payload }: { payload: Record<string, unknown> }) {
  const itemIds = Array.isArray(payload.itemIds)
    ? (payload.itemIds as string[])
    : [];
  return (
    <div className="review-content">
      <p className="review-content-text">
        {typeof payload.description === 'string' && payload.description
          ? payload.description
          : '（缺少描述）'}
      </p>
      <div className="review-meta-grid">
        <div>
          <span>地点</span>
          <strong>{String(payload.locationId ?? '—')}</strong>
        </div>
        <div>
          <span>商品数</span>
          <strong>{itemIds.length}</strong>
        </div>
      </div>
      <h3>商品</h3>
      {itemIds.length === 0 ? (
        <p className="review-empty">还没有上架商品</p>
      ) : (
        <ul className="review-content-text">
          {itemIds.map((id) => (
            <li key={id}>{id}</li>
          ))}
        </ul>
      )}
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

/** 把锚点句包成 <mark>，审的时候一眼看到哪几句不能改。 */
function highlightAnchors(text: string, anchors: string[]) {
  if (anchors.length === 0) return text;
  const parts: (string | React.ReactElement)[] = [];
  let rest = text;
  let guard = 0;
  while (rest.length > 0 && guard < 20) {
    guard += 1;
    let hitIndex = -1;
    let hitAnchor = '';
    for (const anchor of anchors) {
      const index = rest.indexOf(anchor);
      if (index !== -1 && (hitIndex === -1 || index < hitIndex)) {
        hitIndex = index;
        hitAnchor = anchor;
      }
    }
    if (hitIndex === -1) {
      parts.push(rest);
      break;
    }
    if (hitIndex > 0) parts.push(rest.slice(0, hitIndex));
    parts.push(<mark key={`anchor-${guard}`}>{hitAnchor}</mark>);
    rest = rest.slice(hitIndex + hitAnchor.length);
  }
  return parts.length > 0 ? parts : text;
}

function DialoguePreview({
  payload,
  anchors = [],
}: {
  payload: Record<string, unknown>;
  anchors?: string[];
}) {
  const nodes =
    typeof payload.nodes === 'object' && payload.nodes !== null
      ? (payload.nodes as Record<string, DialogueNode>)
      : {};
  const startNodeId = String(payload.startNodeId ?? '');
  const walk = walkDialogue(nodes, startNodeId);

  return (
    <div className="review-content">
      <div className="review-meta-grid">
        <div>
          <span>偶像</span>
          <strong>{String(payload.idolId ?? '—')}</strong>
        </div>
        <div>
          <span>起始节点</span>
          <strong>{startNodeId || '—'}</strong>
        </div>
        <div>
          <span>节点数</span>
          <strong>{Object.keys(nodes).length}</strong>
        </div>
        <div>
          <span>阅读顺序</span>
          <strong>{walk.length} 步</strong>
        </div>
      </div>
      {anchors.length > 0 ? (
        <p className="review-anchor-note">
          本章锚点（必须逐字保留）：{anchors.join(' ／ ')}
        </p>
      ) : null}
      <h3>按阅读顺序</h3>
      {walk.length === 0 ? (
        <p className="review-empty">没有节点</p>
      ) : (
        walk.map((entry) => {
          const speaker = entry.node.speakerId
            ? (CONTENT_INDEX.idols.get(entry.node.speakerId)?.name ??
              CONTENT_INDEX.actors.get(entry.node.speakerId)?.name ??
              entry.node.speakerId)
            : '旁白';
          return (
            <article
              className="review-choice"
              key={entry.nodeId}
              style={{ marginLeft: entry.depth * 18 }}
            >
              <header>
                <span>{entry.nodeId}</span>
                <strong>{speaker}</strong>
                {entry.viaChoice ? (
                  <em className="review-via">← 选项：{entry.viaChoice}</em>
                ) : null}
              </header>
              <p>{highlightAnchors(entry.node.text, anchors)}</p>
              {entry.node.choices && entry.node.choices.length > 0 ? (
                <ul className="review-choice-list">
                  {entry.node.choices.map((choice) => (
                    <li key={choice.label}>
                      {choice.label} → {choice.nextNodeId}
                    </li>
                  ))}
                </ul>
              ) : null}
            </article>
          );
        })
      )}
      <JsonBlock label="payload" value={payload} />
    </div>
  );
}

function StoryPreview({ payload }: { payload: Record<string, unknown> }) {
  const steps = Array.isArray(payload.steps) ? payload.steps : [];
  return (
    <div className="review-content">
      <div className="review-meta-grid">
        <div>
          <span>偶像</span>
          <strong>{String(payload.idolId ?? '—')}</strong>
        </div>
        <div>
          <span>优先级</span>
          <strong>{String(payload.priority ?? 0)}</strong>
        </div>
        <div>
          <span>步骤数</span>
          <strong>{steps.length}</strong>
        </div>
      </div>
      <h3>步骤</h3>
      {steps.length === 0 ? (
        <p className="review-empty">没有步骤</p>
      ) : (
        steps.map((step, index) => {
          const record =
            typeof step === 'object' && step !== null
              ? (step as Record<string, unknown>)
              : {};
          return (
            <article className="review-choice" key={index}>
              <header>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <strong>{String(record.actionLabel ?? '未命名步骤')}</strong>
              </header>
              <p>
                {String(record.locationId ?? '—')} ·{' '}
                {String(record.dialogueId ?? '—')}
              </p>
            </article>
          );
        })
      )}
      <JsonBlock label="payload" value={payload} />
    </div>
  );
}

function Preview({
  draft,
  anchors = [],
}: {
  draft: ReviewDraft;
  anchors?: string[];
}) {
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
            <span className="review-kind">v{draft.version ?? 1}</span>
          </div>
          <h2>{draft.title}</h2>
          <p className="review-id">{draft.id}</p>
        </div>
        <div className="review-readonly">第一阶段 · 只读预览</div>
      </header>

      {draft.kind === 'activity' ? (
        <ActivityPreview payload={payload} />
      ) : draft.kind === 'item' ? (
        <ItemPreview payload={payload} />
      ) : draft.kind === 'shop' ? (
        <ShopPreview payload={payload} />
      ) : draft.kind === 'topic' ? (
        <TopicPreview payload={payload} />
      ) : draft.kind === 'event' ? (
        <EventPreview payload={payload} />
      ) : draft.kind === 'job' ? (
        <JobPreview payload={payload} />
      ) : draft.kind === 'dialogue' ? (
        <DialoguePreview payload={payload} anchors={anchors} />
      ) : (
        <StoryPreview payload={payload} />
      )}

      <footer className="review-preview-foot">
        <span>创建：{formatDate(draft.createdAt)}</span>
        <span>更新：{formatDate(draft.updatedAt)}</span>
      </footer>
    </article>
  );
}

function Annotations({
  annotations,
  locked,
  busy,
  text,
  field,
  onTextChange,
  onFieldChange,
  onAdd,
  onResolve,
}: {
  annotations: ReviewAnnotation[];
  locked: boolean;
  busy: boolean;
  text: string;
  field: string;
  onTextChange: (value: string) => void;
  onFieldChange: (value: string) => void;
  onAdd: () => void;
  onResolve: (annotation: ReviewAnnotation, resolved: boolean) => void;
}) {
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
              {!locked ? (
                <button
                  type="button"
                  className="review-link"
                  disabled={busy}
                  onClick={() => onResolve(annotation, !annotation.resolved)}
                >
                  {annotation.resolved ? '重新打开' : '标记已处理'}
                </button>
              ) : null}
            </article>
          ))}
        </div>
      )}

      {!locked ? (
        <div className="review-note-add">
          <label className="review-field">
            <span>字段路径（可选）</span>
            <input
              value={field}
              onChange={(event) => onFieldChange(event.target.value)}
              placeholder="payload.text"
            />
          </label>
          <label className="review-field">
            <span>批注</span>
            <textarea
              className="review-textarea"
              value={text}
              onChange={(event) => onTextChange(event.target.value)}
              placeholder="写下需要修改的地方"
            />
          </label>
          <button
            type="button"
            className="review-button"
            disabled={busy || !text.trim()}
            onClick={onAdd}
          >
            添加批注
          </button>
        </div>
      ) : null}
    </aside>
  );
}

export function ReviewApp() {
  const [drafts, setDrafts] = useState<ReviewDraft[]>([]);
  const [status, setStatus] = useState<ReviewStatus | 'all'>('review');
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [editing, setEditing] = useState(false);
  const [newOpen, setNewOpen] = useState(false);
  const [newKind, setNewKind] = useState<ReviewKind>('event');
  const [newTitle, setNewTitle] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [annotationText, setAnnotationText] = useState('');
  const [annotationField, setAnnotationField] = useState('');
  const [actionError, setActionError] = useState<string | undefined>();
  const [flash, setFlash] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!flash) return;
    const timer = window.setTimeout(() => setFlash(undefined), 2600);
    return () => window.clearTimeout(timer);
  }, [flash]);

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

  const upsertDraft = (next: ReviewDraft) => {
    setDrafts((current) => {
      const index = current.findIndex((draft) => draft.id === next.id);
      if (index === -1) return [next, ...current];
      const copy = [...current];
      copy[index] = next;
      return copy;
    });
    setSelectedId(next.id);
  };

  const errorsOf = (reason: unknown): string[] => {
    if (reason instanceof ReviewApiError) {
      return reason.errors.length > 0 ? reason.errors : [reason.message];
    }
    return [reason instanceof Error ? reason.message : '操作失败'];
  };

  const saveDraft = async (
    title: string,
    payload: unknown,
  ): Promise<string[]> => {
    if (!selected) return ['没有选中的草稿'];
    setActionError(undefined);
    try {
      const next = await repository.save(selected.id, { title, payload });
      upsertDraft(next);
      setEditing(false);
      return [];
    } catch (reason) {
      const errors = errorsOf(reason);
      setActionError(errors.join('；'));
      return errors;
    }
  };

  // 对话草稿 → 所属章节与步号。审查台靠它把一章的几段按顺序排在一起。
  const chapterIndex = useMemo(() => {
    const map = new Map<
      string,
      {
        chapterId: string;
        title: string;
        step: number;
        total: number;
        anchors: string[];
        card?: { title: string; index: number; total: number };
      }
    >();
    const chains = [...CONTENT_INDEX.storyChains.values(), ...PENDING_CHAPTERS];
    for (const chain of chains) {
      const source = CHAPTER_SOURCES.find((entry) => entry.chapterId === chain.id);
      chain.steps.forEach((step, index) => {
        map.set(step.dialogueId, {
          chapterId: chain.id,
          title: chain.title ?? chain.id,
          step: index + 1,
          total: chain.steps.length,
          anchors: source?.anchors ?? [],
          card: source?.card,
        });
      });
    }
    return map;
  }, []);

  const chapterOf = (draft: ReviewDraft) => {
    const payload = draft.payload as { id?: string };
    return payload.id ? chapterIndex.get(payload.id) : undefined;
  };

  /** 整章通过 / 整章打回：剧情是连着的，只过一半链会断。 */
  const changeStatusBatch = async (
    ids: string[],
    nextStatus: ReviewStatus,
  ) => {
    if (ids.length === 0) return;
    const label = ids.length > 1 ? `这一组 ${ids.length} 条` : '这一条';
    if (
      nextStatus === 'discarded' &&
      !window.confirm(`确认废弃${label}内容？`)
    ) {
      return;
    }
    setBusy(true);
    setActionError(undefined);
    try {
      await repository.setStatusBatch(
        ids,
        nextStatus,
        statusNote.trim() || undefined,
      );
      const all = await repository.list();
      setDrafts(all);
      setStatusNote('');
      setEditing(false);
      setFlash(`${label}${STATUS_LABELS[nextStatus]}`);
    } catch (caught) {
      setActionError(caught instanceof Error ? caught.message : '操作失败');
    } finally {
      setBusy(false);
    }
  };

  const changeStatus = async (nextStatus: ReviewStatus) => {
    if (!selected) return;
    if (nextStatus === 'discarded' && !window.confirm('确认废弃这条内容？')) {
      return;
    }
    setBusy(true);
    setActionError(undefined);

    // 当前队列的顺序（用户眼下看到的），用来在流转后挑"下一条"。
    const order = filtered.map((draft) => draft.id);
    const movedId = selected.id;
    const movedTitle = selected.title;
    const staysInTab = status === 'all' || nextStatus === status;

    try {
      const next = await repository.setStatus(
        movedId,
        nextStatus,
        statusNote.trim() || undefined,
      );
      const all = await repository.list();
      setDrafts(all);
      setStatusNote('');
      setEditing(false);
      setFlash(`《${movedTitle}》${STATUS_LABELS[nextStatus]}`);

      if (staysInTab) {
        upsertDraft(next);
        return;
      }

      // 停在当前队列，选下一条；队列空了才清空选中。
      const index = order.indexOf(movedId);
      const candidates = [
        ...order.slice(index + 1),
        ...order.slice(0, Math.max(index, 0)),
      ];
      const nextId = candidates.find((id) => {
        const draft = all.find((item) => item.id === id);
        return draft?.status === status;
      });
      setSelectedId(nextId);
    } catch (reason) {
      setActionError(errorsOf(reason).join('；'));
    } finally {
      setBusy(false);
    }
  };

  const reviseDraft = async () => {
    if (!selected) return;
    setBusy(true);
    setActionError(undefined);
    try {
      const next = await repository.revise(selected.id);
      const all = await repository.list();
      setDrafts(all);
      upsertDraft(next);
      setStatus('review');
      setEditing(true);
    } catch (reason) {
      setActionError(errorsOf(reason).join('；'));
    } finally {
      setBusy(false);
    }
  };

  const createDraft = async () => {
    setBusy(true);
    setActionError(undefined);
    try {
      const next = await repository.create(newKind, newTitle);
      upsertDraft(next);
      setNewOpen(false);
      setNewTitle('');
      setStatus('review');
      setEditing(true);
    } catch (reason) {
      setActionError(errorsOf(reason).join('；'));
    } finally {
      setBusy(false);
    }
  };

  const addAnnotation = async () => {
    if (!selected || !annotationText.trim()) return;
    setBusy(true);
    setActionError(undefined);
    try {
      const next = await repository.addAnnotation(
        selected.id,
        annotationText,
        annotationField.trim() || undefined,
      );
      upsertDraft(next);
      setAnnotationText('');
      setAnnotationField('');
    } catch (reason) {
      setActionError(errorsOf(reason).join('；'));
    } finally {
      setBusy(false);
    }
  };

  const resolveAnnotation = async (
    annotation: ReviewAnnotation,
    resolved: boolean,
  ) => {
    if (!selected) return;
    setBusy(true);
    setActionError(undefined);
    try {
      const next = await repository.resolveAnnotation(
        selected.id,
        annotation.id,
        resolved,
      );
      upsertDraft(next);
    } catch (reason) {
      setActionError(errorsOf(reason).join('；'));
    } finally {
      setBusy(false);
    }
  };

  const locked =
    selected?.status === 'approved' || selected?.status === 'discarded';

  return (
    <div className="review-shell">
      <header className="review-topbar">
        <div>
          <p className="review-eyebrow">SHINYMEMORY · CONTENT REVIEW</p>
          <h1>内容审查台</h1>
          <p className="review-subtitle">
            本地文件审查 · 编辑、批注、通过、打回、废弃
          </p>
        </div>
        <div className="review-topbar-actions">
          <button
            type="button"
            className="review-button primary"
            onClick={() => setNewOpen(true)}
          >
            新建草稿
          </button>
        </div>
      </header>

      {newOpen ? (
        <div className="review-modal-backdrop">
          <section className="review-modal" role="dialog" aria-modal="true">
            <h2>新建草稿</h2>
            <label className="review-field">
              <span>类型</span>
              <select
                value={newKind}
                onChange={(event) => setNewKind(event.target.value as ReviewKind)}
              >
                <option value="activity">行动</option>
                <option value="event">事件</option>
                <option value="item">物品</option>
                <option value="shop">商店</option>
                <option value="job">工作</option>
                <option value="dialogue">对话</option>
                <option value="story">剧情链</option>
              </select>
            </label>
            <label className="review-field">
              <span>标题</span>
              <input
                autoFocus
                value={newTitle}
                onChange={(event) => setNewTitle(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') void createDraft();
                }}
              />
            </label>
            <div className="review-modal-actions">
              <button
                type="button"
                className="review-button ghost"
                onClick={() => setNewOpen(false)}
              >
                取消
              </button>
              <button
                type="button"
                className="review-button primary"
                disabled={busy}
                onClick={() => void createDraft()}
              >
                创建
              </button>
            </div>
          </section>
        </div>
      ) : null}

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
            {(() => {
              // 一章的对话按步号排在一起；其余草稿照旧平铺。
              const groups = new Map<string, ReviewDraft[]>();
              const singles: ReviewDraft[] = [];
              for (const draft of filtered) {
                const info = chapterOf(draft);
                if (!info) {
                  singles.push(draft);
                  continue;
                }
                const list = groups.get(info.chapterId) ?? [];
                list.push(draft);
                groups.set(info.chapterId, list);
              }
              const orderedGroups = [...groups.entries()]
                .map(([id, list]) => ({
                id,
                title: chapterOf(list[0]!)?.title ?? id,
                total: chapterOf(list[0]!)?.total ?? list.length,
                card: chapterOf(list[0]!)?.card,
                  drafts: [...list].sort(
                    (a, b) =>
                      (chapterOf(a)?.step ?? 0) - (chapterOf(b)?.step ?? 0),
                  ),
                }))
                // 按"卡内第几节"排，让 1→5 顺着看
                .sort(
                  (a, b) =>
                    (a.card?.index ?? 999) - (b.card?.index ?? 999) ||
                    a.title.localeCompare(b.title, 'zh-CN'),
                );

              const renderItem = (draft: ReviewDraft, stepLabel?: string) => (
                <button
                  type="button"
                  key={draft.id}
                  className={`review-queue-item ${draft.id === selectedId ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedId(draft.id);
                    setEditing(false);
                  }}
                >
                  <span className={`review-status status-${draft.status}`}>
                    {STATUS_LABELS[draft.status]}
                  </span>
                  <strong>
                    {stepLabel ? `${stepLabel} ` : ''}
                    {draft.title}
                  </strong>
                  <small>
                    {KIND_LABELS[draft.kind]} · {formatDate(draft.updatedAt)}
                  </small>
                </button>
              );

              return (
                <>
                  {orderedGroups.map((group) => {
                    const ids = group.drafts.map((draft) => draft.id);
                    const pending = group.drafts.filter(
                      (draft) =>
                        draft.status !== 'approved' &&
                        draft.status !== 'discarded',
                    );
                    return (
                      <section className="review-chapter" key={group.id}>
                        <header className="review-chapter-head">
                          <div>
                            <strong>{group.title}</strong>
                            <small>
                              {group.card
                                ? `${group.card.title} · 第 ${group.card.index}/${group.card.total} 节 · `
                                : ''}
                              {group.drafts.length}/{group.total} 段待审
                            </small>
                          </div>
                          {pending.length > 0 ? (
                            <div className="review-chapter-actions">
                              <button
                                type="button"
                                className="review-approve"
                                disabled={busy}
                                onClick={() =>
                                  void changeStatusBatch(ids, 'approved')
                                }
                              >
                                整章通过
                              </button>
                              <button
                                type="button"
                                className="review-reject"
                                disabled={busy}
                                onClick={() =>
                                  void changeStatusBatch(ids, 'revision')
                                }
                              >
                                整章打回
                              </button>
                            </div>
                          ) : null}
                        </header>
                        {group.drafts.map((draft) =>
                          renderItem(
                            draft,
                            (chapterOf(draft)?.total ?? 0) > 1
                              ? `第${chapterOf(draft)?.step ?? 0}步`
                              : undefined,
                          ),
                        )}
                      </section>
                    );
                  })}
                  {singles.map((draft) => renderItem(draft))}
                </>
              );
            })()}
          </div>
        </aside>

        <section className="review-main">
          {flash ? <p className="review-flash">{flash}</p> : null}
          {actionError ? <p className="review-error review-action-error">{actionError}</p> : null}
          {selected ? (
            <>
              <div className="review-toolbar">
                <div className="review-toolbar-left">
                  <span className={`review-status status-${selected.status}`}>
                    {STATUS_LABELS[selected.status]}
                  </span>
                  {locked ? (
                    <span className="review-locked-note">
                      已锁定，不可编辑或流转
                    </span>
                  ) : null}
                </div>
                {!locked ? (
                  editing ? (
                    <span className="review-locked-note">
                      编辑中，保存后返回预览再流转
                    </span>
                  ) : (
                    <div className="review-toolbar-actions">
                    {selected.status === 'review' || selected.status === 'revision' ? (
                      <button
                        type="button"
                        className="review-button"
                        disabled={busy}
                        onClick={() => setEditing(true)}
                      >
                        编辑
                      </button>
                    ) : null}
                    {selected.status === 'revision' ? (
                      <button
                        type="button"
                        className="review-button"
                        disabled={busy}
                        onClick={() => void changeStatus('review')}
                      >
                        重新送审
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className="review-button approve"
                      disabled={busy}
                      onClick={() => void changeStatus('approved')}
                    >
                      通过
                    </button>
                    <button
                      type="button"
                      className="review-button reject"
                      disabled={busy}
                      onClick={() => void changeStatus('revision')}
                    >
                      打回
                    </button>
                    <button
                      type="button"
                      className="review-button ghost"
                      disabled={busy}
                      onClick={() => void changeStatus('discarded')}
                    >
                      废弃
                    </button>
                  </div>
                  )
                ) : selected.status === 'approved' ? (
                  <div className="review-toolbar-actions">
                    <button
                      type="button"
                      className="review-button"
                      disabled={busy}
                      onClick={() => void reviseDraft()}
                    >
                      修订为新版本
                    </button>
                  </div>
                ) : null}
              </div>
              {!locked && !editing ? (
                <label className="review-status-note">
                  <span>打回批注（可选）</span>
                  <input
                    value={statusNote}
                    onChange={(event) => setStatusNote(event.target.value)}
                    placeholder="例如：正文需要更具体"
                  />
                </label>
              ) : null}

              {editing && !locked ? (
                <ReviewEditor
                  key={selected.id}
                  draft={selected}
                  onSave={saveDraft}
                  onCancel={() => setEditing(false)}
                />
              ) : (
                <Preview
                  draft={selected}
                  anchors={chapterOf(selected)?.anchors ?? []}
                />
              )}
            </>
          ) : (
            <div className="review-placeholder">
              <h2>选择一条内容</h2>
              <p>从左侧队列选择草稿后查看预览。</p>
            </div>
          )}
        </section>

        {selected ? (
          <Annotations
            annotations={selected.annotations}
            locked={Boolean(locked)}
            busy={busy}
            text={annotationText}
            field={annotationField}
            onTextChange={setAnnotationText}
            onFieldChange={setAnnotationField}
            onAdd={addAnnotation}
            onResolve={resolveAnnotation}
          />
        ) : null}
      </main>
    </div>
  );
}
