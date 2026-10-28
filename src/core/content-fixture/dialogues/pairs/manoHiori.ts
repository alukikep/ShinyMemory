import type { DialogueDef } from '../../../types';

/** 双人对话：参与者按 participantIds 顺序对应 {a} / {b}。 */
export const PAIR_MANO_HIORI: DialogueDef = {
  id: 'dialogue.pair.mano_hiori',
  participantIds: ['mano', 'hiori'],
  startNodeId: 'start',
  nodes: {
    start: {
      id: 'start',
      speakerId: 'mano',
      text: '{a}把便当盒推到中间，{b}没有客气，先夹了一块。',
      nextNodeId: 'reply',
    },
    reply: {
      id: 'reply',
      speakerId: 'hiori',
      text: '“你也吃啊。”{b}说这句话的时候没有抬头。',
      nextNodeId: 'end',
    },
    end: {
      id: 'end',
      speakerId: 'mano',
      text: '{a}应了一声，把最后一块留给了{b}。',
    },
  },
};
