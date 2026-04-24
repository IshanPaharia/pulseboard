"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";

type SiteSetupResponse = {
  siteId: string;
  apiKey: string;
  embedSnippet: string;
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export function OnboardingForm() {
  const [domain, setDomain] = useState("localhost");
  const [result, setResult] = useState<SiteSetupResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dashboardHref = useMemo(() => {
    if (!result) {
      return "#";
    }

    const searchParams = new URLSearchParams({
      key: result.apiKey,
      domain,
    });

    return `/dashboard/${result.siteId}?${searchParams.toString()}`;
  }, [domain, result]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`${apiBaseUrl}/api/sites`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ domain }),
      });

      if (!response.ok) {
        throw new Error(`Site setup failed: ${response.status}`);
      }

      setResult((await response.json()) as SiteSetupResponse);
    } catch (setupError) {
      setError(setupError instanceof Error ? setupError.message : "Site setup failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function copySnippet() {
    if (!result) {
      return;
    }

    await navigator.clipboard.writeText(result.embedSnippet);
  }

  return (
    <div className="mx-auto grid min-h-screen w-full max-w-6xl grid-cols-[minmax(0,1fr)_minmax(320px,440px)] gap-10 px-8 py-6 max-lg:grid-cols-1">
      <section className="flex flex-col justify-center">
        <div className="mb-8 inline-flex w-fit rounded-full bg-brand-muted px-3 py-1 text-xs font-medium text-brand">
          PulseBoard
        </div>
        <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-text-primary max-md:text-4xl">
          Set up lightweight analytics for your site.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-text-secondary">
          Create a site key, install the snippet, and watch live traffic roll into the dashboard.
        </p>
      </section>

      <section className="flex items-center">
        <div className="w-full rounded-xl border border-bg-border bg-bg-surface p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                className="mb-2 block text-xs font-medium uppercase tracking-widest text-text-secondary"
                htmlFor="domain"
              >
                Domain
              </label>
              <input
                className="h-12 w-full rounded-lg border border-bg-border bg-bg-raised px-4 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-brand"
                id="domain"
                name="domain"
                onChange={(event) => setDomain(event.target.value)}
                placeholder="example.com"
                value={domain}
              />
            </div>

            <button
              className="flex h-12 w-full items-center justify-center rounded-lg bg-brand px-4 text-sm font-medium text-white transition-colors hover:bg-brand-soft disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? "Creating..." : "Create site"}
            </button>
          </form>

          {error && (
            <div className="mt-5 rounded-lg bg-bg-raised px-4 py-3 text-sm text-danger">
              {error}
            </div>
          )}

          {result && (
            <div className="mt-6 space-y-4">
              <pre className="overflow-x-auto rounded-lg border border-bg-border bg-bg-raised p-4 text-xs leading-6 text-text-primary">
                <code>{result.embedSnippet}</code>
              </pre>

              <div className="flex gap-3 max-sm:flex-col">
                <button
                  className="flex h-11 flex-1 items-center justify-center rounded-lg border border-bg-border px-4 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-raised hover:text-text-primary"
                  onClick={copySnippet}
                  type="button"
                >
                  Copy snippet
                </button>
                <Link
                  className="flex h-11 flex-1 items-center justify-center rounded-lg bg-brand px-4 text-sm font-medium text-white transition-colors hover:bg-brand-soft"
                  href={dashboardHref}
                >
                  Open dashboard
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
