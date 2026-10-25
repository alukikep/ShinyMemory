# 偶像日程表系统研究

## 当前状态

已实现：

- `ActorSchedule.weekdays` / `priority` / `label` / `visibility`；
- `ActorDef.overrides` 单日覆盖；
- 解析器：覆盖 → 星期模板 → 默认；
- 真乃/灯织每周模板；
- 日程表以“今天”为起点显示未来七天；
- 日程表隐藏私人地点，显示“自由活动”；
- 名册显示实际当前位置，包括地图不可达的学校；
- 公园/商业街两个可步行地点，学校为 off-map 地点；
- 动态覆盖存入 `ActorState.scheduleOverrides`；
- `replace-day` 覆盖会替换当天模板；
- `protected` 日程保护 + `canReplaceDay` 冲突检查；
- 过期覆盖在时间推进时自动删除；
- 事务所工作邀约：接取后写入未来某天的 `replace-day` 覆盖；
- 移动端横向滚动。

尚未实现：

- 工作当天的执行、报酬和失败链；
- 单日覆盖的取消/编辑 UI；
- 日程表编辑；
- 更多偶像的正式周模板；
- 跨夜班次；
- 星期事件条件。

## 背景

日历已经接入：

```text
2026年4月6日 · 星期一
08:00
¥3,000
```

日期由 `CALENDAR_START = 2026-04-06` 推导，不新增存档字段。

下一步要研究的是：

- 偶像每周固定日程；
- 临时/单日覆盖；
- 日程与在场、训练、工作、事件的关系；
- 玩家如何查看日程表。

## 当前实现

`ActorDef.schedule`：

```ts
type ActorSchedule = {
  fromMinute: number;
  toMinute: number;
  locationId: string;
};
```

解析：

```ts
actor.schedule.find((entry) =>
  isMinuteInWindow(absoluteMinutes, entry),
)?.locationId;
```

特点：

- 每天重复；
- 只看分钟，不看星期；
- 重叠时第一个匹配项生效；
- 没有休息日；
- 没有单日例外；
- 没有“课程/收录/休息”标签。

当前数据：

```text
真乃
  08:00–14:00 练习室
  14:00–20:00 录音棚

灯织
  10:00–16:00 练习室
  16:00–22:00 录音棚

叶月
  09:00–18:00 事务所

努
  10:00–17:00 事务所
```

## 目标

### 必需

1. 支持星期；
2. 支持每周固定模板；
3. 支持单日覆盖；
4. 保持旧日程兼容；
5. 日程表可读；
6. 在场判断仍是一个纯函数。

### 暂不做

- 玩家编辑日程；
- 多周轮换；
- 复杂倒班；
- 天气影响日程；
- 自动排班算法；
- 全部 25 名偶像的正式日程。

## 数据模型建议

### 1. 扩展 ActorSchedule

```ts
type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

type ActorSchedule = {
  id?: string;
  weekdays?: Weekday[];   // 省略 = 每天
  fromMinute: number;
  toMinute: number;
  locationId?: string;    // 省略 = 无固定地点
  label?: string;         // 练习 / 收录 / 自由活动
  priority?: number;      // 数字越大越优先
  visibility?: 'public' | 'private';
};
```

兼容性：

- 旧数据没有 `weekdays`，视为每天；
- 旧数据没有 `priority`，视为 0；
- 旧数据没有 `visibility`，视为公开；
- 不需要改存档，日程是内容数据。

`visibility: 'private'` 只影响日程表：

- 日程表显示“自由活动”；
- 名册仍显示实际 `locationId`；
- 没有 `locationId` 时，名册显示“自由活动”。

### 2. 单日覆盖

```ts
type ScheduleOverride = {
  day: number;            // 第 N 天
  startMinute?: number;
  endMinute?: number;
  locationId: string;
  label?: string;
};
```

用于：

- 特别收录；
- 某天休息；
- 临时外景；
- 生日/纪念日。

也可以后续改为日期范围：

```ts
fromDay?: number;
toDay?: number;
```

第一版建议只做单日。

### 3. 日程标签

```ts
type ScheduleLabel = 'practice' | 'recording' | 'office' | 'rest' | 'special';
```

UI 用来着色：

- 练习：粉；
- 收录：蓝；
- 事务所：金；
- 休息：绿；
- 特别：紫。

## 日期窗口

日程表不再固定周一到周日，而是：

```ts
getScheduleWindow(actor, startDay, 7, stateOverrides)
```

返回从今天开始的 7 天：

```text
今天 · 4月6日 星期一
4月7日 星期二
...
4月12日 星期日
```

第一列是当前日期，跨月/跨年由日历函数处理。

## 动态覆盖

存档动态覆盖放在：

```ts
ActorState.scheduleOverrides?: ActorScheduleOverride[]
```

与内容预设 `ActorDef.overrides` 合并解析。

```ts
type ActorScheduleOverride = {
  id?: string;
  day: number;
  fromMinute?: number;
  toMinute?: number;
  locationId?: string;
  label?: string;
  visibility?: 'public' | 'private';
  mode?: 'add' | 'replace-day';
};
```

- `replace-day`：当天只保留覆盖，周模板隐藏；
- 没有 `mode`：叠加。

接工作应写：

```ts
{
  day,
  fromMinute,
  toMinute,
  locationId,
  label: '收录',
  visibility: 'public',
  mode: 'replace-day',
}
```

## 档期冲突

日程模板有：

```ts
protected?: boolean;
```

- 默认 `true`；
- 自由活动/私人弹性时间设为 `false`；
- `canReplaceDay(actor, day, overrides)` 在接工作前检查：
  - 已有覆盖 → 拒绝；
  - 有受保护的默认日程 → 拒绝；
  - 只有自由活动或无日程 → 允许。

这样只会保护原本会被工作覆盖的默认日程，不会让所有空闲日都无法接工作。

## 工作邀约

事务所页面在 08:00–20:00 显示工作邀约。

当前内容：

```text
杂志拍摄  10:00–16:00  ¥1,200
电台收录  19:00–22:00  ¥1,800
```

接取流程：

```text
读取当前偶像
→ 在接下来 7 天里找第一个 canReplaceDay 通过的日期
→ 写入 ActorState.scheduleOverrides
→ mode: replace-day
→ 日程表显示“临时”
```

受保护日程（练习/收录/学校）不会被邀约占用；只有自由活动日或空档可以作为工作日期。

当前只完成“接取 + 改期”，还没有实现工作当天的执行和报酬。

## 自动清理

`advanceTime` 和读档时调用：

```ts
pruneScheduleOverrides(state)
```

删除 `day < 当前天` 的动态覆盖。

下一天自动回到默认周模板。

## 解析规则

建议顺序：

```text
1. 单日覆盖（day 精确匹配）
2. 周模板（weekday 匹配 + 时间窗）
3. 默认地点
4. 无地点（不在任何地方）
```

同一层内：

```text
priority 高者优先
priority 相同则 fromMinute 晚者优先
再相同则内容顺序
```

这样可以表达：

```text
周一 10:00–12:00 特别收录
覆盖原本的练习室
```

## 跨夜问题

当前 `isMinuteInWindow` 支持跨夜：

```ts
fromMinute > toMinute
  ? minute >= fromMinute || minute < toMinute
  : ...
```

但加入星期后会出现：

```text
周五 22:00–周六 02:00
```

这段属于周五还是周六？

建议第一版：

- 日程不允许跨夜；
- 需要跨夜时拆成两条：
  - 周五 22:00–24:00；
  - 周六 00:00–02:00。

这样可以避免“星期归属”歧义。

## 日程表 UI

### 位置

不建议塞进 236px 侧边栏。

建议：

- 侧边栏导航加「日程表」；
- 打开全屏/大面板 overlay；
- 7 列 × 时间段网格；
- 顶部偶像切换；
- 当前星期和当前时间高亮。

### 结构

```text
┌────────────────────────────────────────────┐
│ 偶像日程表                       [关闭]     │
│ [真乃] [灯织]                              │
├──────┬──────┬──────┬──────┬──────┬──────┬──┤
│ 周一  │ 周二  │ 周三  │ 周四  │ 周五  │ 周六 │周日│
├──────┼──────┼──────┼──────┼──────┼──────┼──┤
│08-14 │练习室 │练习室 │练习室 │练习室 │练习室 │...│
│14-20 │录音棚 │录音棚 │录音棚 │录音棚 │录音棚 │...│
│20-08 │休息   │休息   │休息   │休息   │休息   │...│
└──────┴──────┴──────┴──────┴──────┴──────┴──┘
```

### 信息层级

- 先显示当前偶像；
- 其他偶像可切换；
- 地点颜色；
- 当天高亮；
- 当前时间线；
- 单日覆盖用角标标记。

### 移动端

- 不做 7 列小格子；
- 改为“按天列表”：

```text
周一
  08:00–14:00 练习室
  14:00–20:00 录音棚
周二
  ...
```

## 与在场/行动的关系

日程只决定“她默认在哪里”，不直接决定：

- 玩家能不能训练；
- 玩家能不能工作；
- 事件是否触发。

这些仍由：

- `activityAvailability`；
- 地点；
- 时间窗；
- 事件条件；
- 玩家是否进入偶像页面；

决定。

日程变化会影响：

- 地点页面出现哪些角色；
- 偶像页面是否可进入；
- 工作/训练是否可见；
- 事件上下文。

## 与事件系统的关系

建议新增条件：

```ts
{ kind: 'weekday'; weekday: Weekday }
{ kind: 'dateAtLeast'; year; month; day }
```

用于：

- 周一课程事件；
- 周末特别节目；
- 某日生日；
- 某日临时收录。

第一版可以只加 `weekday`，日期条件后置。

## 内容设计

先只为真乃、灯织制作每周模板。

示例（待确认）：

```text
真乃
  周一–周五
    08:00–14:00 练习室
    14:00–20:00 录音棚
  周六
    10:00–14:00 练习室
    14:00–18:00 录音棚
  周日
    自由活动

灯织
  周一/三/五
    10:00–16:00 练习室
    16:00–22:00 录音棚
  周二/四
    08:00–10:00 学校
    10:00–18:00 练习室
  周六
    12:00–18:00 录音棚
  周日
    自由活动
```

具体休息日需要和玩法平衡一起定，不应先写死。

## 实施阶段

### S1：数据兼容

- `ActorSchedule.weekdays` / `priority` / `label`；
- 旧日程按每天处理；
- 不改变现有在场结果；
- 测试覆盖旧数据。

### S2：解析器

- 单日覆盖；
- 星期过滤；
- priority；
- 跨夜禁止或拆分；
- 单元测试。

### S3：日程表 UI

- 桌面 7 列；
- 移动端按天列表；
- 当前偶像切换；
- 当前时间高亮。

### S4：正式日程内容

- 真乃/灯织每周模板；
- 休息日；
- 与工作/训练可用性对齐；
- 事件条件。

### S5：单日覆盖

- 特别收录；
- 临时休息；
- UI 角标。

## 风险

- 休息日过多会让玩法空转；
- 所有偶像都固定同一作息会失去差异；
- 跨夜归属容易出错；
- 日程表和实际在场逻辑不一致会破坏信任；
- UI 7 列在移动端不可读；
- 旧日程数据没有星期，迁移时要默认每天。

## 建议

先做 S1 + S2：

- 只加数据字段和解析器；
- 不立即改 UI；
- 用现有真乃/灯织数据验证；
- 确认每周模板后再做日程表 UI。

日历已经完成，星期可作为日程系统的第一层过滤条件。
