import { NAVY } from "../constants";

/**
 * DataTable — a generic, reusable table component.
 *
 * Props:
 *   columns   Array<{ key: string, label: string, render?: (row) => ReactNode }>
 *   rows      Array<object>   — data rows; each row must have a unique `id` field
 *                               OR pass a `rowKey` prop to specify the key field
 *   rowKey    string?         — field to use as React key (default "id")
 *   emptyMsg  string?         — message shown when rows is empty
 *   maxRows   number?         — if set, slices rows to this count
 *   caption   string?         — optional caption shown above the table
 */
function DataTable({
  columns,
  rows,
  rowKey = "id",
  emptyMsg = "No data available.",
  maxRows,
  caption,
}) {
  const displayRows = maxRows ? rows.slice(0, maxRows) : rows;

  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      {caption && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold" style={{ color: NAVY }}>
            {caption}
          </h2>
          {maxRows && rows.length > maxRows && (
            <span className="text-xs text-gray-400">
              showing {maxRows} of {rows.length}
            </span>
          )}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: `2px solid ${NAVY}` }}>
              {columns.map(col => (
                <th
                  key={col.key}
                  className="text-left py-2 px-3 text-xs font-semibold"
                  style={{ color: NAVY }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayRows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-8 text-center text-sm text-gray-400"
                >
                  {emptyMsg}
                </td>
              </tr>
            ) : (
              displayRows.map((row, idx) => (
                <tr
                  key={row[rowKey] ?? idx}
                  className="hover:bg-blue-50 transition-colors"
                  style={{ borderBottom: "1px solid #f0f2f5" }}
                >
                  {columns.map(col => (
                    <td key={col.key} className="py-2.5 px-3">
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DataTable;
