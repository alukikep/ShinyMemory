import { useEffect, useState } from 'react';
import {
  formatSlotClock,
  formatSlotTime,
  type SaveSlotMeta,
} from '../../save/slots';
import { useDialogFocus } from '../hooks/useDialogFocus';

type SavePanelProps = {
  mode: 'save' | 'load';
  slots: SaveSlotMeta[];
  onClose: () => void;
  onSave: (slotId: string, label: string) => void;
  onLoad: (slotId: string) => void;
  onDelete: (slotId: string) => void;
  onExport: (slotId: string, label: string) => void;
  onImport: (file: File) => void;
};

export function SavePanel({
  mode,
  slots,
  onClose,
  onSave,
  onLoad,
  onDelete,
  onExport,
  onImport,
}: SavePanelProps) {
  const dialogRef = useDialogFocus<HTMLElement>();
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const createSlot = () => {
    const id = `slot-${Date.now()}`;
    onSave(id, `存档 ${slots.length + 1}`);
  };

  return (
    <div
      className="roster-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="roster-panel save-panel"
        role="dialog"
        aria-modal="true"
        aria-label={mode === 'save' ? '存档' : '读档'}
        ref={dialogRef}
        tabIndex={-1}
      >
        <header className="roster-head">
          <div>
            <p className="eyebrow">{mode === 'save' ? 'SAVE' : 'LOAD'}</p>
            <h2>{mode === 'save' ? '存档' : '读档'}</h2>
          </div>
          <button
            type="button"
            className="roster-close"
            onClick={onClose}
            aria-label="关闭存档面板"
          >
            关闭
          </button>
        </header>

        {mode === 'save' ? (
          <>
            <button type="button" className="save-new" onClick={createSlot}>
              新建存档槽
            </button>
            <label className="save-new save-import">
              导入存档文件
              <input
                type="file"
                accept=".json,application/json"
                aria-label="导入存档文件"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) onImport(file);
                  event.target.value = '';
                }}
              />
            </label>
          </>
        ) : null}

        {slots.length === 0 ? (
          <p className="save-empty">还没有存档。</p>
        ) : (
          <div className="save-list">
            {slots.map((slot) => (
              <article className="save-slot" key={slot.id}>
                <div className="save-slot-main">
                  <p className="save-slot-label">{slot.label}</p>
                  <p className="save-slot-meta">
                    第 {slot.summary.day} 天 · {formatSlotClock(slot.summary.minuteOfDay)}
                    {slot.summary.locationName
                      ? ` · ${slot.summary.locationName}`
                      : ''}
                    {slot.summary.idolName ? ` · ${slot.summary.idolName}` : ''}
                    {` · ¥${slot.summary.money.toLocaleString('zh-CN')}`}
                  </p>
                  <p className="save-slot-time">
                    {formatSlotTime(slot.createdAt)} · v{slot.gameVersion}
                  </p>
                </div>
                <div className="save-slot-actions">
                  <button
                    type="button"
                    className="save-slot-action"
                    onClick={() => onExport(slot.id, slot.label)}
                  >
                    导出
                  </button>
                  {mode === 'save' ? (
                    <button
                      type="button"
                      className="save-slot-action"
                      onClick={() => onSave(slot.id, slot.label)}
                    >
                      覆盖保存
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="save-slot-action"
                      onClick={() => onLoad(slot.id)}
                    >
                      读取
                    </button>
                  )}
                  <button
                    type="button"
                    className="save-slot-action danger"
                    onClick={() => {
                      if (pendingDelete === slot.id) {
                        onDelete(slot.id);
                        setPendingDelete(null);
                        return;
                      }
                      setPendingDelete(slot.id);
                    }}
                  >
                    {pendingDelete === slot.id ? '确认删除' : '删除'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
