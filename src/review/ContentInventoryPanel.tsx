import { useEffect, useState } from 'react';
import type { InventoryReport } from '../shared/contentInventoryTypes';

type Report = InventoryReport;
const approval = { approved: '已批准', review: '待审查', revision: '待修改', structure: '结构内容' };
const kinds = { activity: '行动', dialogue: '对话', story: '剧情链', topic: '话题', event: '事件', job: '工作', item: '物品', shop: '商店' };
const roles = { exclusive: '专属/主属', participant: '参与', condition: '条件关联', reference: '引用' };

export function ContentInventoryPanel({ onClose }: { onClose: () => void }) {
  const [report, setReport] = useState<Report>();
  const [idol, setIdol] = useState('mano');
  const [scope, setScope] = useState('idol');
  const [kind, setKind] = useState('all');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [generation, setGeneration] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    fetch('/api/review/inventory', { signal: controller.signal, cache: 'no-store' })
      .then(async response => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? '读取档案失败');
        return data as Report;
      }).then(data => { if (!controller.signal.aborted) setReport(data); })
      .catch(e => { if (!controller.signal.aborted) { setReport(undefined); setError(String(e)); } })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [generation]);
  const row = report?.idols.find(i => i.id === idol);
  const keys = new Set(scope === 'shared' ? report?.sharedKeys : scope === 'unresolved' ? report?.unresolvedKeys : [...(row?.keys ?? []), ...(row?.pendingKeys ?? [])]);
  const entries = report?.entries.filter(e => keys.has(e.key) && (kind === 'all' || e.kind === kind)) ?? [];
  return <main className="review-inventory">
    <header className="review-topbar">
      <div><h1>偶像内容档案</h1><p>查看内容数量、出处、审批和源包接入状态。</p></div>
      <div><button onClick={() => setGeneration(g => g + 1)} disabled={loading}>刷新档案</button> <button onClick={onClose}>返回审查队列</button></div>
    </header>
    {loading && <p role="status">正在读取最新内容…</p>}
    {error && <p role="alert" className="review-error">{error}</p>}
    {report && <>
      <div className="inventory-filters">
        <label>偶像 <select aria-label="档案偶像" value={idol} onChange={e => setIdol(e.target.value)}>{report.idols.map(i => <option key={i.id} value={i.id}>{i.name}（{i.id}）</option>)}</select></label>
        <label>范围 <select aria-label="档案范围" value={scope} onChange={e => setScope(e.target.value)}><option value="idol">角色相关</option><option value="shared">通用 / 动态</option><option value="unresolved">待确认归属</option></select></label>
        <label>类型 <select aria-label="档案类型" value={kind} onChange={e => setKind(e.target.value)}><option value="all">全部类型</option>{Object.entries(kinds).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
      </div>
      <p>{report.basis}。审批后可点击刷新；分类存在重叠，不可直接相加。</p>
      {row && <section aria-label="角色内容汇总" className="inventory-counts">
        {Object.entries({ '卡面（完整接入/登记）': `${row.counts.integratedCards}/${row.counts.cards}`, '卡面章节（接入/可用/总数）': `${row.counts.integratedCardChapters}/${row.counts.availableCardChapters}/${row.counts.cardChapters}`,
          '招募链': row.counts.recruitment, '长线': row.counts.arcs, '专属行动': row.counts.exclusiveActions, '多人行动': row.counts.participantActions,
          '话题': row.counts.topics, '主属对话': row.counts.dialogues, '参与对话': row.counts.participantDialogues,
          '专属事件': row.counts.exclusiveEvents, '参与事件': row.counts.participantEvents, '条件关联事件': row.counts.conditionEvents, '待处理': row.counts.pending }).map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}
      </section>}
      <details><summary>统计警告（{report.warnings.length}）</summary>{report.warnings.map(w => <p key={w}>{w}</p>)}</details>
      <h2>内容明细（{entries.length}）</h2>
      {!entries.length && <p>当前筛选没有内容。</p>}
      {entries.map(entry => <details className="inventory-entry" key={entry.key}>
        <summary>{kinds[entry.kind]} · {entry.title} <small>{entry.integrated ? '已接入源包' : '未接入'}{entry.versions.some(v => v.approval === 'review' || v.approval === 'revision') ? ' · 有待处理稿' : ''}</small><code>{entry.key}</code></summary>
        {entry.versions.map((v, n) => <section key={`${v.file}/${n}`}>
          <p><strong>{approval[v.approval]} · {v.integration === 'integrated' ? '已接入源包' : '未接入'}</strong> {v.reason}</p>
          <p>文件：<code>{v.file}</code></p><p>草稿：{v.draftId ?? '—'} · 版本 {v.version ?? '—'} · 根版本 {v.rootId ?? '—'} · 替换 {v.supersedes ?? '—'}</p>
          <ul>{v.relations.map((r, i) => <li key={i}>{r.idolId} · {roles[r.role]} · <code>{r.path}</code></li>)}</ul>
        </section>)}
        {entry.chapters?.map(c => <p key={c.id}>章 <code>{c.id}</code> · {c.available ? '对话可用' : '缺对话'} / {c.integrated ? '链已接入' : '链未接入'}<br/>剧本 {c.source?.script ?? c.script ?? '—'} · {c.source?.source ?? '未登记出处'}</p>)}
      </details>)}
    </>}
  </main>;
}
