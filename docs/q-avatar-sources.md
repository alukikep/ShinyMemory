# Q 版头像素材来源

调研日期：2026-10-25。

## 结论

在萌娘共享找到了 `Sc_sdportrait_*` 系列 Q 版头像：

- 180 × 180 PNG；
- RGBA 透明背景；
- 头部/肩部裁切；
- 画风统一，适合侧边栏、名册、偶像页的小头像。

示例：

![Q 版头像示例](../screenshots/q-avatar-samples.png)

已找到 **26 名角色** 的 Q 版头像：

- 01–25 的 25 名角色；
- CoMETIK 的斑鸠路加（文件编号 201）。

暂缺：

- 铃木羽那；
- 郁田阳希。

这两名 CoMETIK 成员在萌娘共享没有对应的 `Sc_sdportrait` 文件；其角色页只有非 Q 版全身立绘。

## 来源

总索引：

- [User:Caiseni/shinycolorsindex](https://zh.moegirl.org.cn/User:Caiseni/shinycolorsindex)

单文件示例：

- [File:Sc sdportrait 01 mano.png](https://commons.moegirl.org.cn/index.php?title=File:Sc_sdportrait_01_mano.png)
- [File:Sc sdportrait 201 luca.png](https://commons.moegirl.org.cn/index.php?title=File:Sc_sdportrait_201_luca.png)

素材说明：

- 文件页标注“原作者保留权利”；
- 萌娘百科以非盈利介绍目的使用；
- 不是 CC0/公有领域素材；
- 公开分发或商业使用前需要另行确认授权。

## 文件列表

### illumination STARS

| 编号 | 角色 | 文件 |
|---|---|---|
| 01 | 樱木真乃 | `Sc_sdportrait_01_mano.png` |
| 02 | 风野灯织 | `Sc_sdportrait_02_hiori.png` |
| 03 | 八宫巡 | `Sc_sdportrait_03_meguru.png` |

### L'Antica

| 编号 | 角色 | 文件 |
|---|---|---|
| 04 | 月冈恋钟 | `Sc_sdportrait_04_kogane.png` |
| 05 | 田中摩美々 | `Sc_sdportrait_05_mamimi.png` |
| 06 | 白濑咲耶 | `Sc_sdportrait_06_sakuya.png` |
| 07 | 三峰结华 | `Sc_sdportrait_07_yuika.png` |
| 08 | 幽谷雾子 | `Sc_sdportrait_08_kiriko.png` |

### 放学后 CLIMAX GIRLS

| 编号 | 角色 | 文件 |
|---|---|---|
| 09 | 小宫果穗 | `Sc_sdportrait_09_kaho.png` |
| 10 | 园田智代子 | `Sc_sdportrait_10_chiyoko.png` |
| 11 | 西城树里 | `Sc_sdportrait_11_juri.png` |
| 12 | 杜野凛世 | `Sc_sdportrait_12_rinze.png` |
| 13 | 有栖川夏叶 | `Sc_sdportrait_13_natsuha.png` |

### ALSTROEMERIA

| 编号 | 角色 | 文件 |
|---|---|---|
| 14 | 大崎甘奈 | `Sc_sdportrait_14_amana.png` |
| 15 | 大崎甜花 | `Sc_sdportrait_15_tenka.png` |
| 16 | 桑山千雪 | `Sc_sdportrait_16_chiyuki.png` |

### Straylight

| 编号 | 角色 | 文件 |
|---|---|---|
| 17 | 芹泽朝日 | `Sc_sdportrait_17_asahi.png` |
| 18 | 黛冬优子 | `Sc_sdportrait_18_fuyuko.png` |
| 19 | 和泉爱依 | `Sc_sdportrait_19_mei.png` |
| 20 | 浅仓透 | `Sc_sdportrait_20_tooru.png` |

### noctchill

| 编号 | 角色 | 文件 |
|---|---|---|
| 21 | 樋口圆香 | `Sc_sdportrait_21_madoka.png` |
| 22 | 福丸小糸 | `Sc_sdportrait_22_koito.png` |
| 23 | 市川雏菜 | `Sc_sdportrait_23_hinana.png` |

### SHHis

| 编号 | 角色 | 文件 |
|---|---|---|
| 24 | 七草日花 | `Sc_sdportrait_24_nichika.png` |
| 25 | 绯田美琴 | `Sc_sdportrait_25_mikoto.png` |

### CoMETIK

| 编号 | 角色 | 文件 |
|---|---|---|
| 201 | 斑鸠路加 | `Sc_sdportrait_201_luca.png` |
| — | 铃木羽那 | 暂缺 |
| — | 郁田阳希 | 暂缺 |

## 建议下载结构

如果确认素材，下载为：

```text
public/assets/idols/q/
  mano.png
  hiori.png
  meguru.png
  kogane.png
  mamimi.png
  ...
  luca.png
```

当前游戏只使用：

```text
mano.png
hiori.png
```

其他角色先保留为未来扩展素材，不接入内容数据。

## 建议接入方式

- 侧边栏当前偶像卡：44 × 55；
- 名册卡：78 × 96；
- 偶像页：56 × 70；
- 使用 `object-fit: contain` 或 `cover`；
- 透明背景，不裁掉头部；
- 不再使用全身立绘做小头像。

## 待确认

1. 是否确认这套 `Sc_sdportrait` 就是想要的 Q 版头像；
2. 是否先下载全部 26 张；
3. 铃木羽那、郁田阳希：
   - 暂时留空；
   - 用非 Q 版头像占位；
   - 或另找来源。

确认后再下载并接入，避免先搬错素材。
