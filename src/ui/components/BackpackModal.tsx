import { useEffect, useMemo, useState } from 'react';
import { CONTENT_INDEX } from '../../core/contentIndex';
import { describeModifier } from '../../core/modifiers';
import { slotKeys } from '../../core/sim';
import type { EquipDef, GameState, ItemDef } from '../../core/types';
import { useDialogFocus } from '../hooks/useDialogFocus';
import { GameIcon } from './GameIcon';

type BackpackModalProps = {
  state: GameState;
  onClose: () => void;
  onGift: (itemId: string, idolId: string) => void;
  onEquip: (equipId: string) => void;
  onUnequip: (slotKey: string) => void;
};

function EquipSection({
  state,
  onEquip,
  onUnequip,
}: {
  state: GameState;
  onEquip: (equipId: string) => void;
  onUnequip: (slotKey: string) => void;
}) {
  const equipment = state.equipment ?? {};
  const slots = slotKeys(state, 'charm');
  const owned = (state.ownedEquips ?? [])
    .filter((id) => !Object.values(equipment).includes(id))
    .map((id) => CONTENT_INDEX.equips.get(id))
    .filter((def): def is EquipDef => Boolean(def));

  if (slots.length === 0 && owned.length === 0) return null;

  return (
    <section className="equip-section" aria-label="饰品">
      <h3 className="equip-title">饰品</h3>
      <div className="equip-slots">
        {slots.map((key, index) => {
          const def = equipment[key]
            ? CONTENT_INDEX.equips.get(equipment[key])
            : undefined;
          return (
            <div className="equip-slot" key={key}>
              <span className="equip-slot-label">位置 {index + 1}</span>
              {def ? (
                <>
                  <span className="equip-slot-name">{def.name}</span>
                  <span className="equip-slot-effect">
                    {def.modifiers.map(describeModifier).join(' · ')}
                  </span>
                  <button
                    type="button"
                    className="equip-action"
                    onClick={() => onUnequip(key)}
                  >
                    卸下
                  </button>
                </>
              ) : (
                <span className="equip-slot-empty">空</span>
              )}
            </div>
          );
        })}
      </div>
      {owned.length > 0 ? (
        <ul className="equip-owned">
          {owned.map((def) => (
            <li key={def.id}>
              <span className="equip-owned-name">{def.name}</span>
              <span className="equip-owned-effect">
                {def.modifiers.map(describeModifier).join(' · ')}
              </span>
              <button
                type="button"
                className="equip-action"
                onClick={() => onEquip(def.id)}
              >
                装备
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

export function BackpackModal({
  state,
  onClose,
  onGift,
  onEquip,
  onUnequip,
}: BackpackModalProps) {
  const dialogRef = useDialogFocus<HTMLElement>();
  const idols = Object.values(state.idols).filter(
    (idol) => idol.status === 'recruited',
  );
  const [giftTarget, setGiftTarget] = useState(
    idols.some((idol) => idol.id === state.selectedIdolId)
      ? state.selectedIdolId
      : idols[0]?.id ?? '',
  );
  const [giftFeedback, setGiftFeedback] = useState<string | undefined>();
  const giftTargetName =
    CONTENT_INDEX.idols.get(giftTarget)?.name ?? giftTarget;

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

  const giveGift = (itemId: string, itemName: string) => {
    onGift(itemId, giftTarget);
    setGiftFeedback(`已把${itemName}送给${giftTargetName}。`);
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

        {giftFeedback ? (
          <p className="inventory-feedback" role="status">
            {giftFeedback}
          </p>
        ) : null}

        <EquipSection state={state} onEquip={onEquip} onUnequip={onUnequip} />

        {entries.length === 0 ? (
          <p className="inventory-empty">
            背包里没有道具。去商业街的礼品店看看？
          </p>
        ) : (
          <>
            <div className="inventory-target">
              <span>赠送对象（默认当前偶像）</span>
              <select
                value={giftTarget}
                onChange={(event) => {
                  setGiftTarget(event.target.value);
                  setGiftFeedback(undefined);
                }}
                aria-label="赠送对象"
              >
                {idols.map((idol) => (
                  <option key={idol.id} value={idol.id}>
                    {CONTENT_INDEX.idols.get(idol.id)?.name ?? idol.id}
                    {idol.id === state.selectedIdolId ? '（当前）' : ''}
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
                      onClick={() => giveGift(item.id, item.name)}
                      disabled={!giftTarget || state.phase !== 'plan'}
                    >
                      {state.phase === 'plan'
                        ? `赠送给${giftTargetName}`
                        : '仅安排阶段'}
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
