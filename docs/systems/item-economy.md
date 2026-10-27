# 物品与商店系统

> 系统保留，正式物品/商店内容当前为空；测试内容只存在于 fixture。

## 当前状态

已实现最小垂直切片：

- 商业街礼品店；
- 物品目录；
- 背包库存；
- 商品限购；
- 购买记录；
- 选择偶像赠送礼物；
- 礼物信任效果；
- 存档迁移 v11；
- 商店/背包 UI；
- 购买/赠送 E2E。

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
  maxPurchases?,
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
```

- `inventory`：当前背包数量；
- `shopPurchases`：每个商品在当前存档中买过多少次；
- 限购按存档计算，不随时间恢复。

## 命令

```text
buyItem
giveGift
```

规则：

- 购买只能在对应商店地点、安排阶段执行；
- 购买不消耗时间；
- 赠送不消耗时间；
- 赠送对象由玩家选择，默认当前偶像，可切换；
- 礼物消耗 1 个；
- 礼物只影响指定偶像的信任；
- 收藏品不能赠送。

## UI

- 侧边栏「背包」：所有地点可用；
- 主栏位「街角礼品店」按钮：仅在商业街、安排阶段显示；
- 商店显示价格、已拥有数量、已购/限购、售罄、金钱不足；
- 背包显示数量、类型、赠送对象选择。

## 内容位置

```text
src/core/content/items.ts
```

当前商品：

```text
花束        ¥500   礼物   限购 3
发饰        ¥800   礼物   限购 1
信纸        ¥200   礼物   限购 3
演唱会照片  ¥300   收藏   限购 1
```

礼物偏好目前覆盖真乃与灯织。

## 审查流程

物品目录当前为静态 TS 内容，和活动一样不进入审查页。

如果以后要求统一审查，需要扩展：

```text
ReviewKind += 'item'
approved/items
Item 编辑器
```

## 验收

```bash
npm test
npm run acceptance
```

覆盖：

- 购买扣钱、库存增加；
- 限购；
- 钱不够；
- 错误地点；
- 赠送消耗；
- 指定偶像信任增加；
- 收藏品不可赠送；
- 刷新后库存保留。
