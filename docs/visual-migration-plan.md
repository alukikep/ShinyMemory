# 视觉迁移计划：从参考项目到 ShinyMemory

参考项目：

```text
E:\game dev\闪耀色彩页游
```

参考重点：

- `docs/visual-reference.md`：视觉方向与素材来源
- `src/styles.css` / `src/sidebar.css`：色板、面板、布局、场景与地图
- `src/App.vue`：侧边栏、顶部栏、Hero 场景、行动区
- `src/components/OfficeScene.vue`：原创 SVG 室内/街区背景
- `src/components/TownMap.vue`：地图背景、pin、路线、图例
- `src/components/GameIcon.vue`：线性 SVG 图标库
- `public/assets/idols/*.png`：透明立绘

## 进度

- [x] Phase A：视觉 token、顶部三色线、图标系统、面板/按钮换肤
- [x] Phase B：Hero 场景 + 立绘
- [x] Phase B 调整：主列大 Hero 移到侧边栏顶部场景卡；图中只留地点名；图下按日期/时间/金钱三行显示，日期行预留未来日历；行动数从玩家界面移除
- [x] Phase C：名册头像与属性色（详细计划见 `docs/phase-c-plan.md`）
- [ ] C.1：地点角色条头像（可选，暂不做）
- [x] Phase D：固定侧边栏 / App Shell（调整后的顺序）
- [x] Phase E：地图与公交视觉（原 D）
- [ ] Phase F：响应式与可访问性收尾
- 后续路线图见 `docs/post-phase-c-roadmap.md`

## 目标

把参考项目的“闪耀色彩页游感”迁移到当前项目，同时保留 ShinyMemory 的开放模拟结构：

- 冷白、浅青蓝、粉/黄点缀的视觉语言；
- 角色立绘 + 地点场景 + 姓名标签对白；
- 线性图标、轻量面板、紧凑但可读的行动区；
- 规则网格地图，而不是参考项目的有机散布地图；
- 为后续固定侧边栏和更多功能预留结构。

## 非目标

- 不直接复制 Vue 组件。
- 不照搬参考项目的全部页面和信息架构。
- 不为了还原而使用 8–10px 小字号。
- 不改成有机散布地图；继续使用规则网格。
- 不在未确认素材授权的情况下公开发布官方立绘。

## 视觉 token

第一阶段替换当前暖米色为冷白/浅青，但保留当前项目的可读性。

```css
:root {
  --bg: #f4f9fc;
  --panel: rgba(255, 255, 255, 0.94);
  --panel-solid: #ffffff;
  --ink: #334960;
  --muted: #7c91a5;
  --faint: #a8bac7;
  --line: #e1edf3;

  --brand: #319bc5;
  --brand-strong: #2386ad;
  --pink: #e67da4;
  --yellow: #f5ca58;
  --purple: #9b7fc4;
  --green: #5fa88a;
  --red: #d47c7c;

  --accent: var(--brand);
  --accent-strong: var(--brand-strong);
  --gold: #d3a23e;
  --shadow: 0 4px 20px rgba(99, 139, 160, 0.08);
  --radius: 12px;
}
```

需要额外处理：

- `--accent` 从粉色改为青蓝色后，训练/工作/休息/自由等行动色调要单独定义，不能全部跟着变蓝；
- 训练：粉色；
- 工作：黄色/金色；
- 休息：绿色；
- 自由/交流：青蓝或紫色；
- 睡觉：低饱和紫色；
- 属性条：Vocal 粉、Dance 蓝、Expression 黄、Trust 紫。

## 字体与密度

- UI 使用当前无衬线字体栈；
- 品牌字保留当前衬线，作为 ShinyMemory 自身的识别；
- 正文从 16px 降到 15px 左右；
- 辅助信息最低 10–11px，不复制参考项目的 8px；
- 面板圆角从 20px 降到 12px 左右；
- 阴影减弱，边框更清晰。

## 资产

复制：

```text
public/assets/idols/mano-portrait.png
public/assets/idols/hiori-portrait.png
```

可选：

```text
public/assets/idols/mano-card.png
```

注意事项：

- 立绘是官方素材，仅适合本地/私人同人原型；
- 公开仓库或发布前需要替换为原创素材或取得授权；
- 两张立绘总量约 1MB，后续可转 WebP/AVIF；
- 巡的素材当前游戏未使用，不复制。

## 数据结构

`IdolDef` 增加可选字段：

```ts
portrait?: string;
quote?: string;
locationQuotes?: Partial<Record<string, string>>;
```

`LocationDef` 增加可选场景标识：

```ts
sceneKey?: 'office' | 'practice' | 'studio' | 'home' | 'station';
```

也可以不新增 `sceneKey`，直接使用 `location.id` 映射背景。

## 分阶段

### Phase A：视觉基础

交付：

- 替换 `src/index.css` 的 token；
- 顶部三色渐变线；
- 面板、按钮、输入、弹窗统一到新色板；
- 新增 React `GameIcon`，迁移参考项目的线性图标；
- 行动、状态、地图、公交先接入图标。

暂不改布局。

验收：

- 现有 107 个测试通过；
- 桌面/390px 无横向溢出；
- 颜色对比度可读；
- 不改变任何游戏逻辑。

估算：1–2 天。

### Phase B：Hero 场景 + 立绘

交付：

- `public/assets/idols/`；
- `IdolDef.portrait` / `quote`；
- 新增 `SceneHero` 组件；
- 先做“事务所”一个地点；
- 场景背景、地点名、当前在场偶像立绘、姓名标签对白；
- 无偶像在场时不显示立绘，只显示场景。

Hero 规格：

- 桌面高度 220–260px；
- 立绘高度约 330–380px，底部被对白框裁切；
- 移动端高度 180px，立绘约 260px；
- `object-fit: contain`，底部对齐；
- 对白框使用半透明白底 + 粉/蓝姓名标签。

验收：

- 真乃/灯织在场时立绘正确；
- 不在场时不显示；
- 移动端不溢出；
- 原有场景描述、行动、地图仍正常。

估算：2–3 天。

### Phase C：角色界面

交付：

- 名册卡加入头像；
- 当前偶像卡加入小头像；
- 属性条改为 Vocal 粉 / Dance 蓝 / Expression 黄 / Trust 紫；
- 共享体力/压力保持绿/红语义；
- 名册当前偶像标记、头像、属性布局统一。

估算：1–2 天。

### Phase D：地图与公交视觉

交付：

- 保留规则网格坐标；
- 地图加入点阵地面、淡色建筑块、圆形图标 pin、路线和图例；
- 当前节点使用实心青蓝，相邻节点白底青边，非相邻节点降低透明度；
- 公交/出租车弹窗改为图标行、右侧票价、底部现金；
- 路线描述保持固定车费/时间。

注意：

- 不改成参考项目的有机散布；
- 地图宽度继续与选项面板同宽；
- 不增加新的移动规则。

估算：1–2 天。

### Phase E：固定侧边栏 / 页面骨架

交付：

- 固定左侧栏；
- 品牌、时间、当前偶像小卡、主导航；
- 顶部面包屑/保存状态；
- 主内容区从顶部栏下方开始；
- 手机底栏导航。

这一步结构性最强，建议在 A–D 视觉方向确认后再做。

估算：3–5 天。

### Phase F：响应式与可访问性

交付：

- 390px / 768px / 1440px 三档检查；
- 弹窗焦点管理；
- 立绘懒加载；
- 减少动画；
- 键盘操作和对比度。

估算：1–2 天。

## 建议先做的第一个迭代

不要一次迁移全部。

建议第一个迭代只做：

1. 视觉 token；
2. 图标系统；
3. 事务所 Hero + 真乃/灯织立绘。

这样能最快判断“方向对不对”，再决定是否铺 5 个地点和固定侧边栏。

## 风险

- 官方立绘的授权与分发风险；
- Hero + 地图会让页面变长，需要控制高度；
- 只有偶像有立绘，NPC 没有立绘，场景可能出现“有对白无立绘”的不一致；
- 冷色主题可能与当前暖色品牌识别冲突，需要保留一个 ShinyMemory 自己的品牌元素；
- 固定侧边栏会改变现有三列布局，必须在视觉方向确认后再做；
- 不要把参考项目的 8px 密度直接搬过来。

## 待确认

- 是否接受冷白/浅青作为主底色；
- 品牌字保留衬线，还是改成参考项目的无衬线；
- 第一个 Hero 只做事务所，还是一次做 5 个地点；
- 固定侧边栏是现在做，还是 A–D 后做。
