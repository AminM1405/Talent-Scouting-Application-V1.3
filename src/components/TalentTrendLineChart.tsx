import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { TrendingUp, Calendar, Info, Layers } from 'lucide-react';
import { AssessmentRecord } from '../lib/firebase';
import { DOMAINS } from '../data/domains';

interface TalentTrendLineChartProps {
  assessments: AssessmentRecord[];
}

interface TrendDataPoint {
  dateLabel: string;
  startDate: Date;
  endDate: Date;
  [domainName: string]: any;
}

// Palet warna domain untuk grafik tren
const DOMAIN_COLORS: Record<string, string> = {
  'Minat & Eksplorasi Karier': '#d97706', // Amber-600
  'Penalaran & Belajar': '#2563eb', // Blue-600
  'Teknis & Praktis': '#70263d', // ITDF Maroon
  'Kreativitas & Ekspresi': '#b47b26', // Gold
  'Interpersonal & Kolaborasi': '#16a34a', // Emerald-600
  'Kepemimpinan & Inisiatif': '#9333ea', // Purple-600
  'Pengelolaan Diri & Ketekunan': '#0891b2', // Cyan-600
  'Aspirasi & Kesiapan Berkembang': '#e11d48' // Rose-600
};

export const TalentTrendLineChart: React.FC<TalentTrendLineChartProps> = ({ assessments }) => {
  // Mode tampilan: 'frequency' (jumlah siswa per domain) atau 'averageScore' (rata-rata skor)
  const [metricMode, setMetricMode] = useState<'frequency' | 'averageScore'>('frequency');

  // Filter domain aktif (default pilih 4 domain yang paling sering muncul)
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);

  // Tentukan jendela 30 hari terakhir
  const { chartData, activeDomainKeys, trendSummary } = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Filter asesmen dalam rentang 30 hari terakhir
    const recentAssessments = assessments.filter((a) => {
      const date = a.created_at ? new Date(a.created_at) : new Date();
      return date >= thirtyDaysAgo && date <= now;
    });

    // Buat 6 interval waktu (masing-masing 5 hari) dalam rentang 30 hari
    const intervals: TrendDataPoint[] = [];
    const intervalDays = 5;
    const totalIntervals = 6;

    for (let i = 0; i < totalIntervals; i++) {
      const startMs = thirtyDaysAgo.getTime() + i * intervalDays * 24 * 60 * 60 * 1000;
      const endMs = startMs + intervalDays * 24 * 60 * 60 * 1000;
      const startD = new Date(startMs);
      const endD = new Date(Math.min(endMs, now.getTime()));

      const startDay = startD.getDate();
      const endDay = endD.getDate();
      const monthStr = endD.toLocaleDateString('id-ID', { month: 'short' });

      const label = `${startDay}–${endDay} ${monthStr}`;

      const point: TrendDataPoint = {
        dateLabel: label,
        startDate: startD,
        endDate: endD
      };

      // Inisialisasi hitungan untuk setiap domain
      DOMAINS.forEach((d) => {
        point[d.name] = 0;
        point[`${d.name}_totalScore`] = 0;
        point[`${d.name}_scoreCount`] = 0;
      });

      intervals.push(point);
    }

    // Hitung kemunculan asesmen ke dalam setiap interval
    const domainFrequencyMap: Record<string, number> = {};

    recentAssessments.forEach((a) => {
      const aDate = a.created_at ? new Date(a.created_at) : new Date();
      const targetInterval = intervals.find(
        (int) => aDate >= int.startDate && aDate <= int.endDate
      ) || intervals[intervals.length - 1];

      // Catat domain teratas
      if (a.top_domain && targetInterval[a.top_domain] !== undefined) {
        targetInterval[a.top_domain] = (targetInterval[a.top_domain] || 0) + 1;
        domainFrequencyMap[a.top_domain] = (domainFrequencyMap[a.top_domain] || 0) + 1;
      }

      // Catat skor untuk mode averageScore
      if (a.scores) {
        DOMAINS.forEach((d) => {
          const s = a.scores[d.key];
          if (s !== undefined) {
            targetInterval[`${d.name}_totalScore`] += Number(s);
            targetInterval[`${d.name}_scoreCount`] += 1;
          }
        });
      }
    });

    // Jika mode averageScore, hitung rata-rata
    if (metricMode === 'averageScore') {
      intervals.forEach((point) => {
        DOMAINS.forEach((d) => {
          const count = point[`${d.name}_scoreCount`];
          const total = point[`${d.name}_totalScore`];
          point[d.name] = count > 0 ? Number((total / count).toFixed(2)) : 0;
        });
      });
    }

    // Urutkan domain berdasarkan frekuensi kemunculan tertinggi
    const sortedDomains = DOMAINS.map((d) => ({
      name: d.name,
      count: domainFrequencyMap[d.name] || 0
    })).sort((a, b) => b.count - a.count);

    // Ambil 4 domain teratas yang ada datanya, atau 3 domain pertama jika kosong
    const topFour = sortedDomains.filter((d) => d.count > 0).slice(0, 4).map((d) => d.name);
    const fallbackTop = topFour.length > 0 ? topFour : [DOMAINS[2].name, DOMAINS[3].name, DOMAINS[1].name];

    // Buat ringkasan insight tren
    let summaryText = 'Menampilkan tren distribusi potensi bakat siswa.';
    if (topFour.length > 0) {
      summaryText = `Dalam 30 hari terakhir, domain "${topFour[0]}" paling banyak menjadi fokus utama siswa.`;
    }

    return {
      chartData: intervals,
      activeDomainKeys: fallbackTop,
      trendSummary: summaryText
    };
  }, [assessments, metricMode]);

  // Kelola domain yang dicentang
  const currentActiveDomains = selectedDomains.length > 0 ? selectedDomains : activeDomainKeys;

  const toggleDomain = (domainName: string) => {
    setSelectedDomains((prev) => {
      const active = prev.length > 0 ? prev : activeDomainKeys;
      if (active.includes(domainName)) {
        if (active.length <= 1) return active; // Minimal 1 garis aktif
        return active.filter((name) => name !== domainName);
      } else {
        return [...active, domainName];
      }
    });
  };

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-md p-3 rounded-xl border border-stone-200 shadow-xl text-xs space-y-1.5 min-w-[160px]">
          <p className="font-bold text-stone-900 border-b border-stone-100 pb-1">
            Periode: {label}
          </p>
          <div className="space-y-1 pt-0.5">
            {payload.map((entry: any) => (
              <div key={entry.name} className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-1.5 text-stone-600 truncate max-w-[140px]">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: entry.color }}
                  />
                  {entry.name}
                </span>
                <span className="font-mono font-bold text-stone-900 tabular-nums">
                  {metricMode === 'frequency'
                    ? `${entry.value} siswa`
                    : `${Number(entry.value).toFixed(2)} / 5`}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl border border-[#eaded8] p-4 sm:p-5 shadow-xs space-y-3.5">
      {/* Header Grafik */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-[#eaded8] pb-3">
        <div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#70263d] tracking-wider uppercase">
            <TrendingUp className="w-3.5 h-3.5 text-[#70263d]" />
            <span>Tren Potensi 30 Hari Terakhir</span>
          </div>
          <h3 className="text-sm sm:text-base font-bold text-stone-900 mt-0.5">
            Dinamika Sebaran Domain Asesmen
          </h3>
          <p className="text-[11px] text-stone-600 mt-0.5">
            {trendSummary}
          </p>
        </div>

        {/* Toggle Mode Frekuensi vs Rata-rata Skor */}
        <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-xl self-start sm:self-auto text-xs">
          <button
            onClick={() => setMetricMode('frequency')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
              metricMode === 'frequency'
                ? 'bg-white text-stone-900 shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Jumlah Siswa
          </button>
          <button
            onClick={() => setMetricMode('averageScore')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
              metricMode === 'averageScore'
                ? 'bg-white text-stone-900 shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Rerata Skor (1–5)
          </button>
        </div>
      </div>

      {/* Filter Chips Domain yang Ditampilkan */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-bold text-stone-600 uppercase tracking-wider block">
          Pilih Garis Domain:
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          {DOMAINS.map((domain) => {
            const isSelected = currentActiveDomains.includes(domain.name);
            const color = DOMAIN_COLORS[domain.name] || '#70263d';

            return (
              <button
                key={domain.key}
                type="button"
                onClick={() => toggleDomain(domain.name)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all border ${
                  isSelected
                    ? 'bg-stone-50 border-stone-300 text-stone-900 shadow-2xs'
                    : 'bg-white/60 border-stone-200 text-stone-600 opacity-60 hover:opacity-100'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{
                    backgroundColor: isSelected ? color : '#a8a29e'
                  }}
                />
                <span className="truncate max-w-[130px]">{domain.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Kontainer Grafik Recharts */}
      <div className="w-full h-64 sm:h-72 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1e9e5" vertical={false} />
            <XAxis
              dataKey="dateLabel"
              tickLine={false}
              axisLine={{ stroke: '#eaded8' }}
              tick={{ fill: '#78716c', fontSize: 10 }}
            />
            <YAxis
              tickLine={false}
              axisLine={{ stroke: '#eaded8' }}
              tick={{ fill: '#78716c', fontSize: 10 }}
              domain={metricMode === 'averageScore' ? [0, 5] : ['auto', 'auto']}
              allowDecimals={metricMode === 'averageScore'}
            />
            <Tooltip content={<CustomTooltip />} />
            {currentActiveDomains.map((domainName) => {
              const strokeColor = DOMAIN_COLORS[domainName] || '#70263d';
              return (
                <Line
                  key={domainName}
                  type="monotone"
                  dataKey={domainName}
                  name={domainName}
                  stroke={strokeColor}
                  strokeWidth={2.5}
                  dot={{ r: 3.5, fill: strokeColor, strokeWidth: 1.5, stroke: '#ffffff' }}
                  activeDot={{ r: 5, strokeWidth: 2, stroke: '#ffffff' }}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Keterangan Kaki Grafik */}
      <div className="flex items-center justify-between text-[10px] text-stone-600 pt-1 border-t border-stone-100">
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3 text-stone-600" />
          <span>Rentang 30 hari terakhir (diagregasi tiap 5 hari)</span>
        </span>
        <span>Recharts v2</span>
      </div>
    </div>
  );
};
