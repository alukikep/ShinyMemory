export type StatKey =
  | 'vocal'
  | 'dance'
  | 'expression'
  | 'stamina'
  | 'stress'
  | 'trust';

export type LogTone = 'info' | 'good' | 'bad';

export type LogEntry = {
  id: number;
  week: number;
  slot: number;
  text: string;
  tone: LogTone;
};

export type Phase =
  | 'plan'
  | 'activityResult'
  | 'event'
  | 'eventResult'
  | 'examMid'
  | 'examFinal'
  | 'ending';

export type GameState = {
  week: number;
  slot: 0 | 1;
  stats: Record<StatKey, number>;
  money: number;
  flags: Record<string, boolean>;
  log: LogEntry[];
  phase: Phase;
  actionsTaken: number;
  nextLogId: number;
  rng: { seed: number; counter: number };
  pendingActivityId?: string;
  pendingEventId?: string;
  lastResult?: string;
  examScore?: number;
  examPassed?: boolean;
  examParts?: { label: string; value: number }[];
  endingId?: string;
  midExamDone: boolean;
  finalExamDone: boolean;
};

export type Effect =
  | { kind: 'stat'; stat: StatKey; delta: number }
  | { kind: 'money'; delta: number }
  | { kind: 'flag'; key: string; value: boolean }
  | { kind: 'log'; text: string; tone?: LogTone };

export type Condition =
  | { kind: 'weekAtLeast'; week: number }
  | { kind: 'statAtLeast'; stat: StatKey; value: number }
  | { kind: 'statAtMost'; stat: StatKey; value: number }
  | { kind: 'moneyAtMost'; value: number }
  | { kind: 'flag'; key: string; value?: boolean }
  | { kind: 'scoreAtLeast'; value: number }
  | { kind: 'scoreAtMost'; value: number }
  | { kind: 'all'; of: Condition[] }
  | { kind: 'any'; of: Condition[] }
  | { kind: 'not'; of: Condition };

export type Cost = {
  money?: number;
  stamina?: number;
};

export type ActivityKind = 'training' | 'work' | 'rest' | 'bond';

export type ActivityDef = {
  id: string;
  name: string;
  description: string;
  kind: ActivityKind;
  cost: Cost;
  effects: Effect[];
  requires?: Condition[];
  resultTexts: string[];
  resultVariants?: { when: Condition[]; text: string }[];
};

export type EventChoice = {
  label: string;
  hint?: string;
  requires?: Condition[];
  effects: Effect[];
  result: string;
};

export type EventDef = {
  id: string;
  title: string;
  when: Condition[];
  once?: boolean;
  weight?: number;
  text: string;
  choices: EventChoice[];
};

export type EndingDef = {
  id: string;
  title: string;
  when: Condition[];
  text: string;
  accent: 'true' | 'normal' | 'bad';
};

export type TextBlock = {
  kind: 'p' | 'quote' | 'system';
  text: string;
};

export type ActionTone =
  | 'primary'
  | 'secondary'
  | 'danger'
  | 'training'
  | 'work'
  | 'rest'
  | 'bond';

export type ActionView = {
  id: string;
  label: string;
  hint?: string;
  disabled?: boolean;
  disabledReason?: string;
  tone?: ActionTone;
};

export type SceneView = {
  id: string;
  phase: Phase;
  phaseLabel: string;
  title: string;
  subtitle?: string;
  blocks: TextBlock[];
  actions: ActionView[];
  layout: 'grid' | 'list';
};
