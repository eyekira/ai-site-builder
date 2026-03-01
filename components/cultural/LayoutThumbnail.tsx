type Props = { layoutKey: string };

const ORDERS: Record<string, number[]> = {
  luxury: [28, 10, 10, 10],
  modern_casual: [20, 12, 12, 12, 12],
  cozy_local: [22, 10, 10, 10, 10],
  minimal_contemporary: [20, 10, 10, 10],
  menu_first: [14, 16, 10, 10, 10],
};

export function LayoutThumbnail({ layoutKey }: Props) {
  const rows = ORDERS[layoutKey] ?? ORDERS.minimal_contemporary;
  return (
    <div className="h-[90px] w-[144px] rounded-md border border-zinc-300 bg-zinc-100 p-1.5">
      <div className="h-[10px] rounded-[4px] border border-zinc-300 bg-zinc-50" />
      <div className="mt-1 space-y-1">
        {rows.map((h, i) => (
          <div key={`${layoutKey}-${i}`} className="rounded-[4px] border border-zinc-300 bg-zinc-50" style={{ height: `${h / 2}px` }} />
        ))}
      </div>
    </div>
  );
}
