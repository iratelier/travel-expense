export default function FilterBar({ filterLoc, onFilterLoc, locations }) {
  if (locations.length === 0) return null;

  return (
    <>
      <div className="flex gap-2.5 items-center flex-wrap mb-3">
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          여행지
        </span>
        <select
          className="form--field w-auto"
          value={filterLoc}
          onChange={(e) => onFilterLoc(e.target.value)}
        >
          <option value="">전체</option>
          {locations.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}
