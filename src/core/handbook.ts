import { CONTENT_INDEX } from './contentIndex';
import { attributeLabel } from './labels';
import type { CheckContext, Condition, GameState } from './types';

/**
 * 把一条未满足的条件翻成人话，供手册展示。
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
      const name = CONTENT_INDEX.items.get(condition.itemId)?.name ?? condition.itemId;
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
    case 'atLocation': {
      const name = CONTENT_INDEX.locations.get(condition.locationId)?.name;
      return name ? `得回${name}一趟` : undefined;
    }
    case 'timeWindow':
    case 'dayAtLeast':
      return '过两天再说';
    default:
      return undefined;
  }
}
