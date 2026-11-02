# 开发工具链与 AI 侧插件

> 这份文档记两件事：**DSH 桌面里装了什么插件、为什么装**，以及**剧本语料检索工具怎么用**。
> 装插件的目的是省钱（token）和少犯错，不是收集工具——每一条都要能说出"它挡掉了哪个具体成本"。

最后更新：2026-11-02　对应 DSH 0.2.1（CLI 0.2.1-rc.5）

---

## 1. 装了哪几个

profile 在 `~/.dsh/profiles/desktop/package.json` 的 `dsh.profile.bundles` 里。

| 插件 | 版本 | 解决什么 | 代价 / 边界 |
|---|---|---|---|
| `dsh-context` | 0.79.0 | 每轮上下文组成、cache hit、按天成本曲线，`/context` 命令 | 只读，纯观测；不改变发出去的 prompt |
| `@aiwayds/dsh-mcp-adapter` | 0.7.2 | 把 `mcp__*` 的工具 schema 从每轮 prompt 里折叠掉，换成 `mcp_list` / `mcp_call` 两个固定工具 | 调 MCP 工具多一跳；**和同名 `dsh-mcp-adapter`（NexusAgentX）不能混装** |
| `dsh-plugin-save-token` | 2.4.1 | 大工具输出结构化压缩 + 可逆 spill + 90s 内重复输出去重 | 只压工具输出；`read` 的结果**不压**。原始文本永远在 spill 文件里 |
| `dsh-shiny-script` | 0.1.0（本地） | 剧本语料按行 id / 关键词检索，见第 3 节 | 只读；依赖 `.cache/shiny` 已导出 |

### 为什么装 mcp-adapter

这个 profile 挂了 unity（40+ 工具）和 blender（15 个长描述）。本项目一次都用不到，
但每个请求都在付它们的 JSON Schema。折叠后 prompt 里只剩两个 meta 工具，具体工具按需展开。

adapter 只折叠、不省"注册"：只要 bundle 还挂着，连接和工具表就还在。所以真正省事的是
**默认把它们关掉**（见第 4 节）。现在 unity / blender / novel 三个 bundle 默认都是关的，
adapter 保留是为了哪天开回 unity 时仍然折叠。

### 为什么装 save-token

实测一例：400 行管道表格 **29,335 → 10,726 字节（−63%）**，模型看到表头/表尾 +
带原始行号的抽样，中间缺的部分用 `save_token_expand` 或 spill 文件取回。

它会压这些：`pwsh`/`bash` 输出、`content:audit` 的表格、`playwright` 日志。
它**不压** `read`，所以读源码改代码不受影响。

### 已知代价

- 输出的"中间被省略"提示会出现在工具结果里，第一次见容易以为数据丢了；原始文件路径就在提示里。
- `save-token` 自带的 120k 自动 compact 默认是关的，**保持关闭**：压缩阈值要按实际窗口调，别让它替引擎决定何时总结历史。

---

## 2. 装 / 卸 / 排错

```bash
dsh plugin --profile desktop add <包名>
dsh plugin --profile desktop remove <包名>
```

桌面版的 `dsh` 在 `resources/runtime/cli/bin/dsh.cmd`，**系统 PATH 里没有**；桌面 app 内
Settings → Plugins → Add plugin 也走同一条链路。

装完不用重启：profile 的 `package.json` 一改，host 会热加载（工具 schema 会当场更新）。

### 踩过的坑：`ERR_PNPM_IGNORED_BUILDS`

pnpm 11 默认不跑依赖的 postinstall，`dsh plugin add` 会因为**非零退出**跳过写 bundle 行——
于是包进了 `node_modules`，插件却完全不可见，而且没有任何报错指向这里。

修法（两步都要）：

```yaml
# ~/.dsh/profiles/desktop/pnpm-workspace.yaml
onlyBuiltDependencies:
  - '@aiwayds/dsh-mcp-adapter'
```

```bash
# 清掉已经记下的 ignoredBuilds，否则 pnpm 不会重跑
# 编辑 ~/.dsh/profiles/desktop/node_modules/.modules.yaml：把 ignoredBuilds 置为 []
node <pnpm> install
dsh plugin --profile desktop add <包名>   # 再跑一次，这次才会写 bundle 行
```

判断装没装成功，只看一处：

```powershell
node -e "const p=require('os').homedir()+'/.dsh/profiles/desktop/package.json';console.log(require(p).dsh.profile.bundles)"
```

**bundle 列表里有名字才算装好。** 依赖里有、列表里没有 = 不会加载。

### 回滚点

装之前备份过：`~/.dsh/profiles/desktop/*.bak-tokenopt-*`、`package.json.bak-mcpadapter-*`、
`cordis.patch.yml.bak-shinyscript-*`、`node_modules/.modules.yaml.bak-tokenopt`。

---

## 3. 剧本语料检索（`script_find` / `script_window`）

写剧情前必须读原文（[AGENTS.md](../../AGENTS.md) 硬性禁止 #8），但一份剧本 JSON 几千行，
整份读要几千 token。这两个工具只回命中的几行，**返回的行 id 就是 `step.source` 要写的编号**。

### 用法

```text
script_find query="1902001010010"            # 精确行 id（也接受 10–12 位前缀）
script_find query="社長 おはよう"             # 多个日文关键词 = 全部命中
script_find query="プロデューサー" script="100400101"   # 限定剧本
script_find                                   # 不带 query：列出已缓存的剧本编号
script_window script="100400101" around="1902001010010" count=6   # 看上下文
script_window script="100400101" from="#40" count=20              # 顺序读一段
```

### 行为约定

- 同一句常常原样出现在多份剧本里（共用序章/共通线）。结果按「行 id + 说话人 + 正文」去重，
  只标 `（+N 份剧本也有）`，不刷屏。
- 单次有字符预算（默认 5000），截断时明确说还剩多少行；`limit` 上限 40。
- 行号 `#n` 从 0 起，和 JSON 数组下标一致。
- 语料目录在插件配置里（`dir`），**没有联网、没有写入能力**。
- 目录不存在时返回一句可执行的提示，不抛错：

```bash
npx tsx tools/scriptExport.ts <剧本编号> [<剧本编号> ...]   # 产物进 .cache/shiny/
```

### 插件在哪

`E:\dsh-plugins\dsh-shiny-script\`（源码 + `test.mjs` + `cordis.patch.yml`），
以 `link:` 方式挂进 profile。改完代码不用重装，host 下次加载即生效；冒烟测试：

```bash
cd "E:\dsh-plugins\dsh-shiny-script"
node test.mjs "E:/game dev/ShinyMemory/.cache/shiny"
```

**它不在仓库里**（和 blender 插件同样的位置约定）。要改行为，直接改那个目录；
仓库这边只有这份文档记录它的契约。

---

## 4. 默认关掉的东西（按需打开）

**原则：用不到的插件不进 bundle。** 只要 bundle 挂着，它的工具定义就每轮都进 prompt，
它的 skills 就每轮都在技能目录里——哪怕这一次一个字都不用它。

现在默认关掉三个（依赖和 `node_modules` 都留着，打开是秒级）：

| bundle | 关掉的理由 |
|---|---|
| `@local/mcp-unity` | 40+ 工具，本项目不碰 Unity |
| `@dsh-external/dsh-blender-plugin` | 15 个超长描述的工具，只在做 3D 时用 |
| `dsh-novel` | 14 个工具 + 12 个技能，还会往系统提示词里塞一整段"你在写小说" |

开关脚本：`C:\Users\ASUS\.dsh\toggle-bundle.mjs`

```bash
node ~/.dsh/toggle-bundle.mjs list                 # 当前挂着什么、关了什么
node ~/.dsh/toggle-bundle.mjs off <包名> [...]      # 关（记录原位置）
node ~/.dsh/toggle-bundle.mjs on  <包名> [...]      # 开（按原位置插回去）
```

- 只改 `dsh.profile.bundles`，关掉的位置记在 `<profile>/.disabled-bundles.json`。
- 改完会 touch `package.json`，**host 热加载，不用重启桌面端**。
- 判断有没有生效：技能目录里不该再出现 `novel-*` / `blender-modeling`；
  `mcp_list` 应该回 "no MCP tools are registered"。

做 3D 之前先 `on` 回来，否则 `blender_rt_*` 工具和 blender 技能都不可见。

**还没做到的部分**：技能目录本身（名字 + 一句描述）仍然每轮注入，约 1.3k。
它已经是最省的形态（正文是按需加载），要再省只能按项目裁剪技能来源，
那需要 DSH 支持 per-project skill 过滤——现在没有，别硬造。

---

## 5. 还没做

- 用 `dsh-context` 的 `/context` 跑一周，确认「省下来的」是 MCP schema 还是工具输出——
  现在两条都装了，没做 A/B，归属不清。
- 语料检索目前只索引 `.cache/shiny/*.json`，**没有索引已批准的中文改编**（`content-review/approved/`）。
  想查"这句中文之前放在哪一章"，还得靠 `content:where`。
- 插件版本会漂：`dsh-context` 与 `save-token` 都在活跃更新，升级前先看一次 changelog，
  别在提交前夜升级。
