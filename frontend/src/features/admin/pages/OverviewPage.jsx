import { Link } from "react-router-dom";
import { adminApi } from "../api/adminApi";
import { useAsync } from "../hooks/useAsync";
import { RISK } from "../constants";
import { number, signed, timeAgo } from "../utils/format";
import PageHeader from "../components/PageHeader";
import PageState from "../components/PageState";
import StatStrip from "../components/StatStrip";
import BarChart from "../components/BarChart";
import DonutChart from "../components/DonutChart";
import Avatar from "../components/Avatar";
import Badge from "../components/Badge";
import { Card, CardHeader } from "../components/Card";

const HEADER = <PageHeader title="Overview" subtitle="Today at Athma Counselling" />;
const Hl = ({ children }) => <b className="font-medium text-orange-700">{children}</b>;

export default function OverviewPage() {
  const { data, loading, error } = useAsync(adminApi.getOverview, []);
  console.log(data);
  if (loading || error) return <>{HEADER}<PageState loading={loading} error={error} /></>;

  const { stats, by_day, risk } = data;
  const segments = Object.entries(RISK).map(([key, r]) => ({ key, ...r, value: risk[key] }));
  const total = segments.reduce((sum, s) => sum + s.value, 0);

  return (
    <>
      {HEADER}

      <StatStrip
        items={[
          { label: "Assessments completed this week", value: number(stats.assessments_week), hint: <><Hl>{signed(stats.assessments_change)}%</Hl> vs last week</> },
          { label: "Registered patients", value: number(stats.patients), hint: <><Hl>+{stats.patients_month}</Hl> this month</> },
          { label: "High-risk follow-ups", value: number(stats.high_risk), hint: <><Hl>{stats.high_risk_waiting} waiting</Hl> for a call</> },
        ]}
      />

      <div className="mb-6 grid gap-6 lg:grid-cols-[1.85fr_1fr]">
        <Card>
          <CardHeader title="Assessments by day" right="Last 7 days" />
          <div className="px-7 pb-7 pt-3.5">
            <BarChart data={by_day.map((d) => ({ label: d.day, value: d.count }))} />
          </div>
        </Card>

        <Card>
          <CardHeader title="Risk levels" right="All patients" />
          <div className="px-7 pb-7 pt-3.5">
            <DonutChart segments={segments} total={total} label="patients" />
            <ul>
              {segments.map((s) => (
                <li key={s.key} className="flex items-center gap-3 border-t border-orange-100/60 py-3 text-stone-500">
                  <i className="size-2.5 rounded-full" style={{ background: s.color }} />
                  <span className="flex-1">{s.label}</span>
                  <b className="text-neutral-900">{number(s.value)}</b>
                  <em className="w-11 text-right text-sm not-italic">{Math.round((s.value / total) * 100)}%</em>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Latest activity"
          right={<Link to="/admin/activity" className="rounded-[10px] border border-peach-line px-3.5 py-2 text-sm text-orange-700 hover:bg-orange-50">View all</Link>}
        />
        {/* <ul className="divide-y divide-orange-100/60">
          {activity.map((a) => (
            <li key={a.id} className="flex items-center gap-3.5 px-7 py-4">
              <Avatar name={a.name} />
              <div className="flex-1">
                <p className="text-[15px]"><strong>{a.name}</strong> {a.action}</p>
                <small className="text-stone-500">{timeAgo(a.created_at)}</small>
              </div>
              <Badge tone={a.risk}>{RISK[a.risk].label}</Badge>
            </li>
          ))}
        </ul> */}
      </Card>
    </>
  );
}
