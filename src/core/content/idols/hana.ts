import type { IdolDef } from '../../types';

const idol: IdolDef = {
  id: 'hana',
  name: '鈴木羽那',
  unit: 'CoMETIK',
  color: '#d89ac6',
  profile:
    'CoMETIK 的成员。冈山出身，被朋友的视频送进了这行；不会掩饰，也从不敷衍，笑的时候整张脸都在笑。',
  avatar: './assets/idols/q/hana.png',
  age: 18,
  school: 'none',
  // facts 首行：「高中时被制作人发掘，高中毕业后一个人上京」——已毕业，不在学籍。
  schoolNote: 'facts 写的是"高中时被发掘、高中毕业后上京"——已毕业，不在学校',
  // 一张白纸：唱和跳都从零开始；她强在"被人看着"这件事本身。
  growth: {
    vocal: { initial: 'E', max: 'S' },
    dance: { initial: 'E', max: 'S' },
    expression: { initial: 'C', max: 'S' },
    trust: { initial: 'E', max: 'S' },
  },
};

export default idol;
