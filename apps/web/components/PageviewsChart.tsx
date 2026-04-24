"use client";

import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import type { ChartOptions } from "chart.js";
import { useEffect, useMemo, useRef, useState } from "react";
import { Line } from "react-chartjs-2";

import { useSSE } from "@/hooks/useSSE";
import { getHistory, type HistoryPoint } from "@/lib/api";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

type PageviewsChartProps = {
  siteId: string;
  apiKey: string;
};

function currentHourIso(): string {
  const hour = new Date();
  hour.setMinutes(0, 0, 0);
  return hour.toISOString();
}

function formatHour(hour: string): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(hour));
}

export function PageviewsChart({ siteId, apiKey }: PageviewsChartProps) {
  const liveStats = useSSE(siteId, apiKey);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const previousTotal = useRef<number | null>(null);

  useEffect(() => {
    let isMounted = true;

    getHistory(siteId)
      .then((rows) => {
        if (isMounted) {
          setHistory(rows);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [siteId]);

  useEffect(() => {
    if (!liveStats) {
      return;
    }

    const lastTotal = previousTotal.current;
    previousTotal.current = liveStats.totalToday;

    if (lastTotal === null) {
      return;
    }

    const delta = liveStats.totalToday - lastTotal;

    if (delta <= 0) {
      return;
    }

    setHistory((currentHistory) => {
      const hour = currentHourIso();
      const nextHistory = [...currentHistory];
      const existingIndex = nextHistory.findIndex((point) => point.hour === hour);

      if (existingIndex >= 0) {
        nextHistory[existingIndex] = {
          ...nextHistory[existingIndex],
          count: nextHistory[existingIndex].count + delta,
        };
      } else {
        nextHistory.push({ hour, count: delta });
      }

      return nextHistory
        .sort((left, right) => new Date(left.hour).getTime() - new Date(right.hour).getTime())
        .slice(-24);
    });
  }, [liveStats]);

  const chartData = useMemo(
    () => ({
      labels: history.map((point) => formatHour(point.hour)),
      datasets: [
        {
          data: history.map((point) => point.count),
          borderColor: "#4F6EF7",
          backgroundColor: "rgba(79,110,247,0.08)",
          fill: true,
          tension: 0.35,
          pointBackgroundColor: "#4F6EF7",
          pointBorderColor: "#FFFFFF",
          pointRadius: 3,
          pointHoverRadius: 5,
        },
      ],
    }),
    [history],
  );

  const chartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#FFFFFF",
        bodyColor: "#0D1117",
        borderColor: "#DDE2F0",
        borderWidth: 1,
        displayColors: false,
        titleColor: "#5A6482",
      },
    },
    scales: {
      x: {
        grid: {
          color: "#DDE2F0",
        },
        ticks: {
          color: "#5A6482",
          maxRotation: 0,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "#DDE2F0",
        },
        ticks: {
          color: "#5A6482",
          precision: 0,
        },
      },
    },
  };

  return (
    <section className="rounded-xl border border-bg-border bg-bg-surface p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-text-secondary">
            Pageviews
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-text-primary">
            Last 24 hours
          </h2>
        </div>
        {isLoading && <span className="text-xs font-medium text-text-muted">loading...</span>}
      </div>
      <div className="h-80">
        <Line data={chartData} options={chartOptions} />
      </div>
    </section>
  );
}
