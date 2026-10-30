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
  "id": "dialogue.e2e.review",
  "idolId": "mano",
  "startNodeId": "n01",
  "nodes": {
    "n01": {
      "id": "n01",
      "text": "第一句",
      "nextNodeId": "n02"
    },
    "n02": {
      "id": "n02",
      "text": "第二句"
    }
  }
}
],
  storyChains: [
{
  "id": "story.e2e.review",
  "idolId": "mano",
  "steps": [
    {
      "id": "step-1",
      "locationId": "park",
      "dialogueId": "dialogue.e2e.review",
      "actionLabel": "E2E 剧情步骤",
      "timeWindow": {
        "fromMinute": 600,
        "toMinute": 1080
      }
    }
  ]
}
],
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
}
],
};
