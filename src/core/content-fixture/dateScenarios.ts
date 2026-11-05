import type { DateScenarioDef, DialogueDef } from '../types';

/** Synthetic mechanism fixture. Not character writing, not production content. */
export const DATE_TEST_DIALOGUE: DialogueDef = {
  id: 'fixture.date.mano', idolId: 'mano', startNodeId: 'start',
  nodes: {
    start: { id: 'start', text: '【机制测试】选择约会结果档位。', choices: [
      { label: '测试：合适选择', nextNodeId: 'end', effects: [{ kind: 'attributeExp', ref: 'trust', tier: 20 }] },
      { label: '测试：普通选择', nextNodeId: 'end', effects: [{ kind: 'attributeExp', ref: 'trust', tier: 10 }] },
      { label: '测试：不合适选择', nextNodeId: 'end' },
    ] },
    end: { id: 'end', text: '【机制测试】约会结束。', effects: [{ kind: 'flag', key: 'fixture.date.choiceApplied', value: true }] },
  },
};
export const DATE_TEST_SCENARIO: DateScenarioDef = {
  id: 'fixture.date.park', title: '【机制测试】公园约会', idolId: 'mano', locationId: 'park',
  dialogueId: DATE_TEST_DIALOGUE.id, fee: 1000, durationMinutes: 60, arrivalWindowMinutes: 30, penaltyTier: 10, rewardBudget: 20,
};
