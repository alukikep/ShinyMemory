// 由 `npm run content:sync` 生成，不要手改。
// 来源：content-review/approved/*.json
import type { ApprovedContent } from './approvedPacking';

export const APPROVED_CONTENT: ApprovedContent = {
  activities: [
{
  "id": "activity.carry_gear",
  "name": "帮忙搬器材",
  "description": "录音棚缺人手，灯架和音箱都得从楼下搬上来。",
  "kind": "work",
  "target": "none",
  "locations": [
    "studio"
  ],
  "durationMinutes": 30,
  "timeWindows": [
    {
      "fromMinute": 480,
      "toMinute": 1200
    }
  ],
  "cost": {
    "stamina": 12
  },
  "effects": [
    {
      "kind": "money",
      "delta": 220
    },
    {
      "kind": "attributeExp",
      "ref": {
        "scope": "producer",
        "key": "stamina"
      },
      "tier": 3
    },
    {
      "kind": "sharedStat",
      "stat": "stress",
      "delta": 2
    }
  ],
  "resultTexts": [
    "最后一趟上楼的时候，你的手已经在抖了。",
    "师傅教你怎么抱音箱不伤腰，你试了两次才学会。",
    "搬完你在楼梯口坐了一会儿，才想起来还有别的事。"
  ]
},
{
  "id": "activity.daily_errand",
  "name": "发传单",
  "description": "商业街的店在找人手，站一会儿，按小时结。",
  "kind": "work",
  "target": "none",
  "locations": [
    "shopping_street",
    "station"
  ],
  "durationMinutes": 30,
  "timeWindows": [
    {
      "fromMinute": 480,
      "toMinute": 1200
    }
  ],
  "cost": {
    "stamina": 8
  },
  "effects": [
    {
      "kind": "money",
      "delta": 280
    },
    {
      "kind": "attributeExp",
      "ref": {
        "scope": "producer",
        "key": "negotiation"
      },
      "tier": 3
    },
    {
      "kind": "sharedStat",
      "stat": "stress",
      "delta": 3
    }
  ],
  "resultTexts": [
    "有人接了传单，有人绕开。你数了数剩下的，够交差。",
    "风把传单吹跑了几张，你追出去两条街。",
    "派到最后，你学会了看人——哪些人不会伸手。"
  ]
},
{
  "id": "activity.hiori.review",
  "name": "听她复盘",
  "description": "收工之后，她把自己今天做错的地方一条条说出来。",
  "kind": "bond",
  "target": "present-idol",
  "idolIds": [
    "hiori"
  ],
  "locations": [
    "studio"
  ],
  "durationMinutes": 30,
  "timeWindows": [
    {
      "fromMinute": 960,
      "toMinute": 1080
    }
  ],
  "cost": {
    "stamina": 4
  },
  "effects": [
    {
      "kind": "attributeExp",
      "ref": "trust",
      "tier": 5
    },
    {
      "kind": "attributeExp",
      "ref": "expression",
      "tier": 1
    },
    {
      "kind": "sharedStat",
      "stat": "stress",
      "delta": -5
    }
  ],
  "resultTexts": [
    "她列了四条，第三条说完停住，说这条不算，是我自己太在意。",
    "你只是听着，没有安慰。她说完之后道了声谢，语气比平时轻。",
    "复盘到一半她抬头：你在记吗。你说在记。她没有再问。"
  ]
},
{
  "id": "activity.hiori.transposition",
  "name": "陪她练到满意为止",
  "description": "她说状态不错，想再多练一会儿。",
  "kind": "bond",
  "target": "present-idol",
  "idolIds": [
    "hiori"
  ],
  "locations": [
    "practice_room"
  ],
  "durationMinutes": 30,
  "timeWindows": [
    {
      "fromMinute": 600,
      "toMinute": 900
    }
  ],
  "cost": {
    "stamina": 8
  },
  "effects": [
    {
      "kind": "attributeExp",
      "ref": "trust",
      "tier": 5
    },
    {
      "kind": "attributeExp",
      "ref": "vocal",
      "tier": 1
    },
    {
      "kind": "sharedStat",
      "stat": "stress",
      "delta": 3
    }
  ],
  "resultTexts": [
    "又练了一遍。她停下来，说：没有。练到满意为止会没完没了，考虑到明天，到这里该停了。",
    "「不要勉强自己。」她想了想，回了一句：那我只做必要的练习。",
    "她把毛巾搭在肩上，说明天再继续。走之前回头看了一眼镜子。"
  ]
},
{
  "id": "activity.mano.extra_practice",
  "name": "陪她加练",
  "description": "她说最后那两拍还不对，问你能不能再看一遍。",
  "kind": "bond",
  "target": "present-idol",
  "idolIds": [
    "mano"
  ],
  "locations": [
    "practice_room"
  ],
  "durationMinutes": 30,
  "timeWindows": [
    {
      "fromMinute": 480,
      "toMinute": 810
    }
  ],
  "cost": {
    "stamina": 8
  },
  "effects": [
    {
      "kind": "attributeExp",
      "ref": {
        "scope": "idol",
        "key": "trust"
      },
      "tier": 5
    },
    {
      "kind": "attributeExp",
      "ref": {
        "scope": "idol",
        "key": "expression"
      },
      "tier": 1
    },
    {
      "kind": "sharedStat",
      "stat": "stress",
      "delta": 3
    }
  ],
  "resultTexts": [
    "她数着拍子走了第七遍，终于停下来，说这次好像对了。",
    "你站在镜子侧边看她的脚。她说被看着会更紧张，但还是继续了。",
    "跳到一半她突然笑出来，说刚才那个动作自己都觉得奇怪。"
  ]
},
{
  "id": "activity.mano.pigeons",
  "name": "一起喂鸽子",
  "description": "傍晚的公园，她蹲在长椅边上，手心里还剩一点面包屑。",
  "kind": "bond",
  "target": "present-idol",
  "idolIds": [
    "mano"
  ],
  "locations": [
    "park"
  ],
  "durationMinutes": 30,
  "timeWindows": [
    {
      "fromMinute": 1080,
      "toMinute": 1170
    }
  ],
  "cost": {
    "stamina": 5
  },
  "effects": [
    {
      "kind": "attributeExp",
      "ref": {
        "scope": "idol",
        "key": "trust"
      },
      "tier": 5
    },
    {
      "kind": "sharedStat",
      "stat": "stress",
      "delta": -6
    }
  ],
  "resultTexts": [
    "她把手摊平不动，等了很久，才有一只鸽子跳上来。",
    "「它们认得我吗。」她小声问，没等你回答就自己点了头。",
    "面包屑用完以后她还在原地蹲着，看鸽子散开。"
  ]
},
{
  "id": "activity.meguru.after_practice",
  "name": "收工以后",
  "description": "练习结束，她还没走。你想确认一下她的状态。",
  "kind": "bond",
  "target": "present-idol",
  "idolIds": [
    "meguru"
  ],
  "locations": [
    "practice_room"
  ],
  "durationMinutes": 30,
  "timeWindows": [
    {
      "fromMinute": 900,
      "toMinute": 960
    }
  ],
  "cost": {
    "stamina": 4
  },
  "effects": [
    {
      "kind": "attributeExp",
      "ref": "trust",
      "tier": 5
    },
    {
      "kind": "sharedStat",
      "stat": "stress",
      "delta": -6
    }
  ],
  "resultTexts": [
    "「诶？我没事哦！」她说得有点快。你没接话，她停了一下，说「……其实有一点累」。",
    "她把毛巾叠得很整齐，说这样明天用起来方便。",
    "「制作人，你每次都留到最后呢。」她说完自己点了点头。"
  ]
},
{
  "id": "activity.meguru.park_help",
  "name": "陪她去球场",
  "description": "她说就去看一眼，结果一进场就被拉上场了。",
  "kind": "bond",
  "target": "present-idol",
  "idolIds": [
    "meguru"
  ],
  "locations": [
    "park"
  ],
  "durationMinutes": 30,
  "timeWindows": [
    {
      "fromMinute": 960,
      "toMinute": 1080
    }
  ],
  "cost": {
    "stamina": 9
  },
  "effects": [
    {
      "kind": "attributeExp",
      "ref": "trust",
      "tier": 5
    },
    {
      "kind": "attributeExp",
      "ref": "dance",
      "tier": 1
    },
    {
      "kind": "sharedStat",
      "stat": "stress",
      "delta": -4
    }
  ],
  "resultTexts": [
    "她连着投中三个，回头冲你比了个手势。第四个没进，她自己先笑了。",
    "朋友说\"巡的朋友也一起打啊\"，她看了你一眼，好像在等你点头。",
    "散场以后她坐在球场边喝水，说好久没打得这么开心了。"
  ]
},
{
  "id": "activity.office_filing",
  "name": "整理资料",
  "description": "把抽屉里那堆通告单和合同按日期重新排一遍。",
  "kind": "work",
  "target": "none",
  "locations": [
    "office"
  ],
  "durationMinutes": 30,
  "timeWindows": [
    {
      "fromMinute": 480,
      "toMinute": 1200
    }
  ],
  "cost": {
    "stamina": 4
  },
  "effects": [
    {
      "kind": "money",
      "delta": 150
    },
    {
      "kind": "attributeExp",
      "ref": {
        "scope": "producer",
        "key": "planning"
      },
      "tier": 3
    },
    {
      "kind": "sharedStat",
      "stat": "stress",
      "delta": 1
    }
  ],
  "resultTexts": [
    "排到一半你发现三份档期撞在一起，只好重新算了一遍。",
    "你把过期的通告单挑出来，剩下的按月份夹好。",
    "整理完你才意识到，这个月的空档比想象中少。"
  ]
},
{
  "id": "activity.street_photo",
  "name": "街拍练习",
  "description": "带着相机在街上走，找一点值得按快门的东西。",
  "kind": "explore",
  "target": "none",
  "locations": [
    "park",
    "shopping_street"
  ],
  "durationMinutes": 30,
  "timeWindows": [
    {
      "fromMinute": 480,
      "toMinute": 1200
    }
  ],
  "cost": {
    "stamina": 8
  },
  "effects": [
    {
      "kind": "attributeExp",
      "ref": {
        "scope": "producer",
        "key": "photography"
      },
      "tier": 3
    },
    {
      "kind": "sharedStat",
      "stat": "stress",
      "delta": 0
    }
  ],
  "resultTexts": [
    "你拍了三十几张，回看的时候删掉了二十九张。",
    "光落在橱窗边上的时候你按了一次快门，之后再也等不到那个角度。",
    "有个老人问你是不是记者。你说是练习，他笑了一下。"
  ]
},
{
  "id": "activity.watch_street",
  "name": "在街上待一会儿",
  "description": "不做什么，只是站在人多的地方看。",
  "kind": "explore",
  "target": "none",
  "locations": [
    "station",
    "shopping_street"
  ],
  "durationMinutes": 30,
  "timeWindows": [
    {
      "fromMinute": 480,
      "toMinute": 1200
    }
  ],
  "cost": {
    "stamina": 3
  },
  "effects": [
    {
      "kind": "attributeExp",
      "ref": {
        "scope": "producer",
        "key": "insight"
      },
      "tier": 3
    },
    {
      "kind": "sharedStat",
      "stat": "stress",
      "delta": -2
    }
  ],
  "resultTexts": [
    "一个女生在橱窗前站了很久，最后什么也没买。",
    "你注意到下班时间的人走路都比早上快半拍。",
    "有人把伞收起来又撑开，反复了三次。"
  ]
}
],
  events: [
{
  "id": "evt.mano.after_dance",
  "title": "镜子里多了一拍",
  "when": [],
  "after": {
    "ids": [
      "dance"
    ]
  },
  "afterIdol": {
    "ids": [
      "mano"
    ]
  },
  "chance": 0.4,
  "priority": 5,
  "once": true,
  "text": "舞蹈课结束，她对着镜子又把最后两拍走了一遍。走完自己先皱起眉。",
  "choices": [
    {
      "label": "陪她把这一拍抠顺",
      "hint": "体力 -5，信任 +3",
      "effects": [
        {
          "kind": "attributeExp",
          "ref": "trust",
          "tier": 3
        },
        {
          "kind": "sharedStat",
          "stat": "stamina",
          "delta": -5
        }
      ],
      "result": "数到第七遍，她停下来，说原来是脚先动了。"
    },
    {
      "label": "问她哪里不对",
      "hint": "信任 +1",
      "effects": [
        {
          "kind": "attributeExp",
          "ref": "trust",
          "tier": 1
        }
      ],
      "result": "她比划了半天，最后小声说，大概是……我自己踩早了。"
    },
    {
      "label": "今天就到这里",
      "hint": "压力 -3",
      "effects": [
        {
          "kind": "sharedStat",
          "stat": "stress",
          "delta": -3
        }
      ],
      "result": "她把毛巾搭在肩上，说明天再试。走出门前又看了一眼镜子。"
    }
  ]
},
{
  "id": "evt.mano.after_expression",
  "title": "对着镜子练笑",
  "when": [],
  "after": {
    "ids": [
      "expression"
    ]
  },
  "afterIdol": {
    "ids": [
      "mano"
    ]
  },
  "chance": 0.4,
  "priority": 5,
  "once": true,
  "text": "表现课结束，她对着镜子练一个笑。练了几次，最后停下来，问自己是不是很奇怪。",
  "choices": [
    {
      "label": "告诉她刚才那个就很好",
      "hint": "信任 +3",
      "effects": [
        {
          "kind": "attributeExp",
          "ref": "trust",
          "tier": 3
        }
      ],
      "result": "她愣了一下，说你这样说，我反而有点不知道该摆什么表情了。"
    },
    {
      "label": "让她自己决定",
      "hint": "压力 -3，信任 +1",
      "effects": [
        {
          "kind": "attributeExp",
          "ref": "trust",
          "tier": 1
        },
        {
          "kind": "sharedStat",
          "stat": "stress",
          "delta": -3
        }
      ],
      "result": "她想了很久，最后选了一个不太对称的。说这样比较像自己。"
    },
    {
      "label": "陪她再试一次",
      "hint": "体力 -5，信任 +1，压力 +3",
      "effects": [
        {
          "kind": "attributeExp",
          "ref": "trust",
          "tier": 1
        },
        {
          "kind": "sharedStat",
          "stat": "stamina",
          "delta": -5
        },
        {
          "kind": "sharedStat",
          "stat": "stress",
          "delta": 3
        }
      ],
      "result": "这一次她笑得更僵了。她看着镜子里的自己，慢慢把嘴角放下来。"
    }
  ]
},
{
  "id": "evt.mano.after_free",
  "title": "回去的路上",
  "when": [],
  "after": {
    "ids": [
      "free"
    ]
  },
  "afterIdol": {
    "ids": [
      "mano"
    ]
  },
  "chance": 0.4,
  "priority": 5,
  "once": true,
  "text": "回去的路上她忽然停下来，说今天其实有一件事想讲，但讲之前先看了一眼前面路口的红灯。",
  "choices": [
    {
      "label": "站在这里听她讲完",
      "hint": "多花 15 分钟，信任 +3",
      "durationMinutes": 15,
      "effects": [
        {
          "kind": "attributeExp",
          "ref": "trust",
          "tier": 3
        }
      ],
      "result": "她讲了很久，最后说讲出来好像也没什么。绿灯亮了两次，你们才走。"
    },
    {
      "label": "先送她回去",
      "hint": "压力 -3，信任 +1",
      "effects": [
        {
          "kind": "attributeExp",
          "ref": "trust",
          "tier": 1
        },
        {
          "kind": "sharedStat",
          "stat": "stress",
          "delta": -3
        }
      ],
      "result": "她点点头，把想说的话收了回去。到楼下时她说，下次再说也一样。"
    },
    {
      "label": "说改天再听",
      "hint": "什么都不变",
      "effects": [],
      "result": "她说好，然后一路上都没有再提起。"
    }
  ]
},
{
  "id": "evt.mano.look_around_pigeons",
  "title": "鸽子围了半圈",
  "when": [
    {
      "kind": "castPresent",
      "idolIds": [
        "mano"
      ]
    }
  ],
  "after": {
    "ids": [
      "look_around"
    ]
  },
  "chance": 0.35,
  "priority": 5,
  "once": true,
  "text": "她蹲在长椅边上，鸽子围了半圈。她正小声跟它们说话，没有注意到你。",
  "choices": [
    {
      "label": "站着听一会儿",
      "hint": "压力 -3，信任 +1",
      "effects": [
        {
          "kind": "attributeExp",
          "ref": "trust",
          "tier": 1
        },
        {
          "kind": "sharedStat",
          "stat": "stress",
          "delta": -3
        }
      ],
      "result": "她说的话都很短，像是在跟熟人打招呼。过了会儿她自己笑了。"
    },
    {
      "label": "坐下来一起",
      "hint": "体力 -2，信任 +3",
      "effects": [
        {
          "kind": "attributeExp",
          "ref": "trust",
          "tier": 3
        },
        {
          "kind": "sharedStat",
          "stat": "stamina",
          "delta": -2
        }
      ],
      "result": "你坐下的时候有一只直接跳到你脚边。她小声说，它大概是觉得你安全。"
    },
    {
      "label": "叫她该走了",
      "hint": "信任 -1",
      "effects": [
        {
          "kind": "attributeExp",
          "ref": "trust",
          "tier": 1,
          "direction": "loss"
        }
      ],
      "result": "她应了一声，站起来，走了两步又回头看了一眼。"
    }
  ]
},
{
  "id": "evt.mano.after_vocal",
  "title": "还没唱完的一句",
  "when": [],
  "after": {
    "ids": [
      "vocal"
    ]
  },
  "afterIdol": {
    "ids": [
      "mano"
    ]
  },
  "chance": 0.45,
  "priority": 5,
  "once": true,
  "text": "声乐课结束了，她还站在钢琴边上，把刚才那一句反复唱到只剩气声。",
  "choices": [
    {
      "label": "再陪她练一遍",
      "hint": "体力 -5，信任 +3",
      "effects": [
        {
          "kind": "attributeExp",
          "ref": "trust",
          "tier": 3
        },
        {
          "kind": "sharedStat",
          "stat": "stamina",
          "delta": -5
        }
      ],
      "result": "第三遍的时候她终于点头，说这一句好像找到地方了。"
    },
    {
      "label": "让她早点回去休息",
      "hint": "压力 -5，信任 +1",
      "effects": [
        {
          "kind": "attributeExp",
          "ref": "trust",
          "tier": 1
        },
        {
          "kind": "sharedStat",
          "stat": "stress",
          "delta": -5
        }
      ],
      "result": "她把谱子合上，说下次一定唱完。走到门口又回头确认了一遍灯关没关。"
    }
  ]
},
{
  "id": "evt.hiori.after_dance",
  "title": "被指出来的那一拍",
  "when": [],
  "after": {
    "ids": [
      "dance"
    ]
  },
  "afterIdol": {
    "ids": [
      "hiori"
    ]
  },
  "chance": 0.4,
  "priority": 5,
  "once": true,
  "text": "老师说她第三拍慢了半拍。她点头说知道了，然后从头再来。",
  "choices": [
    {
      "label": "什么也不说，看她做完",
      "hint": "信任 +3",
      "effects": [
        {
          "kind": "attributeExp",
          "ref": "trust",
          "tier": 3
        }
      ],
      "result": "第三遍对了。她看着镜子里的自己，没有表情，也没有停下来。"
    },
    {
      "label": "说「这次准了」",
      "hint": "信任 +1、舞蹈 +1",
      "effects": [
        {
          "kind": "attributeExp",
          "ref": "trust",
          "tier": 1
        },
        {
          "kind": "attributeExp",
          "ref": "dance",
          "tier": 1
        }
      ],
      "result": "「嗯。」她没回头，但下一遍更稳。"
    },
    {
      "label": "说「别太苛责自己」",
      "hint": "压力 +3",
      "effects": [
        {
          "kind": "sharedStat",
          "stat": "stress",
          "delta": 3
        }
      ],
      "result": "「这不是苛责。是事实。」她说完继续数拍子。"
    }
  ]
},
{
  "id": "evt.hiori.after_free",
  "title": "她准备了东西",
  "when": [],
  "after": {
    "ids": [
      "free"
    ]
  },
  "afterIdol": {
    "ids": [
      "hiori"
    ]
  },
  "chance": 0.35,
  "priority": 5,
  "once": true,
  "text": "她把手里的文件夹递过来，说这是这几天的总结。",
  "choices": [
    {
      "label": "当场翻一遍",
      "hint": "信任 +3",
      "effects": [
        {
          "kind": "attributeExp",
          "ref": "trust",
          "tier": 3
        }
      ],
      "result": "里面按日期排得整整齐齐。最后一页写着：以上，我自己判断还有不足。"
    },
    {
      "label": "问她为什么给你看",
      "hint": "信任 +1",
      "effects": [
        {
          "kind": "attributeExp",
          "ref": "trust",
          "tier": 1
        }
      ],
      "result": "「因为你说过，不会替我遮过去。」"
    },
    {
      "label": "说之后再细看",
      "hint": "无变化",
      "effects": [],
      "result": "她点头，把文件夹收回去，说明天再带过来。"
    }
  ]
},
{
  "id": "evt.hiori.after_vocal",
  "title": "到该停的地方",
  "when": [],
  "after": {
    "ids": [
      "vocal"
    ]
  },
  "afterIdol": {
    "ids": [
      "hiori"
    ]
  },
  "chance": 0.4,
  "priority": 5,
  "once": true,
  "text": "课已经结束了。她还在练，说状态不错，想再多练一会儿。",
  "choices": [
    {
      "label": "让她练到满意",
      "hint": "信任 +3",
      "effects": [
        {
          "kind": "attributeExp",
          "ref": "trust",
          "tier": 3
        }
      ],
      "result": "她又练了三遍，然后停下：考虑到明天，到这里吧。"
    },
    {
      "label": "提醒明天还有事",
      "hint": "压力 -3",
      "effects": [
        {
          "kind": "sharedStat",
          "stat": "stress",
          "delta": -3
        }
      ],
      "result": "「……说得对。我只做必要的练习。」她关了音响。"
    },
    {
      "label": "问她差在哪里",
      "hint": "信任 +1、歌唱 +1",
      "effects": [
        {
          "kind": "attributeExp",
          "ref": "trust",
          "tier": 1
        },
        {
          "kind": "attributeExp",
          "ref": "vocal",
          "tier": 1
        }
      ],
      "result": "她想了想：不是技巧，是我不敢把最后那一句放开。"
    }
  ]
},
{
  "id": "evt.mano.overwork",
  "title": "站得不太稳",
  "when": [],
  "after": {
    "ids": [
      "dance"
    ]
  },
  "afterIdol": {
    "ids": [
      "mano"
    ]
  },
  "chance": 0.35,
  "priority": 8,
  "once": true,
  "text": "练习结束，她扶着把杆站了一会儿才松开手。看见你在门口，她立刻站直了。",
  "choices": [
    {
      "label": "让她今天就到这里",
      "hint": "信任 +3、压力 -6",
      "effects": [
        {
          "kind": "attributeExp",
          "ref": "trust",
          "tier": 3
        },
        {
          "kind": "sharedStat",
          "stat": "stress",
          "delta": -6
        }
      ],
      "result": "「没事的呼哇哇哇……」她说完自己也笑了一下，才把手从把杆上拿开。"
    },
    {
      "label": "问她是不是还想再练",
      "hint": "信任 +1、舞蹈 +1、压力 +4",
      "effects": [
        {
          "kind": "attributeExp",
          "ref": "trust",
          "tier": 1
        },
        {
          "kind": "attributeExp",
          "ref": "dance",
          "tier": 1
        },
        {
          "kind": "sharedStat",
          "stat": "stress",
          "delta": 4
        }
      ],
      "result": "「嗯。……就一遍。」她练了三遍，第二遍开始手就在抖。"
    },
    {
      "label": "什么也没说，把水递给她",
      "hint": "压力 -3",
      "effects": [
        {
          "kind": "sharedStat",
          "stat": "stress",
          "delta": -3
        }
      ],
      "result": "她愣了一下才接过去，喝了两口，说谢谢。"
    }
  ]
},
{
  "id": "evt.meguru.after_dance",
  "title": "再来一次",
  "when": [],
  "after": {
    "ids": [
      "dance"
    ]
  },
  "afterIdol": {
    "ids": [
      "meguru"
    ]
  },
  "chance": 0.4,
  "priority": 5,
  "once": true,
  "text": "课结束了。她把音乐倒回去，从第一拍重新开始。",
  "choices": [
    {
      "label": "陪她再来一遍",
      "hint": "信任 +3、舞蹈 +1",
      "effects": [
        {
          "kind": "attributeExp",
          "ref": "trust",
          "tier": 3
        },
        {
          "kind": "attributeExp",
          "ref": "dance",
          "tier": 1
        }
      ],
      "result": "第二遍结束，她喘着气说：这次对了！"
    },
    {
      "label": "提醒她该休息了",
      "hint": "压力 -3",
      "effects": [
        {
          "kind": "sharedStat",
          "stat": "stress",
          "delta": -3
        }
      ],
      "result": "「诶……啊，也是。」她关了音乐，动作有点舍不得。"
    },
    {
      "label": "问她为什么突然这么拼",
      "hint": "信任 +1",
      "effects": [
        {
          "kind": "attributeExp",
          "ref": "trust",
          "tier": 1
        }
      ],
      "result": "「因为我想跳得好看一点嘛！……还有，想让大家觉得我很厉害。」"
    }
  ]
},
{
  "id": "evt.meguru.after_free",
  "title": "手机一直在响",
  "when": [],
  "after": {
    "ids": [
      "free"
    ]
  },
  "afterIdol": {
    "ids": [
      "meguru"
    ]
  },
  "chance": 0.35,
  "priority": 5,
  "once": true,
  "text": "自由时间刚开始，她的手机就响了三次。每次接完都笑得很好看。",
  "choices": [
    {
      "label": "问她是谁打来的",
      "hint": "信任 +3",
      "effects": [
        {
          "kind": "attributeExp",
          "ref": "trust",
          "tier": 3
        }
      ],
      "result": "「是朋友！……都说是\"只帮一下\"就这样。」她挠了挠头。"
    },
    {
      "label": "把她的手机轻轻按下去",
      "hint": "信任 +1、压力 -4",
      "effects": [
        {
          "kind": "attributeExp",
          "ref": "trust",
          "tier": 1
        },
        {
          "kind": "sharedStat",
          "stat": "stress",
          "delta": -4
        }
      ],
      "result": "她愣了半秒，然后真的把手机放进包里：「……那我今天先不管它。」"
    },
    {
      "label": "什么也不说",
      "hint": "无变化",
      "effects": [],
      "result": "她接完第三个电话，坐下来，安静了一会儿。"
    }
  ]
},
{
  "id": "evt.meguru.after_vocal",
  "title": "声音太大",
  "when": [],
  "after": {
    "ids": [
      "vocal"
    ]
  },
  "afterIdol": {
    "ids": [
      "meguru"
    ]
  },
  "chance": 0.35,
  "priority": 5,
  "once": true,
  "text": "声乐老师说她的音量太满，第一段就放到底了，后面没有余地。",
  "choices": [
    {
      "label": "让她试着留一半力气",
      "hint": "信任 +3、歌唱 +1",
      "effects": [
        {
          "kind": "attributeExp",
          "ref": "trust",
          "tier": 3
        },
        {
          "kind": "attributeExp",
          "ref": "vocal",
          "tier": 1
        }
      ],
      "result": "她唱得收着，自己先笑出来：「这样好难啊！」"
    },
    {
      "label": "说\"有精神就好\"",
      "hint": "信任 +1",
      "effects": [
        {
          "kind": "attributeExp",
          "ref": "trust",
          "tier": 1
        }
      ],
      "result": "「诶嘿嘿，谢谢你！……不过老师说得对啦。」"
    },
    {
      "label": "问她为什么总是唱这么满",
      "hint": "压力 +3",
      "effects": [
        {
          "kind": "sharedStat",
          "stat": "stress",
          "delta": 3
        }
      ],
      "result": "她愣了一下：「因为我怕停下来啊。」"
    }
  ]
}
],
  jobs: [
{
  "id": "job.dance_program",
  "name": "舞蹈节目收录",
  "description": "综艺里的一个舞蹈环节，两小时连排带录。",
  "locationId": "studio",
  "fromMinute": 840,
  "toMinute": 960,
  "pay": 1000,
  "check": {
    "ref": "dance",
    "difficulty": "D",
    "shift": 0
  },
  "failurePayRatio": 0.4,
  "cooldownDays": 2,
  "requires": [
    {
      "kind": "attributeAtLeast",
      "ref": {
        "scope": "idol",
        "key": "dance"
      },
      "rank": "E"
    }
  ],
  "effects": [
    {
      "kind": "fans",
      "value": 90
    },
    {
      "kind": "attributeExp",
      "ref": {
        "scope": "idol",
        "key": "dance"
      },
      "tier": 10
    },
    {
      "kind": "attributeExp",
      "ref": {
        "scope": "idol",
        "key": "trust"
      },
      "tier": 3
    },
    {
      "kind": "sharedStat",
      "stat": "stress",
      "delta": 8
    }
  ],
  "failureEffects": [
    {
      "kind": "sharedStat",
      "stat": "stress",
      "delta": 14
    },
    {
      "kind": "log",
      "text": "走位错了两次，重排到很晚才收工。",
      "tone": "bad"
    }
  ],
  "resultTexts": [
    "连着录了三条，导演说可以了。她下台时腿还在抖。",
    "她和伴舞对了一个手势，现场笑了一下，那个反应被留在了成片里。",
    "收工后她一个人在空舞台上把那段又走了一遍。"
  ],
  "failureTexts": [
    "「我拖慢大家了。」她在后台小声说，然后去把地上的胶带一条条揭掉。",
    "第三条还是没过。节目组说先用备选方案，她点点头，没再说什么。"
  ]
},
{
  "id": "job.first_live",
  "name": "初次 Live",
  "description": "三十个人的小场子。第一次站上去，唱三首。",
  "locationId": "studio",
  "fromMinute": 1080,
  "toMinute": 1260,
  "pay": 800,
  "check": {
    "ref": "dance",
    "difficulty": "C",
    "shift": 0
  },
  "failurePayRatio": 0.4,
  "cooldownDays": 4,
  "requires": [
    {
      "kind": "flag",
      "key": "unlocked.first_live"
    }
  ],
  "hiddenUntilUnlocked": true,
  "effects": [
    {
      "kind": "fans",
      "value": 220
    },
    {
      "kind": "attributeExp",
      "ref": {
        "scope": "idol",
        "key": "dance"
      },
      "tier": 10
    },
    {
      "kind": "attributeExp",
      "ref": {
        "scope": "idol",
        "key": "expression"
      },
      "tier": 5
    },
    {
      "kind": "attributeExp",
      "ref": {
        "scope": "idol",
        "key": "trust"
      },
      "tier": 5
    },
    {
      "kind": "sharedStat",
      "stat": "stress",
      "delta": 15
    }
  ],
  "failureEffects": [
    {
      "kind": "sharedStat",
      "stat": "stress",
      "delta": 25
    },
    {
      "kind": "log",
      "text": "第二首歌的后半段，她的声音开始发抖。",
      "tone": "bad"
    }
  ],
  "resultTexts": [
    "唱到第三首的时候，前排有人举起了手。她看见了，笑了一下，然后接着唱。",
    "结束之后她在后台坐了很久，说腿还是软的。",
    "散场时有个女孩等在门口，说自己是从公园那次开始听她唱歌的。"
  ],
  "failureTexts": [
    "「对不起……第三首我没唱好。」她一遍遍说，声音已经哑了。",
    "下来以后她没哭，只是把话筒放回架子上，慢慢蹲了下去。"
  ]
},
{
  "id": "job.magazine_cover",
  "name": "杂志封面",
  "description": "一整天的外景拍摄，主视觉封面。要求她全程在状态。",
  "locationId": "studio",
  "fromMinute": 600,
  "toMinute": 960,
  "pay": 2000,
  "check": {
    "ref": "expression",
    "difficulty": "C",
    "shift": 0
  },
  "failurePayRatio": 0.4,
  "cooldownDays": 4,
  "requires": [
    {
      "kind": "fansAtLeast",
      "value": 500
    }
  ],
  "effects": [
    {
      "kind": "fans",
      "value": 250
    },
    {
      "kind": "attributeExp",
      "ref": {
        "scope": "idol",
        "key": "expression"
      },
      "tier": 10
    },
    {
      "kind": "attributeExp",
      "ref": {
        "scope": "idol",
        "key": "vocal"
      },
      "tier": 5
    },
    {
      "kind": "attributeExp",
      "ref": {
        "scope": "idol",
        "key": "trust"
      },
      "tier": 5
    },
    {
      "kind": "sharedStat",
      "stat": "stress",
      "delta": 12
    }
  ],
  "failureEffects": [
    {
      "kind": "sharedStat",
      "stat": "stress",
      "delta": 20
    },
    {
      "kind": "log",
      "text": "封面组最后换了备选方案。她在车里一句话都没说。",
      "tone": "bad"
    }
  ],
  "resultTexts": [
    "拍到日落才收工。摄影师说这组不用修太多。",
    "她站在海边被风吹了六个小时，回程时头发还没顺过来。",
    "最后一版打样出来时，staff 围在一起看了很久。"
  ],
  "failureTexts": [
    "「我是不是拖慢了进度。」她小声问，然后自己摇了摇头。",
    "状态一直没找回来。封面组礼貌地说会再看看，她听懂了下半句。"
  ]
},
{
  "id": "job.radio_recording",
  "name": "电台收录",
  "description": "深夜档的电台节目，两小时，讲自己的近况再放一首歌。",
  "locationId": "studio",
  "fromMinute": 840,
  "toMinute": 960,
  "pay": 900,
  "check": {
    "ref": "expression",
    "difficulty": "D",
    "shift": 0
  },
  "failurePayRatio": 0.4,
  "cooldownDays": 2,
  "requires": [
    {
      "kind": "attributeAtLeast",
      "ref": {
        "scope": "idol",
        "key": "expression"
      },
      "rank": "D"
    }
  ],
  "effects": [
    {
      "kind": "fans",
      "value": 80
    },
    {
      "kind": "attributeExp",
      "ref": {
        "scope": "idol",
        "key": "expression"
      },
      "tier": 5
    },
    {
      "kind": "attributeExp",
      "ref": {
        "scope": "idol",
        "key": "trust"
      },
      "tier": 3
    },
    {
      "kind": "sharedStat",
      "stat": "stress",
      "delta": 4
    }
  ],
  "failureEffects": [
    {
      "kind": "sharedStat",
      "stat": "stress",
      "delta": 10
    },
    {
      "kind": "log",
      "text": "麦克风前她卡了三次，主持人帮她圆了过去。",
      "tone": "bad"
    }
  ],
  "resultTexts": [
    "她讲起最近在练的那段舞，讲到一半自己笑了。主持人说这种反应很好。",
    "直播结束后，staff 说她的声音比想象中稳。她把台本折成四折塞进包里。",
    "最后放歌的时候她没说话，只是听完了整首。"
  ],
  "failureTexts": [
    "「对不起……我刚才是不是说错了。」她在电梯里问了两遍。",
    "直播中有十几秒没人说话。回来路上她一直看着窗外。"
  ]
},
{
  "id": "job.recording_demo",
  "name": "录音小样",
  "description": "先录一版小样给制作方听。两小时，棚里只有她和你。",
  "locationId": "studio",
  "fromMinute": 840,
  "toMinute": 960,
  "pay": 600,
  "check": {
    "ref": "vocal",
    "difficulty": "E",
    "shift": 0
  },
  "failurePayRatio": 0.4,
  "cooldownDays": 1,
  "effects": [
    {
      "kind": "fans",
      "value": 50
    },
    {
      "kind": "attributeExp",
      "ref": {
        "scope": "idol",
        "key": "vocal"
      },
      "tier": 10
    },
    {
      "kind": "attributeExp",
      "ref": {
        "scope": "idol",
        "key": "trust"
      },
      "tier": 1
    },
    {
      "kind": "sharedStat",
      "stat": "stress",
      "delta": 3
    }
  ],
  "failureEffects": [
    {
      "kind": "sharedStat",
      "stat": "stress",
      "delta": 8
    },
    {
      "kind": "log",
      "text": "录到第四遍，她自己说先停一下。",
      "tone": "bad"
    }
  ],
  "resultTexts": [
    "第二遍就过了。录音师说这个声音干净，她愣了一下才道谢。",
    "棚里很安静，只有她换气的声音。收工时她把耳机绕好放回架子上。",
    "你隔着玻璃看她唱完最后一句，她抬头确认，看见你点头才笑出来。"
  ],
  "failureTexts": [
    "「对不起，我能再来一次吗。」她说了三次，声音一次比一次小。",
    "今天状态不对，最后先回去了。她说明天想早点来。"
  ]
},
{
  "id": "job.studio_shoot",
  "name": "摄影棚拍摄",
  "description": "杂志内页的一组拍摄。两个小时，灯光和快门都比想象中吵。",
  "locationId": "studio",
  "fromMinute": 600,
  "toMinute": 720,
  "pay": 1200,
  "label": "拍摄",
  "effects": [
    {
      "kind": "fans",
      "value": 120
    },
    {
      "kind": "attributeExp",
      "ref": {
        "scope": "idol",
        "key": "expression"
      },
      "tier": 10
    },
    {
      "kind": "attributeExp",
      "ref": {
        "scope": "idol",
        "key": "trust"
      },
      "tier": 3
    },
    {
      "kind": "sharedStat",
      "stat": "stress",
      "delta": 6
    }
  ],
  "check": {
    "ref": "expression",
    "difficulty": "E",
    "shift": 0
  },
  "failurePayRatio": 0.4,
  "failureEffects": [
    {
      "kind": "sharedStat",
      "stat": "stress",
      "delta": 12
    },
    {
      "kind": "log",
      "text": "拍摄方说这组不合用，只能按试用价结算。",
      "tone": "bad"
    }
  ],
  "resultTexts": [
    "拍完最后一组，摄影师说今天就到这里。她在卸妆间门口小声说，比想象中累。",
    "三套衣服换下来，她的肩膀一直没松过。收工的时候才笑出来。",
    "中途卡了两次，第三次终于过了。staff 鼓掌的时候她愣了一下才反应过来。"
  ],
  "failureTexts": [
    "「对不起……是我没跟上。」她说这句话的时候，声音比平时更小。",
    "拍到一半她开始出神。最后勉强收工，对方说会用已经拍好的部分。"
  ],
  "cooldownDays": 2
}
],
  dialogues: [
{
  "id": "dialogue.meguru.coffee",
  "idolId": "meguru",
  "startNodeId": "1-01",
  "nodes": {
    "1-01": {
      "id": "1-01",
      "text": "（好，必要的联络差不多都结束了。）",
      "nextNodeId": "1-02",
      "speakerId": "producer"
    },
    "1-02": {
      "id": "1-02",
      "text": "（已经这个时间了，得早点回去……）",
      "nextNodeId": "1-03",
      "speakerId": "producer"
    },
    "1-03": {
      "id": "1-03",
      "text": "（唉……回去之前先喝一杯咖啡吧。）",
      "nextNodeId": "1-04",
      "speakerId": "producer"
    },
    "1-04": {
      "id": "1-04",
      "speakerId": "meguru",
      "text": "制作人，制作人……",
      "nextNodeId": "1-05"
    },
    "1-05": {
      "id": "1-05",
      "speakerId": "meguru",
      "text": "早安！",
      "nextNodeId": "1-06"
    },
    "1-06": {
      "id": "1-06",
      "text": "早安……这样啊，我趴在桌上睡着了。",
      "nextNodeId": "1-07",
      "speakerId": "producer"
    },
    "1-07": {
      "id": "1-07",
      "text": "这条毯子是？",
      "nextNodeId": "1-08",
      "speakerId": "producer"
    },
    "1-08": {
      "id": "1-08",
      "speakerId": "meguru",
      "text": "是叶月放的。她说试着叫过你，但你没醒。",
      "nextNodeId": "1-09"
    },
    "1-09": {
      "id": "1-09",
      "speakerId": "meguru",
      "text": "工作很忙吧……在家里好好睡一觉更好啊——",
      "nextNodeId": "1-10"
    },
    "1-10": {
      "id": "1-10",
      "speakerId": "meguru",
      "text": "制作人，我最近都没看到你休息啊？",
      "nextNodeId": "1-11"
    },
    "1-11": {
      "id": "1-11",
      "speakerId": "meguru",
      "text": "难道……因为我才这么忙？",
      "nextNodeId": "1-12"
    },
    "1-12": {
      "id": "1-12",
      "speakerId": "meguru",
      "text": "又来看我练习，又来陪我说话……",
      "choices": [
        {
          "label": "不是你的错",
          "nextNodeId": "2-01",
          "effects": [
            {
              "kind": "attributeExp",
              "ref": "trust",
              "tier": 1
            }
          ]
        },
        {
          "label": "我很开心，没问题的",
          "nextNodeId": "3-01",
          "effects": [
            {
              "kind": "sharedStat",
              "stat": "stress",
              "delta": -2
            }
          ]
        },
        {
          "label": "其实我有休息",
          "nextNodeId": "4-01",
          "effects": [
            {
              "kind": "attributeExp",
              "ref": "expression",
              "tier": 1
            }
          ]
        }
      ]
    },
    "2-01": {
      "id": "2-01",
      "text": "让你这么想，抱歉。",
      "nextNodeId": "2-02",
      "speakerId": "producer"
    },
    "2-02": {
      "id": "2-02",
      "speakerId": "meguru",
      "text": "制作人……",
      "nextNodeId": "2-03"
    },
    "2-03": {
      "id": "2-03",
      "text": "巡每天也都坚持完成严格的课程吧。",
      "nextNodeId": "2-04",
      "speakerId": "producer"
    },
    "2-04": {
      "id": "2-04",
      "text": "在舞台上发光是巡的工作，在背后支撑你是我的工作。",
      "nextNodeId": "2-05",
      "speakerId": "producer"
    },
    "2-05": {
      "id": "2-05",
      "speakerId": "meguru",
      "text": "嗯……",
      "nextNodeId": "2-06"
    },
    "2-06": {
      "id": "2-06",
      "text": "不过，我会尽量不让你担心。",
      "nextNodeId": "2-07",
      "speakerId": "producer"
    },
    "2-07": {
      "id": "2-07",
      "speakerId": "meguru",
      "text": "嗯！要快点好好休息……不是为了我担心，是为了制作人的身体哦？",
      "nextNodeId": "2-08"
    },
    "2-08": {
      "id": "2-08",
      "text": "嗯。不过巡也没资格说别人吧。",
      "nextNodeId": "2-09",
      "speakerId": "producer"
    },
    "2-09": {
      "id": "2-09",
      "text": "以后我会给你接更多更多工作的！",
      "nextNodeId": "2-10",
      "speakerId": "producer"
    },
    "2-10": {
      "id": "2-10",
      "speakerId": "meguru",
      "text": "没关系！我的忙碌就是快乐的意思嘛！",
      "nextNodeId": "2-11"
    },
    "2-11": {
      "id": "2-11",
      "speakerId": "meguru",
      "text": "放马过来——！"
    },
    "3-01": {
      "id": "3-01",
      "text": "你能这么想我很高兴，不过这样也不行啊。",
      "nextNodeId": "3-02",
      "speakerId": "producer"
    },
    "3-02": {
      "id": "3-02",
      "speakerId": "meguru",
      "text": "开心是开心……可是那样也不行啊！",
      "nextNodeId": "3-03"
    },
    "3-03": {
      "id": "3-03",
      "text": "巡每天也都坚持完成严格的课程吧。在舞台上发光是巡的工作，在背后支撑你是我的工作。",
      "nextNodeId": "3-04",
      "speakerId": "producer"
    },
    "3-04": {
      "id": "3-04",
      "speakerId": "meguru",
      "text": "嗯……",
      "nextNodeId": "3-05"
    },
    "3-05": {
      "id": "3-05",
      "text": "我会尽量不让你担心。",
      "nextNodeId": "3-06",
      "speakerId": "producer"
    },
    "3-06": {
      "id": "3-06",
      "speakerId": "meguru",
      "text": "嗯！要快点好好休息……不是为了我担心，是为了制作人的身体哦？",
      "nextNodeId": "3-07"
    },
    "3-07": {
      "id": "3-07",
      "speakerId": "meguru",
      "text": "那我也要变得让你不用担心的样子！"
    },
    "4-01": {
      "id": "4-01",
      "speakerId": "meguru",
      "text": "骗人。桌上都是文件。",
      "nextNodeId": "4-02"
    },
    "4-02": {
      "id": "4-02",
      "text": "……今天确实拖得晚了点。",
      "nextNodeId": "4-03",
      "speakerId": "producer"
    },
    "4-03": {
      "id": "4-03",
      "text": "巡每天也都坚持完成严格的课程吧。在舞台上发光是巡的工作，在背后支撑你是我的工作。",
      "nextNodeId": "4-04",
      "speakerId": "producer"
    },
    "4-04": {
      "id": "4-04",
      "speakerId": "meguru",
      "text": "嗯……",
      "nextNodeId": "4-05"
    },
    "4-05": {
      "id": "4-05",
      "text": "我会尽量不让你担心。",
      "nextNodeId": "4-06",
      "speakerId": "producer"
    },
    "4-06": {
      "id": "4-06",
      "speakerId": "meguru",
      "text": "嗯！要快点好好休息……不是为了我担心，是为了制作人的身体哦？"
    }
  }
},
{
  "id": "dialogue.meguru.swimsuit",
  "idolId": "meguru",
  "startNodeId": "1-01",
  "nodes": {
    "1-01": {
      "id": "1-01",
      "text": "这是一本叫新人偶像特集的杂志。你先看看。",
      "nextNodeId": "1-02",
      "speakerId": "producer"
    },
    "1-02": {
      "id": "1-02",
      "speakerId": "meguru",
      "text": "这个杂志！便利店经常有卖的那种！",
      "nextNodeId": "1-03"
    },
    "1-03": {
      "id": "1-03",
      "speakerId": "meguru",
      "text": "哇，不同的人感觉完全不一样！大家的衣服也都好可爱——！",
      "nextNodeId": "1-04"
    },
    "1-04": {
      "id": "1-04",
      "text": "这本杂志的方针，好像是重视偶像的个性。",
      "nextNodeId": "1-05",
      "speakerId": "producer"
    },
    "1-05": {
      "id": "1-05",
      "speakerId": "meguru",
      "text": "好厉害！！好期待啊……！",
      "nextNodeId": "1-06"
    },
    "1-06": {
      "id": "1-06",
      "text": "还有，服装那边说想用巡的私服。",
      "nextNodeId": "1-07",
      "speakerId": "producer"
    },
    "1-07": {
      "id": "1-07",
      "text": "平时的衣服我觉得挺好，但也有泳装的镜头。你有吗？",
      "nextNodeId": "1-08",
      "speakerId": "producer"
    },
    "1-08": {
      "id": "1-08",
      "speakerId": "meguru",
      "text": "学校用的那种有……嗯——不过要拍照的话，还是可爱的泳装比较好吧！？",
      "nextNodeId": "1-09"
    },
    "1-09": {
      "id": "1-09",
      "speakerId": "meguru",
      "text": "那得去买泳装才行，制作人！",
      "nextNodeId": "1-10"
    },
    "1-10": {
      "id": "1-10",
      "text": "好，那就出去一趟吧。课程之后的安排我来定。",
      "nextNodeId": "1-11",
      "speakerId": "producer"
    },
    "1-11": {
      "id": "1-11",
      "speakerId": "meguru",
      "text": "好耶——！谢谢你，制作人！要挑什么样的呢，诶嘿嘿！",
      "nextNodeId": "1-12"
    },
    "1-12": {
      "id": "1-12",
      "speakerId": "meguru",
      "text": "制作人，来这边来这边！好多种泳装——",
      "nextNodeId": "1-13"
    },
    "1-13": {
      "id": "1-13",
      "speakerId": "meguru",
      "text": "哇——……！每一件都可爱啊——……！",
      "nextNodeId": "1-14"
    },
    "1-14": {
      "id": "1-14",
      "speakerId": "meguru",
      "text": "有花图案的、还有蝴蝶结……制作人觉得哪种好？",
      "nextNodeId": "1-15"
    },
    "1-15": {
      "id": "1-15",
      "text": "不是该选巡自己喜欢的吗？",
      "nextNodeId": "1-16",
      "speakerId": "producer"
    },
    "1-16": {
      "id": "1-16",
      "speakerId": "meguru",
      "text": "和朋友逛街的时候，一边聊天一边看，超开心的。",
      "nextNodeId": "1-17"
    },
    "1-17": {
      "id": "1-17",
      "speakerId": "meguru",
      "text": "也有过聊得太投入，什么都没买就回家了！诶嘿嘿。",
      "nextNodeId": "1-18"
    },
    "1-18": {
      "id": "1-18",
      "speakerId": "meguru",
      "text": "……不过能上杂志的只有一件吧……嗯——好难选——！",
      "nextNodeId": "1-19"
    },
    "1-19": {
      "id": "1-19",
      "speakerId": "meguru",
      "text": "怎么办啊，制作人……！",
      "choices": [
        {
          "label": "有精神的会不会更适合你",
          "nextNodeId": "2-01",
          "effects": [
            {
              "kind": "attributeExp",
              "ref": "expression",
              "tier": 1
            }
          ]
        },
        {
          "label": "试试搭配吧",
          "nextNodeId": "3-01",
          "effects": [
            {
              "kind": "attributeExp",
              "ref": "trust",
              "tier": 1
            }
          ]
        },
        {
          "label": "交给运气来吧",
          "nextNodeId": "4-01",
          "effects": [
            {
              "kind": "sharedStat",
              "stat": "stress",
              "delta": -2
            }
          ]
        }
      ]
    },
    "2-01": {
      "id": "2-01",
      "text": "有精神的会不会更适合你？",
      "nextNodeId": "2-02",
      "speakerId": "producer"
    },
    "2-02": {
      "id": "2-02",
      "speakerId": "meguru",
      "text": "比如……这样的？",
      "nextNodeId": "2-03"
    },
    "2-03": {
      "id": "2-03",
      "speakerId": "meguru",
      "text": "哇！这个好！好可爱……！",
      "nextNodeId": "2-04"
    },
    "2-04": {
      "id": "2-04",
      "speakerId": "meguru",
      "text": "那这件呢……！？会不会有点成熟？",
      "nextNodeId": "2-05"
    },
    "2-05": {
      "id": "2-05",
      "speakerId": "meguru",
      "text": "不是，虽然想变得适合穿这种，但还是等再大一点吧！",
      "nextNodeId": "2-06"
    },
    "2-06": {
      "id": "2-06",
      "speakerId": "meguru",
      "text": "嗯！只要一下子哦？"
    },
    "3-01": {
      "id": "3-01",
      "text": "试试搭配吧。",
      "nextNodeId": "3-02",
      "speakerId": "producer"
    },
    "3-02": {
      "id": "3-02",
      "speakerId": "meguru",
      "text": "诶？什么意思……啊！那样也可以啊！",
      "nextNodeId": "3-03"
    },
    "3-03": {
      "id": "3-03",
      "text": "发饰啊项链之类的……",
      "nextNodeId": "3-04",
      "speakerId": "producer"
    },
    "3-04": {
      "id": "3-04",
      "speakerId": "meguru",
      "text": "嗯！把喜欢的都配起来，一定会很开心！",
      "nextNodeId": "3-05"
    },
    "3-05": {
      "id": "3-05",
      "speakerId": "meguru",
      "text": "谢谢你制作人！好，搭配搭配！我看看……"
    },
    "4-01": {
      "id": "4-01",
      "text": "试试闭上眼睛随手抓一件，赌在偶然的相遇上如何？",
      "nextNodeId": "4-02",
      "speakerId": "producer"
    },
    "4-02": {
      "id": "4-02",
      "speakerId": "meguru",
      "text": "啊哈哈，好像游戏！那——……好——……这件！",
      "nextNodeId": "4-03"
    },
    "4-03": {
      "id": "4-03",
      "speakerId": "meguru",
      "text": "哇，好时尚……！可是奇怪……好像有点大。",
      "nextNodeId": "4-04"
    },
    "4-04": {
      "id": "4-04",
      "speakerId": "meguru",
      "text": "嗯，好像没有适合我的尺寸。",
      "nextNodeId": "4-05"
    },
    "4-05": {
      "id": "4-05",
      "speakerId": "meguru",
      "text": "……这么大的尺寸，应该比较适合制作人了——",
      "nextNodeId": "4-06"
    },
    "4-06": {
      "id": "4-06",
      "text": "喂，别往我身上比。",
      "nextNodeId": "4-07",
      "speakerId": "producer"
    },
    "4-07": {
      "id": "4-07",
      "speakerId": "meguru",
      "text": "诶嘿嘿，开个玩笑！",
      "nextNodeId": "4-08"
    },
    "4-08": {
      "id": "4-08",
      "speakerId": "meguru",
      "text": "那就挑一些好看的，再从里面选合适的尺寸吧。",
      "nextNodeId": "4-09"
    },
    "4-09": {
      "id": "4-09",
      "speakerId": "meguru",
      "text": "对哦！太多会困扰……一点点缩小范围确实更好！",
      "nextNodeId": "4-10"
    },
    "4-10": {
      "id": "4-10",
      "speakerId": "meguru",
      "text": "真是的——！能全部都穿到就好了——！"
    }
  }
},
{
  "id": "dialogue.meguru.purity",
  "idolId": "meguru",
  "startNodeId": "1-01",
  "nodes": {
    "1-01": {
      "id": "1-01",
      "text": "其他人好像还没到。巡每次都来这么早吗？",
      "nextNodeId": "1-02",
      "speakerId": "producer"
    },
    "1-02": {
      "id": "1-02",
      "speakerId": "meguru",
      "text": "今天是碰巧啦！学校那边的事情结束得早。",
      "nextNodeId": "1-03"
    },
    "1-03": {
      "id": "1-03",
      "speakerId": "meguru",
      "text": "你看你看，我的身体比之前柔软了吧——！",
      "nextNodeId": "1-04"
    },
    "1-04": {
      "id": "1-04",
      "text": "真的，腿抬得很干净。",
      "nextNodeId": "1-05",
      "speakerId": "producer"
    },
    "1-05": {
      "id": "1-05",
      "speakerId": "meguru",
      "text": "诶嘿嘿，谢谢夸奖！",
      "nextNodeId": "1-06"
    },
    "1-06": {
      "id": "1-06",
      "speakerId": "meguru",
      "text": "啊，我想拉伸一下，能帮我压着背吗？",
      "nextNodeId": "1-07"
    },
    "1-07": {
      "id": "1-07",
      "text": "好。这样？",
      "nextNodeId": "1-08",
      "speakerId": "producer"
    },
    "1-08": {
      "id": "1-08",
      "speakerId": "meguru",
      "text": "嗯！谢谢——！",
      "nextNodeId": "1-09"
    },
    "1-09": {
      "id": "1-09",
      "speakerId": "meguru",
      "text": "说起来，制作人谈过恋爱吗？",
      "nextNodeId": "1-10"
    },
    "1-10": {
      "id": "1-10",
      "text": "嗯？",
      "nextNodeId": "1-11",
      "speakerId": "producer"
    },
    "1-11": {
      "id": "1-11",
      "speakerId": "meguru",
      "text": "前几天舞蹈课来了外面的老师吧？",
      "nextNodeId": "1-12"
    },
    "1-12": {
      "id": "1-12",
      "speakerId": "meguru",
      "text": "他说我虽然跳得认真，但感情表现不够。",
      "nextNodeId": "1-13"
    },
    "1-13": {
      "id": "1-13",
      "speakerId": "meguru",
      "text": "让我回想起恋爱时的心动，把感情放进去……",
      "nextNodeId": "1-14"
    },
    "1-14": {
      "id": "1-14",
      "speakerId": "meguru",
      "text": "可是，我……根本不知道那种东西啊——！",
      "nextNodeId": "1-15"
    },
    "1-15": {
      "id": "1-15",
      "speakerId": "meguru",
      "text": "制作人知道吗？恋爱是什么感觉？",
      "choices": [
        {
          "label": "心跳加速的感觉",
          "nextNodeId": "2-01",
          "effects": [
            {
              "kind": "attributeExp",
              "ref": "expression",
              "tier": 1
            }
          ]
        },
        {
          "label": "心头一紧的感觉",
          "nextNodeId": "3-01",
          "effects": [
            {
              "kind": "attributeExp",
              "ref": "trust",
              "tier": 1
            }
          ]
        },
        {
          "label": "你可以看看书",
          "nextNodeId": "4-01",
          "effects": [
            {
              "kind": "sharedStat",
              "stat": "stress",
              "delta": -2
            }
          ]
        }
      ]
    },
    "2-01": {
      "id": "2-01",
      "speakerId": "meguru",
      "text": "这样啊……",
      "nextNodeId": "2-02"
    },
    "2-02": {
      "id": "2-02",
      "text": "巡没有心跳加速过吗？",
      "nextNodeId": "2-03",
      "speakerId": "producer"
    },
    "2-03": {
      "id": "2-03",
      "speakerId": "meguru",
      "text": "有啊。站在舞台上的时候！",
      "nextNodeId": "2-04"
    },
    "2-04": {
      "id": "2-04",
      "speakerId": "meguru",
      "text": "在后台，真乃和灯织就在旁边，等出场的那一刻最……",
      "nextNodeId": "2-05"
    },
    "2-05": {
      "id": "2-05",
      "speakerId": "meguru",
      "text": "明明特别兴奋，可有时候心还是会揪一下……",
      "nextNodeId": "2-06"
    },
    "2-06": {
      "id": "2-06",
      "text": "那就用那时候的心情去跳，怎么样？",
      "nextNodeId": "2-07",
      "speakerId": "producer"
    },
    "2-07": {
      "id": "2-07",
      "speakerId": "meguru",
      "text": "那样也可以？就算不是恋爱？",
      "nextNodeId": "2-08"
    },
    "2-08": {
      "id": "2-08",
      "text": "老师想说的，大概是像恋爱那样强烈的心意吧。",
      "nextNodeId": "2-09",
      "speakerId": "producer"
    },
    "2-09": {
      "id": "2-09",
      "speakerId": "meguru",
      "text": "是吗……！",
      "nextNodeId": "2-10"
    },
    "2-10": {
      "id": "2-10",
      "speakerId": "meguru",
      "text": "我还在想，要是必须马上去谈恋爱可怎么办。",
      "nextNodeId": "2-11"
    },
    "2-11": {
      "id": "2-11",
      "text": "哈哈，不用勉强。",
      "nextNodeId": "2-12",
      "speakerId": "producer"
    },
    "2-12": {
      "id": "2-12",
      "speakerId": "meguru",
      "text": "嗯嗯，一定是这样！",
      "nextNodeId": "2-13"
    },
    "2-13": {
      "id": "2-13",
      "speakerId": "meguru",
      "text": "好，我现在就来试试看……！"
    },
    "3-01": {
      "id": "3-01",
      "speakerId": "meguru",
      "text": "嘿……恋爱是件好事啊……",
      "nextNodeId": "3-02"
    },
    "3-02": {
      "id": "3-02",
      "speakerId": "meguru",
      "text": "学校的朋友聊恋爱话题的时候，看起来确实很开心。",
      "nextNodeId": "3-03"
    },
    "3-03": {
      "id": "3-03",
      "text": "巡也想谈一次吗？",
      "nextNodeId": "3-04",
      "speakerId": "producer"
    },
    "3-04": {
      "id": "3-04",
      "speakerId": "meguru",
      "text": "嗯——……",
      "nextNodeId": "3-05"
    },
    "3-05": {
      "id": "3-05",
      "speakerId": "meguru",
      "text": "……我最喜欢大家了。",
      "nextNodeId": "3-06"
    },
    "3-06": {
      "id": "3-06",
      "speakerId": "meguru",
      "text": "可是，喜欢到什么程度才算恋爱呢……",
      "nextNodeId": "3-07"
    },
    "3-07": {
      "id": "3-07",
      "speakerId": "meguru",
      "text": "是在我的\"最喜欢\"更前面，还是完全在别的地方呢……",
      "nextNodeId": "3-08"
    },
    "3-08": {
      "id": "3-08",
      "speakerId": "meguru",
      "text": "就是不知道这个，才连想不想谈都不清楚……诶嘿嘿。",
      "nextNodeId": "3-09"
    },
    "3-09": {
      "id": "3-09",
      "text": "按你的步调来就好。",
      "nextNodeId": "3-10",
      "speakerId": "producer"
    },
    "3-10": {
      "id": "3-10",
      "text": "跳舞的时候，试着想一想你最喜欢的那些人正看着你。",
      "nextNodeId": "3-11",
      "speakerId": "producer"
    },
    "3-11": {
      "id": "3-11",
      "speakerId": "meguru",
      "text": "哇，好像很有趣……！",
      "nextNodeId": "3-12"
    },
    "3-12": {
      "id": "3-12",
      "speakerId": "meguru",
      "text": "把心意传达给最喜欢的大家的那种感觉……嗯……嗯……",
      "nextNodeId": "3-13"
    },
    "3-13": {
      "id": "3-13",
      "speakerId": "meguru",
      "text": "可以现在试一下吗！？我去放音乐……！",
      "nextNodeId": "3-14"
    },
    "3-14": {
      "id": "3-14",
      "speakerId": "meguru",
      "text": "……啊，可是。",
      "nextNodeId": "3-15"
    },
    "3-15": {
      "id": "3-15",
      "speakerId": "meguru",
      "text": "如果有一天我对谁心跳了一下，",
      "nextNodeId": "3-16"
    },
    "3-16": {
      "id": "3-16",
      "speakerId": "meguru",
      "text": "那到时候要好好向制作人报告才行！"
    },
    "4-01": {
      "id": "4-01",
      "text": "这不是别人教你就能懂的。要不要试着代入书或者电影里的主角？",
      "nextNodeId": "4-02",
      "speakerId": "producer"
    },
    "4-02": {
      "id": "4-02",
      "speakerId": "meguru",
      "text": "这样啊……",
      "nextNodeId": "4-03"
    },
    "4-03": {
      "id": "4-03",
      "speakerId": "meguru",
      "text": "果然还是，知道真正的恋爱会比较好吗……",
      "nextNodeId": "4-04"
    },
    "4-04": {
      "id": "4-04",
      "text": "……巡很喜欢跳舞吧。",
      "nextNodeId": "4-05",
      "speakerId": "producer"
    },
    "4-05": {
      "id": "4-05",
      "speakerId": "meguru",
      "text": "嗯！我想跳得更好……！",
      "nextNodeId": "4-06"
    },
    "4-06": {
      "id": "4-06",
      "speakerId": "meguru",
      "text": "最开始只是觉得开心而已。",
      "nextNodeId": "4-07"
    },
    "4-07": {
      "id": "4-07",
      "speakerId": "meguru",
      "text": "但成了偶像之后见到很多粉丝……",
      "nextNodeId": "4-08"
    },
    "4-08": {
      "id": "4-08",
      "speakerId": "meguru",
      "text": "现在，我想让看我表演的大家也觉得开心。",
      "nextNodeId": "4-09"
    },
    "4-09": {
      "id": "4-09",
      "speakerId": "meguru",
      "text": "所以，我能做的我都想努力做到……！",
      "nextNodeId": "4-10"
    },
    "4-10": {
      "id": "4-10",
      "text": "嗯……",
      "nextNodeId": "4-11",
      "speakerId": "meguru"
    },
    "4-11": {
      "id": "4-11",
      "speakerId": "meguru",
      "text": "诶嘿嘿。不过我知道，恋爱不是想做到就能做到的事。",
      "nextNodeId": "4-12"
    },
    "4-12": {
      "id": "4-12",
      "speakerId": "meguru",
      "text": "我去看看书！虽然要理解主角的心情可能还要很久……",
      "nextNodeId": "4-13"
    },
    "4-13": {
      "id": "4-13",
      "speakerId": "meguru",
      "text": "啊。",
      "nextNodeId": "4-14"
    },
    "4-14": {
      "id": "4-14",
      "text": "怎么了？",
      "nextNodeId": "4-15",
      "speakerId": "producer"
    },
    "4-15": {
      "id": "4-15",
      "speakerId": "meguru",
      "text": "……制作人！我想跳一下，你帮我看看！",
      "nextNodeId": "4-16"
    },
    "4-16": {
      "id": "4-16",
      "text": "你明白什么了吗？",
      "nextNodeId": "4-17",
      "speakerId": "producer"
    },
    "4-17": {
      "id": "4-17",
      "speakerId": "meguru",
      "text": "我想让制作人记住现在的我！这样哪天我变了，你随时都能发现。",
      "nextNodeId": "4-18"
    },
    "4-18": {
      "id": "4-18",
      "speakerId": "meguru",
      "text": "对吧，是个好主意吧！？我去放音乐！"
    }
  }
},
{
  "id": "dialogue.meguru.stars",
  "idolId": "meguru",
  "startNodeId": "1-n01",
  "nodes": {
    "1-n01": {
      "id": "1-n01",
      "text": "晚上的公园。路灯很暗，抬头能看到星星。",
      "nextNodeId": "1-n02"
    },
    "1-n02": {
      "id": "1-n02",
      "speakerId": "meguru",
      "text": "哇——！制作人快看！",
      "nextNodeId": "1-n03"
    },
    "1-n03": {
      "id": "1-n03",
      "speakerId": "meguru",
      "text": "星星真的很漂亮……！",
      "nextNodeId": "1-n04"
    },
    "1-n04": {
      "id": "1-n04",
      "speakerId": "meguru",
      "text": "好多一闪一闪的！诶嘿嘿，好像我们一样。",
      "nextNodeId": "1-n05"
    },
    "1-n05": {
      "id": "1-n05",
      "text": "你问她指的是 illumination STARS 吗。",
      "nextNodeId": "1-n06",
      "speakerId": "producer"
    },
    "1-n06": {
      "id": "1-n06",
      "speakerId": "meguru",
      "text": "对！诶嘿嘿……",
      "nextNodeId": "2-n01"
    },
    "2-n01": {
      "id": "2-n01",
      "speakerId": "meguru",
      "text": "我就是在这个公园第一次遇到制作人的，还记得吗？",
      "nextNodeId": "2-n02"
    },
    "2-n02": {
      "id": "2-n02",
      "text": "当然记得。那时候她在打篮球。",
      "nextNodeId": "2-n03",
      "speakerId": "producer"
    },
    "2-n03": {
      "id": "2-n03",
      "speakerId": "meguru",
      "text": "然后制作人说，自己不是怪人！",
      "nextNodeId": "2-n04"
    },
    "2-n04": {
      "id": "2-n04",
      "text": "……你说过吗？你有点不确定。",
      "nextNodeId": "2-n05"
    },
    "2-n05": {
      "id": "2-n05",
      "speakerId": "meguru",
      "text": "说过！",
      "nextNodeId": "2-n06"
    },
    "2-n06": {
      "id": "2-n06",
      "speakerId": "meguru",
      "text": "对了，现在的我和相遇的时候比起来怎么样？变帅了吗？",
      "nextNodeId": "2-n07"
    },
    "2-n07": {
      "id": "2-n07",
      "text": "你想了想，说成长得令人惊讶。",
      "nextNodeId": "2-n08a"
    },
    "2-n08a": {
      "id": "2-n08a",
      "speakerId": "meguru",
      "text": "诶嘿嘿，好耶——！",
      "nextNodeId": "2-n09"
    },
    "2-n09": {
      "id": "2-n09",
      "speakerId": "meguru",
      "text": "到那天为止，我每天都在期待什么时候能遇到制作人。",
      "nextNodeId": "2-n10"
    },
    "2-n10": {
      "id": "2-n10",
      "speakerId": "meguru",
      "text": "然后在公园看到了穿西装的人……是我的制作人！这个想法一闪而过，我就跑起来了！",
      "nextNodeId": "2-n11"
    },
    "2-n11": {
      "id": "2-n11",
      "speakerId": "meguru",
      "text": "真的很开心……！我那时候真的很兴奋吧？",
      "nextNodeId": "3-n01"
    },
    "3-n01": {
      "id": "3-n01",
      "text": "你说和平常没什么两样吧，然后补了一句是在夸她。",
      "nextNodeId": "3-n02",
      "speakerId": "producer"
    },
    "3-n02": {
      "id": "3-n02",
      "speakerId": "meguru",
      "text": "这么认真的表情说这些，我有点害羞了……不过……谢谢你！",
      "nextNodeId": "3-n03"
    },
    "3-n03": {
      "id": "3-n03",
      "speakerId": "meguru",
      "text": "到现在发生的这么多事，对我来说全部都是不想忘记的重要的回忆……",
      "nextNodeId": "3-n04"
    },
    "3-n04": {
      "id": "3-n04",
      "speakerId": "meguru",
      "text": "今后也拜托你了，我最喜欢你了，制作人！",
      "nextNodeId": "3-n05"
    },
    "3-n05": {
      "id": "3-n05",
      "text": "她说完就往前跑。你说跑起来很危险。",
      "nextNodeId": "3-n06"
    },
    "3-n06": {
      "id": "3-n06",
      "speakerId": "meguru",
      "text": "嗯，我会注意！稍微等一下……！",
      "nextNodeId": "3-n07"
    },
    "3-n07": {
      "id": "3-n07",
      "text": "她举起手机，对着天空。过了一会儿放下来。",
      "nextNodeId": "3-n08"
    },
    "3-n08": {
      "id": "3-n08",
      "speakerId": "meguru",
      "text": "……啊——，好像不行啊。",
      "nextNodeId": "3-n09"
    },
    "3-n09": {
      "id": "3-n09",
      "speakerId": "meguru",
      "text": "我就是想拍今晚的星空，可是手机的镜头好像拍不出来。",
      "nextNodeId": "3-n10"
    },
    "3-n10": {
      "id": "3-n10",
      "speakerId": "meguru",
      "text": "工作和课程虽然也一样，但是我还想记住更多这种什么都没有的日子。",
      "nextNodeId": "3-n11"
    },
    "3-n11": {
      "id": "3-n11",
      "speakerId": "meguru",
      "text": "……今天的事我也会好好藏在心底的……好吗，制作人！"
    }
  }
},
{
  "id": "dialogue.meguru.sunshine",
  "idolId": "meguru",
  "startNodeId": "1-n01",
  "nodes": {
    "1-n01": {
      "id": "1-n01",
      "text": "泳池边，器材正在撤。太阳把白瓷砖照得发亮。",
      "nextNodeId": "1-n02"
    },
    "1-n02": {
      "id": "1-n02",
      "speakerId": "meguru",
      "text": "非常感谢——！",
      "nextNodeId": "1-n03"
    },
    "1-n03": {
      "id": "1-n03",
      "speakerId": "meguru",
      "text": "制作人！",
      "nextNodeId": "1-n04"
    },
    "1-n04": {
      "id": "1-n04",
      "text": "你说辛苦了，表情很好。她笑起来。",
      "nextNodeId": "1-n05",
      "speakerId": "producer"
    },
    "1-n05": {
      "id": "1-n05",
      "speakerId": "meguru",
      "text": "嗯，我拍得很开心——！",
      "nextNodeId": "1-n06"
    },
    "1-n06": {
      "id": "1-n06",
      "speakerId": "meguru",
      "text": "啊……明明在工作，说开心真的好吗。",
      "nextNodeId": "1-n07"
    },
    "1-n07": {
      "id": "1-n07",
      "text": "你说当然好，这很重要。而且她确实做到了摄影师要的东西。",
      "nextNodeId": "1-n09",
      "speakerId": "producer"
    },
    "1-n09": {
      "id": "1-n09",
      "speakerId": "meguru",
      "text": "诶嘿嘿，制作人真温柔——",
      "nextNodeId": "1-n10"
    },
    "1-n10": {
      "id": "1-n10",
      "speakerId": "meguru",
      "text": "谢谢你一直看着我！你很热吧？",
      "nextNodeId": "1-n11"
    },
    "1-n11": {
      "id": "1-n11",
      "text": "你说完全没事。她盯着你手里的水瓶看了两秒。",
      "nextNodeId": "1-n12",
      "speakerId": "producer"
    },
    "1-n12": {
      "id": "1-n12",
      "speakerId": "meguru",
      "text": "……那个水看起来也温温的啊？",
      "nextNodeId": "1-n13"
    },
    "1-n13": {
      "id": "1-n13",
      "speakerId": "meguru",
      "text": "到下一段采访之前还有点时间。巡也去玩玩水吧？",
      "nextNodeId": "1-n14"
    },
    "1-n14": {
      "id": "1-n14",
      "speakerId": "meguru",
      "text": "那我先休息一下吧。一起去阳伞下休息吧！",
      "nextNodeId": "2-n01"
    },
    "2-n01": {
      "id": "2-n01",
      "text": "阳伞下摆着两张折叠椅。她去拿毛巾了。",
      "nextNodeId": "2-n02"
    },
    "2-n02": {
      "id": "2-n02",
      "text": "你坐下，想着不要迷路就好了。阴凉处确实凉快。",
      "nextNodeId": "2-n03"
    },
    "2-n03": {
      "id": "2-n03",
      "text": "不知道过了多久，忽然有人叫你。",
      "nextNodeId": "2-n04"
    },
    "2-n04": {
      "id": "2-n04",
      "speakerId": "meguru",
      "text": "……制作人！",
      "nextNodeId": "2-n05"
    },
    "2-n05": {
      "id": "2-n05",
      "text": "你被冰了一下，醒过来。",
      "nextNodeId": "2-n06"
    },
    "2-n06": {
      "id": "2-n06",
      "speakerId": "meguru",
      "text": "诶嘿嘿，醒啦？给你果汁——",
      "nextNodeId": "2-n07"
    },
    "2-n07": {
      "id": "2-n07",
      "speakerId": "meguru",
      "text": "制作人，这个就可以吗？虽然我选了我想喝的！",
      "nextNodeId": "2-n08"
    },
    "2-n08": {
      "id": "2-n08",
      "text": "你接过来道谢。瓶身上还挂着一层水。",
      "nextNodeId": "2-n09"
    },
    "2-n09": {
      "id": "2-n09",
      "speakerId": "meguru",
      "text": "我已经喝过了！我去下泳池！",
      "nextNodeId": "3-n01"
    },
    "3-n01": {
      "id": "3-n01",
      "text": "她几步跑到池边，跳了进去。水面碎开又合上。",
      "nextNodeId": "3-n02"
    },
    "3-n02": {
      "id": "3-n02",
      "speakerId": "meguru",
      "text": "……制作人！快看——！",
      "nextNodeId": "3-n03"
    },
    "3-n03": {
      "id": "3-n03",
      "speakerId": "meguru",
      "text": "是不是闪闪发亮的——！",
      "nextNodeId": "3-n04"
    },
    "3-n04": {
      "id": "3-n04",
      "speakerId": "meguru",
      "text": "太阳耀眼的时候溅起的水花，超漂亮的……！",
      "nextNodeId": "3-n05"
    },
    "3-n05": {
      "id": "3-n05",
      "text": "你说是啊，让她别跌倒了。",
      "nextNodeId": "3-n06",
      "speakerId": "producer"
    },
    "3-n06": {
      "id": "3-n06",
      "speakerId": "meguru",
      "text": "没关系的——！你看你看——",
      "nextNodeId": "3-n07"
    },
    "3-n07": {
      "id": "3-n07",
      "text": "水花溅到脚边。凉凉的很舒服。",
      "nextNodeId": "3-n08"
    },
    "3-n08": {
      "id": "3-n08",
      "speakerId": "meguru",
      "text": "啊，泼到你了？对不起！",
      "nextNodeId": "3-n09"
    },
    "3-n09": {
      "id": "3-n09",
      "text": "她趴在池边，仰头看着你。头发贴在脸上，还在滴水。",
      "nextNodeId": "3-n10"
    },
    "3-n10": {
      "id": "3-n10",
      "speakerId": "meguru",
      "text": "制作人，下次也一起来泳池里玩吧。",
      "nextNodeId": "3-n11"
    },
    "3-n11": {
      "id": "3-n11",
      "text": "远处工作人员在喊集合。她应了一声，又回头看了你一眼。"
    }
  }
}
],
  storyChains: [],
  items: [
{
  "id": "gift.bird_charm",
  "name": "小鸟挂饰",
  "description": "木头雕的小鸟，尾巴上系着一根细绳。",
  "category": "gift",
  "price": 600,
  "icon": "sparkle",
  "maxPurchases": 2,
  "gift": {
    "defaultTrustTier": 1,
    "preferences": [
      {
        "idolId": "mano",
        "trustTier": 5,
        "reaction": "呼哇……她捏着小鸟看了很久，最后才想起来说谢谢。"
      }
    ]
  }
},
{
  "id": "gift.flower",
  "name": "花束",
  "description": "用浅色包装纸扎好的小花束，适合在见面时递过去。",
  "category": "gift",
  "price": 500,
  "icon": "sparkle",
  "maxPurchases": 3,
  "gift": {
    "defaultTrustTier": 1,
    "preferences": [
      {
        "idolId": "mano",
        "trustTier": 3,
        "reaction": "真乃把花抱在怀里，低头闻了很久。"
      },
      {
        "idolId": "hiori",
        "trustTier": 1,
        "reaction": "灯织接过花，认真地说了声谢谢。"
      }
    ]
  }
},
{
  "id": "gift.hairclip",
  "name": "发饰",
  "description": "一枚小小的银色发饰，在灯下会闪一下。",
  "category": "gift",
  "price": 800,
  "icon": "star",
  "maxPurchases": 1,
  "gift": {
    "defaultTrustTier": 1,
    "preferences": [
      {
        "idolId": "mano",
        "trustTier": 1,
        "reaction": "真乃把发饰别在头发上，对着橱窗照了照。"
      },
      {
        "idolId": "hiori",
        "trustTier": 3,
        "reaction": "灯织捏着发饰看了很久，最后小心地收进了口袋。"
      }
    ]
  }
},
{
  "id": "gift.letter",
  "name": "信纸",
  "description": "一张带细纹的信纸，可以写些不适合当面说的话。",
  "category": "gift",
  "price": 200,
  "icon": "book",
  "maxPurchases": 3,
  "gift": {
    "defaultTrustTier": 1,
    "preferences": [
      {
        "idolId": "mano",
        "trustTier": 1,
        "reaction": "真乃把信纸贴在胸口，笑得有点不好意思。"
      },
      {
        "idolId": "hiori",
        "trustTier": 3,
        "reaction": "灯织把信纸折好，夹进了随身带着的笔记本。"
      }
    ]
  }
},
{
  "id": "keepsake.photo",
  "name": "演唱会照片",
  "description": "一张从街角照相馆买到的照片，边角有点翘。",
  "category": "keepsake",
  "price": 300,
  "icon": "star",
  "maxPurchases": 1
}
],
  shops: [
{
  "id": "shopping_street_gift",
  "name": "街角礼品店",
  "description": "卖些小礼物和旧照片的店，店主不太打扰客人。",
  "locationId": "shopping_street",
  "itemIds": [
    "gift.flower",
    "gift.hairclip",
    "gift.letter",
    "keepsake.photo",
    "gift.bird_charm"
  ]
}
],
  topics: [
{
  "id": "hiori.chat.about_you",
  "actorId": "hiori",
  "label": "关于制作人",
  "text": "「你来做我的制作人，到底有没有问题——我现在，稍微不那么想了。」",
  "cooldownMinutes": 1440,
  "effects": [
    {
      "kind": "attributeExp",
      "ref": "trust",
      "tier": 1
    }
  ]
},
{
  "id": "hiori.chat.how_was_today",
  "actorId": "hiori",
  "label": "今天怎么样",
  "text": "「普通。」停了一下。「……你问这个做什么。」",
  "cooldownMinutes": 1440,
  "effects": [
    {
      "kind": "attributeExp",
      "ref": "trust",
      "tier": 1
    }
  ]
},
{
  "id": "hiori.chat.mano",
  "actorId": "hiori",
  "label": "真乃的事",
  "text": "「她太容易把事揽到自己身上。……别的我不说。」",
  "cooldownMinutes": 1440,
  "effects": [
    {
      "kind": "attributeExp",
      "ref": "trust",
      "tier": 1
    }
  ]
},
{
  "id": "hiori.chat.mistake",
  "actorId": "hiori",
  "label": "失误之后",
  "text": "「明明练了那么多次，连一件工作都做不好。」她停了停。「……没什么。」",
  "cooldownMinutes": 1440,
  "effects": [
    {
      "kind": "attributeExp",
      "ref": "trust",
      "tier": 1
    }
  ]
},
{
  "id": "hiori.chat.practice",
  "actorId": "hiori",
  "label": "训练的进度",
  "text": "「不管再怎么练习，都感觉不到自己在接近理想中的样子。」",
  "cooldownMinutes": 1440,
  "effects": [
    {
      "kind": "attributeExp",
      "ref": "trust",
      "tier": 1
    }
  ]
},
{
  "id": "hiori.chat.why_idol",
  "actorId": "hiori",
  "label": "为什么想当偶像",
  "text": "「……那时候只是自我满足。现在不一样了。大概。」",
  "cooldownMinutes": 1440,
  "effects": [
    {
      "kind": "attributeExp",
      "ref": "trust",
      "tier": 1
    }
  ]
},
{
  "id": "mano.chat.about_you",
  "actorId": "mano",
  "label": "关于制作人",
  "text": "「制作人先生……您每天都来吗。」",
  "cooldownMinutes": 1440,
  "effects": [
    {
      "kind": "attributeExp",
      "ref": "trust",
      "tier": 1
    }
  ]
},
{
  "id": "mano.chat.favorite",
  "actorId": "mano",
  "label": "喜欢的东西",
  "text": "「喜欢……可以说喜欢吗。那我喜欢甜的。」",
  "cooldownMinutes": 1440,
  "effects": [
    {
      "kind": "attributeExp",
      "ref": "trust",
      "tier": 1
    }
  ]
},
{
  "id": "mano.chat.how_was_today",
  "actorId": "mano",
  "label": "今天怎么样",
  "text": "「……嗯。还行。就是刚才把水杯碰倒了，洒了半桌。」",
  "cooldownMinutes": 1440,
  "effects": [
    {
      "kind": "attributeExp",
      "ref": "trust",
      "tier": 1
    }
  ]
},
{
  "id": "mano.chat.lunch",
  "actorId": "mano",
  "label": "午饭吃了吗",
  "text": "「吃了。面包。……其实没吃饱，但没关系。」",
  "cooldownMinutes": 1440,
  "effects": [
    {
      "kind": "attributeExp",
      "ref": "trust",
      "tier": 1
    }
  ]
},
{
  "id": "mano.chat.pigeons",
  "actorId": "mano",
  "label": "公园的鸽子",
  "text": "「好像多了一只。白色的那只不太抢食，总是等别的吃完才过去。」",
  "cooldownMinutes": 1440,
  "effects": [
    {
      "kind": "attributeExp",
      "ref": "trust",
      "tier": 1
    }
  ]
},
{
  "id": "mano.chat.piichan",
  "actorId": "mano",
  "label": "家里的鸟",
  "text": "「小P最近好像学会新叫法了。……制作人想听吗。它叫起来是『啾』一下那种。」",
  "cooldownMinutes": 1440,
  "effects": [
    {
      "kind": "attributeExp",
      "ref": "trust",
      "tier": 1
    }
  ]
},
{
  "id": "mano.chat.progress",
  "actorId": "mano",
  "label": "练习的进度",
  "text": "「那个转身……还是会在第三步卡一下。我再试试。」",
  "cooldownMinutes": 1440,
  "effects": [
    {
      "kind": "attributeExp",
      "ref": "trust",
      "tier": 1
    }
  ]
},
{
  "id": "mano.chat.sofa",
  "actorId": "mano",
  "label": "事务所的沙发",
  "text": "「这里比家里舒服。……啊，不是那个意思。」",
  "cooldownMinutes": 1440,
  "effects": [
    {
      "kind": "attributeExp",
      "ref": "trust",
      "tier": 1
    }
  ]
},
{
  "id": "mano.chat.tomorrow",
  "actorId": "mano",
  "label": "明天的事",
  "text": "「明天想早点到。上次那段还没练熟，不想拖大家后腿。」",
  "cooldownMinutes": 1440,
  "effects": [
    {
      "kind": "attributeExp",
      "ref": "trust",
      "tier": 1
    }
  ]
},
{
  "id": "meguru.chat.alone",
  "actorId": "meguru",
  "label": "一个人的时候",
  "text": "「一个人啊……会有点安静。所以我才喜欢待在人多的地方吧？」",
  "cooldownMinutes": 1440,
  "effects": [
    {
      "kind": "attributeExp",
      "ref": "trust",
      "tier": 1
    }
  ]
},
{
  "id": "meguru.chat.call_her",
  "actorId": "meguru",
  "label": "名字",
  "text": "「叫我巡就可以了！前辈这么叫会让我觉得难为情——啊，制作人不算前辈啦。」",
  "cooldownMinutes": 1440,
  "effects": [
    {
      "kind": "attributeExp",
      "ref": "trust",
      "tier": 1
    }
  ]
},
{
  "id": "meguru.chat.friends",
  "actorId": "meguru",
  "label": "朋友的事",
  "text": "「诶嘿嘿，大家都很可爱哦。篮球部、排球部，还有田径部——只要拜托我的话，我都去！」",
  "cooldownMinutes": 1440,
  "effects": [
    {
      "kind": "attributeExp",
      "ref": "trust",
      "tier": 1
    }
  ]
},
{
  "id": "meguru.chat.how_was_today",
  "actorId": "meguru",
  "label": "今天怎么样",
  "text": "「今天超有精神的！……啊，不过刚才跑太多了，腿有点酸。」",
  "cooldownMinutes": 1440,
  "effects": [
    {
      "kind": "attributeExp",
      "ref": "trust",
      "tier": 1
    }
  ]
},
{
  "id": "meguru.chat.practice",
  "actorId": "meguru",
  "label": "练习的进度",
  "text": "「那个转身我练了三十次！……三十次之后还是会歪，诶嘿嘿。」",
  "cooldownMinutes": 1440,
  "effects": [
    {
      "kind": "attributeExp",
      "ref": "trust",
      "tier": 1
    }
  ]
},
{
  "id": "meguru.chat.worried",
  "actorId": "meguru",
  "label": "被担心的时候",
  "text": "「诶？我没事哦！真的！……制作人，你刚才是不是在担心我？」",
  "cooldownMinutes": 1440,
  "effects": [
    {
      "kind": "attributeExp",
      "ref": "trust",
      "tier": 1
    }
  ]
}
],
};
