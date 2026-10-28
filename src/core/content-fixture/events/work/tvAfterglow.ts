import type { EventDef } from '../../../types';

const event: EventDef = {
  id: 'evt.tv_afterglow',
  title: '第二天的回音',
  entry: { kind: 'chain' },
  when: [],
  text: '第二天，节目片段在社交平台上被转了几次。事务所的电话比平时多。',
  choices: [
    {
      label: '把消息告诉她',
      hint: '目标偶像信任 EXP +1',
      effects: [{ kind: 'attributeExp', ref: 'trust', tier: 1 }],
      result: '她看着屏幕，先是愣住，然后把手机递还给你，耳朵有点红。',
    },
  ],
};

export default event;
