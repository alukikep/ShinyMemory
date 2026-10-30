export type SharedStatKey = 'stamina' | 'stress';
export type IdolStatKey = 'vocal' | 'dance' | 'expression' | 'trust';
export type ProducerStatKey =
  | 'photography'
  | 'negotiation'
  | 'planning'
  | 'insight'
  | 'stamina';
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
  /** 初始粉丝数；缺省 0。已经出道的偶像可以给一个非零起点。 */
  fans?: number;
  growth: GrowthProfile;
};

export type IdolState = {
  id: string;
  stats: IdolStats;
  status: IdolStatus;
  /** 粉丝数。只增不减的累计值，不进 rank 曲线。 */
  fans: number;
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
  /** 这一步的额外前置条件；不满足时地点页不出现行动，手册显示原因。 */
  when?: Condition[];
  /** 这一步完成时结算一次。 */
  effects?: Effect[];
  complete?: {
    status?: IdolStatus;
    nextStepDelayDays?: number;
  };
};

export type StoryChainDef = {
  id: string;
  idolId: string;
  priority?: number;
  /** 手册条目标题；缺省回退到「偶像名 · 首步标签」。 */
  title?: string;
  /** 链尚未启动时，满足它就允许出现在手册里。 */
  revealWhen?: Condition[];
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
  /** 当前打开的偶像页；侧边栏与派活看的是 focusIdolId。 */
  selectedIdolId: string;
  /** 玩家指定的「重点培养」偶像：侧边栏显示她，工作默认派给她。 */
  focusIdolId: string;
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
  /** 定时事件 → 上次触发的日，用于同日去重。 */
  scheduledDays?: Record<string, number>;
  /** 通用数值状态；未写过的键读作 0。 */
  vars?: Record<string, number>;
  /** 一次性延迟触发的待办，按绝对日排队。 */
  pendingEvents?: { eventId: string; day: number }[];
  /** 槽位键（charm1…）→ 饰品 id。倍率是派生值，不入档。 */
  equipment?: Record<string, string>;
  ownedEquips?: string[];
  /** 某个槽位的数量；缺省取各槽的默认值。 */
  slots?: Partial<Record<EquipSlot, number>>;
  jobs: JobAssignment[];
  /** 每份工作最后一次完成的日期，冷却从这天算起。 */
  jobCooldowns: Record<string, number>;
  eventCooldowns: Record<string, number>;
  log: LogEntry[];
  phase: Phase;
  actionsTaken: number;
  nextLogId: number;
  rng: { seed: number; counter: number };
  pendingActivityId?: string;
  /** 有检定的行动：这次是成功还是失败。 */
  pendingActivityPassed?: boolean;
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

export type ModifierKey =
  | 'staminaCost'
  | 'staminaCap'
  | 'duration'
  | 'travel'
  | 'trainingExp'
  | 'workMoney';

/**
 * 一条加成。同类相加、跨类相乘，由 resolveModifiers 统一结算；
 * 中间层不要取整。
 */
export type Modifier = {
  key: ModifierKey;
  /** 缺省 mul。mul 连乘，add 先各自相加。 */
  op?: 'mul' | 'add';
  value: number;
  /** 不满足时这条不生效。 */
  when?: Condition[];
  /** 只对某个偶像生效；省略 = 全体。 */
  idolId?: string;
};

export type EquipSlot = 'charm';

export type EquipDef = {
  id: string;
  name: string;
  slot: EquipSlot;
  description: string;
  modifiers: Modifier[];
  icon?: string;
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
  | { kind: 'var'; key: string; op?: 'set' | 'add'; value: number }
  /** 粉丝数。`idolId` 省略时取当前偶像上下文。 */
  | { kind: 'fans'; idolId?: string; op?: 'set' | 'add'; value: number }
  | { kind: 'scheduleEvent'; eventId: string; inDays: number }
  | { kind: 'unlockSlot'; slot: EquipSlot; amount?: number }
  | { kind: 'grantEquip'; equipId: string }
  | {
      /** 改写某个角色接下来几天的日程；不给 locationId 就是"这几天不在任何地方"。 */
      kind: 'scheduleOverride';
      actorId: string;
      /** 从生效当天算起第几天开始，默认 0。 */
      dayOffset?: number;
      /** 连续几天，默认 1。 */
      days?: number;
      locationId?: string;
      fromMinute?: number;
      toMinute?: number;
      label?: string;
      mode?: 'add' | 'replace-day';
      id?: string;
    }
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
  | { kind: 'moneyAtLeast'; value: number }
  | { kind: 'hasItem'; itemId: string; count?: number }
  /** `idolId` 省略时取上下文偶像；`recruited` 满足 `known` 的要求。 */
  | { kind: 'idolStatus'; idolId?: string; status: IdolStatus }
  | { kind: 'atLocation'; locationId: string }
  | { kind: 'flag'; key: string; value?: boolean }
  /** 数值变量；未写过 = 0。label 只用于显示，参与不了结算。 */
  | { kind: 'varAtLeast'; key: string; value: number; label?: string }
  | { kind: 'varAtMost'; key: string; value: number; label?: string }
  /** 粉丝数；`idolId` 省略时取上下文偶像。 */
  | { kind: 'fansAtLeast'; idolId?: string; value: number }
  | { kind: 'fansAtMost'; idolId?: string; value: number }
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
  /** 有检定时记录成败，供结果页显示。 */
  passed?: boolean;
};

export type ActivityCheck = {
  ref: AttributeRefInput;
  difficulty: Rank;
  /** 概率微调，单位百分点。 */
  shift?: number;
};

export type ActivityDef = {
  id: string;
  name: string;
  description: string;
  kind: ActivityKind;
  target?: ActivityTarget;
  /**
   * 这条行动只属于这些偶像；省略 = 全员通用。
   * 不匹配时整条隐藏（不是禁用），且只对 present-idol / all-present-idols 有意义。
   */
  idolIds?: string[];
  locations?: string[];
  durationMinutes: number;
  timeWindows?: TimeWindow[];
  cost: Cost;
  effects: Effect[];
  /** 存在时先掷骰：成功走 effects/resultTexts，失败走下面两条。 */
  check?: ActivityCheck;
  failureEffects?: Effect[];
  failureTexts?: string[];
  workReward?: WorkReward;
  workRisk?: WorkRisk;
  requires?: Condition[];
  resultTexts: string[];
  resultVariants?: { when: Condition[]; text: string }[];
};

export type JobCheck = {
  ref: AttributeRefInput;
  difficulty: Rank;
  /** 概率微调，单位百分点。 */
  shift?: number;
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
  /** 存在时出发前掷骰：成功拿全款，失败按比例结算并走 failureEffects。 */
  check?: JobCheck;
  /** 失败时的报酬比例，缺省 0.5。 */
  failurePayRatio?: number;
  failureEffects?: Effect[];
  /** 结果页的描述文本；没有时退回 description。 */
  resultTexts?: string[];
  failureTexts?: string[];
  /** 全部满足才会出现在工作面板里（交涉、人脉解锁用）。 */
  requires?: Condition[];
  /** 工作完成后的冷却天数，缺省 0（次日即可再接）。 */
  cooldownDays?: number;
};

export type JobBoardOffer = {
  idolId: string;
  idolName: string;
  day: number;
  dayLabel: string;
  chance?: number;
  checkLabel?: string;
  command?: ActionCommand;
  disabledReason?: string;
};

export type JobBoardEntry = {
  jobId: string;
  name: string;
  description: string;
  locationName: string;
  timeLabel: string;
  pay: number;
  checkText?: string;
  /** 检定用的偶像属性，界面上用来显示 Vo / Da / Vi 徽标。 */
  checkStat?: StatKey;
  /** 只用于调试/日志；界面只显示「未解锁」。 */
  lockedReason?: string;
  locked: boolean;
  /** 已派出 / 冷却中：这份工作暂时没人能接。 */
  busyReason?: string;
  offers: JobBoardOffer[];
};

export type JobBoardView = {
  entries: JobBoardEntry[];
  focusIdolId: string;
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
  | { kind: 'chain' }
  /** 到达某个地点时触发；不参与行动后的随机池。 */
  | { kind: 'arrival' };

/** 跟时间走的触发；带 trigger 的事件不参与行动后的随机池。 */
export type EventTrigger = {
  /** 每 N 天一次，从第 1 天起算。与 weekday 二选一。 */
  everyDays?: number;
  weekday?: Weekday;
  /** 当天这个时间之后才算到点。 */
  atMinute: number;
};

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
  trigger?: EventTrigger;
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
  | { type: 'acceptJob'; jobId: string; day: number; idolId?: string }
  | { type: 'setFocusIdol'; idolId: string }
  | { type: 'openJobBoard' }
  | { type: 'attendJob'; jobId: string }
  | { type: 'buyItem'; itemId: string }
  | { type: 'equip'; equipId: string }
  | { type: 'unequip'; slotKey: string }
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
  fans: number;
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
