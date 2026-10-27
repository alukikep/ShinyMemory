import { useEffect } from 'react';
import { CONTENT_INDEX } from '../../core/contentIndex';
import type { GameState, ItemDef } from '../../core/types';
import { useDialogFocus } from '../hooks/useDialogFocus';
import { GameIcon } from './GameIcon';

type ShopModalProps = {
  state: GameState;
  shopId: string;
  onClose: () => void;
  onBuy: (itemId: string) => void;
};

export function ShopModal({
  state,
  shopId,
  onClose,
  onBuy,
}: ShopModalProps) {
  const dialogRef = useDialogFocus<HTMLElement>();
  const shop = CONTENT_INDEX.shops.get(shopId);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  if (!shop) return null;

  const items = shop.itemIds
    .map((itemId) => CONTENT_INDEX.items.get(itemId))
    .filter((item): item is ItemDef => Boolean(item));

  return (
    <div
      className="roster-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="roster-panel shop-panel"
        role="dialog"
        aria-modal="true"
        aria-label={shop.name}
        ref={dialogRef}
        tabIndex={-1}
      >
        <header className="roster-head">
          <div>
            <p className="eyebrow">SHOP</p>
            <h2>{shop.name}</h2>
            <p className="shop-description">{shop.description}</p>
          </div>
          <div className="inventory-head-meta">
            <span>
              <GameIcon name="coin" size={13} /> ¥{state.money}
            </span>
            <button
              type="button"
              className="roster-close"
              onClick={onClose}
              aria-label={`关闭${shop.name}`}
            >
              关闭
            </button>
          </div>
        </header>

        <div className="shop-list">
          {items.map((item) => {
            const purchased = state.shopPurchases[item.id] ?? 0;
            const owned = state.inventory[item.id] ?? 0;
            const soldOut =
              item.maxPurchases !== undefined && purchased >= item.maxPurchases;
            const unaffordable = state.money < item.price;
            const reason = soldOut
              ? '售罄'
              : unaffordable
                ? '金钱不足'
                : null;

            return (
              <article
                className={`shop-item ${soldOut ? 'sold-out' : ''}`}
                key={item.id}
              >
                <span className="shop-icon">
                  <GameIcon name={item.icon ?? 'bag'} size={22} />
                </span>
                <div className="shop-copy">
                  <div className="shop-name-row">
                    <h3>{item.name}</h3>
                    <span className="shop-price">¥{item.price}</span>
                  </div>
                  <p>{item.description}</p>
                  <div className="shop-meta">
                    <span>已拥有 {owned}</span>
                    {item.maxPurchases !== undefined ? (
                      <span>
                        已购 {purchased}/{item.maxPurchases}
                      </span>
                    ) : null}
                  </div>
                </div>
                <button
                  type="button"
                  className="shop-buy-button"
                  disabled={Boolean(reason)}
                  onClick={() => onBuy(item.id)}
                >
                  {reason ?? '购买'}
                </button>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
