import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "../utils/supabase";
import Header from "../components/layout/Header";
import SummaryGrid from "../components/expense/SummaryGrid";
import ExpenseForm from "../components/expense/ExpenseForm";
import ExpenseTable from "../components/expense/ExpenseTable";
import Toast from "../components/common/Toast";
import TravelModal from "../components/travel/TravelModal";
import ExpenseEditModal from "../components/expense/ExpenseEditModal";
import { useExchangeRate } from "../hooks/useExchangeRate";

const TODAY = new Date().toISOString().slice(0, 10);
const EMPTY_FORM = {
  date: TODAY,
  description: "",
  location: "",
  store: "",
  currency: "JPY",
  amount: "",
  tags: [], // 태그 배열 — 저장 시 콤마 문자열로 변환
  memo: "",
};

// ── localStorage 여행 목록 ──────────────────────────────────────────────────
const TRIPS_KEY = "travel-trips-v1";
function loadTrips() {
  try {
    return JSON.parse(localStorage.getItem(TRIPS_KEY) ?? "[]");
  } catch {
    return [];
  }
}
function saveTrips(list) {
  localStorage.setItem(TRIPS_KEY, JSON.stringify(list));
}

const EMPTY_TRIP = { location: "", startDate: "", endDate: "", companions: "" };

export default function TravelPage() {
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [filterLoc, setFilterLoc] = useState("");
  const [toast, setToast] = useState("");
  const toastTimer = useRef(null);
  const importRef = useRef(null);

  useExchangeRate(); // 앱 시작 시 환율 자동 캐시

  // ── 여행 목록 ───────────────────────────────────────────────────────────────
  const [trips, setTrips] = useState(loadTrips);
  const [selectedTripId, setSelectedTripId] = useState(""); // 선택된 여행 id
  const [showAddTrip, setShowAddTrip] = useState(false);
  const [editingTripId, setEditingTripId] = useState(null); // null = 추가, id = 수정
  const [tripForm, setTripForm] = useState(EMPTY_TRIP);

  // ── 항목 수정 ──────────────────────────────────────────────────────────────
  const [editingEntry, setEditingEntry] = useState(null); // null = 닫힘, object = 수정 대상

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchEntries = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .order("date", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) {
      setError("데이터를 불러오지 못했습니다: " + error.message);
    } else {
      setEntries(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  // ── Realtime ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!supabase) return;
    const channel = supabase
      .channel("expenses-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "expenses" },
        fetchEntries,
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [fetchEntries]);

  // ── Toast ─────────────────────────────────────────────────────────────────
  function showToast(msg) {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2200);
  }

  // ── Form change ───────────────────────────────────────────────────────────
  function handleFormChange(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  // ── Add ───────────────────────────────────────────────────────────────────
  async function handleAdd(descRef) {
    if (!form.date || !form.description.trim()) {
      showToast("날짜와 내역을 입력해 주세요");
      return;
    }
    if (trips.length > 0 && !form.location.trim()) {
      showToast("여행을 선택해 주세요");
      return;
    }
    if (!supabase) {
      showToast("Supabase 연결이 필요합니다");
      return;
    }
    setSaving(true);
    const payload = {
      date: form.date,
      description: form.description.trim(),
      location: form.location.trim() || null,
      store: form.store.trim() || null,
      currency: form.currency || "JPY",
      amount: form.amount !== "" ? Number(form.amount) : null,
      tag: form.tags.length > 0 ? form.tags.join(",") : null,
      memo: form.memo.trim() || null,
    };
    const { error } = await supabase.from("expenses").insert(payload);
    if (error) {
      showToast("저장 실패: " + error.message);
    } else {
      setForm((f) => ({
        ...EMPTY_FORM,
        date: f.date,
        location: f.location,
        currency: f.currency,
      }));
      descRef.current?.focus();
      showToast("추가 완료");
    }
    setSaving(false);
  }

  // ── Update ───────────────────────────────────────────────────────────────
  async function handleUpdate(id, payload) {
    if (!supabase) return;
    setSaving(true);
    const { error } = await supabase
      .from("expenses")
      .update(payload)
      .eq("id", id);
    if (error) {
      showToast("수정 실패: " + error.message);
    } else {
      setEditingEntry(null);
      showToast("수정 완료");
      fetchEntries();
    }
    setSaving(false);
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  async function handleDelete(id) {
    if (!supabase) return;
    const { error } = await supabase.from("expenses").delete().eq("id", id);
    if (error) showToast("삭제 실패: " + error.message);
    else showToast("삭제됐습니다");
  }

  // ── Clear all ─────────────────────────────────────────────────────────────
  async function handleClear() {
    if (!confirm("모든 내역을 삭제할까요?") || !supabase) return;
    const { error } = await supabase
      .from("expenses")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    if (error) showToast("삭제 실패: " + error.message);
    else showToast("전체 삭제 완료");
  }

  // ── Export ────────────────────────────────────────────────────────────────
  function handleExport() {
    const data = {
      exportedAt: new Date().toISOString(),
      summary: { count: entries.length },
      entries: entries.map(({ id, created_at, ...rest }) => rest),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `지출_${TODAY}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("JSON 저장됐습니다 ↓");
  }

  // ── Import ────────────────────────────────────────────────────────────────
  async function handleImport(e) {
    const file = e.target.files?.[0];
    if (!file || !supabase) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const rows = data.entries ?? data;
      if (!Array.isArray(rows)) throw new Error("올바른 형식이 아닙니다");
      const payload = rows.map(
        ({
          date,
          description,
          desc,
          location,
          store,
          currency,
          amount,
          tag,
          memo,
        }) => ({
          date,
          description: description ?? desc,
          location: location ?? null,
          store: store ?? null,
          currency: currency ?? "JPY",
          amount: amount != null ? Number(amount) : null,
          tag: tag ?? null,
          memo: memo ?? null,
        }),
      );
      const { error } = await supabase.from("expenses").insert(payload);
      if (error) showToast("불러오기 실패: " + error.message);
      else showToast(`${payload.length}건 불러왔습니다 ✓`);
    } catch (err) {
      showToast("파일 오류: " + err.message);
    }
    e.target.value = "";
  }

  // ── 여행 추가 ─────────────────────────────────────────────────────────────
  function openAddTrip() {
    setEditingTripId(null);
    setTripForm(EMPTY_TRIP);
    setShowAddTrip(true);
  }

  function openEditTrip() {
    if (!selectedTrip) return;
    setEditingTripId(selectedTrip.id);
    setTripForm({
      location: selectedTrip.location,
      startDate: selectedTrip.startDate ?? "",
      endDate: selectedTrip.endDate ?? "",
      companions: selectedTrip.companions ?? "",
    });
    setShowAddTrip(true);
  }

  function handleSaveTrip() {
    const loc = tripForm.location.trim();
    if (!loc) return;
    let updated;
    if (editingTripId) {
      // 수정
      updated = trips.map((t) =>
        t.id === editingTripId
          ? {
              ...t,
              location: loc,
              startDate: tripForm.startDate,
              endDate: tripForm.endDate,
              companions: tripForm.companions.trim(),
            }
          : t,
      );
      setFilterLoc(loc);
    } else {
      // 추가
      const trip = {
        id: crypto.randomUUID(),
        location: loc,
        startDate: tripForm.startDate,
        endDate: tripForm.endDate,
        companions: tripForm.companions.trim(),
      };
      updated = [...trips, trip];
      setSelectedTripId(trip.id);
      setFilterLoc(loc);
    }
    setTrips(updated);
    saveTrips(updated);
    setTripForm(EMPTY_TRIP);
    setEditingTripId(null);
    setShowAddTrip(false);
  }

  function closeTrip() {
    setShowAddTrip(false);
    setEditingTripId(null);
    setTripForm(EMPTY_TRIP);
  }

  function handleSelectTrip(id) {
    setSelectedTripId(id);
    if (!id) {
      setFilterLoc("");
      setForm((f) => ({ ...f, location: "" }));
      return;
    }
    const trip = trips.find((t) => t.id === id);
    if (trip) {
      setFilterLoc(trip.location);
      setForm((f) => ({ ...f, location: trip.location }));
    }
  }

  const selectedTrip = trips.find((t) => t.id === selectedTripId) ?? null;

  // ── Derived ───────────────────────────────────────────────────────────────
  const filtered = entries.filter((e) => {
    if (filterLoc && e.location !== filterLoc) return false;
    return true;
  });

  return (
    <>
      <div className="wrap expense-page">
        <Header />

        <main className="main">
          {/* 페이지 상단 */}
          <div className="page-top">
            <div className="page-top__title-nav">
              <span className="page-top__title">지출내역</span>
            </div>
            <div className="page-top__actions">
              <button onClick={handleExport} className="btn page-top__btn">
                <i className="ni-download" /> 내보내기
              </button>
              <label className="btn page-top__btn">
                <i className="ni-upload" /> 불러오기
                <input
                  ref={importRef}
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleImport}
                />
              </label>
            </div>
          </div>

          {/* 콘텐츠 */}
          <div className="page-container">
            <section className="travel-info">
              <article className="travel-info__section">
                {error && <div className="error-section">⚠️ {error}</div>}

                {/* 여행 선택 헤더 */}
                <div className="travel-info__header">
                  <select
                    className="form--select travel-info__trip-select"
                    value={selectedTripId}
                    onChange={(e) => handleSelectTrip(e.target.value)}
                  >
                    <option value="">전체 여행</option>
                    {trips.map((t) => {
                      const ym = t.startDate
                        ? t.startDate.slice(0, 7).replace("-", ".")
                        : "";
                      return (
                        <option key={t.id} value={t.id}>
                          {t.location}
                          {ym ? ` (${ym})` : ""}
                        </option>
                      );
                    })}
                  </select>
                  {selectedTrip && (
                    <button
                      className="btn btn--edit travel-info__edit-btn"
                      onClick={openEditTrip}
                      title="여행 수정"
                    >
                      <i className="ni-write" /> 여행 수정
                    </button>
                  )}
                  <button
                    className="btn btn--primary travel-info__add-btn"
                    onClick={openAddTrip}
                  >
                    <i className="ni-add" /> 여행 추가
                  </button>
                </div>

                <SummaryGrid entries={filtered} trip={selectedTrip} />
              </article>
            </section>

            <section className="expense-record">
              <ExpenseForm
                form={form}
                onChange={handleFormChange}
                onAdd={handleAdd}
                saving={saving}
                trips={trips}
              />

              <ExpenseTable
                entries={entries}
                filtered={filtered}
                onDelete={handleDelete}
                onEdit={setEditingEntry}
                onClear={handleClear}
                loading={loading}
              />
            </section>
          </div>
        </main>

        <Toast message={toast} />

        {/* 항목 수정 모달 */}
        {editingEntry && (
          <ExpenseEditModal
            entry={editingEntry}
            onSave={handleUpdate}
            onClose={() => setEditingEntry(null)}
            saving={saving}
            trips={trips}
          />
        )}

        {/* 여행 추가/수정 모달 */}
        {showAddTrip && (
          <TravelModal
            isEditing={!!editingTripId}
            tripForm={tripForm}
            onChange={(key, value) =>
              setTripForm((f) => ({ ...f, [key]: value }))
            }
            onSave={handleSaveTrip}
            onClose={closeTrip}
          />
        )}
      </div>
    </>
  );
}
