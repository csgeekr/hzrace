import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "杭城赛事 · 杭州年度赛事日历" },
      {
        name: "description",
        content:
          "杭城赛事以年度日历形式列出杭州每年定期举办的人工智能与科技赛事活动，支持在线新增与删除。",
      },
      { property: "og:title", content: "杭城赛事 · 杭州年度赛事日历" },
      {
        property: "og:description",
        content: "杭州每年定期举办的赛事活动年度日历，支持自由新增与删除。",
      },
    ],
  }),
  component: Index,
});

type RaceEvent = {
  id: string;
  month: number;
  title: string;
  date: string;
  organizer: string;
  note: string;
  url?: string;
};

const MONTHS = [
  "一月",
  "二月",
  "三月",
  "四月",
  "五月",
  "六月",
  "七月",
  "八月",
  "九月",
  "十月",
  "十一月",
  "十二月",
];

const SEED: RaceEvent[] = [
  {
    id: "gaitc",
    month: 5,
    title: "GAITC 全球人工智能技术大会",
    date: "2026年5月23-24日",
    organizer: "中国人工智能学会",
    note: "国内 AI 领域千人级综合性活动，2026 年在杭州举行。",
  },
  {
    id: "zjb-ai",
    month: 5,
    title: "之江杯全球人工智能大赛",
    date: "每年 5-6 月启动报名，7-8 月初赛复赛，9-10 月全球总决赛",
    organizer: "浙江省政府、科技部火炬中心",
    note: "浙江省 AI 赛事品牌。该赛事没有独立官网，报名统一走「浙江政务服务网」赛会活动通道，搜索「人工智能大赛」进入。",
    url: "https://zjzwfw.gov.cn",
  },
  {
    id: "jinchao",
    month: 6,
    title: "浙江省「金潮杯」科技和产业创新融合竞赛",
    date: "2026年6月16日发文启动，申报截止7月30日；8-9月线上初赛，8月30日/10月15日两赛道线下决赛",
    organizer: "浙江省文化广电和旅游厅",
    note: "聚焦文旅领域「文化+科技」融合。设「行业强基」（已落地项目）和「前沿探索」（原型产品/中试/产需对接，允许高校学生团队参与）两个赛道。",
    url: "http://scrhjs.wasu.com.cn",
  },
  {
    id: "adventurex",
    month: 7,
    title: "AdventureX 青年黑客松大赛",
    date: "2026年7月22-26日",
    organizer: "AdventureX",
    note: "中国最大的青年黑客松，每年固定落地杭州；2024 年为 7 月 15-19 日在杭州湖畔创新中心。",
    url: "https://adventure-x.org",
  },
  {
    id: "goai",
    month: 7,
    title: "GOAI 世界人工智能开源大赛",
    date: "2026年7月下旬至8月中旬开放初赛作品提交",
    organizer: "杭州市开源人工智能基金会",
    note: "2026 年首届。",
    url: "https://goaihz.com",
  },
  {
    id: "postdoc",
    month: 10,
    title: "「大走廊杯」杭州博士后科创精英赛",
    date: "报名截止8月底，决赛10月中旬",
    organizer: "杭州市",
    note: "面向海内外博士后团队，设人工智能等专业赛道。",
  },
];

const STORAGE_KEY = "hangcheng-events-v2";

function Index() {
  const [events, setEvents] = useState<RaceEvent[]>(SEED);
  const [loaded, setLoaded] = useState(false);
  const [formMonth, setFormMonth] = useState<number | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setEvents(JSON.parse(raw) as RaceEvent[]);
    } catch {
      /* 忽略读取失败 */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  }, [events, loaded]);

  const byMonth = useMemo(() => {
    const map = new Map<number, RaceEvent[]>();
    for (let m = 1; m <= 12; m++) map.set(m, []);
    for (const e of events) map.get(e.month)?.push(e);
    return map;
  }, [events]);

  

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-end justify-between gap-6 px-6 py-14 md:px-10 md:py-20">
          <div>
            <p className="font-display text-xs uppercase tracking-[0.35em] text-muted-foreground">
              Hangzhou Event Calendar
            </p>
            <h1 className="mt-4 text-5xl font-bold leading-none tracking-tight md:text-7xl">
              杭城赛事
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
              以年度日历的形式，记录每年在杭州定期举办的赛事活动。
            </p>
          </div>
          <div className="font-display text-right">
            <div className="text-6xl font-bold leading-none text-brand md:text-8xl">DNCN</div>
            <div className="mt-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
              共 {events.length} 场赛事
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-[1400px] px-6 py-12 md:px-10">
        <div className="grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
            const list = byMonth.get(m) ?? [];
            return (
              <div key={m} className="flex min-h-[220px] flex-col bg-background p-5">
                <div className="flex items-baseline justify-between border-b border-border pb-3">
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-3xl font-bold leading-none">
                      {String(m).padStart(2, "0")}
                    </span>
                    <span className="text-xs tracking-widest text-muted-foreground">
                      {MONTHS[m - 1]}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormMonth(formMonth === m ? null : m)}
                    className="font-display text-xs uppercase tracking-widest text-brand transition-opacity hover:opacity-60"
                  >
                    {formMonth === m ? "取消" : "+ 新增"}
                  </button>
                </div>

                <div className="mt-4 flex flex-1 flex-col gap-3">
                  {list.length === 0 && formMonth !== m && (
                    <p className="text-xs text-muted-foreground">本月暂无收录赛事</p>
                  )}

                  {list.map((e) => (
                    <article
                      key={e.id}
                      className="group border-l-2 border-brand bg-secondary/60 p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <h2 className="text-sm font-semibold leading-snug">{e.title}</h2>
                        <button
                          type="button"
                          aria-label={`删除 ${e.title}`}
                          onClick={() => setEvents((prev) => prev.filter((x) => x.id !== e.id))}
                          className="shrink-0 text-xs text-muted-foreground transition-colors hover:text-destructive"
                        >
                          删除
                        </button>
                      </div>
                      <p className="mt-1 font-display text-xs tracking-wide text-brand">{e.date}</p>
                      {e.organizer && (
                        <p className="mt-1 text-xs text-muted-foreground">主办：{e.organizer}</p>
                      )}
                      {e.note && (
                        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                          {e.note}
                        </p>
                      )}
                      {e.url && (
                        <a
                          href={e.url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-block text-xs text-brand underline-offset-2 hover:underline"
                        >
                          官网/报名通道
                        </a>
                      )}
                    </article>
                  ))}

                  {formMonth === m && (
                    <EventForm
                      month={m}
                      onCancel={() => setFormMonth(null)}
                      onSubmit={(e) => {
                        setEvents((prev) => [...prev, e]);
                        setFormMonth(null);
                      }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-[1400px] px-6 py-10 text-xs text-muted-foreground md:px-10">
          杭城赛事 · 杭州年度赛事日历
        </div>
      </footer>
    </main>
  );
}

function EventForm({
  month,
  onSubmit,
  onCancel,
}: {
  month: number;
  onSubmit: (e: RaceEvent) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [organizer, setOrganizer] = useState("");
  const [note, setNote] = useState("");
  const [url, setUrl] = useState("");

  const field =
    "w-full border border-border bg-background px-2 py-1.5 text-xs outline-none focus:border-brand";

  return (
    <form
      className="flex flex-col gap-2 border border-dashed border-brand p-3"
      onSubmit={(ev) => {
        ev.preventDefault();
        if (!title.trim()) return;
        onSubmit({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          month,
          title: title.trim(),
          date: date.trim(),
          organizer: organizer.trim(),
          note: note.trim(),
          ...(url.trim() ? { url: url.trim() } : {}),
        });
      }}
    >
      <input
        className={field}
        placeholder="赛事名称"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        autoFocus
      />
      <input
        className={field}
        placeholder="举办时间，如 2026年5月23-24日"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
      <input
        className={field}
        placeholder="主办方"
        value={organizer}
        onChange={(e) => setOrganizer(e.target.value)}
      />
      <textarea
        className={field}
        rows={2}
        placeholder="简介"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <input
        className={field}
        placeholder="官网/报名链接（可选）"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <div className="flex gap-2">
        <button
          type="submit"
          className="bg-brand px-3 py-1.5 font-display text-xs uppercase tracking-widest text-primary-foreground transition-opacity hover:opacity-80"
        >
          添加
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 font-display text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground"
        >
          取消
        </button>
      </div>
    </form>
  );
}
