(() => {
  const pair = {
    insight: "learning",
    learning: "insight",
    creativity: "exploration",
    exploration: "creativity",
    empathy: "collaboration",
    collaboration: "empathy",
    action: "expression",
    expression: "action",
  };

  const option = (text, primary) => ({
    text,
    scores: {
      [primary]: 2,
      [pair[primary]]: 1,
    },
  });

  window.TEST_DATA = {
    dimensions: [
      {
        id: "insight",
        name: "洞察力",
        symbol: "看见",
        summary: "从细节里辨认真正的问题",
        strong:
          "你常会先退半步，观察事情的纹理，再决定怎么回应。别人看到热闹时，你更容易留意到结构、动机和那条被忽略的线索。",
        middle:
          "你会在需要时停下来梳理局势，也愿意在信息足够后作出判断。洞察不必总是安静发生，它也可以藏在一次好问题里。",
        light:
          "你通常更愿意先行动或先感受，而不是反复分析。清晰有时会在做的过程中出现，这也是一种有效路径。",
        actions: [
          "遇到复杂选择时，先写下“真正需要解决的是什么”。",
          "回看一件最近的决定，分辨事实、猜测和感受。",
        ],
        archetype: "安静的观察者",
        archetypeSubtitle: "在细节里，读出更大的图景",
      },
      {
        id: "creativity",
        name: "创造力",
        symbol: "联想",
        summary: "把不相关的东西连成新可能",
        strong:
          "你擅长跳出显而易见的第一种答案。一个比喻、一次重组、一个看似无关的联想，都可能成为你打开局面的方式。",
        middle:
          "你愿意尝试新角度，也懂得给想法加上现实边界。创造对你而言，不一定轰轰烈烈，也可以是把日常做出一点新意。",
        light:
          "你更信任成熟的方法和清晰步骤。先把事情稳稳做好，再在有余力时尝试变化，同样能让创造力慢慢长出来。",
        actions: [
          "给一个正在卡住的问题，强行写出 5 个“不合理但有趣”的方案。",
          "随手收集三个跨领域素材，试着找它们之间的共同点。",
        ],
        archetype: "念头收集家",
        archetypeSubtitle: "把散落的想法，拼成新的入口",
      },
      {
        id: "empathy",
        name: "共情力",
        symbol: "感受",
        summary: "读懂话语背后的情绪与需要",
        strong:
          "你对人与人之间的温度很敏感。你常能听出话外之音，也愿意先理解一个人为什么这样想，而不急着判断对错。",
        middle:
          "你能照顾他人的感受，同时保留自己的边界。需要时你会靠近，消耗过多时也能知道该先照顾自己。",
        light:
          "你倾向于用事实、行动或清晰表达来回应他人。理解并不只有一种入口，把问题说明白也可以是关心。",
        actions: [
          "听朋友讲一件事时，先复述你听到的感受，再给建议。",
          "在帮助别人前，先问问自己：我现在愿意付出多少？",
        ],
        archetype: "温度感知者",
        archetypeSubtitle: "先听见人，再处理事",
      },
      {
        id: "action",
        name: "行动力",
        symbol: "推进",
        summary: "把模糊的念头变成下一步",
        strong:
          "你不太会让想法无限停留在准备阶段。对你来说，真实世界里的反馈比脑海中的完美推演更重要，先做起来往往就能找到路。",
        middle:
          "你在计划与行动之间保持着不错的平衡。重要的事你愿意推进，也会为不确定的部分留出观察时间。",
        light:
          "你更重视想清楚、看清楚或等合适时机。行动对你可能意味着确认安全感后的坚定一步，而不是仓促开始。",
        actions: [
          "把一件拖延的小事缩成 10 分钟内能完成的动作。",
          "启动前只回答三个问题：先做什么、做到哪、何时检查。",
        ],
        archetype: "向前推进的人",
        archetypeSubtitle: "让下一步先真实发生",
      },
      {
        id: "exploration",
        name: "探索力",
        symbol: "打开",
        summary: "用好奇心拓宽世界的边界",
        strong:
          "你对未知有天然的靠近感。新地方、新观点、新做法会激活你，而你也擅长在不确定里找到值得继续追的线索。",
        middle:
          "你愿意尝试新事物，也会考虑成本与节奏。对你而言，探索未必是远行，换一条路、认识一个新观点已经足够。",
        light:
          "你更珍惜熟悉与稳定，倾向在确定的范围里深入。持续探索也可以从很小的变化开始，不必打破全部秩序。",
        actions: [
          "本周做一件低成本的“第一次”，例如换一家店或读一个陌生领域。",
          "把一个熟悉问题写成问题清单，找一条从未查过的线索。",
        ],
        archetype: "新鲜感导航员",
        archetypeSubtitle: "在未知里，找到下一处风景",
      },
      {
        id: "expression",
        name: "表达力",
        symbol: "说清",
        summary: "让复杂感受变得可被理解",
        strong:
          "你能够把经历、想法和情绪转换成别人接收得到的语言。清楚并不等于简单，你更擅长让复杂的东西变得有入口。",
        middle:
          "你会在有需要时整理并表达自己，也懂得根据对象调整方式。表达对你可能更像一种工具，而不是持续展示。",
        light:
          "你更愿意让行动或结果说话，不必事事解释。表达可以在安全的关系和具体场景里慢慢练习，而不是成为表演。",
        actions: [
          "用“我观察到、我感受到、我希望”描述一次小冲突。",
          "把最近学到的一件事，用三句话讲给完全没有背景的人。",
        ],
        archetype: "意义转译者",
        archetypeSubtitle: "把心里发生的事，说成别人听得懂的话",
      },
      {
        id: "collaboration",
        name: "协作力",
        symbol: "连接",
        summary: "让不同的人一起把事情做成",
        strong:
          "你天然关注人和事之间的连接。你愿意补位、协调、让信息流动，也常能看到一场合作里真正需要被照顾的环节。",
        middle:
          "你能在独立完成与共同推进之间切换。需要合作时你会靠近，必要时也能保留自己的节奏和判断。",
        light:
          "你更重视自主和清晰边界。合作不必意味着时刻在一起，明确分工、彼此信任，也可以是你擅长的连接方式。",
        actions: [
          "在一次合作开始时，先说清各自负责什么、何时同步。",
          "注意一次团队里的隐形劳动，并主动询问是否需要支持。",
        ],
        archetype: "关系连接者",
        archetypeSubtitle: "在人与事之间，搭起可通行的桥",
      },
      {
        id: "learning",
        name: "学习力",
        symbol: "生长",
        summary: "从经历里持续更新自己",
        strong:
          "你愿意把不会当作起点。无论是系统学习还是边做边学，你都能把新信息转化成自己的方法，并持续迭代。",
        middle:
          "你会在需要时主动学习，也会平衡输入和消化。对你而言，成长不一定快速，但可以稳定、真实地发生。",
        light:
          "你更依赖已有经验和成熟方法，不急着追逐每个新知识。深度和熟练同样重要，学习也可以是安静地积累。",
        actions: [
          "每次学完新内容，用自己的话写下一条“下次怎么做”。",
          "选一项已有技能，找一个可以多掌握 10% 的具体动作。",
        ],
        archetype: "持续生长者",
        archetypeSubtitle: "把每一次不会，变成下一次会",
      },
    ],
    questions: [
      {
        prompt: "周末计划突然空出半天，你更想怎样度过？",
        options: [
          option("找一处没去过的小店或街区，边走边决定", "exploration"),
          option("先观察当下最需要什么，再决定怎么安排", "insight"),
          option("把拖了很久的一件小事立刻做完", "action"),
          option("约上一个聊得来的人，一起消磨时间", "collaboration"),
        ],
      },
      {
        prompt: "朋友说最近很迷茫，你通常会先做什么？",
        options: [
          option("听他讲完零散的感受，再帮他抓重点", "insight"),
          option("抛几个新角度，让问题看起来不一样", "creativity"),
          option("先回应他的情绪，让他知道被理解", "empathy"),
          option("直接问他最想改变的具体是哪件事", "expression"),
        ],
      },
      {
        prompt: "接手一个完全陌生的任务，你最自然的第一步是？",
        options: [
          option("先把已有信息摊开，找出里面的规律", "insight"),
          option("快速找一个能上手的例子，边看边学", "learning"),
          option("先做出最小可交付的版本，再看反馈", "action"),
          option("向有经验的人讲清目标，询问关键提醒", "expression"),
        ],
      },
      {
        prompt: "在一个几乎都不认识的聚会上，你最会做什么？",
        options: [
          option("先观察氛围和大家的谈话节奏", "insight"),
          option("认识一个来自完全不同圈子的人", "exploration"),
          option("留意有点落单的人，主动聊两句", "empathy"),
          option("帮忙张罗吃喝，让场面顺畅起来", "collaboration"),
        ],
      },
      {
        prompt: "遇到一个没有标准答案的问题，你会优先选择？",
        options: [
          option("拆开线索，看看真正的矛盾在哪里", "insight"),
          option("先列出几种截然不同的解法", "creativity"),
          option("挑一个立刻试验，从结果里找答案", "action"),
          option("查资料、补知识，边做边形成方法", "learning"),
        ],
      },
      {
        prompt: "团队意见不一致时，你最可能承担的角色是？",
        options: [
          option("总结双方真正分歧在哪里", "insight"),
          option("先确认每个人最担心的是什么", "empathy"),
          option("用自己的话重新说清方案", "expression"),
          option("组织一次短会，把共识往前推一步", "collaboration"),
        ],
      },
      {
        prompt: "看到一份很有启发的新观点，你接下来更想？",
        options: [
          option("判断它背后的前提和证据是否站得住", "insight"),
          option("顺着它继续查更多相关的内容", "exploration"),
          option("写下自己的理解，并讲给别人听", "expression"),
          option("收进笔记，之后慢慢消化和实践", "learning"),
        ],
      },
      {
        prompt: "朋友临时请你帮忙，但你也正忙，你会？",
        options: [
          option("先判断这件事的轻重缓急", "insight"),
          option("想一个双方都更省力的替代办法", "creativity"),
          option("直说自己的时间边界，同时问他最急什么", "empathy"),
          option("能挤出一点时间就先动手做", "action"),
        ],
      },
      {
        prompt: "准备一次短途旅行，你最期待哪种准备方式？",
        options: [
          option("研究当地真正值得看的细节", "insight"),
          option("只定住处，留大量空白到当地再探索", "exploration"),
          option("设计一条很有个人特色的主题路线", "creativity"),
          option("拉上朋友一起分工，把行程拼起来", "collaboration"),
        ],
      },
      {
        prompt: "要推进一个没人愿意接手的项目，你会先？",
        options: [
          option("找出它真正卡住的原因", "insight"),
          option("做一份清楚的说明，让价值被看见", "expression"),
          option("直接认领一小块，先把进度推起来", "action"),
          option("找到合适的人补位，建立配合方式", "collaboration"),
        ],
      },
      {
        prompt: "在群里看到别人提出不同意见，你更可能？",
        options: [
          option("对比双方逻辑，先找到共同事实", "insight"),
          option("查清还不确定的概念，再参与讨论", "learning"),
          option("先理解对方为什么这样想", "empathy"),
          option("私聊确认彼此立场，再推动大家讨论", "collaboration"),
        ],
      },
      {
        prompt: "做一份个人介绍时，你最想突出什么？",
        options: [
          option("最能代表自己的几段经历", "insight"),
          option("一个有趣、准确的自我比喻", "creativity"),
          option("最近一次让你长大的新尝试", "exploration"),
          option("我现在在做什么，以及想认识怎样的人", "expression"),
        ],
      },
      {
        prompt: "突然停电的夜晚，你第一反应更像？",
        options: [
          option("把黑暗当成机会，编个故事或小游戏", "creativity"),
          option("看看身边的人有没有害怕或需要什么", "empathy"),
          option("借这个机会弄明白家里的应急用品怎么用", "learning"),
          option("拍下这个特别的晚上，记录此刻感受", "expression"),
        ],
      },
      {
        prompt: "报名一门线上课时，你最看重哪种进入方式？",
        options: [
          option("先看它有没有与众不同的视角", "exploration"),
          option("开课就直接做第一次作业", "action"),
          option("找一个学习搭子，互相提醒打卡", "collaboration"),
          option("先安排固定复习时间，确保真正学会", "learning"),
        ],
      },
      {
        prompt: "为朋友准备生日，你最想负责的部分是？",
        options: [
          option("想一个让人意外的主题", "creativity"),
          option("先问最近什么让他真正开心", "empathy"),
          option("带大家去一个没体验过的地方", "exploration"),
          option("组织大家分工，把各个环节串起来", "collaboration"),
        ],
      },
      {
        prompt: "想开始一项副业，你最可能先做哪件事？",
        options: [
          option("先构想一个很不一样的产品或内容", "creativity"),
          option("今天就发出第一条内容试水", "action"),
          option("把自己的想法讲给潜在用户听", "expression"),
          option("拆解需要的能力，列一张学习清单", "learning"),
        ],
      },
      {
        prompt: "来到一个全新环境，你会怎样让自己安定下来？",
        options: [
          option("感受这里的情绪和人际氛围", "empathy"),
          option("先四处看看，体验不同的角落", "exploration"),
          option("和工作人员聊聊，了解真实情况", "expression"),
          option("找到能互相照应的小圈子", "collaboration"),
        ],
      },
      {
        prompt: "收到一项开放到几乎没有边界的任务，你会？",
        options: [
          option("先想一种别人可能没想到的做法", "creativity"),
          option("尽快做出一个能用的第一版", "action"),
          option("找真实用户聊聊，边看反馈边改", "exploration"),
          option("对比优秀案例，提炼一套方法", "learning"),
        ],
      },
      {
        prompt: "朋友做了一件让你不太舒服的事，你通常会？",
        options: [
          option("先用一点幽默把尴尬化开", "creativity"),
          option("先想他最近可能经历了什么", "empathy"),
          option("等情绪平稳后，直接谈这件事", "action"),
          option("找一个双方都信任的人帮忙沟通", "collaboration"),
        ],
      },
      {
        prompt: "被安排做一场陌生领域的分享，你更可能？",
        options: [
          option("先看看不同讲者怎样把这个主题讲出新意", "exploration"),
          option("把内容讲成有起承转合的故事", "expression"),
          option("找熟悉这个领域的朋友一起准备", "collaboration"),
          option("系统查资料，补上自己的知识盲点", "learning"),
        ],
      },
      {
        prompt: "看到一条让你好奇的新闻，你最容易关注？",
        options: [
          option("新闻里具体的人经历了什么", "empathy"),
          option("有没有我现在就能做的一件小事", "action"),
          option("怎样把这件事清楚地解释给别人", "expression"),
          option("查来源和背景，弄清完整脉络", "learning"),
        ],
      },
      {
        prompt: "面对城市里一个反复出现的小问题，你会先？",
        options: [
          option("想一个不那么常规的解决方式", "creativity"),
          option("关注它最影响哪些人的日常", "empathy"),
          option("去看看别的城市怎么处理", "exploration"),
          option("学习相关政策和方法，找到可行路径", "learning"),
        ],
      },
      {
        prompt: "部门准备做一场庆功活动，你最自然想负责？",
        options: [
          option("一个新鲜的创意和现场氛围", "creativity"),
          option("把预算、流程和关键节点落到实处", "action"),
          option("找一个大家都没去过的新场地", "exploration"),
          option("上台把这次合作的故事讲出来", "expression"),
        ],
      },
      {
        prompt: "团队里有人明显跟不上进度，你会优先？",
        options: [
          option("先问他最近遇到了什么情绪或困难", "empathy"),
          option("帮他把下一步拆成更能完成的小动作", "action"),
          option("协调其他人先补齐关键环节", "collaboration"),
          option("分享自己遇到类似情况时的方法", "learning"),
        ],
      },
    ],
  };
})();
