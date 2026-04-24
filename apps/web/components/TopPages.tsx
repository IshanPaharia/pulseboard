"use client";

import { useSSE } from "@/hooks/useSSE";

type TopPagesProps = {
  siteId: string;
  apiKey: string;
};

export function TopPages({ siteId, apiKey }: TopPagesProps) {
  const stats = useSSE(siteId, apiKey);
  const pages = stats?.topPages ?? [];
  const topCount = pages[0]?.count ?? 0;

  return (
    <section className="rounded-xl border border-bg-border bg-bg-surface p-6 shadow-sm">
      <div className="mb-6">
        <p className="text-xs font-medium uppercase tracking-widest text-text-secondary">
          Top Pages
        </p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight text-text-primary">
          Live ranking
        </h2>
      </div>

      {!stats ? (
        <div className="rounded-lg bg-bg-raised px-4 py-6 text-sm text-text-secondary">
          connecting...
        </div>
      ) : (
        <div className="overflow-hidden">
          <table className="w-full table-fixed divide-y divide-bg-border text-left">
            <thead>
              <tr className="text-xs font-medium uppercase tracking-widest text-text-secondary">
                <th className="w-12 pb-3">#</th>
                <th className="pb-3">Page</th>
                <th className="w-20 pb-3 text-right">Views</th>
                <th className="w-36 pb-3 pl-4">Bar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bg-border">
              {pages.length === 0 ? (
                <tr>
                  <td className="py-5 text-sm text-text-secondary" colSpan={4}>
                    No pageviews yet.
                  </td>
                </tr>
              ) : (
                pages.map((page, index) => {
                  const width = topCount > 0 ? `${(page.count / topCount) * 100}%` : "0%";

                  return (
                    <tr key={page.url} className="text-sm text-text-secondary">
                      <td className="py-4 pr-3 text-text-muted">{index + 1}</td>
                      <td className="py-4 pr-4">
                        <span className="block truncate font-mono text-sm text-text-primary">
                          {page.url}
                        </span>
                      </td>
                      <td className="py-4 text-right font-medium text-text-primary">
                        {page.count}
                      </td>
                      <td className="py-4 pl-4">
                        <div className="h-2 w-full rounded-full bg-bg-raised">
                          <div
                            className="h-2 rounded-full bg-brand"
                            style={{ width }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
