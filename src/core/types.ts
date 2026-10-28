export type SharedStatKey = 'stamina' | 'stress';
export type IdolStatKey = 'vocal' | 'dance' | 'expression' | 'trust';
export type ProducerStatKey = 'photography' | 'stamina';
export type StatKey = SharedStatKey | IdolStatKey;

export type Rank = 'F' | 'E' | 'D' | 'C' | 'B' | 'A' | 'S';
export type ExpTier = 1 | 3 | 5 | 10 | 20;

export type SharedStats = Record<SharedStatKey, number>;

export type IdolAttribute = {
  rank: Rank;
  exp: number;
  maxRank: Rank;
};

export type IdolStats = Record<IdolStatKey, IdolAttribute>;

export type ProducerStats = Record<ProducerStatKey, IdolAttribute>;

/**
 * 属性的统一引用：偶像属性挂在单个偶像身上，制作人属性对所有偶像全局生效。
 * 两者共用同一条 rank 曲线和同一套结算。
 */
export type AttributeRef =
  | { scope: 'idol'; key: IdolStatKey }
  | { scope: 'producer'; key: ProducerStatKey };

/** 内容里允许直接写偶像属性名，等价于 `{ scope: 'idol', key }`。 */
export type AttributeRefInput = IdolStatKey | AttributeRef;

export type WorkTerm = {
  ref: AttributeRefInput;
  weight?: number;
  multipliers?: Partial<Record<Rank, number>>;
};

export type WorkReward = {
  baseMoney: number;
  terms: WorkTerm[];
  /** 默认 `sum`：各项权重相加；`product`：各项倍率相乘（此时 weight 无效）。 */
  combine?: 'sum' | 'product';
};

export type WorkRisk = {
  /** 省略时对 `workReward.terms` 的每一项各算一次，取最差。 */
  ref?: AttributeRefInput;
  minRank?: Rank;
  safeRank: Rank;
  failureEventId?: string;
  successEventId?: string;
  failureByGap?: Partial<Record<number, number>>;
};

export type GrowthProfile = Record<
  IdolStatKey,
  { initial: Rank; max: Rank }
>;

export type IdolDef = {
  id: string;
  name: string;
  unit: string;
  color?: string;
  profile: string;
  portrait?: string;
  avatar?: string;
  quote?: string;
  isStart?: boolean;
  growth: GrowthProfile;
};

export type IdolState = {
  id: string;
  stats: IdolStats;
  status: IdolStatus;
  knownAt?: number;
  recruitedAt?: number;
};

export type IdolStatus = 'unknown' | 'known' | 'recruited';

export type StoryChainState = {
  chainId: string;
  stepIndex: number;
  nextEligibleDay?: number;
  completed?: boolean;
};

export type DialogueChoice = {
  label: string;
  nextNodeId: string;
  effects?: Effect[];
  requires?: Condition[];
};

export type DialogueTextVariant = {
  when: Condition[];
  text: string;
};

export type DialogueNode = {
  id: string;
  speakerId?: string;
  text: string;
  textVariants?: DialogueTextVariant[];
  nextNodeId?: string;
  choices?: DialogueChoice[];
  effects?: Effect[];
};

export type DialogueDef = {
  id: string;
  idolId?: string;
  /** 多人对话的参与者；文本里可用 {a} / {b}。 */
  participantIds?: string[];
  startNodeId: string;
  nodes: Record<string, DialogueNode>;
};

export type StoryChainStep = {
  id: string;
  locationId: string;
  timeWindow?: TimeWindow;
  minDaysAfterPrevious?: number;
  dialogueId: string;
  actionLabel: string;
  complete?: {
    status?: IdolStatus;
    nextStepDelayDays?: number;
  };
};

export type StoryChainDef = {
  id: string;
  idolId: string;
  priority?: number;
  steps: StoryChainStep[];
};

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
  | 'idol';

export type GameState = {
  clock: { absoluteMinutes: number };
  locationId: string;
  actors: Record<string, ActorState>;
  shared: SharedStats;
  producer: ProducerStats;
  idols: Record<string, IdolState>;
  selectedIdolId: string;
  money: number;
  inventory: Record<string, number>;
  shopPurchases: Record<string, number>;
  storyChains: Record<string, StoryChainState>;
  pendingDialogueId?: string;
  dialogueChainId?: string;
  dialogueNodeId?: string;
  dialogueTargetIdolId?: string;
  pendingDialogueCast?: string[];
  /** 对话结束后回到的状态与文案。 */
  dialogueReturnPhase?: Phase;
  dialogueReturnResult?: string;
  flags: Record<string, boolean>;
  jobs: JobAssignment[];
  eventCooldowns: Record<string, number>;
  log: LogEntry[];
  phase: Phase;
  actionsTaken: number;
  nextLogId: number;
  rng: { seed: number; counter: number };
  pendingActivityId?: string;
  pendingResults?: ActivityResultEntry[];
  pendingEventId?: string;
  pendingEventIdolId?: string;
  pendingEventCast?: string[];
  pendingChainEventId?: string;
  pendingActorId?: string;
  pendingIdolReturnId?: string;
  pendingTopicId?: string;
  lastResult?: string;
};

export type Effect =
  | { kind: 'sharedStat'; stat: SharedStatKey; delta: number }
  | {
      kind: 'attributeExp';
      ref: AttributeRefInput;
      tier: ExpTier;
      direction?: 'gain' | 'loss';
    }
  | { kind: 'money'; delta: number }
  | { kind: 'flag'; key: string; value: boolean }
  | { kind: 'actorAffinity'; actorId: string; delta: number }
  | { kind: 'log'; text: string; tone?: LogTone };

export type Condition =
  | { kind: 'dayAtLeast'; day: number }
  | { kind: 'weekAtLeast'; week: number }
  | { kind: 'timeWindow'; fromMinute: number; toMinute: number }
  | { kind: 'sharedStatAtLeast'; stat: SharedStatKey; value: number }
  | { kind: 'sharedStatAtMost'; stat: SharedStatKey; value: number }
  | { kind: 'attributeAtLeast'; ref: AttributeRefInput; rank: Rank }
  | { kind: 'attributeAtMost'; ref: AttributeRefInput; rank: Rank }
  | { kind: 'castPresent'; idolIds: string[] }
  | { kind: 'npcAffinityAtLeast'; actorId: string; value: number }
  | { kind: 'npcAffinityAtMost'; actorId: string; value: number }
  | { kind: 'moneyAtMost'; value: number }
  | { kind: 'atLocation'; locationId: string }
  | { kind: 'flag'; key: string; value?: boolean }
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

export type ActorRole = 'staff' | 'president' | 'idol' | 'rival';

export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type ActorSchedule = {
  fromMinute: number;
  toMinute: number;
  locationId?: string;
  weekdays?: Weekday[];
  label?: string;
  priority?: number;
  visibility?: 'public' | 'private';
  protected?: boolean;
};

export type ActorScheduleOverride = {
  id?: string;
  day: number;
  locationId?: string;
  fromMinute?: number;
  toMinute?: number;
  label?: string;
  visibility?: 'public' | 'private';
  mode?: 'add' | 'replace-day';
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
  overrides?: ActorScheduleOverride[];
  topics: ActorTopic[];
};

export type ActorState = {
  id: string;
  affinity: number;
  flags: Record<string, boolean>;
  topicCooldowns: Record<string, number>;
  scheduleOverrides?: ActorScheduleOverride[];
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

export type ActivityTarget = 'none' | 'present-idol' | 'all-present-idols';

export type ActivityResultEntry = {
  idolId: string;
  text: string;
};

export type ActivityDef = {
  id: string;
  name: string;
  description: string;
  kind: ActivityKind;
  target?: ActivityTarget;
  locations?: string[];
  durationMinutes: number;
  timeWindows?: TimeWindow[];
  cost: Cost;
  effects: Effect[];
  workReward?: WorkReward;
  workRisk?: WorkRisk;
  requires?: Condition[];
  resultTexts: string[];
  resultVariants?: { when: Condition[]; text: string }[];
};

export type JobDef = {
  id: string;
  name: string;
  description: string;
  locationId: string;
  fromMinute: number;
  toMinute: number;
  pay: number;
  label?: string;
  effects?: Effect[];
};

export type JobAssignment = {
  id: string;
  jobId: string;
  idolId: string;
  day: number;
  fromMinute: number;
  toMinute: number;
  locationId: string;
};

export type ItemCategory = 'gift' | 'keepsake' | 'consumable';

export type GiftPreference = {
  idolId: string;
  trustTier: ExpTier;
  reaction?: string;
};

export type ItemDef = {
  id: string;
  name: string;
  description: string;
  category: ItemCategory;
  price: number;
  icon?: string;
  shopId?: string;
  maxPurchases?: number;
  gift?: {
    defaultTrustTier: ExpTier;
    preferences?: GiftPreference[];
  };
};

export type ShopDef = {
  id: string;
  name: string;
  description: string;
  locationId: string;
  itemIds: string[];
};

export type EventChoice = {
  label: string;
  hint?: string;
  requires?: Condition[];
  durationMinutes?: number;
  effects: Effect[];
  result: string;
  nextEventId?: string;
  /** 选择后进入对话；对话结束回到事件结果。 */
  dialogueId?: string;
};

export type ActivitySelector =
  | { ids: string[] }
  | { kinds: ActivityKind[] };

export type EventEntry =
  | { kind: 'random' }
  | {
      kind: 'workOutcome';
      activityId: string;
      outcome: 'success' | 'failure';
    }
  | { kind: 'chain' };

export type EventDef = {
  id: string;
  title: string;
  when: Condition[];
  /** 显式组合：这些偶像必须全部在场。目前只支持 2 人。 */
  cast?: string[];
  /** 泛化组合：从在场偶像里随机挑 N 人。目前只支持 2。 */
  castSize?: number;
  /** 按组合（而不是按事件 id）计算的冷却行动数。 */
  pairCooldownActions?: number;
  entry?: EventEntry;
  nextEventId?: string;
  after?: ActivitySelector;
  afterNpc?: { ids: string[] };
  afterIdol?: { ids: string[] };
  chance?: number;
  priority?: number;
  cooldownActions?: number;
  once?: boolean;
  weight?: number;
  /** 支持 {a} / {b} 占位，按参与者顺序替换。 */
  text: string;
  choices: EventChoice[];
};

export type LocationKind = 'place' | 'station' | 'street';

export type LocationDef = {
  id: string;
  name: string;
  description: string;
  isStart?: boolean;
  kind?: LocationKind;
  mapX?: number;
  mapY?: number;
  reachable?: boolean;
};

export type MapEdgeDef = {
  from: string;
  to: string;
  minutes: number;
};

export type TransitRouteDef = {
  id: string;
  from: string;
  to: string;
  fare: number;
  minutes: number;
  label: string;
  kind: 'bus' | 'taxi';
};

export type LocationView = {
  id: string;
  name: string;
  current: boolean;
  minutes: number;
};

export type EventContext = {
  lastActivityId?: string;
  lastActivityKind?: ActivityKind;
  locationId?: string;
  npcId?: string;
  topicId?: string;
  idolId?: string;
};

export type CheckContext = {
  idolId?: string;
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
  contentEpoch: number;
  gameVersion: string;
  createdAt: string;
  state: GameState;
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

export type ActionCommand =
  | { type: 'move'; locationId: string }
  | { type: 'transit'; routeId: string }
  | { type: 'activity'; activityId: string; idolId?: string }
  | { type: 'enterNpc'; actorId: string }
  | { type: 'talk'; actorId: string; topicId: string }
  | { type: 'enterIdol'; idolId: string }
  | { type: 'train'; idolId: string; activityId: string }
  | { type: 'work'; idolId: string; activityId: string }
  | { type: 'acceptJob'; jobId: string; day: number }
  | { type: 'attendJob'; jobId: string }
  | { type: 'buyItem'; itemId: string }
  | { type: 'giveGift'; itemId: string; idolId: string }
  | { type: 'startStory'; chainId: string }
  | { type: 'dialogueAdvance' }
  | { type: 'dialogueChoice'; index: number }
  | { type: 'leaveNpc' }
  | { type: 'leaveIdol' }
  | { type: 'eventChoice'; index: number }
  | { type: 'continue' };

export type ActionView = {
  id: string;
  command: ActionCommand;
  label: string;
  hint?: string;
  icon?: string;
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
  affinity: number | string;
  relationshipLabel: string;
  entryLabel: string;
  enterCommand: ActionCommand;
};

export type NpcPageView = {
  id: string;
  name: string;
  role: ActorRole;
  description: string;
  color?: string;
  affinity: number;
};

export type IdolPageView = {
  id: string;
  name: string;
  unit: string;
  description: string;
  color?: string;
  avatar?: string;
  stats: IdolStats;
};

export type HeroView = {
  locationId: string;
  locationName: string;
  idolId?: string;
  idolName?: string;
  unit?: string;
  color?: string;
  portrait?: string;
  quote?: string;
};

export type SceneView = {
  id: string;
  phase: Phase;
  phaseLabel: string;
  title: string;
  subtitle?: string;
  locationName?: string;
  locations?: LocationView[];
  hero?: HeroView;
  actors?: ActorView[];
  npc?: NpcPageView;
  idol?: IdolPageView;
  blocks: TextBlock[];
  actions: ActionView[];
  layout: 'grid' | 'list';
};
