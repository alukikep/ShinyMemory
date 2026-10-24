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
  day: number;
  minuteOfDay: number;
  text: string;
  tone: LogTone;
};

export type Phase =
  | 'plan'
  | 'activityResult'
  | 'event'
  | 'eventResult'
  | 'npc'
  | 'npcResult'
  | 'examMid'
  | 'examFinal'
  | 'ending';

export type GameState = {
  clock: { absoluteMinutes: number };
  locationId: string;
  actors: Record<string, ActorState>;
  stats: Record<StatKey, number>;
  money: number;
  flags: Record<string, boolean>;
  eventCooldowns: Record<string, number>;
  log: LogEntry[];
  phase: Phase;
  actionsTaken: number;
  nextLogId: number;
  rng: { seed: number; counter: number };
  pendingActivityId?: string;
  pendingEventId?: string;
  pendingActorId?: string;
  pendingTopicId?: string;
  pendingExam?: 'mid' | 'final';
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
  | { kind: 'actorAffinity'; actorId: string; delta: number }
  | { kind: 'log'; text: string; tone?: LogTone };

export type Condition =
  | { kind: 'dayAtLeast'; day: number }
  | { kind: 'weekAtLeast'; week: number }
  | { kind: 'timeWindow'; fromMinute: number; toMinute: number }
  | { kind: 'statAtLeast'; stat: StatKey; value: number }
  | { kind: 'statAtMost'; stat: StatKey; value: number }
  | { kind: 'npcAffinityAtLeast'; actorId: string; value: number }
  | { kind: 'npcAffinityAtMost'; actorId: string; value: number }
  | { kind: 'moneyAtMost'; value: number }
  | { kind: 'atLocation'; locationId: string }
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

export type TimeWindow = {
  fromMinute: number;
  toMinute: number;
};

export type ActorRole = 'staff' | 'idol' | 'rival';

export type ActorSchedule = {
  fromMinute: number;
  toMinute: number;
  locationId: string;
};

export type ActorTopic = {
  id: string;
  label: string;
  hint?: string;
  text: string;
  when?: Condition[];
  once?: boolean;
  cooldownMinutes?: number;
  effects: Effect[];
};

export type ActorDef = {
  id: string;
  name: string;
  role: ActorRole;
  description: string;
  color?: string;
  schedule: ActorSchedule[];
  topics: ActorTopic[];
};

export type ActorState = {
  id: string;
  affinity: number;
  flags: Record<string, boolean>;
  topicCooldowns: Record<string, number>;
};

export type ActivityKind =
  | 'training'
  | 'work'
  | 'rest'
  | 'bond'
  | 'explore'
  | 'sleep';

export type Availability =
  | { ok: true }
  | {
      ok: false;
      display: 'hide' | 'disable';
      reason: string;
    };

export type ActivityDef = {
  id: string;
  name: string;
  description: string;
  kind: ActivityKind;
  locations?: string[];
  durationMinutes: number;
  timeWindows?: TimeWindow[];
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
  durationMinutes?: number;
  effects: Effect[];
  result: string;
};

export type ActivitySelector =
  | { ids: string[] }
  | { kinds: ActivityKind[] };

export type EventDef = {
  id: string;
  title: string;
  when: Condition[];
  after?: ActivitySelector;
  afterNpc?: { ids: string[] };
  chance?: number;
  priority?: number;
  cooldownActions?: number;
  once?: boolean;
  weight?: number;
  text: string;
  choices: EventChoice[];
};

export type LocationDef = {
  id: string;
  name: string;
  description: string;
  isStart?: boolean;
  openHours?: TimeWindow[];
};

export type LocationView = {
  id: string;
  name: string;
  current: boolean;
  open: boolean;
};

export type EventContext = {
  lastActivityId?: string;
  lastActivityKind?: ActivityKind;
  locationId?: string;
  npcId?: string;
  topicId?: string;
};

export type TriggerReport = {
  eventId: string;
  eligible: boolean;
  reason?: 'condition' | 'after' | 'once' | 'cooldown';
  chanceRoll?: number;
  passedChance?: boolean;
  priority?: number;
  selected?: boolean;
};

export type SaveEnvelope = {
  schemaVersion: number;
  gameVersion: string;
  createdAt: string;
  state: GameState;
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
  | 'bond'
  | 'explore'
  | 'sleep';

export type ActionView = {
  id: string;
  label: string;
  hint?: string;
  disabled?: boolean;
  disabledReason?: string;
  tone?: ActionTone;
};

export type ActorView = {
  id: string;
  name: string;
  role: ActorRole;
  description: string;
  color?: string;
  affinity: number;
  enterActionId: string;
};

export type NpcPageView = {
  id: string;
  name: string;
  role: ActorRole;
  description: string;
  color?: string;
  affinity: number;
  leaveActionId: string;
};

export type SceneView = {
  id: string;
  phase: Phase;
  phaseLabel: string;
  title: string;
  subtitle?: string;
  locationName?: string;
  locations?: LocationView[];
  actors?: ActorView[];
  npc?: NpcPageView;
  blocks: TextBlock[];
  actions: ActionView[];
  layout: 'grid' | 'list';
};
