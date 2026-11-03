# 物品与商店系统

> 正式内容已上线：1 家商店、5 件商品，另有 1 件系统奖励道具「信赖的证明」。
> 当前是**购买冷却 + 永久限购**并存；设计见 [money-sinks](../current/money-sinks.md)，已实现。

## 当前状态

已实现：

- 商业街礼品店（`shopping_street_gift`）；
- 物品目录与商店货架；
- 背包库存；
- 购买冷却（`cooldownMinutes`，按游戏内时间）；
- 永久限购（`maxPurchases`，买完显示已售罄）；
- 购买记录；
- 选择偶像赠送礼物；
- 礼物信任效果；
- 消耗品使用（`useEffects`，如「信赖的证明」+2 体力上限）；
- 剧情完成自动发道具（`grantItem`）；
- 存档迁移至 `SAVE_VERSION 19`；
- 商店/背包 UI；
- 购买/赠送/装备 E2E；
- 物品/商店走审查台（`REVIEW_KINDS` 含 `item` / `shop`）。

## 数据模型

```ts
ItemCategory = 'gift' | 'keepsake' | 'consumable'

ItemDef = {
  id,
  name,
  description,
  category,
  price,
  icon?,
  shopId?,
  maxPurchases?,      // 永久限购；与 cooldownMinutes 并存
  cooldownMinutes?,   // 购买后冷却（游戏内分钟）
  useEffects?,        // 消耗品使用后的效果
  gift?: {
    defaultTrustTier,
    preferences?: { idolId, trustTier, reaction }[]
  }
}

ShopDef = {
  id,
  name,
  description,
  locationId,
  itemIds
}
```

存档新增：

```ts
GameState.inventory: Record<string, number>
GameState.shopPurchases: Record<string, number>
GameState.shopCooldowns?: Record<string, number>
```

- `inventory`：当前背包数量；
- `shopPurchases`：每个商品在当前存档中买过多少次（永久限购用）；
- `shopCooldowns`：上次购买的绝对分钟；按游戏内时间恢复；
- 两种模式可以并存：先判 `maxPurchases` 永久上限，再判冷却。

## 命令

```text
buyItem
giveGift
useItem
```

规则：

- 购买只能在对应商店地点、安排阶段执行；
- 购买不消耗时间；
- 赠送不消耗时间；
- 使用消耗品不消耗时间；
- 赠送对象由玩家选择，默认当前偶像，可切换；
- 礼物消耗 1 个；
- 礼物只影响指定偶像的信任；
- 收藏品不能赠送；
- 消耗品使用后按 `useEffects` 结算，可一次使用多个；
- 默认购买后进入 `cooldownMinutes` 冷却；`maxPurchases` 商品仍按永久限购，买完显示“已售罄”。

## UI

- 侧边栏「背包」：所有地点可用；
- 主栏位「街角礼品店」按钮：仅在商业街、安排阶段显示；
- 商店显示价格、已拥有数量、冷却/售罄、金钱不足；
- 冷却中显示“冷却中 · 还需 X 小时/分钟”，与“已售罄”分开显示；
- 背包显示数量、类型、赠送对象选择；
- 消耗品显示「使用 1 个 / 全部使用」。

## 信赖奖励

- 信赖 A 级剧情完成时，通过 `grantItem` 自动把「信赖的证明」放进背包；
- 28 个偶像共用同一种道具，最多 28 个；
- 使用 1 个：`vars['stamina.trustBonus'] += 2`，体力上限永久 +2；
- 制作人面板显示 `体力上限 216（基础 160 + 信赖 56）` 这类拆分；
- 旧存档需要按 `trust >= A` 补发一次，并用 `flags['trustReward.<idolId>.A']` 防重复。
- 当前正式内容还没有 A 级信赖剧情；先用 `trustReward.test` 的 fixture 剧情验证系统，正式剧情接入时补 `grantItem` 效果与补发逻辑。

## 内容位置

```text
content-review/approved/*.json   →  src/core/content/approved.generated.ts
```

物品/商店属于审查台内容，通过后进入 `approved.generated.ts`；`src/core/content/index.ts` 的 `ITEMS` / `SHOPS` 是基准数组。
例外：系统奖励道具「信赖的证明」是引擎结构道具，写在 `src/core/content/trustToken.ts`，不进审查台。

当前商品（全部为 5 件冷却商品，暂无永久限购内容）：

```text
信纸        ¥200   礼物   冷却 24h
演唱会照片  ¥300   收藏   冷却 24h
花束        ¥500   礼物   冷却 24h
小鸟挂饰    ¥600   礼物   冷却 72h
发饰        ¥800   礼物   冷却 72h
```

礼物偏好覆盖真乃与灯织；小鸟挂饰有真乃专属反应。

## 审查流程

物品/商店已进入审查台：

```text
ReviewKind: item / shop
校验：validateItem / validateShop
载入：approvedPacking → mergeApprovedContent
```

审查顺序：**先通过物品，再通过引用它的商店**，否则会报 `item-ref`。

## 验收

```bash
npm test
npm run acceptance
```

覆盖：

- 购买扣钱、库存增加；
- 冷却中拒绝购买、推进游戏时间后可买；
- `maxPurchases: 1` 永久售罄；
- 钱不够；
- 错误地点；
- 赠送消耗；
- 指定偶像信任增加；
- 收藏品不可赠送；
- 刷新后库存与冷却保留；
- v18 → v19 迁移补 `shopCooldowns`。
