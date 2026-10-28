import type { EventDef } from '../../../../types';

const card: EventDef = {
  id: 'evt.shopping_window',
  title: '橱窗里的新海报',
  when: [{ kind: 'atLocation', locationId: 'shopping_street' }],
  after: { ids: ['look_around'] },
  once: true,
  weight: 20,
  text: '商业街的橱窗换上了新海报。你一眼认出站在最边上的她。',
  choices: [
    {
      label: '拍下来发给她',
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 1 },
        { kind: 'sharedStat', stat: 'stress', delta: -1 },
      ],
      result: '她回了一个很短的消息：“拍得还行。”后面跟着一个小小的表情。',
    },
    {
      label: '多看一会儿',
      effects: [
        { kind: 'sharedStat', stat: 'stress', delta: -2 },
      ],
      result: '海报上的她比平时更亮一点。你站了一会儿，才想起还有安排。',
    },
  ],
};

export default card;
