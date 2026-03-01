type Props = {
  layoutKey: string;
  selected?: boolean;
};

function Row({ h }: { h: number }) {
  return <div className="rounded-[3px] border border-zinc-300 bg-zinc-50" style={{ height: h }} />;
}

export function LayoutThumbnail({ layoutKey }: Props) {
  if (layoutKey === 'luxury') {
    return (
      <div className="h-[88px] w-[140px] rounded-md border border-zinc-300 bg-zinc-100 p-2">
        <div className="h-[10px] rounded-[3px] border border-zinc-300 bg-zinc-50" />
        <div className="mt-1 h-[28px] rounded-[3px] border border-zinc-300 bg-zinc-200" />
        <div className="mt-1 space-y-1"> <Row h={4} /><Row h={4} /><Row h={4} /> </div>
      </div>
    );
  }

  if (layoutKey === 'modern_casual') {
    return (
      <div className="h-[88px] w-[140px] rounded-md border border-zinc-300 bg-zinc-100 p-2">
        <div className="flex h-[10px] items-center justify-between rounded-[3px] border border-zinc-300 bg-zinc-50 px-1">
          <div className="h-[4px] w-[18px] rounded bg-zinc-300" />
          <div className="h-[6px] w-[24px] rounded-full border border-zinc-400 bg-zinc-400" />
        </div>
        <div className="mt-1 grid h-[20px] grid-cols-[3fr_2fr] gap-1">
          <Row h={20} />
          <div className="rounded-[3px] border border-zinc-300 bg-zinc-200" />
        </div>
        <div className="mt-1 grid grid-cols-3 gap-1"> <Row h={10} /><Row h={10} /><Row h={10} /> </div>
      </div>
    );
  }

  if (layoutKey === 'cozy_local') {
    return (
      <div className="h-[88px] w-[140px] rounded-md border border-zinc-300 bg-zinc-100 p-2">
        <div className="h-[10px] rounded-[6px] border border-zinc-300 bg-zinc-50" />
        <div className="mt-1 h-[18px] rounded-[6px] border border-zinc-300 bg-zinc-200" />
        <div className="mt-1 grid grid-cols-3 gap-1"> <div className="h-[6px] rounded-full bg-zinc-300" /><div className="h-[6px] rounded-full bg-zinc-300" /><div className="h-[6px] rounded-full bg-zinc-300" /> </div>
        <div className="mt-1"><Row h={12} /></div>
      </div>
    );
  }

  if (layoutKey === 'menu_first') {
    return (
      <div className="h-[88px] w-[140px] rounded-md border border-zinc-300 bg-zinc-100 p-2">
        <div className="h-[10px] rounded-[3px] border border-zinc-300 bg-zinc-50" />
        <div className="mt-1 grid h-[58px] grid-cols-[1fr_2fr] gap-1">
          <div className="space-y-1"> <Row h={6} /><Row h={6} /><Row h={6} /><Row h={6} /> </div>
          <div className="space-y-1"> <Row h={10} /><Row h={10} /><Row h={10} /><Row h={10} /> </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[88px] w-[140px] rounded-md border border-zinc-300 bg-zinc-100 p-2">
      <div className="h-[10px] rounded-[3px] border border-zinc-300 bg-zinc-50" />
      <div className="mt-1 grid h-[24px] grid-cols-2 gap-1"> <Row h={24} /><div className="rounded-[3px] border border-zinc-300 bg-zinc-200" /> </div>
      <div className="mt-1 space-y-1"> <Row h={6} /><Row h={6} /><Row h={6} /> </div>
    </div>
  );
}
