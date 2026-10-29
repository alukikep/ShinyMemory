import { useEffect, useState } from 'react';
import { LOCATIONS } from '../core/content/locations';
import { IDOLS } from '../core/content/idols';
import type { ReviewDraft } from './types';

type ReviewEditorProps = {
  draft: ReviewDraft;
  disabled?: boolean;
  onSave: (title: string, payload: unknown) => Promise<string[]>;
  onCancel: () => void;
};

function minuteToTime(value: unknown): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '10:00';
  const hours = Math.floor(value / 60);
  const minutes = Math.round(value % 60);
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function timeToMinute(value: string): number {
  const [hours, minutes] = value.split(':').map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return 0;
  return hours * 60 + minutes;
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

const KIND_TITLE: Record<ReviewDraft['kind'], string> = {
  activity: '行动',
  event: '事件',
  job: '工作',
  dialogue: '对话',
  story: '剧情链',
  item: '物品',
  shop: '商店',
};

const ACTIVITY_KIND_OPTIONS = [
  { value: 'training', label: '训练' },
  { value: 'work', label: '工作' },
  { value: 'rest', label: '休息' },
  { value: 'bond', label: '互动' },
  { value: 'explore', label: '探索' },
  { value: 'sleep', label: '睡觉' },
] as const;

export function ReviewEditor({
  draft,
  disabled = false,
  onSave,
  onCancel,
}: ReviewEditorProps) {
  const [title, setTitle] = useState(draft.title);
  const [payload, setPayload] = useState<Record<string, unknown>>(
    asRecord(draft.payload),
  );
  const [jsonMode, setJsonMode] = useState(
    draft.kind === 'dialogue' ||
      draft.kind === 'story' ||
      draft.kind === 'item' ||
      draft.kind === 'shop',
  );
  const [jsonText, setJsonText] = useState(
    JSON.stringify(draft.payload, null, 2),
  );
  const [errors, setErrors] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setTitle(draft.title);
    setPayload(asRecord(draft.payload));
    setJsonText(JSON.stringify(draft.payload, null, 2));
    setJsonMode(
      draft.kind === 'dialogue' ||
        draft.kind === 'story' ||
        draft.kind === 'item' ||
        draft.kind === 'shop',
    );
    setErrors([]);
  }, [draft.id, draft.title, draft.payload, draft.kind]);

  const update = (key: string, value: unknown) => {
    setPayload((current) => ({ ...current, [key]: value }));
  };

  const updateChoice = (index: number, key: string, value: unknown) => {
    setPayload((current) => {
      const choices = Array.isArray(current.choices) ? [...current.choices] : [];
      const choice = asRecord(choices[index]);
      choices[index] = { ...choice, [key]: value };
      return { ...current, choices };
    });
  };

  const addChoice = () => {
    setPayload((current) => ({
      ...current,
      choices: [
        ...(Array.isArray(current.choices) ? current.choices : []),
        { label: '新选项', effects: [], result: '' },
      ],
    }));
  };

  const removeChoice = (index: number) => {
    setPayload((current) => ({
      ...current,
      choices: (Array.isArray(current.choices) ? current.choices : []).filter(
        (_, choiceIndex) => choiceIndex !== index,
      ),
    }));
  };

  const submit = async () => {
    setErrors([]);
    let nextPayload = payload;
    if (jsonMode) {
      try {
        nextPayload = JSON.parse(jsonText) as Record<string, unknown>;
        setPayload(nextPayload);
      } catch {
        setErrors(['高级 JSON 不是合法 JSON']);
        return;
      }
    }

    setBusy(true);
    try {
      const nextTitle =
        draft.kind === 'event'
          ? String(nextPayload.title ?? title)
          : draft.kind === 'activity' || draft.kind === 'job'
            ? String(nextPayload.name ?? title)
            : title;
      const nextErrors = await onSave(nextTitle, nextPayload);
      setErrors(nextErrors);
    } finally {
      setBusy(false);
    }
  };

  if (disabled) {
    return (
      <div className="review-editor review-editor-locked">
        <p>已通过或已废弃的内容不可编辑。</p>
        <button type="button" className="review-button" onClick={onCancel}>
          返回预览
        </button>
      </div>
    );
  }

  const choices = Array.isArray(payload.choices) ? payload.choices : [];

  return (
    <div className="review-editor">
      <header className="review-editor-head">
        <div>
          <p className="review-eyebrow">EDITING</p>
          <h2>编辑 {KIND_TITLE[draft.kind]}</h2>
        </div>
        <div className="review-editor-actions">
          {draft.kind === 'event' ||
          draft.kind === 'job' ||
          draft.kind === 'activity' ? (
            <button
              type="button"
              className="review-button"
              onClick={() => {
                setJsonMode((current) => !current);
                if (!jsonMode) setJsonText(JSON.stringify(payload, null, 2));
              }}
            >
              {jsonMode ? '表单编辑' : '高级 JSON'}
            </button>
          ) : null}
          <button type="button" className="review-button ghost" onClick={onCancel}>
            预览
          </button>
          <button
            type="button"
            className="review-button primary"
            disabled={busy}
            onClick={() => void submit()}
          >
            {busy ? '保存中…' : '保存草稿'}
          </button>
        </div>
      </header>

      {errors.length > 0 ? (
        <ul className="review-form-errors">
          {errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      ) : null}

      {jsonMode ? (
        <>
          {draft.kind === 'dialogue' ||
          draft.kind === 'story' ||
          draft.kind === 'item' ||
          draft.kind === 'shop' ? (
            <label className="review-field">
              <span>标题</span>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </label>
          ) : null}
          <label className="review-field">
            <span>payload JSON</span>
            <textarea
              className="review-textarea review-json-editor"
              value={jsonText}
              onChange={(event) => setJsonText(event.target.value)}
              spellCheck={false}
            />
          </label>
        </>
      ) : draft.kind === 'event' ? (
        <>
          <div className="review-form-grid">
            <label className="review-field">
              <span>标题</span>
              <input
                value={String(payload.title ?? '')}
                onChange={(event) => update('title', event.target.value)}
              />
            </label>
            <label className="review-field">
              <span>事件 ID</span>
              <input
                value={String(payload.id ?? '')}
                onChange={(event) => update('id', event.target.value)}
              />
            </label>
          </div>

          <label className="review-field">
            <span>正文</span>
            <textarea
              className="review-textarea"
              value={String(payload.text ?? '')}
              onChange={(event) => update('text', event.target.value)}
            />
          </label>

          <div className="review-form-grid three">
            <label className="review-field">
              <span>触发概率</span>
              <input
                type="number"
                min="0"
                max="1"
                step="0.05"
                value={Number(payload.chance ?? 1)}
                onChange={(event) => update('chance', Number(event.target.value))}
              />
            </label>
            <label className="review-field">
              <span>优先级</span>
              <input
                type="number"
                value={Number(payload.priority ?? 0)}
                onChange={(event) => update('priority', Number(event.target.value))}
              />
            </label>
            <label className="review-field checkbox">
              <input
                type="checkbox"
                checked={Boolean(payload.once)}
                onChange={(event) => update('once', event.target.checked)}
              />
              <span>只触发一次</span>
            </label>
          </div>

          <div className="review-editor-section">
            <div className="review-editor-section-head">
              <h3>选项</h3>
              <button type="button" className="review-button" onClick={addChoice}>
                添加选项
              </button>
            </div>
            {choices.map((choice, index) => {
              const item = asRecord(choice);
              return (
                <article className="review-editor-choice" key={index}>
                  <div className="review-form-grid">
                    <label className="review-field">
                      <span>选项 {index + 1} 标题</span>
                      <input
                        value={String(item.label ?? '')}
                        onChange={(event) =>
                          updateChoice(index, 'label', event.target.value)
                        }
                      />
                    </label>
                    <label className="review-field">
                      <span>提示</span>
                      <input
                        value={String(item.hint ?? '')}
                        onChange={(event) =>
                          updateChoice(index, 'hint', event.target.value)
                        }
                      />
                    </label>
                  </div>
                  <label className="review-field">
                    <span>结果文本</span>
                    <textarea
                      className="review-textarea"
                      value={String(item.result ?? '')}
                      onChange={(event) =>
                        updateChoice(index, 'result', event.target.value)
                      }
                    />
                  </label>
                  <button
                    type="button"
                    className="review-link danger"
                    onClick={() => removeChoice(index)}
                  >
                    删除选项
                  </button>
                </article>
              );
            })}
          </div>

          <div className="review-editor-section">
            <div className="review-editor-section-head">
              <h3>触发方式</h3>
            </div>
            <div className="review-form-grid three">
              <label className="review-field">
                <span>入口</span>
                <select
                  value={String(asRecord(payload.entry).kind ?? 'random')}
                  onChange={(event) => {
                    const next = event.target.value;
                    if (next === 'random') update('entry', undefined);
                    else update('entry', { kind: next });
                  }}
                >
                  <option value="random">行动后随机</option>
                  <option value="arrival">到达地点</option>
                  <option value="chain">后续链</option>
                </select>
              </label>
              <label className="review-field">
                <span>每 N 天</span>
                <input
                  type="number"
                  min="1"
                  placeholder="空 = 不按天"
                  value={String(asRecord(payload.trigger).everyDays ?? '')}
                  onChange={(event) => {
                    const raw = event.target.value;
                    const current = asRecord(payload.trigger);
                    update(
                      'trigger',
                      raw === ''
                        ? undefined
                        : { ...current, everyDays: Number(raw) },
                    );
                  }}
                />
              </label>
              <label className="review-field">
                <span>到点时刻</span>
                <input
                  type="time"
                  value={minuteToTime(asRecord(payload.trigger).atMinute)}
                  onChange={(event) =>
                    update('trigger', {
                      ...asRecord(payload.trigger),
                      atMinute: timeToMinute(event.target.value),
                    })
                  }
                />
              </label>
            </div>

            <div className="review-form-grid three">
              <label className="review-field">
                <span>权重</span>
                <input
                  type="number"
                  min="0"
                  value={Number(payload.weight ?? 1)}
                  onChange={(event) => update('weight', Number(event.target.value))}
                />
              </label>
              <label className="review-field">
                <span>冷却（行动数）</span>
                <input
                  type="number"
                  min="0"
                  value={Number(payload.cooldownActions ?? 0)}
                  onChange={(event) =>
                    update('cooldownActions', Number(event.target.value))
                  }
                />
              </label>
              <label className="review-field">
                <span>组合人数</span>
                <input
                  type="number"
                  min="0"
                  placeholder="空 = 单偶像"
                  value={String(payload.castSize ?? '')}
                  onChange={(event) => {
                    const raw = event.target.value;
                    update('castSize', raw === '' ? undefined : Number(raw));
                  }}
                />
              </label>
            </div>

            <p className="review-form-note">
              条件（when）、锚点（after）、效果（effects）和后续事件仍用“高级 JSON”编辑。
            </p>
          </div>

          <div className="review-editor-section">
            <div className="review-editor-section-head">
              <h3>固定组合（cast）</h3>
            </div>
            <div className="review-location-grid">
              {IDOLS.map((idol) => {
                const current = Array.isArray(payload.cast)
                  ? (payload.cast as string[])
                  : [];
                const checked = current.includes(idol.id);
                return (
                  <label className="review-field checkbox" key={idol.id}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        const next = checked
                          ? current.filter((id) => id !== idol.id)
                          : [...current, idol.id];
                        update('cast', next.length > 0 ? next : undefined);
                      }}
                    />
                    <span>{idol.name}</span>
                  </label>
                );
              })}
            </div>
            <p className="review-form-note">
              写了 cast 就是组合戏，必须挂在行动锚点（after）上。留空则用 castSize 随机组人。
            </p>
          </div>
        </>
      ) : draft.kind === 'activity' ? (
        <>
          <div className="review-form-grid">
            <label className="review-field">
              <span>行动名称</span>
              <input
                value={String(payload.name ?? '')}
                onChange={(event) => update('name', event.target.value)}
              />
            </label>
            <label className="review-field">
              <span>行动 ID</span>
              <input
                value={String(payload.id ?? '')}
                onChange={(event) => update('id', event.target.value)}
              />
            </label>
          </div>

          <label className="review-field">
            <span>描述</span>
            <textarea
              className="review-textarea"
              value={String(payload.description ?? '')}
              onChange={(event) => update('description', event.target.value)}
            />
          </label>

          <div className="review-form-grid three">
            <label className="review-field">
              <span>类型</span>
              <select
                value={String(payload.kind ?? 'training')}
                onChange={(event) => update('kind', event.target.value)}
              >
                {ACTIVITY_KIND_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="review-field">
              <span>时长（分钟）</span>
              <input
                type="number"
                min="0"
                step="5"
                value={Number(payload.durationMinutes ?? 60)}
                onChange={(event) =>
                  update('durationMinutes', Number(event.target.value))
                }
              />
            </label>
            <label className="review-field">
              <span>目标</span>
              <select
                value={String(payload.target ?? 'none')}
                onChange={(event) =>
                  update(
                    'target',
                    event.target.value === 'none' ? undefined : event.target.value,
                  )
                }
              >
                <option value="none">无（地点行动）</option>
                <option value="present-idol">指定在场偶像</option>
                <option value="all-present-idols">所有在场偶像</option>
              </select>
            </label>
          </div>

          <div className="review-form-grid">
            <label className="review-field">
              <span>体力消耗</span>
              <input
                type="number"
                min="0"
                value={Number(asRecord(payload.cost).stamina ?? 0)}
                onChange={(event) =>
                  update('cost', {
                    ...asRecord(payload.cost),
                    stamina: Number(event.target.value),
                  })
                }
              />
            </label>
            <label className="review-field">
              <span>金钱消耗</span>
              <input
                type="number"
                min="0"
                value={Number(asRecord(payload.cost).money ?? 0)}
                onChange={(event) =>
                  update('cost', {
                    ...asRecord(payload.cost),
                    money: Number(event.target.value),
                  })
                }
              />
            </label>
          </div>

          <div className="review-editor-section">
            <div className="review-editor-section-head">
              <h3>专属偶像</h3>
            </div>
            <div className="review-location-grid">
              {IDOLS.map((idol) => {
                const current = Array.isArray(payload.idolIds)
                  ? (payload.idolIds as string[])
                  : [];
                const checked = current.includes(idol.id);
                return (
                  <label className="review-field checkbox" key={idol.id}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        const next = checked
                          ? current.filter((id) => id !== idol.id)
                          : [...current, idol.id];
                        update('idolIds', next.length > 0 ? next : undefined);
                      }}
                    />
                    <span>{idol.name}</span>
                  </label>
                );
              })}
            </div>
            <p className="review-form-note">
              勾选后这条行动只在这些偶像的互动页出现；留空 = 全员通用。目标必须是“指定在场偶像”或“所有在场偶像”。
            </p>
          </div>

          <div className="review-editor-section">
            <div className="review-editor-section-head">
              <h3>可用地点</h3>
            </div>
            <div className="review-location-grid">
              {LOCATIONS.map((location) => {
                const current = Array.isArray(payload.locations)
                  ? (payload.locations as string[])
                  : [];
                const checked = current.includes(location.id);
                return (
                  <label className="review-field checkbox" key={location.id}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        update(
                          'locations',
                          checked
                            ? current.filter((id) => id !== location.id)
                            : [...current, location.id],
                        )
                      }
                    />
                    <span>{location.name}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="review-editor-section">
            <div className="review-editor-section-head">
              <h3>结果文本</h3>
              <button
                type="button"
                className="review-button"
                onClick={() =>
                  update('resultTexts', [
                    ...(Array.isArray(payload.resultTexts)
                      ? (payload.resultTexts as string[])
                      : []),
                    '',
                  ])
                }
              >
                添加一条
              </button>
            </div>
            {(Array.isArray(payload.resultTexts)
              ? (payload.resultTexts as string[])
              : []
            ).map((text, index) => (
              <div className="review-result-row" key={index}>
                <textarea
                  className="review-textarea"
                  value={String(text ?? '')}
                  onChange={(event) => {
                    const next = [
                      ...(payload.resultTexts as string[]),
                    ];
                    next[index] = event.target.value;
                    update('resultTexts', next);
                  }}
                />
                <button
                  type="button"
                  className="review-link danger"
                  onClick={() =>
                    update(
                      'resultTexts',
                      (payload.resultTexts as string[]).filter(
                        (_, i) => i !== index,
                      ),
                    )
                  }
                >
                  删除
                </button>
              </div>
            ))}
          </div>

          <p className="review-form-note">
            效果、失败分支、检定（check）、前置条件（requires）使用“高级 JSON”编辑。
          </p>
        </>
      ) : (
        <>
          <div className="review-form-grid">
            <label className="review-field">
              <span>工作名称</span>
              <input
                value={String(payload.name ?? '')}
                onChange={(event) => update('name', event.target.value)}
              />
            </label>
            <label className="review-field">
              <span>工作 ID</span>
              <input
                value={String(payload.id ?? '')}
                onChange={(event) => update('id', event.target.value)}
              />
            </label>
          </div>

          <label className="review-field">
            <span>描述</span>
            <textarea
              className="review-textarea"
              value={String(payload.description ?? '')}
              onChange={(event) => update('description', event.target.value)}
            />
          </label>

          <div className="review-form-grid three">
            <label className="review-field">
              <span>地点</span>
              <select
                value={String(payload.locationId ?? 'studio')}
                onChange={(event) => update('locationId', event.target.value)}
              >
                {LOCATIONS.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="review-field">
              <span>开始</span>
              <input
                type="time"
                value={minuteToTime(payload.fromMinute)}
                onChange={(event) =>
                  update('fromMinute', timeToMinute(event.target.value))
                }
              />
            </label>
            <label className="review-field">
              <span>结束</span>
              <input
                type="time"
                value={minuteToTime(payload.toMinute)}
                onChange={(event) =>
                  update('toMinute', timeToMinute(event.target.value))
                }
              />
            </label>
          </div>

          <div className="review-form-grid">
            <label className="review-field">
              <span>报酬</span>
              <input
                type="number"
                min="0"
                value={Number(payload.pay ?? 0)}
                onChange={(event) => update('pay', Number(event.target.value))}
              />
            </label>
            <label className="review-field">
              <span>工作事件 ID</span>
              <input
                value={String(payload.eventId ?? '')}
                onChange={(event) => update('eventId', event.target.value)}
              />
            </label>
          </div>

          <p className="review-form-note">
            效果使用“高级 JSON”编辑。
          </p>
        </>
      )}

      <footer className="review-editor-foot">
        <button type="button" className="review-button ghost" onClick={onCancel}>
          取消
        </button>
        <button
          type="button"
          className="review-button primary"
          disabled={busy}
          onClick={() => void submit()}
        >
          {busy ? '保存中…' : '保存草稿'}
        </button>
      </footer>
    </div>
  );
}
