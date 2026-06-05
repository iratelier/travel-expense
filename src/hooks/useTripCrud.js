import { useState } from "react";
import { supabase } from "../utils/supabase";

/**
 * 여행 추가/수정/삭제 공통 훅
 * @param {object} opts
 * @param {(msg:string)=>void}  opts.showToast
 * @param {(data:object)=>void} opts.onInsert  - 추가 성공 후 콜백 (data = trips 행)
 * @param {(tripId,form)=>void} opts.onUpdate  - 수정 성공 후 콜백
 * @param {(tripId)=>void}      opts.onDelete  - 삭제 성공 후 콜백
 */
export function useTripCrud({ showToast, onInsert, onUpdate, onDelete } = {}) {
  const [showModal, setShowModal] = useState(false);
  const [editingTripId, setEditingTripId] = useState(null);

  function openAdd() {
    setEditingTripId(null);
    setShowModal(true);
  }
  function openEdit(tripId) {
    setEditingTripId(tripId);
    setShowModal(true);
  }
  function closeModal() {
    setShowModal(false);
    setEditingTripId(null);
  }

  async function handleSaveTrip(tripId, formData) {
    const loc = formData.location.trim();
    if (!loc || !supabase) return;

    if (tripId) {
      const { error } = await supabase.from("trips").update({
        location: loc,
        start_date: formData.startDate || null,
        end_date: formData.endDate || null,
        companions: formData.companions.trim() || null,
      }).eq("id", tripId);
      if (error) { showToast?.("여행 수정 실패: " + error.message); return; }
      onUpdate?.(tripId, formData);
      showToast?.("여행이 수정됐습니다");
    } else {
      const { data, error } = await supabase.from("trips").insert({
        location: loc,
        start_date: formData.startDate || null,
        end_date: formData.endDate || null,
        companions: formData.companions.trim() || null,
      }).select().single();
      if (error) { showToast?.("여행 추가 실패: " + error.message); return; }
      onInsert?.(data);
      showToast?.("여행이 추가됐습니다");
    }
    closeModal();
  }

  async function handleDeleteTrip(tripId, trips) {
    const trip = trips.find((t) => t.id === tripId);
    if (!trip || !supabase) return;
    if (!confirm(`"${trip.location}" 여행을 삭제할까요?`)) return;
    const { error } = await supabase.from("trips").delete().eq("id", tripId);
    if (error) { showToast?.("여행 삭제 실패: " + error.message); return; }
    onDelete?.(tripId);
    showToast?.("여행이 삭제됐습니다");
    closeModal();
  }

  return {
    showModal, editingTripId,
    openAdd, openEdit, closeModal,
    handleSaveTrip, handleDeleteTrip,
  };
}
