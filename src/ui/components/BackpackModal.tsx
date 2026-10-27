import { useEffect, useMemo, useState } from 'react';
import { CONTENT_INDEX } from '../../core/contentIndex';
import type { GameState, ItemDef } from '../../core/types';
import { useDialogFocus } from '../hooks/useDialogFocus';
import { GameIcon } from './GameIcon';

type BackpackModalProps = {
  state: GameState;
  onClose: () => void;
  onGift: (itemId: string, idolId: string) => void;
};

export function BackpackModal({
  state,
  onClose,
  onGift,
}: BackpackModalProps) {
  const dialogRef = useDialogFocus<HTMLElement>();
  const idols = Object.values(state.idols);
  const [giftTarget, setGiftTarget] = useState(
    idols.some((idol) => idol.id === state.activeIdolId)
      ? state.activeIdolId
      : idols[0]?.id ?? '',
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const entries = useMemo(() => {
    const result: Array<{ item: ItemDef; quantity: number }> = [];
    for (const [itemId, quantity] of Object.entries(state.inventory)) {
      const item = CONTENT_INDEX.items.get(itemId);
      if (item && quantity > 0) result.push({ item, quantity });
    }
    return result.sort((a, b) =>
      a.item.name.localeCompare(b.item.name, 'zh-CN'),
    );
  }, [state.inventory]);

  return (
    <div
      className="roster-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="roster-panel inventory-panel"
        role="dialog"
        aria-modal="true"
        aria-label="背包"
        ref={dialogRef}
        tabIndex={-1}
      >
        <header className="roster-head">
          <div>
            <p className="eyebrow">BACKPACK</p>
            <h2>背包</h2>
          </div>
          <div className="inventory-head-meta">
            <span>
              <GameIcon name="coin" size={13} /> ¥{state.money}
            </span>
            <button
              type="button"
              className="roster-close"
              onClick={onClose}
              aria-label="关闭背包"
            >
              关闭
            </button>
          </div>
        </header>

        {entries.length === 0 ? (
          <p className="inventory-empty">
            背包还是空的。去商业街的礼品店看看？
          </p>
        ) : (
          <>
            <div className="inventory-target">
              <span>赠送对象</span>
              <select
                value={giftTarget}
                onChange={(event) => setGiftTarget(event.target.value)}
                aria-label="赠送对象"
              >
                {idols.map((idol) => (
                  <option key={idol.id} value={idol.id}>
                    {CONTENT_INDEX.idols.get(idol.id)?.name ?? idol.id}
                  </option>
                ))}
              </select>
            </div>

            <div className="inventory-list">
              {entries.map(({ item, quantity }) => (
                <article className="inventory-item" key={item.id}>
                  <span className="inventory-icon">
                    <GameIcon name={item.icon ?? 'bag'} size={21} />
                  </span>
                  <div className="inventory-copy">
                    <div className="inventory-name-row">
                      <h3>{item.name}</h3>
                      <span className="inventory-quantity">×{quantity}</span>
                    </div>
                    <p>{item.description}</p>
                    <span className="inventory-category">
                      {item.category === 'gift'
                        ? '礼物'
                        : item.category === 'keepsake'
                          ? '收藏'
                          : '消耗品'}
                    </span>
                  </div>
                  {item.gift ? (
                    <button
                      type="button"
                      className="inventory-gift-button"
                      onClick={() => onGift(item.id, giftTarget)}
                      disabled={!giftTarget || state.phase !== 'plan'}
                    >
                      {state.phase === 'plan' ? '赠送' : '仅安排阶段'}
                    </button>
                  ) : (
                    <span className="inventory-locked">收藏品</span>
                  )}
                </article>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
