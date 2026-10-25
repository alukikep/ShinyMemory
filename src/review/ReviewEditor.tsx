import { useEffect, useState } from 'react';
import { LOCATIONS } from '../core/content/locations';
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
  const [jsonMode, setJsonMode] = useState(false);
  const [jsonText, setJsonText] = useState(
    JSON.stringify(draft.payload, null, 2),
  );
  const [errors, setErrors] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setTitle(draft.title);
    setPayload(asRecord(draft.payload));
    setJsonText(JSON.stringify(draft.payload, null, 2));
    setJsonMode(false);
    setErrors([]);
  }, [draft.id, draft.title, draft.payload]);

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
          : String(nextPayload.name ?? title);
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
          <h2>编辑 {draft.kind === 'event' ? '事件' : '工作'}</h2>
        </div>
        <div className="review-editor-actions">
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
        <label className="review-field">
          <span>payload JSON</span>
          <textarea
            className="review-textarea review-json-editor"
            value={jsonText}
            onChange={(event) => setJsonText(event.target.value)}
            spellCheck={false}
          />
        </label>
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

          <p className="review-form-note">
            触发条件、效果、后续事件使用“高级 JSON”编辑。
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
