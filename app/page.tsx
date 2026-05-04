"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Database,
  Settings as SettingsIcon,
  Download,
  Trash2,
  RefreshCw,
  Plus,
  ChevronDown,
  ChevronRight,
  Check,
  Clock,
  AlertCircle,
  Loader2,
  Copy,
  Eye,
  EyeOff,
  ListChecks,
  X,
  Info,
  Zap,
  Shield,
  HardDrive,
  Timer,
  FileText,
  Calendar,
  HelpCircle,
  ExternalLink,
  Key,
} from "lucide-react";
import {
  VISIT_FIELDS,
  HIT_FIELDS,
  ATTRIBUTION_MODELS,
  DEFAULT_VISIT_FIELDS,
  DEFAULT_HIT_FIELDS,
  type FieldCategory,
} from "@/lib/fields";

/* ─── Types ─── */

interface LogRequest {
  request_id: number;
  counter_id: number;
  source: string;
  date1: string;
  date2: string;
  fields: string[];
  status: string;
  size: number;
  attribution: string;
  parts?: { part_number: number; size: number }[];
}

interface AppSettings {
  token: string;
  counterId: string;
}

/* ─── API helper ─── */

async function apiCall(
  path: string,
  token: string,
  method = "GET"
): Promise<{ ok: boolean; data?: unknown; error?: string }> {
  try {
    const res = await fetch(`/api/metrika/${path}`, {
      method,
      headers: { "x-metrika-token": token },
    });
    const data = await res.json();
    if (!res.ok) {
      return {
        ok: false,
        error: data.message || data.error || `HTTP ${res.status}`,
      };
    }
    return { ok: true, data };
  } catch (e: unknown) {
    return { ok: false, error: e instanceof Error ? e.message : "Fetch error" };
  }
}

/* ─── Main Page ─── */

export default function Home() {
  const [settings, setSettings] = useState<AppSettings>({
    token: "",
    counterId: "",
  });
  const [showToken, setShowToken] = useState(false);
  const [activeTab, setActiveTab] = useState<"create" | "requests" | "limits" | "guide">("create");

  // Create request form state
  const [source, setSource] = useState<"visits" | "hits">("visits");
  const [date1, setDate1] = useState("");
  const [date2, setDate2] = useState("");
  const [attribution, setAttribution] = useState("LASTSIGN");
  const [selectedFields, setSelectedFields] = useState<string[]>(DEFAULT_VISIT_FIELDS);
  const [creating, setCreating] = useState(false);
  const [createResult, setCreateResult] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);

  // Requests list
  const [requests, setRequests] = useState<LogRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [pollingIds, setPollingIds] = useState<Set<number>>(new Set());
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Load settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("ya-metrics-settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Partial<AppSettings>;
        setSettings({
          token: typeof parsed.token === "string" ? parsed.token : "",
          counterId:
            normalizeCounterId(
              typeof parsed.counterId === "string" ? parsed.counterId : ""
            ) || "",
        });
      } catch { /* ignore */ }
    }
    // Set default dates: last month
    const now = new Date();
    const d2 = new Date(now);
    d2.setDate(d2.getDate() - 1);
    const d1 = new Date(d2);
    d1.setMonth(d1.getMonth() - 1);
    setDate2(fmt(d2));
    setDate1(fmt(d1));
  }, []);

  // Save settings
  useEffect(() => {
    if (settings.token || settings.counterId) {
      localStorage.setItem("ya-metrics-settings", JSON.stringify(settings));
    }
  }, [settings]);

  // Switch default fields on source change
  useEffect(() => {
    setSelectedFields(source === "visits" ? DEFAULT_VISIT_FIELDS : DEFAULT_HIT_FIELDS);
  }, [source]);

  // Polling for pending requests
  const fetchRequests = useCallback(async () => {
    if (!settings.token || !settings.counterId) return;
    setLoadingRequests(true);
    const res = await apiCall(
      `management/v1/counter/${settings.counterId}/logrequests`,
      settings.token
    );
    setLoadingRequests(false);
    if (res.ok && res.data) {
      const d = res.data as { requests: LogRequest[] };
      setRequests(d.requests || []);
    }
  }, [settings.token, settings.counterId]);

  useEffect(() => {
    if (activeTab === "requests" && settings.token && settings.counterId) {
      fetchRequests();
    }
  }, [activeTab, settings.token, settings.counterId, fetchRequests]);

  // Auto-poll for non-processed requests
  useEffect(() => {
    const pending = requests.filter(
      (r) => r.status === "created" || r.status === "processing"
    );
    if (pending.length > 0 && activeTab === "requests") {
      pollingRef.current = setInterval(fetchRequests, 15000);
    } else if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [requests, activeTab, fetchRequests]);

  /* ─── Handlers ─── */

  const handleCreate = async () => {
    if (!settings.token) {
      setCreateResult({ ok: false, message: "Укажите OAuth-токен" });
      return;
    }
    if (!settings.counterId) {
      setCreateResult({
        ok: false,
        message: "Укажите ID счётчика или ссылку на счётчик Метрики",
      });
      return;
    }
    if (!date1 || !date2) {
      setCreateResult({ ok: false, message: "Укажите даты" });
      return;
    }
    if (selectedFields.length === 0) {
      setCreateResult({ ok: false, message: "Выберите хотя бы одно поле" });
      return;
    }

    setCreating(true);
    setCreateResult(null);

    const fields = selectedFields.join(",");
    const params = new URLSearchParams({
      date1,
      date2,
      source,
      fields,
      attribution,
    });

    const res = await apiCall(
      `management/v1/counter/${settings.counterId}/logrequests?${params}`,
      settings.token,
      "POST"
    );

    setCreating(false);

    if (res.ok && res.data) {
      const d = res.data as { log_request: LogRequest };
      setCreateResult({
        ok: true,
        message: `Запрос #${d.log_request.request_id} создан! Статус: ${d.log_request.status}`,
      });
    } else {
      setCreateResult({ ok: false, message: res.error || "Ошибка" });
    }
  };

  const handleDownload = async (requestId: number, partNumber: number) => {
    if (!settings.token || !settings.counterId) return;

    const url = `/api/metrika/management/v1/counter/${settings.counterId}/logrequest/${requestId}/part/${partNumber}/download`;
    try {
      const res = await fetch(url, {
        headers: { "x-metrika-token": settings.token },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `metrika_${source}_${requestId}_part${partNumber}.tsv`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (e) {
      alert(`Ошибка скачивания: ${e instanceof Error ? e.message : e}`);
    }
  };

  const handleClean = async (requestId: number) => {
    if (!confirm("Удалить подготовленный лог и освободить квоту?")) return;
    const res = await apiCall(
      `management/v1/counter/${settings.counterId}/logrequest/${requestId}/clean`,
      settings.token,
      "POST"
    );
    if (res.ok) {
      fetchRequests();
    } else {
      alert(res.error || "Ошибка очистки");
    }
  };

  const handleCheckStatus = async (requestId: number) => {
    setPollingIds((prev) => new Set(prev).add(requestId));
    const res = await apiCall(
      `management/v1/counter/${settings.counterId}/logrequest/${requestId}`,
      settings.token
    );
    setPollingIds((prev) => {
      const next = new Set(prev);
      next.delete(requestId);
      return next;
    });
    if (res.ok) {
      fetchRequests();
    }
  };

  const fieldsConfig = source === "visits" ? VISIT_FIELDS : HIT_FIELDS;
  const fieldsCharCount = selectedFields.join(",").length;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Database className="w-6 h-6 text-yellow-400" />
            <h1 className="text-lg font-bold">YaMetrics</h1>
            <span className="text-xs text-gray-500 hidden sm:inline">
              Logs API Яндекс Метрики
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {settings.counterId && (
              <span className="bg-gray-800 px-2 py-1 rounded">
                #{settings.counterId}
              </span>
            )}
            <span
              className={`w-2 h-2 rounded-full ${
                settings.token ? "bg-green-500" : "bg-red-500"
              }`}
            />
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto w-full px-4 py-6 flex-1 space-y-6">
        {/* Settings */}
        <SettingsPanel
          settings={settings}
          setSettings={setSettings}
          showToken={showToken}
          setShowToken={setShowToken}
        />

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-900 rounded-lg p-1">
          <TabBtn
            active={activeTab === "create"}
            onClick={() => setActiveTab("create")}
            icon={<Plus className="w-4 h-4" />}
            label="Новый запрос"
          />
          <TabBtn
            active={activeTab === "requests"}
            onClick={() => setActiveTab("requests")}
            icon={<ListChecks className="w-4 h-4" />}
            label="Мои запросы"
          />
          <TabBtn
            active={activeTab === "limits"}
            onClick={() => setActiveTab("limits")}
            icon={<Info className="w-4 h-4" />}
            label="Лимиты API"
          />
          <TabBtn
            active={activeTab === "guide"}
            onClick={() => setActiveTab("guide")}
            icon={<HelpCircle className="w-4 h-4" />}
            label="Как получить токен"
          />
        </div>

        {/* Tab Content */}
        {activeTab === "guide" ? (
          <TokenGuide />
        ) : activeTab === "limits" ? (
          <LimitsPanel />
        ) : activeTab === "create" ? (
          <div className="space-y-6">
            {/* Source + Dates + Attribution */}
            <div className="bg-gray-900 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                Параметры выгрузки
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Source */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">
                    Тип данных
                  </label>
                  <div className="flex gap-2">
                    <SourceBtn
                      active={source === "visits"}
                      onClick={() => setSource("visits")}
                      label="Визиты"
                      desc="ym:s:"
                    />
                    <SourceBtn
                      active={source === "hits"}
                      onClick={() => setSource("hits")}
                      label="Хиты"
                      desc="ym:pv:"
                    />
                  </div>
                </div>

                {/* Date from */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">
                    Дата начала
                  </label>
                  <input
                    type="date"
                    value={date1}
                    onChange={(e) => setDate1(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-500 transition-colors"
                  />
                </div>

                {/* Date to */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">
                    Дата окончания
                  </label>
                  <input
                    type="date"
                    value={date2}
                    onChange={(e) => setDate2(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-500 transition-colors"
                  />
                </div>

                {/* Attribution */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">
                    Модель атрибуции
                  </label>
                  <select
                    value={attribution}
                    onChange={(e) => setAttribution(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-500 transition-colors"
                  >
                    {ATTRIBUTION_MODELS.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Field Selector */}
            <div className="bg-gray-900 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  Поля для выгрузки
                </h2>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs ${
                      fieldsCharCount > 2800
                        ? "text-red-400"
                        : fieldsCharCount > 2000
                        ? "text-yellow-400"
                        : "text-gray-500"
                    }`}
                  >
                    {selectedFields.length} полей ({fieldsCharCount}/3000 символов)
                  </span>
                  <button
                    onClick={() => setSelectedFields([])}
                    className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    Сбросить
                  </button>
                  <button
                    onClick={() =>
                      setSelectedFields(
                        fieldsConfig.flatMap((c) =>
                          c.fields.map((f) => f.name)
                        )
                      )
                    }
                    className="text-xs text-yellow-500 hover:text-yellow-400 transition-colors"
                  >
                    Выбрать все
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {fieldsConfig.map((cat) => (
                  <FieldCategoryBlock
                    key={cat.category}
                    category={cat}
                    selected={selectedFields}
                    onToggle={(name) =>
                      setSelectedFields((prev) =>
                        prev.includes(name)
                          ? prev.filter((f) => f !== name)
                          : [...prev, name]
                      )
                    }
                    onToggleAll={(names, checked) =>
                      setSelectedFields((prev) =>
                        checked
                          ? Array.from(new Set([...prev, ...names]))
                          : prev.filter((f) => !names.includes(f))
                      )
                    }
                  />
                ))}
              </div>
            </div>

            {/* Create Button */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleCreate}
                disabled={creating || !settings.token || !settings.counterId}
                className="bg-yellow-500 hover:bg-yellow-400 disabled:bg-gray-700 disabled:text-gray-500 text-gray-900 font-semibold px-6 py-3 rounded-xl flex items-center gap-2 transition-colors"
              >
                {creating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                Создать запрос
              </button>

              {createResult && (
                <div
                  className={`flex items-center gap-2 text-sm ${
                    createResult.ok ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {createResult.ok ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                  {createResult.message}
                </div>
              )}
            </div>

            {/* Generated API call preview */}
            {settings.counterId && selectedFields.length > 0 && (
              <ApiPreview
                counterId={settings.counterId}
                source={source}
                date1={date1}
                date2={date2}
                fields={selectedFields}
                attribution={attribution}
              />
            )}
          </div>
        ) : (
          /* Requests Tab */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                Все запросы на счётчике #{settings.counterId}
              </h2>
              <button
                onClick={fetchRequests}
                disabled={loadingRequests}
                className="text-sm text-gray-400 hover:text-gray-200 flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loadingRequests ? "animate-spin" : ""}`}
                />
                Обновить
              </button>
            </div>

            {loadingRequests && requests.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                Загрузка...
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                Нет активных запросов
              </div>
            ) : (
              <div className="space-y-3">
                {requests.map((req) => (
                  <RequestCard
                    key={req.request_id}
                    req={req}
                    isPolling={pollingIds.has(req.request_id)}
                    onCheckStatus={() => handleCheckStatus(req.request_id)}
                    onDownload={(part) => handleDownload(req.request_id, part)}
                    onClean={() => handleClean(req.request_id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-4 text-center text-xs text-gray-600">
        YaMetrics — интерфейс для Logs API Яндекс Метрики
      </footer>
    </div>
  );
}

/* ─── Sub-components ─── */

function SettingsPanel({
  settings,
  setSettings,
  showToken,
  setShowToken,
}: {
  settings: AppSettings;
  setSettings: (s: AppSettings) => void;
  showToken: boolean;
  setShowToken: (v: boolean) => void;
}) {
  const [open, setOpen] = useState(!settings.token || !settings.counterId);
  const [counterInput, setCounterInput] = useState(settings.counterId);
  const [counterInputError, setCounterInputError] = useState<string | null>(null);

  useEffect(() => {
    if (settings.counterId) {
      setCounterInput(settings.counterId);
      setCounterInputError(null);
    }
  }, [settings.counterId]);

  const handleCounterInputChange = (value: string) => {
    setCounterInput(value);

    const normalized = normalizeCounterId(value);
    if (!value.trim()) {
      setCounterInputError(null);
      setSettings({ ...settings, counterId: "" });
      return;
    }

    if (!normalized) {
      setCounterInputError(
        "Укажите ID счётчика или ссылку на счётчик Метрики"
      );
      setSettings({ ...settings, counterId: "" });
      return;
    }

    setCounterInput(normalized);
    setCounterInputError(null);
    setSettings({ ...settings, counterId: normalized });
  };

  return (
    <div className="bg-gray-900 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3 hover:bg-gray-800/50 transition-colors"
      >
        <div className="flex items-center gap-2 text-sm font-medium">
          <SettingsIcon className="w-4 h-4 text-gray-400" />
          Настройки подключения
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <div className="px-5 pb-4 space-y-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">
              OAuth-токен
            </label>
            <div className="relative">
              <input
                type={showToken ? "text" : "password"}
                value={settings.token}
                onChange={(e) =>
                  setSettings({ ...settings, token: e.target.value.trim() })
                }
                placeholder="y0_AgAAAA..."
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 pr-20 text-sm font-mono focus:outline-none focus:border-yellow-500 transition-colors"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                <button
                  onClick={() => setShowToken(!showToken)}
                  className="p-1 text-gray-500 hover:text-gray-300"
                >
                  {showToken ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">
              ID или ссылка на счётчик
            </label>
            <input
              type="text"
              value={counterInput}
              onChange={(e) => handleCounterInputChange(e.target.value)}
              placeholder="12345678 или ссылка из Метрики"
              aria-invalid={Boolean(counterInputError)}
              className={`w-full bg-gray-800 border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none transition-colors max-w-lg ${
                counterInputError
                  ? "border-red-500 focus:border-red-400"
                  : "border-gray-700 focus:border-yellow-500"
              }`}
            />
            {counterInputError && (
              <p className="mt-1.5 text-xs text-red-400">
                {counterInputError}
              </p>
            )}
          </div>
          <p className="text-xs text-gray-600">
            Токен получается на{" "}
            <a
              href="https://oauth.yandex.ru"
              target="_blank"
              className="text-yellow-600 hover:text-yellow-500"
            >
              oauth.yandex.ru
            </a>{" "}
            с правом <code className="text-gray-400">metrika:read</code>.
            Токен и ID счётчика хранятся только в вашем браузере.
          </p>
        </div>
      )}
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
        active
          ? "bg-gray-800 text-white"
          : "text-gray-500 hover:text-gray-300"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function SourceBtn({
  active,
  onClick,
  label,
  desc,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  desc: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
        active
          ? "bg-yellow-500/10 border-yellow-500/50 text-yellow-400"
          : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600"
      }`}
    >
      <div>{label}</div>
      <div className="text-xs opacity-60 font-mono">{desc}</div>
    </button>
  );
}

function FieldCategoryBlock({
  category,
  selected,
  onToggle,
  onToggleAll,
}: {
  category: FieldCategory;
  selected: string[];
  onToggle: (name: string) => void;
  onToggleAll: (names: string[], checked: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const allNames = category.fields.map((f) => f.name);
  const checkedCount = allNames.filter((n) => selected.includes(n)).length;
  const allChecked = checkedCount === allNames.length;

  return (
    <div className="border border-gray-800 rounded-lg overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-800/50">
        <button onClick={() => setOpen(!open)} className="flex-1 flex items-center gap-2 text-left">
          {open ? (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          )}
          <span className="text-sm font-medium">{category.category}</span>
          <span className="text-xs text-gray-500">
            {checkedCount}/{allNames.length}
          </span>
        </button>
        <button
          onClick={() => onToggleAll(allNames, !allChecked)}
          className={`text-xs px-2 py-0.5 rounded transition-colors ${
            allChecked
              ? "text-yellow-500 hover:text-yellow-400"
              : "text-gray-500 hover:text-gray-300"
          }`}
        >
          {allChecked ? "Снять все" : "Выбрать все"}
        </button>
      </div>
      {open && (
        <div className="px-4 py-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
          {category.fields.map((field) => {
            const checked = selected.includes(field.name);
            return (
              <label
                key={field.name}
                className={`flex items-start gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors ${
                  checked
                    ? "bg-yellow-500/5"
                    : "hover:bg-gray-800/50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggle(field.name)}
                  className="mt-0.5 accent-yellow-500"
                />
                <div className="min-w-0">
                  <div className="text-sm">{field.label}</div>
                  <div className="text-xs text-gray-600 font-mono truncate">
                    {field.name}
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

function RequestCard({
  req,
  isPolling,
  onCheckStatus,
  onDownload,
  onClean,
}: {
  req: LogRequest;
  isPolling: boolean;
  onCheckStatus: () => void;
  onDownload: (part: number) => void;
  onClean: () => void;
}) {
  const statusConfig: Record<string, { color: string; icon: React.ReactNode }> =
    {
      created: {
        color: "text-blue-400",
        icon: <Clock className="w-4 h-4" />,
      },
      processing: {
        color: "text-yellow-400",
        icon: <Loader2 className="w-4 h-4 animate-spin" />,
      },
      processed: {
        color: "text-green-400",
        icon: <Check className="w-4 h-4" />,
      },
      cleaned_by_user: {
        color: "text-gray-500",
        icon: <Trash2 className="w-4 h-4" />,
      },
      cleaned_automatically_as_too_old: {
        color: "text-gray-500",
        icon: <Trash2 className="w-4 h-4" />,
      },
    };

  const status = statusConfig[req.status] || {
    color: "text-gray-400",
    icon: <AlertCircle className="w-4 h-4" />,
  };

  return (
    <div className="bg-gray-900 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={`flex items-center gap-1.5 ${status.color}`}>
            {status.icon}
            <span className="text-sm font-medium">{req.status}</span>
          </span>
          <span className="text-xs text-gray-500 font-mono">
            #{req.request_id}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {(req.status === "created" || req.status === "processing") && (
            <button
              onClick={onCheckStatus}
              disabled={isPolling}
              className="text-xs text-gray-400 hover:text-gray-200 flex items-center gap-1 transition-colors"
            >
              <RefreshCw
                className={`w-3 h-3 ${isPolling ? "animate-spin" : ""}`}
              />
              Проверить
            </button>
          )}
          {req.status !== "cleaned_by_user" &&
            req.status !== "cleaned_automatically_as_too_old" && (
              <button
                onClick={onClean}
                className="text-xs text-red-400/60 hover:text-red-400 flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                Очистить
              </button>
            )}
        </div>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
        <span>
          {req.source === "visits" ? "Визиты" : "Хиты"}
        </span>
        <span>
          {req.date1} — {req.date2}
        </span>
        <span>{req.fields.length} полей</span>
        {req.size > 0 && (
          <span>{(req.size / 1024 / 1024).toFixed(2)} МБ</span>
        )}
        <span>Атрибуция: {req.attribution}</span>
      </div>

      {req.status === "processed" && req.parts && req.parts.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {req.parts.map((part) => (
            <button
              key={part.part_number}
              onClick={() => onDownload(part.part_number)}
              className="bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3 h-3" />
              Часть {part.part_number}
              {part.size > 0 && (
                <span className="text-green-600">
                  ({(part.size / 1024 / 1024).toFixed(2)} МБ)
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      <details className="text-xs">
        <summary className="text-gray-600 cursor-pointer hover:text-gray-400 transition-colors">
          Поля запроса
        </summary>
        <div className="mt-1 text-gray-500 font-mono flex flex-wrap gap-1">
          {req.fields.map((f) => (
            <span
              key={f}
              className="bg-gray-800 px-1.5 py-0.5 rounded"
            >
              {f}
            </span>
          ))}
        </div>
      </details>
    </div>
  );
}

function ApiPreview({
  counterId,
  source,
  date1,
  date2,
  fields,
  attribution,
}: {
  counterId: string;
  source: string;
  date1: string;
  date2: string;
  fields: string[];
  attribution: string;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const curlCmd = `curl -X POST \\
  -H "Authorization: OAuth YOUR_TOKEN" \\
  "https://api-metrika.yandex.net/management/v1/counter/${counterId}/logrequests?date1=${date1}&date2=${date2}&source=${source}&fields=${fields.join(",")}&attribution=${attribution}"`;

  const handleCopy = () => {
    navigator.clipboard.writeText(curlCmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gray-900 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3 hover:bg-gray-800/50 transition-colors"
      >
        <span className="text-xs text-gray-500">Предпросмотр API-запроса</span>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <div className="relative px-5 pb-4">
          <button
            onClick={handleCopy}
            className="absolute top-0 right-6 text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1 transition-colors"
          >
            {copied ? (
              <Check className="w-3 h-3" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
            {copied ? "Скопировано" : "Копировать"}
          </button>
          <pre className="text-xs text-gray-400 font-mono whitespace-pre-wrap break-all bg-gray-950 rounded-lg p-3 overflow-auto max-h-40">
            {curlCmd}
          </pre>
        </div>
      )}
    </div>
  );
}

function TokenGuide() {
  const [copied, setCopied] = useState(false);

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const steps = [
    {
      num: 1,
      title: "Перейдите на страницу разработчика Метрики",
      content: (
        <div className="space-y-2">
          <p>
            Откройте страницу разработчика Яндекс Метрики — это самый надёжный
            способ, который сразу создаёт приложение с нужными правами:
          </p>
          <a
            href="https://yandex.ru/dev/metrika/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20 px-3 py-2 rounded-lg text-sm transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            yandex.ru/dev/metrika
          </a>
          <p className="text-gray-500">
            Выберите тип{" "}
            <strong className="text-gray-300">
              &quot;Для доступа к API или отладки&quot;
            </strong>{" "}
            и нажмите <strong className="text-gray-300">&quot;Перейти к созданию&quot;</strong>.
          </p>
          <div className="bg-red-500/5 border border-red-500/20 rounded-lg px-3 py-2 text-xs text-red-400/80">
            <strong>Важно:</strong> не выбирайте &quot;Для авторизации
            пользователей&quot; — у этого типа нет доступа к Метрике и вы не
            сможете добавить нужные права.
          </div>
        </div>
      ),
    },
    {
      num: 2,
      title: "Настройте приложение",
      content: (
        <div className="space-y-2">
          <div className="space-y-1.5">
            <div className="flex items-start gap-2">
              <span className="text-yellow-500 font-bold shrink-0">→</span>
              <span>
                <strong className="text-gray-300">Название:</strong> любое,
                например <code>Metrica Logs API</code>
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-yellow-500 font-bold shrink-0">→</span>
              <span>
                <strong className="text-gray-300">Доступы:</strong> найдите{" "}
                <code>Яндекс Метрика</code> → включите{" "}
                <code className="text-green-400">metrika:read</code>{" "}
                (Получение статистики, чтение параметров своих и доверенных
                счётчиков)
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-yellow-500 font-bold shrink-0">→</span>
              <span>
                <strong className="text-gray-300">
                  Redirect URI для веб-сервисов:
                </strong>{" "}
                добавьте URL ниже
              </span>
            </div>
          </div>
          <div className="bg-gray-950 rounded-lg px-3 py-2 flex items-center justify-between">
            <code className="text-sm text-gray-300">
              https://oauth.yandex.ru/verification_code
            </code>
            <button
              onClick={() =>
                copyText("https://oauth.yandex.ru/verification_code")
              }
              className="text-gray-500 hover:text-gray-300 ml-2"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
          <p className="text-gray-500">
            Шаги с правами Яндекс ID (username, email) можно пропустить — они
            не нужны для Logs API. Сохраните приложение.
          </p>
        </div>
      ),
    },
    {
      num: 3,
      title: "Скопируйте ClientID и получите токен",
      content: (
        <div className="space-y-2">
          <p>
            После сохранения приложения вы увидите{" "}
            <strong className="text-gray-300">ClientID</strong>. Скопируйте его
            и откройте в браузере ссылку:
          </p>
          <div className="bg-gray-950 rounded-lg px-3 py-2">
            <code className="text-sm text-gray-300 break-all">
              https://oauth.yandex.ru/authorize?response_type=token&amp;client_id=
              <span className="text-yellow-400">ВАШ_CLIENT_ID</span>
            </code>
          </div>
          <p>
            Авторизуйтесь в Яндексе. Вас перенаправит на URL вида:
          </p>
          <div className="bg-gray-950 rounded-lg px-3 py-2">
            <code className="text-xs text-gray-400 break-all">
              https://oauth.yandex.ru/verification_code#
              <span className="text-green-400">access_token=AQAAA...</span>
              &amp;token_type=bearer&amp;expires_in=...
            </code>
          </div>
          <p>
            Значение после{" "}
            <code className="text-green-400">access_token=</code> и до{" "}
            <code>&amp;</code> — это ваш токен. Скопируйте его.
          </p>
          <div className="bg-red-500/5 border border-red-500/20 rounded-lg px-3 py-2 text-xs text-red-400/80">
            <strong>Токен показывается только один раз!</strong> Сохраните его
            сразу — повторно страница его не отобразит.
          </div>
        </div>
      ),
    },
    {
      num: 4,
      title: "Вставьте токен в настройки",
      content: (
        <div className="space-y-2">
          <p>
            Вставьте скопированный токен в поле{" "}
            <strong className="text-gray-300">&quot;OAuth-токен&quot;</strong>{" "}
            в настройках подключения вверху страницы. Также укажите ID или
            ссылку на счётчик Метрики.
          </p>
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-400 space-y-1">
            <p>
              <strong className="text-gray-300">Срок действия:</strong> токен
              действует <strong className="text-white">1 год</strong>, после чего
              нужно получить новый.
            </p>
            <p>
              <strong className="text-gray-300">Безопасность:</strong> токен
              хранится только в вашем браузере (localStorage) и передаётся
              напрямую в API Яндекс Метрики через серверный прокси.
            </p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gray-900 rounded-xl p-5 space-y-2">
        <div className="flex items-center gap-2.5">
          <Key className="w-5 h-5 text-yellow-400" />
          <h2 className="text-base font-bold">
            Как получить OAuth-токен для Яндекс Метрики
          </h2>
        </div>
        <p className="text-sm text-gray-500">
          Токен нужен для доступа к Logs API. Каждый пользователь создаёт свой
          токен — это занимает 2-3 минуты.
        </p>
      </div>

      <div className="space-y-3">
        {steps.map((step) => (
          <div
            key={step.num}
            className="bg-gray-900 rounded-xl p-5 flex gap-4"
          >
            <div className="shrink-0 w-8 h-8 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-400 font-bold text-sm">
              {step.num}
            </div>
            <div className="space-y-2 min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-gray-200">
                {step.title}
              </h3>
              <div className="text-sm text-gray-400">{step.content}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-900 rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
          Где найти ID счётчика
        </h3>
        <div className="text-sm text-gray-400 space-y-2">
          <p>
            Откройте{" "}
            <a
              href="https://metrika.yandex.ru/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              metrika.yandex.ru
            </a>{" "}
            — ID счётчика отображается рядом с названием сайта (числовой код, например{" "}
            <code>12345678</code>).
          </p>
          <p className="text-gray-500">
            Для доступа к Logs API достаточно иметь права{" "}
            <code className="text-gray-400">view</code> (просмотр) на счётчике.
            Если счётчик не ваш, попросите владельца выдать вам гостевой доступ
            в настройках Метрики.
          </p>
        </div>
      </div>

      <div className="bg-gray-900 rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
          Альтернативный способ (через oauth.yandex.ru)
        </h3>
        <div className="text-sm text-gray-400 space-y-2">
          <p>
            Можно создать приложение напрямую через{" "}
            <a
              href="https://oauth.yandex.ru/client/new"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              oauth.yandex.ru/client/new
            </a>
            , но есть нюансы:
          </p>
          <div className="space-y-1.5 text-xs text-gray-500">
            <p>
              → Обязательно выберите тип{" "}
              <strong className="text-gray-300">
                &quot;Для доступа к API или отладки&quot;
              </strong>
            </p>
            <p>
              → В разделе доступов начните вводить{" "}
              <code>metrika</code> в поиске — раздел Метрики скрыт по умолчанию
              в новом интерфейсе
            </p>
            <p>
              → Добавьте <code>metrika:read</code> и Redirect URI{" "}
              <code>https://oauth.yandex.ru/verification_code</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function LimitsPanel() {
  const limits = [
    {
      icon: <Calendar className="w-5 h-5 text-blue-400" />,
      title: "Максимальный период",
      value: "1 год",
      description: "В одном запросе можно запросить данные не более чем за 365 дней",
    },
    {
      icon: <HardDrive className="w-5 h-5 text-purple-400" />,
      title: "Квота хранения",
      value: "10 ГБ",
      description:
        "Суммарный объём подготовленных логов на один счётчик. Метрика Про — до 50 ГБ",
    },
    {
      icon: <FileText className="w-5 h-5 text-green-400" />,
      title: "Длина строки fields",
      value: "3 000 символов",
      description:
        "Максимальная длина параметра fields (список запрашиваемых полей через запятую)",
    },
    {
      icon: <Zap className="w-5 h-5 text-yellow-400" />,
      title: "Параллельные запросы",
      value: "1 запрос",
      description:
        "Только один запрос может быть в статусе created/processing одновременно на счётчик",
    },
    {
      icon: <Timer className="w-5 h-5 text-orange-400" />,
      title: "Данные за текущий день",
      value: "Недоступны",
      description:
        "Можно запрашивать только за вчера и более ранние даты. Данные за сегодня ещё не обработаны",
    },
    {
      icon: <Clock className="w-5 h-5 text-cyan-400" />,
      title: "Хранение подготовленного лога",
      value: "~2 недели",
      description:
        "После подготовки лог хранится около 14 дней, затем автоматически очищается",
    },
    {
      icon: <Shield className="w-5 h-5 text-red-400" />,
      title: "Доступ к API",
      value: "OAuth + metrika:read",
      description:
        "Требуется OAuth-токен с правом metrika:read. Для Logs API достаточно доступа view к счётчику",
    },
  ];

  const tips = [
    "Нельзя параллельно готовить несколько логов — дождитесь processed или очистите текущий",
    "Поля с разными моделями атрибуции (last, first, cross) считаются отдельными и увеличивают длину fields",
    "Большие выгрузки автоматически разбиваются на parts — каждую нужно скачать отдельно",
    "После скачивания очищайте лог (clean), чтобы не расходовать квоту 10 ГБ",
    "OAuth-токен действует 1 год, после чего нужно получить новый",
    "Для визитов (visits) префикс полей ym:s:, для хитов (hits) — ym:pv:",
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gray-900 rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
          Ограничения Logs API
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {limits.map((limit) => (
            <div
              key={limit.title}
              className="bg-gray-800/50 border border-gray-800 rounded-lg p-4 space-y-2"
            >
              <div className="flex items-center gap-2.5">
                {limit.icon}
                <div>
                  <div className="text-sm font-medium">{limit.title}</div>
                  <div className="text-lg font-bold text-white">
                    {limit.value}
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                {limit.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-900 rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
          Два типа данных
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4 space-y-2">
            <div className="text-sm font-bold text-blue-400">
              Визиты (visits)
            </div>
            <div className="text-xs text-gray-400 space-y-1">
              <p>
                <span className="text-gray-300 font-medium">source=</span>
                visits
              </p>
              <p>
                <span className="text-gray-300 font-medium">Префикс:</span>{" "}
                <code className="text-blue-300">ym:s:</code>
              </p>
              <p>
                <span className="text-gray-300 font-medium">Содержит:</span> 1
                строка = 1 сессия пользователя
              </p>
              <p>
                <span className="text-gray-300 font-medium">Полей:</span> ~80
              </p>
              <p className="text-gray-500 pt-1">
                Агрегация просмотров, цели, Директ, UTM, e-commerce, география,
                устройства
              </p>
            </div>
          </div>
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-4 space-y-2">
            <div className="text-sm font-bold text-emerald-400">
              Хиты (hits)
            </div>
            <div className="text-xs text-gray-400 space-y-1">
              <p>
                <span className="text-gray-300 font-medium">source=</span>hits
              </p>
              <p>
                <span className="text-gray-300 font-medium">Префикс:</span>{" "}
                <code className="text-emerald-300">ym:pv:</code>
              </p>
              <p>
                <span className="text-gray-300 font-medium">Содержит:</span> 1
                строка = 1 просмотр страницы
              </p>
              <p>
                <span className="text-gray-300 font-medium">Полей:</span> ~90
              </p>
              <p className="text-gray-500 pt-1">
                Отдельные просмотры, URL, title, referer, цели на хите,
                устройства
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
          Полезные советы
        </h2>
        <div className="space-y-2">
          {tips.map((tip, i) => (
            <div
              key={i}
              className="flex items-start gap-2.5 text-sm text-gray-400"
            >
              <AlertCircle className="w-4 h-4 text-yellow-500/60 mt-0.5 shrink-0" />
              <span>{tip}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-900 rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
          Модели атрибуции
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {ATTRIBUTION_MODELS.map((m) => (
            <div
              key={m.value}
              className="bg-gray-800/50 rounded-lg px-3 py-2.5"
            >
              <div className="text-sm font-medium text-gray-200">
                {m.label}
              </div>
              <div className="text-xs text-gray-500 font-mono">{m.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">
                {m.description}
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-600">
          В именах полей атрибуция отражается префиксом: <code>last</code>,{" "}
          <code>first</code>, <code>cross</code>. Например:{" "}
          <code className="text-gray-400">ym:s:lastUTMSource</code> vs{" "}
          <code className="text-gray-400">ym:s:firstUTMSource</code>
        </p>
      </div>
    </div>
  );
}

/* ─── Helpers ─── */

function fmt(d: Date): string {
  return d.toISOString().split("T")[0];
}

function normalizeCounterId(input: string): string | null {
  const value = input.trim();
  if (!value) return null;
  if (/^\d+$/.test(value)) return value;

  const urls: URL[] = [];
  try {
    urls.push(new URL(value));
  } catch {
    try {
      urls.push(new URL(`https://${value}`));
    } catch {
      // not a URL
    }
  }

  for (const url of urls) {
    for (const paramName of ["id", "counter_id", "counterId"]) {
      const paramValue = url.searchParams.get(paramName);
      const match = paramValue?.match(/\d{5,}/);
      if (match) return match[0];
    }

    const idMatch = `${url.pathname}${url.search}${url.hash}`.match(
      /(?:^|[^\d])(\d{5,})(?!\d)/
    );
    if (idMatch) return idMatch[1];
  }

  const paramLikeMatch = value.match(
    /(?:^|[?&#\s])(?:id|counter_id|counterId)=(\d{5,})(?:\D|$)/i
  );
  return paramLikeMatch?.[1] || null;
}
