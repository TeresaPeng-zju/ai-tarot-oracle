import type { TarotCard, MinorSuit, MinorRank } from './types';

export const MAJORS: Omit<TarotCard, 'type'>[] = [
  { n: "愚者", e: "The Fool", m: "新的开始 · 冒险 · 纯真", url: "9/90/RWS_Tarot_00_Fool.jpg" },
  { n: "魔术师", e: "The Magician", m: "创造力 · 意志 · 显化", url: "d/de/RWS_Tarot_01_Magician.jpg" },
  { n: "女祭司", e: "The High Priestess", m: "直觉 · 神秘 · 潜意识", url: "8/88/RWS_Tarot_02_High_Priestess.jpg" },
  { n: "皇后", e: "The Empress", m: "丰饶 · 自然 · 母性", url: "d/d2/RWS_Tarot_03_Empress.jpg" },
  { n: "皇帝", e: "The Emperor", m: "权威 · 结构 · 控制", url: "c/c3/RWS_Tarot_04_Emperor.jpg" },
  { n: "教皇", e: "The Hierophant", m: "传统 · 信仰 · 教育", url: "8/8d/RWS_Tarot_05_Hierophant.jpg" },
  { n: "恋人", e: "The Lovers", m: "爱 · 和谐 · 选择", url: "3/3a/TheLovers.jpg" },
  { n: "战车", e: "The Chariot", m: "胜利 · 意志 · 自律", url: "9/9b/RWS_Tarot_07_Chariot.jpg" },
  { n: "力量", e: "Strength", m: "勇气 · 耐心 · 同情", url: "f/f5/RWS_Tarot_08_Strength.jpg" },
  { n: "隐士", e: "The Hermit", m: "内省 · 孤独 · 指引", url: "4/4d/RWS_Tarot_09_Hermit.jpg" },
  { n: "命运之轮", e: "Wheel of Fortune", m: "周期 · 变化 · 运气", url: "3/3c/RWS_Tarot_10_Wheel_of_Fortune.jpg" },
  { n: "正义", e: "Justice", m: "公平 · 真理 · 因果", url: "e/e0/RWS_Tarot_11_Justice.jpg" },
  { n: "倒吊人", e: "The Hanged Man", m: "牺牲 · 新视角 · 放手", url: "2/2b/RWS_Tarot_12_Hanged_Man.jpg" },
  { n: "死神", e: "Death", m: "结束 · 转变 · 重生", url: "d/d7/RWS_Tarot_13_Death.jpg" },
  { n: "节制", e: "Temperance", m: "平衡 · 适度 · 融合", url: "f/f8/RWS_Tarot_14_Temperance.jpg" },
  { n: "恶魔", e: "The Devil", m: "束缚 · 欲望 · 诱惑", url: "5/55/RWS_Tarot_15_Devil.jpg" },
  { n: "高塔", e: "The Tower", m: "突变 · 混乱 · 觉醒", url: "5/53/RWS_Tarot_16_Tower.jpg" },
  { n: "星星", e: "The Star", m: "希望 · 灵感 · 治愈", url: "d/db/RWS_Tarot_17_Star.jpg" },
  { n: "月亮", e: "The Moon", m: "幻觉 · 不安 · 潜意识", url: "7/7f/RWS_Tarot_18_Moon.jpg" },
  { n: "太阳", e: "The Sun", m: "快乐 · 成功 · 活力", url: "1/17/RWS_Tarot_19_Sun.jpg" },
  { n: "审判", e: "Judgement", m: "复活 · 觉醒 · 召唤", url: "d/dd/RWS_Tarot_20_Judgement.jpg" },
  { n: "世界", e: "The World", m: "完成 · 整合 · 圆满", url: "f/ff/RWS_Tarot_21_World.jpg" }
];

export const MINORS_SUITS: MinorSuit[] = [
  { id: 'Wands', name: '权杖', key: '行动 火' },
  { id: 'Cups', name: '圣杯', key: '情感 水' },
  { id: 'Swords', name: '宝剑', key: '思想 风' },
  { id: 'Pentacles', name: '星币', key: '物质 土', alt: 'Pents' }
];

export const MINORS_RANKS: MinorRank[] = [
  { id: 'Ace', cn: '首牌', m: '新开端' },
  { id: '2', cn: '2', m: '平衡与决定' },
  { id: '3', cn: '3', m: '合作' },
  { id: '4', cn: '4', m: '稳定' },
  { id: '5', cn: '5', m: '冲突' },
  { id: '6', cn: '6', m: '胜利' },
  { id: '7', cn: '7', m: '坚持' },
  { id: '8', cn: '8', m: '变化' },
  { id: '9', cn: '9', m: '韧性' },
  { id: '10', cn: '10', m: '圆满' },
  { id: 'Page', cn: '侍从', m: '好奇' },
  { id: 'Knight', cn: '骑士', m: '行动' },
  { id: 'Queen', cn: '王后', m: '理解' },
  { id: 'King', cn: '国王', m: '掌控' }
];

// 生成完整的塔罗牌数据库
export const TAROT_DB: TarotCard[] = [
  ...MAJORS.map(c => ({ ...c, type: 'Major Arcana' })),
  ...MINORS_SUITS.flatMap(suit =>
    MINORS_RANKS.map(rank => ({
      n: `${suit.name}${rank.cn}`,
      e: `${rank.id} of ${suit.id}`,
      m: `${suit.key} · ${rank.m}`,
      type: 'Minor Arcana',
      url: `RWS_Tarot_${suit.alt || suit.id}_${rank.id}.jpg`
    }))
  )
];

export const getImg = (path: string): string =>
  path.startsWith('http') ? path : `https://upload.wikimedia.org/wikipedia/commons/${path}`;

