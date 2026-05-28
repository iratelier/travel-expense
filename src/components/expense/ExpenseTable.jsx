import SectionTitle from "../common/SectionTitle";

function fmt(n) {
  return n != null ? Number(n).toLocaleString("ko-KR") : null;
}

const SYMBOL = { JPY: "¥", KRW: "₩", USD: "$", EUR: "€", VND: "₫" };

export default function ExpenseTable({
  entries,
  filtered,
  onDelete,
  onEdit,
  onClear,
  loading,
}) {
  return (
    <>
      <article className="expense-record__content">
        <SectionTitle title="지출 내역">
          <span className="text-foreground">
            {filtered.length !== entries.length
              ? `(${filtered.length} / ${entries.length})`
              : `(${entries.length})`}
          </span>
          {entries.length > 0 && (
            <button className="btn ml-auto" onClick={onClear} title="전체 삭제">
              전체 삭제
            </button>
          )}
        </SectionTitle>

        <div className="expense-record__table">
          {loading ? (
            <p className="noti-section">불러오는 중</p>
          ) : entries.length === 0 ? (
            <p className="noti-section leading-relaxed">
              지출 내역이 없습니다.
              <br />
              위에서 첫 항목을 추가해 보세요!
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table" data-table="expense">
                <thead>
                  <tr>
                    <th style={{ width: 36 }}>#</th>
                    <th style={{ width: 96 }}>날짜</th>
                    <th style={{ width: 200 }}>내역</th>
                    <th style={{ width: 80 }}>여행지</th>
                    <th style={{ width: 100 }}>구입처</th>
                    <th style={{ width: 56 }}>통화</th>
                    <th className="num" style={{ width: 100 }}>
                      금액
                    </th>
                    <th style={{ width: 130 }}>태그</th>
                    <th style={{ width: 140 }}>메모</th>
                    <th style={{ width: 100 }}>기타</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((e, i) => {
                    const symbol = SYMBOL[e.currency] ?? "";
                    const tagList = e.tag
                      ? e.tag
                          .split(",")
                          .map((t) => t.trim())
                          .filter(Boolean)
                      : [];

                    return (
                      <tr key={e.id}>
                        <td data-col="index">
                          <div>{i + 1}</div>
                        </td>
                        <td
                          data-col="date"
                          className="whitespace-nowrap text-sm"
                        >
                          <div>{e.date}</div>
                        </td>
                        <td data-col="description" className="text-sm">
                          <div>{e.description}</div>
                        </td>
                        <td data-col="location">
                          <div>
                            {e.location ? (
                              <span>{e.location}</span>
                            ) : (
                              <span className="text-border">-</span>
                            )}
                          </div>
                        </td>
                        <td data-col="store">
                          <div>
                            {e.store ? (
                              <span>{e.store}</span>
                            ) : (
                              <span className="text-border">-</span>
                            )}
                          </div>
                        </td>
                        <td
                          data-col="currency"
                          className="text-center text-xs font-semibold text-gray-500"
                        >
                          <div>{e.currency ?? "-"}</div>
                        </td>
                        <td data-col="amount" className="num">
                          <div>
                            {e.amount != null ? (
                              <span>
                                {symbol}
                                {fmt(e.amount)}
                              </span>
                            ) : (
                              <span className="text-border">-</span>
                            )}
                          </div>
                        </td>
                        <td data-col="tag">
                          <div>
                            {tagList.length > 0 ? (
                              <div className="flex items-center gap-1">
                                {tagList.map((t) => (
                                  <span
                                    key={t}
                                    className="tag-chip tag-chip--sm"
                                  >
                                    {t}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-border">-</span>
                            )}
                          </div>
                        </td>
                        <td data-col="memo">
                          <div>
                            {e.memo || <span className="text-border">-</span>}
                          </div>
                        </td>
                        <td data-col="actions">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              className="btn btn-add text-border hover:text-blue-500 hover:bg-blue-50 rounded px-1 py-0.5 transition-colors"
                              onClick={() => onEdit(e)}
                              title="수정"
                            >
                              <i className="ni-write" />
                            </button>
                            <button
                              className="btn btn-delete text-border hover:text-red-500 hover:bg-red-50 rounded px-1 py-0.5 transition-colors text-base"
                              onClick={() => onDelete(e.id)}
                              title="삭제"
                            >
                              ✕
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </article>
    </>
  );
}
