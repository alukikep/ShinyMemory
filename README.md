# ShinyMemory

《偶像大师 闪耀色彩》同人生活模拟游戏（开发中）。

一个以“制作人”为视角、文本为主、数据驱动的生活模拟 / 经营游戏。
不追求堆剧情，而是用日程、状态、关系和事件池让每一周产生自己的故事。

## 文档

- [游戏思考](游戏思考.md)
- [设计笔记 v0.1](设计笔记-v0.1.md)
- [技术选型 v1.0](技术选型.md)
- [内容审核流程](workshop/README.md)

## 技术栈（已确认）

TypeScript · Vite · React · Zustand · Zod · IndexedDB (Dexie) · Tailwind CSS

核心模拟层是纯 TypeScript，不依赖 React；React 只负责显示和输入。

## 目录

```
content/    已审核内容（游戏构建只读这里）
workshop/   候选区（AI 草稿、打回、废弃、批次报告）
review/     审核决定记录
canon/      角色口吻、时间线、风格指南
prompts/    版本化的生成/审核提示词
```

## 状态

策划阶段，尚未开始编码。当前在确定游戏驱动模型、内容审核流程和技术栈。

## 仓库

私有仓库。`workshop/` 中的 AI 草稿不要提交到公开仓库。
