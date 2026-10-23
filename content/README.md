# Content（已审核内容）

这里是**游戏构建的唯一内容来源**。只有经过人工审核的卡片才能进来。

## 目录

| 目录 | 用途 |
|---|---|
| `events/` | 事件卡（触发条件 + facts + 文本 + 结果） |
| `scenes/` | 手写场景（多步骤、分支、Live、剧情） |
| `fragments/` | 氛围文本片段（地点、时段、天气、角色） |
| `packs/` | 内容包清单（可选，用于按批次发布/回滚） |

## 规则

1. **只放 approved**：`workshop/` 的草稿永远不会被游戏加载。
2. **每张卡片有 decision**：`review/decisions/<id>.v<version>.json` 必须存在，记录审核人、时间、检查清单、备注。
3. **状态**：`active` 会进入事件池；`retired` 保留但不再触发；`superseded` 被新版本替代。
4. **修改已发布卡片必须升版本**：`v1 → v2`，旧版本保留，避免旧存档/旧事件引用断裂。
5. **不要硬删除**：退役用 `retired`，替换用 `superseded`，废弃用 `workshop/trash/` 的 tombstone。
6. **文本不硬编码在代码里**：所有玩家可见文本走内容文件。

## 事件卡最小结构

```yaml
id: evt.mano.tired.001
version: 1
kind: event
status: active
location: lesson_room
time: { from: 960, to: 1080 }
actors: [mano]
conditions: []
weight: 10
cooldownDays: 3
once: false
facts:
  actor: mano
  action: collapse_on_sofa
text:
  template: "……"
  variants: ["……"]
outcomes:
  - { kind: 'effectPreset', id: 'tired_but_closer' }
```

机制字段（`conditions` / `outcomes` / `time` / `location`）由人或受限生成器填写，AI 不能自由发明数值。
