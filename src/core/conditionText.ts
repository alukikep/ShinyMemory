import { CONTENT_INDEX } from './contentIndex';
import { attributeLabel, formatFans } from './labels';
import { totalFans } from './sim';
import type { CheckContext, Condition, GameState } from './types';

/**
 * 把一条未满足的条件翻成人话，供手册与调试面板展示。
 * 返回 undefined 表示无法翻译，调用方应回退到通用句。
 *
 * 与 checkCondition 吃同一个 Condition 对象：新增条件类型时忘了写文案，
 * 只会退化成通用句，不会显示出错误的原因。
 */
export function describeCondition(
  condition: Condition,
  state: GameState,
  ctx: CheckContext = {},
): string | undefined {
  switch (condition.kind) {
    case 'moneyAtLeast': {
      const gap = condition.value - state.money;
      if (gap <= 0) return undefined;
      return `还差 ¥${gap.toLocaleString('zh-CN')}`;
    }
    case 'hasItem': {
      const need = condition.count ?? 1;
      const gap = need - (state.inventory[condition.itemId] ?? 0);
      if (gap <= 0) return undefined;
      const name =
        CONTENT_INDEX.items.get(condition.itemId)?.name ?? condition.itemId;
      return `还缺 ${name} ×${gap}`;
    }
    case 'idolStatus': {
      const idolId = condition.idolId ?? ctx.idolId ?? state.selectedIdolId;
      const idol = CONTENT_INDEX.idols.get(idolId);
      const current = state.idols[idolId]?.status;
      // 泄露护栏：还没有名字的人不能被写进手记
      if (!idol || !current || current === 'unknown') return undefined;
      return condition.status === 'recruited'
        ? `得先让${idol.name}加入`
        : `还得先正式认识${idol.name}`;
    }
    case 'attributeAtLeast':
      return `${attributeLabel(condition.ref)}还得练到 ${condition.rank}`;
    case 'castPresent': {
      const idols = condition.idolIds.map((id) => CONTENT_INDEX.idols.get(id));
      if (idols.some((idol) => !idol)) return undefined;
      const introduced = condition.idolIds.every((id) => {
        const status = state.idols[id]?.status;
        return Boolean(status) && status !== 'unknown';
      });
      if (!introduced) return undefined;
      return idols.length === 1
        ? `今天见不到${idols[0]!.name}`
        : '今天她们不在';
    }
    case 'atLocation': {
      const name = CONTENT_INDEX.locations.get(condition.locationId)?.name;
      return name ? `得回${name}一趟` : undefined;
    }
    case 'timeWindow':
    case 'dayAtLeast':
      return '过两天再说';
    case 'fansAtLeast': {
      // 门槛按事务所总粉丝（见 sim.totalFans）
      const gap = condition.value - totalFans(state);
      if (gap <= 0) return undefined;
      return `事务所粉丝还差 ${formatFans(gap)}`;
    }
    case 'varAtLeast': {
      const gap = condition.value - (state.vars?.[condition.key] ?? 0);
      if (gap <= 0) return undefined;
      return condition.label ? `${condition.label}还差 ${gap}` : undefined;
    }
    case 'varAtMost': {
      const gap = (state.vars?.[condition.key] ?? 0) - condition.value;
      if (gap <= 0) return undefined;
      return condition.label ? `${condition.label}还差 ${gap}` : undefined;
    }
    default:
      return undefined;
  }
}
