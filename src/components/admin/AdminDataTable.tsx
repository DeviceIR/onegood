import type { ReactNode } from "react";

export function AdminDataTable({
  headers,
  children,
}: {
  headers: string[];
  children: ReactNode;
}) {
  return (
    <div className="mt-6 overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-border text-muted">
            {headers.map((h) => (
              <th key={h} className="py-2 pe-3 text-start font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function AdminTableRow({ cells }: { cells: ReactNode[] }) {
  return (
    <tr className="border-b border-border/70">
      {cells.map((cell, i) => (
        <td key={i} className="py-2 pe-3 align-top">
          {cell}
        </td>
      ))}
    </tr>
  );
}
