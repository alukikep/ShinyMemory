# Workshop（候选区）

这里的内容**不会进入游戏构建**。它是 AI 生成、人工审核、打回修正的工作区。

## 目录

| 目录 | 用途 |
|---|---|
| `drafts/` | 待审核的候选卡片，按批次分文件夹 |
| `rejected/` | 打回、等待统一修正的卡片；保留版本和修改说明 |
| `trash/` | 废弃卡片；保留 tombstone（id / hash / reason），文本可清理 |
| `batches/` | 每批生成的报告（通过率、打回原因 Top N） |

## 文件命名

```
<id>.v<version>.yaml
例：evt.mano.tired.001.v1.yaml
```

## 规则

1. **打回不覆盖原文件**：新版本另存为 `v2`，旧版本保留，审核页可 diff。
2. **废弃不硬删除记录**：至少保留 `trash/<id>.tombstone.json`，包含 id、hash、原因、模型、prompt 版本、日期。文本是否清理单独决定。
3. **一个卡片一个文件**：不要把所有卡片塞进一个大 YAML/JSON，否则 diff 和回滚都会很难。
4. **状态只在这里流转**：`draft → in_review → needs_revision → approved` 或 `discarded`。通过后移到 `content/`。
5. **不要提交到公开仓库**：如果 GitHub 仓库是 public，`workshop/` 里的 AI 草稿和废弃内容也会公开。建议源码仓库私有，或把 `workshop/` 放在独立的私有仓库/本地目录。
6. **每张卡片必须有来源**：模型、prompt 版本、生成时间、批次 ID。没有来源的卡片不进入审核。

## 打回说明格式

```yaml
revision:
  reasons: [voice, pacing]        # 结构化原因，便于汇总
  notes: "真乃不会这么直接；第二句改得更含糊"
  must_keep: ["她趴在桌上"]        # 修正时必须保留的事实
  must_change: ["不要提到 live"]   # 修正时必须去掉的内容
```

`notes` 给 AI 看，`reasons` 给批次统计看，`must_keep` / `must_change` 防止 AI 改过头。
