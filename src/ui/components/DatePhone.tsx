import { useEffect, useRef, useState } from 'react';
import type { DatePhoneView } from '../../core/dateAppointments';
import type { DateAppointment } from '../../core/types';
import { formatClock } from '../../core/time';

export function DatePhone({ view, appointment, onClose, onBook }: { view: DatePhoneView; appointment?: DateAppointment;
  onClose: () => void; onBook: (scenarioId: string, fromMinute: number) => void }) {
  const [idolId, setIdolId] = useState(view.entries[0]?.idolId ?? '');
  const [scenarioId, setScenarioId] = useState('');
  const [time, setTime] = useState<number>();
  const dialogRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();
    return () => previous?.focus();
  }, []);
  const idols = [...new Map(view.entries.map(e => [e.idolId, e.idolName])).entries()];
  const scenarios = view.entries.filter(e => e.idolId === idolId);
  const selected = scenarios.find(e => e.scenarioId === scenarioId) ?? scenarios[0];
  const chosen = selected?.times.find(t => t.fromMinute === time);
  useEffect(() => {
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', escape);
    return () => window.removeEventListener('keydown', escape);
  }, [onClose]);
  return <div className="roster-backdrop" onClick={onClose}>
    <section ref={dialogRef} tabIndex={-1} className="roster-panel date-phone" role="dialog" aria-modal="true" aria-label="电话约会预约" onClick={e => e.stopPropagation()}>
      <header className="roster-head"><h2>电话 · 约会预约</h2><button onClick={onClose} aria-label="关闭电话">关闭</button></header>
      <p>只预约今天，每天最多一次。确认时扣费，确认后不可取消。约会会覆盖她今天的全部普通日程。</p>
      <p>失约只扣当前等级信任经验，最低扣到 0，不降级；费用不退。</p>
      {appointment && <p role="status">今日预约：{appointment.status === 'scheduled' ? '待赴约' : appointment.status === 'inProgress' ? '进行中' : appointment.status === 'completed' ? '已完成' : '已失约'} · {formatClock(appointment.fromMinute)}–{formatClock(appointment.arrivalUntilMinute)} 前开始</p>}
      {!view.entries.length ? <p>暂无可预约内容</p> : <>
        <label>偶像<select aria-label="约会偶像" value={idolId} onChange={e => { setIdolId(e.target.value); setScenarioId(''); setTime(undefined); }}>{idols.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label>
        <label>地点与方案<select aria-label="约会地点" value={selected?.scenarioId ?? ''} onChange={e => { setScenarioId(e.target.value); setTime(undefined); }}>{scenarios.map(e => <option key={e.scenarioId} value={e.scenarioId}>{e.locationName} · {e.title}</option>)}</select></label>
        {selected && <>
          <label>赴约时间<select aria-label="约会时间" value={time ?? ''} onChange={e => setTime(e.target.value === '' ? undefined : Number(e.target.value))}>
            <option value="">请选择时段</option>{selected.times.map(t => <option key={t.fromMinute} value={t.fromMinute} disabled={!t.available}>{formatClock(t.fromMinute)}–{formatClock(t.fromMinute + selected.arrivalWindowMinutes)}{t.reason ? ` · ${t.reason}` : ''}</option>)}
          </select></label>
          <p>费用 ¥{selected.fee} · 约会耗时 {selected.durationMinutes} 分钟 · 失约扣信任经验 {selected.penaltyTier}</p>
          <p>请在窗口结束前主动开始约会。当天只有预留时段内她会出现在约定地点。</p>
          {!selected.times.some(t => t.available) && <p role="status">{selected.times[0]?.reason ?? '今天没有可预约时段'}</p>}
          <button disabled={!chosen?.available} onClick={() => { if (chosen?.available) onBook(selected.scenarioId, chosen.fromMinute); }}>确认预约 · 支付 ¥{selected.fee}</button>
        </>}
      </>}
    </section>
  </div>;
}
