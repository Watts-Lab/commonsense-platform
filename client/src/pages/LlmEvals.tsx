import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import evalData from "../data/llmEvals.json";
import Navbar from "../partials/NavBar";
import Footer from "../partials/Footer";

type MetricKey =
  | "consensusI"
  | "consensusII"
  | "awarenessI"
  | "awarenessII"
  | "commonsensicalityI"
  | "commonsensicalityII";

type SortKey = "model" | "addedDate" | MetricKey;
type SortDirection = "asc" | "desc";

interface MetricScore {
  score: number;
  rank: number;
}

interface LlmEvalRow extends Record<MetricKey, MetricScore> {
  id: string;
  model: string;
  addedDate: string;
}

interface LlmEvalData {
  lastUpdated: string;
  rows: LlmEvalRow[];
}

const data = evalData as LlmEvalData;

const metricColumns: { key: MetricKey; labelKey: string }[] = [
  { key: "consensusI", labelKey: "llmEvals.columns.consensusI" },
  { key: "consensusII", labelKey: "llmEvals.columns.consensusII" },
  { key: "awarenessI", labelKey: "llmEvals.columns.awarenessI" },
  { key: "awarenessII", labelKey: "llmEvals.columns.awarenessII" },
  {
    key: "commonsensicalityI",
    labelKey: "llmEvals.columns.commonsensicalityI",
  },
  {
    key: "commonsensicalityII",
    labelKey: "llmEvals.columns.commonsensicalityII",
  },
];

const formatDate = (date: string, locale: string) =>
  new Intl.DateTimeFormat(locale, {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));

const LlmEvals: React.FC = () => {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage || i18n.language || "en";
  const [query, setQuery] = useState("");
  const [metricFilter, setMetricFilter] = useState<MetricKey>(
    "commonsensicalityII",
  );
  const [minimumScore, setMinimumScore] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: SortKey;
    direction: SortDirection;
  }>({
    key: "commonsensicalityII",
    direction: "desc",
  });

  const topModel = useMemo(
    () =>
      [...data.rows].sort(
        (a, b) =>
          b.commonsensicalityII.score - a.commonsensicalityII.score ||
          a.commonsensicalityII.rank - b.commonsensicalityII.rank,
      )[0],
    [],
  );

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const parsedMinimum = Number.parseFloat(minimumScore);
    const hasMinimum = !Number.isNaN(parsedMinimum);

    return data.rows.filter((row) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        row.model.toLowerCase().includes(normalizedQuery);
      const matchesMinimum =
        !hasMinimum || row[metricFilter].score >= parsedMinimum;

      return matchesQuery && matchesMinimum;
    });
  }, [metricFilter, minimumScore, query]);

  const sortedRows = useMemo(() => {
    return [...filteredRows].sort((a, b) => {
      if (sortConfig.key === "model") {
        const compared = a.model.localeCompare(b.model);
        return sortConfig.direction === "asc" ? compared : -compared;
      }

      if (sortConfig.key === "addedDate") {
        const compared =
          a.addedDate.localeCompare(b.addedDate) ||
          a.model.localeCompare(b.model);
        return sortConfig.direction === "asc" ? compared : -compared;
      }

      const compared =
        a[sortConfig.key].score - b[sortConfig.key].score ||
        b[sortConfig.key].rank - a[sortConfig.key].rank;

      return sortConfig.direction === "asc" ? compared : -compared;
    });
  }, [filteredRows, sortConfig]);

  const handleSort = (key: SortKey) => {
    setSortConfig((current) => ({
      key,
      direction:
        current.key === key && current.direction === "desc" ? "asc" : "desc",
    }));
  };

  const renderSortMarker = (key: SortKey) => {
    if (sortConfig.key !== key) return "";
    return sortConfig.direction === "asc" ? " ^" : " v";
  };

  const renderMetric = (metric: MetricScore) => (
    <span className="inline-flex min-w-[5rem] items-baseline justify-between gap-2">
      <span className="font-semibold text-gray-900 dark:text-gray-100">
        {metric.score.toFixed(1)}
      </span>
      <span className="text-xs text-gray-500 dark:text-gray-400">
        ({metric.rank})
      </span>
    </span>
  );

  const formulaClass =
    "mt-2 overflow-x-auto rounded border border-gray-200 p-4 text-sm text-gray-800 dark:border-gray-700 dark:text-gray-100";
  const mathClass =
    "inline-flex min-w-max items-center gap-2 font-serif leading-8";
  const fractionClass = "inline-flex flex-col items-center px-1 align-middle";

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      <Navbar />

      <main className="flex-grow bg-gray-100 dark:bg-gray-600">
        <section className="relative bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-300">
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
            <div className="py-12 md:py-20">
              <div className="max-w-4xl pb-10 md:pb-14">
                <p className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-300">
                  {t("llmEvals.eyebrow")}
                </p>
                <h1 className="mt-3 mb-4 text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white">
                  {t("llmEvals.title")}
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-200">
                  {t("llmEvals.intro")}
                </p>
                <p className="mt-4 text-base leading-7 text-gray-600 dark:text-gray-200">
                  {t("llmEvals.methodology")}
                </p>
                <p className="mt-4 text-base leading-7 text-gray-600 dark:text-gray-200">
                  {t("llmEvals.variants")}
                </p>
                <p className="mt-4 text-base text-gray-600 dark:text-gray-200">
                  {t("llmEvals.modelDetailsPrefix")}{" "}
                  <a
                    className="font-semibold text-blue-800 dark:text-blue-300 hover:underline"
                    href="https://joshnguyen.net/demos/llm-commonsense.html"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {t("llmEvals.detailsLink")}
                  </a>
                  {t("llmEvals.modelDetailsSuffix")}{" "}
                  {t("llmEvals.methodDetailsPrefix")}{" "}
                  <a
                    className="font-semibold text-blue-800 dark:text-blue-300 hover:underline"
                    href="https://doi.org/10.1093/pnasnexus/pgag029"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {t("llmEvals.paperLink")}
                  </a>
                  {t("llmEvals.methodDetailsSuffix")}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3 mb-6">
                <div className="bg-gray-50 dark:bg-slate-900 rounded shadow-xl p-5">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t("llmEvals.modelsEvaluated")}
                  </p>
                  <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                    {data.rows.length}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-slate-900 rounded shadow-xl p-5">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t("llmEvals.topCommonsensicalityII")}
                  </p>
                  <p className="mt-2 text-xl font-bold text-gray-900 dark:text-white">
                    {topModel.model}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t("llmEvals.scoreRank", {
                      score: topModel.commonsensicalityII.score.toFixed(1),
                      rank: topModel.commonsensicalityII.rank,
                    })}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-slate-900 rounded shadow-xl p-5">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t("llmEvals.lastUpdated")}
                  </p>
                  <p className="mt-2 text-xl font-bold text-gray-900 dark:text-white">
                    {formatDate(data.lastUpdated, locale)}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-slate-900 rounded shadow-xl">
                <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {t("llmEvals.tableTitle")}
                      </h2>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {t("llmEvals.tableHelp")}
                      </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[42rem]">
                      <label className="form-control w-full">
                        <span className="label-text text-gray-700 dark:text-gray-200">
                          {t("llmEvals.modelFilter")}
                        </span>
                        <input
                          type="search"
                          value={query}
                          onChange={(event) => setQuery(event.target.value)}
                          placeholder={t("llmEvals.searchPlaceholder")}
                          className="input input-bordered input-sm w-full bg-white dark:bg-gray-800 dark:text-gray-100"
                        />
                      </label>

                      <label className="form-control w-full">
                        <span className="label-text text-gray-700 dark:text-gray-200">
                          {t("llmEvals.scoreMetric")}
                        </span>
                        <select
                          value={metricFilter}
                          onChange={(event) =>
                            setMetricFilter(event.target.value as MetricKey)
                          }
                          className="select select-bordered select-sm w-full bg-white dark:bg-gray-800 dark:text-gray-100"
                        >
                          {metricColumns.map((column) => (
                            <option key={column.key} value={column.key}>
                              {t(column.labelKey)}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="form-control w-full">
                        <span className="label-text text-gray-700 dark:text-gray-200">
                          {t("llmEvals.minimumScore")}
                        </span>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={minimumScore}
                          onChange={(event) =>
                            setMinimumScore(event.target.value)
                          }
                          placeholder={t("llmEvals.anyPlaceholder")}
                          className="input input-bordered input-sm w-full bg-white dark:bg-gray-800 dark:text-gray-100"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="relative overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <caption className="sr-only">
                      {t("llmEvals.caption")}
                    </caption>
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-300">
                      <tr>
                        <th scope="col" className="px-6 py-3 min-w-[12rem]">
                          <button
                            type="button"
                            className="font-bold uppercase text-left"
                            onClick={() => handleSort("model")}
                          >
                            {t("llmEvals.columns.model")}
                            {renderSortMarker("model")}
                          </button>
                        </th>
                        <th scope="col" className="px-6 py-3 min-w-[10rem]">
                          <button
                            type="button"
                            className="font-bold uppercase text-left"
                            onClick={() => handleSort("addedDate")}
                          >
                            {t("llmEvals.columns.added")}
                            {renderSortMarker("addedDate")}
                          </button>
                        </th>
                        {metricColumns.map((column) => (
                          <th
                            key={column.key}
                            scope="col"
                            className="px-6 py-3 min-w-[10rem]"
                          >
                            <button
                              type="button"
                              className="font-bold uppercase text-left"
                              onClick={() => handleSort(column.key)}
                            >
                              {t(column.labelKey)}
                              {renderSortMarker(column.key)}
                            </button>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sortedRows.map((row) => (
                        <tr
                          key={row.id}
                          className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <th
                            scope="row"
                            className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                          >
                            {row.model}
                          </th>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {formatDate(row.addedDate, locale)}
                          </td>
                          {metricColumns.map((column) => (
                            <td key={column.key} className="px-6 py-4">
                              {renderMetric(row[column.key])}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-col gap-2 p-5 text-sm text-gray-500 dark:text-gray-400 sm:flex-row sm:items-center sm:justify-between">
                  <span>
                    {t("llmEvals.showing", {
                      shown: sortedRows.length,
                      total: data.rows.length,
                    })}
                  </span>
                  <span>{t("llmEvals.scoreNote")}</span>
                </div>

                <div className="border-t border-gray-200 p-5 dark:border-gray-700">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {t("llmEvals.calculationTitle")}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
                    {t("llmEvals.calculationIntro")}
                  </p>

                  <div className="mt-4 grid gap-4 lg:grid-cols-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                        {t("llmEvals.variantIFormulaLabel")}
                      </p>
                      <div className={formulaClass} role="math">
                        <span className={mathClass}>
                          <span>
                            majority<sub>i</sub>
                            <sup>h</sup>
                          </span>
                          <span>=</span>
                          <span>
                            1[d<sub>i</sub>
                            <sup>h,a</sup> &ge; 0.5]
                          </span>
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                        {t("llmEvals.variantIIFormulaLabel")}
                      </p>
                      <div className={formulaClass} role="math">
                        <span className={mathClass}>
                          <span>
                            majority<sub>i</sub>
                            <sup>h</sup>
                          </span>
                          <span>=</span>
                          <span>1[</span>
                          <span className={fractionClass}>
                            <span className="border-b border-current px-2 pb-1">
                              &alpha;<sub>i</sub>
                              <sup>m</sup> + &sum;
                              <sub>j &isin; &Omega;<sub>i</sub></sub> A
                              <sub>i,j</sub>
                            </span>
                            <span className="px-2 pt-1">
                              |&Omega;<sub>i</sub>| + 1
                            </span>
                          </span>
                          <span>&ge; 0.5]</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <dl className="mt-4 grid gap-3 text-sm text-gray-500 dark:text-gray-400 md:grid-cols-2">
                    <div>
                      <dt className="font-semibold text-gray-700 dark:text-gray-200">
                        d_i^{"{h,a}"}
                      </dt>
                      <dd>{t("llmEvals.humanShareDefinition")}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-gray-700 dark:text-gray-200">
                        Omega_i
                      </dt>
                      <dd>{t("llmEvals.omegaDefinition")}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-gray-700 dark:text-gray-200">
                        alpha_i^m
                      </dt>
                      <dd>{t("llmEvals.alphaDefinition")}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-gray-700 dark:text-gray-200">
                        A_i,j
                      </dt>
                      <dd>{t("llmEvals.ratingsDefinition")}</dd>
                    </div>
                    <div className="md:col-span-2">
                      <dt className="font-semibold text-gray-700 dark:text-gray-200">
                        1[...]
                      </dt>
                      <dd>{t("llmEvals.indicatorDefinition")}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default LlmEvals;
