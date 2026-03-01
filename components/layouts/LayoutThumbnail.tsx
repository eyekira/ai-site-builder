type Props = {
  layoutKey: string;
  className?: string;
};

function Row({ h }: { h: number }) {
  return <div className="rounded-[3px] border border-zinc-300 bg-zinc-50" style={{ height: h }} />;
}

export function LayoutThumbnail({ layoutKey, className }: Props) {
  const root = `h-full w-full rounded-lg border border-zinc-300 bg-zinc-100 p-2 ${className ?? ''}`;

  if (layoutKey === 'luxury') {
    return (
      <div className={root}>
        <div className="h-[8px] rounded-[3px] border border-zinc-300 bg-zinc-50" />
        <div className="mt-1 h-[20px] rounded-[3px] border border-zinc-300 bg-zinc-200" />
        <div className="mt-1 space-y-1"><Row h={3} /><Row h={3} /><Row h={3} /></div>
      </div>
    );
  }

  if (layoutKey === 'modern_casual') {
    return (
      <div className={root}>
        <div className="flex h-[8px] items-center justify-between rounded-[3px] border border-zinc-300 bg-zinc-50 px-1">
          <div className="h-[3px] w-[16px] rounded bg-zinc-300" />
          <div className="h-[5px] w-[18px] rounded-full border border-zinc-400 bg-zinc-400" />
        </div>
        <div className="mt-1 grid h-[16px] grid-cols-[3fr_2fr] gap-1"><Row h={16} /><div className="rounded-[3px] border border-zinc-300 bg-zinc-200" /></div>
        <div className="mt-1 grid grid-cols-3 gap-1"><Row h={8} /><Row h={8} /><Row h={8} /></div>
      </div>
    );
  }

  if (layoutKey === 'cozy_local') {
    return (
      <div className={root}>
        <div className="h-[8px] rounded-[6px] border border-zinc-300 bg-zinc-50" />
        <div className="mt-1 h-[14px] rounded-[6px] border border-zinc-300 bg-zinc-200" />
        <div className="mt-1 grid grid-cols-3 gap-1"><div className="h-[5px] rounded-full bg-zinc-300" /><div className="h-[5px] rounded-full bg-zinc-300" /><div className="h-[5px] rounded-full bg-zinc-300" /></div>
        <div className="mt-1"><Row h={8} /></div>
      </div>
    );
  }

  if (layoutKey === 'menu_first') {
    return (
      <div className={root}>
        <div className="h-[8px] rounded-[3px] border border-zinc-300 bg-zinc-50" />
        <div className="mt-1 grid h-[42px] grid-cols-[1fr_2fr] gap-1">
          <div className="space-y-1"><Row h={5} /><Row h={5} /><Row h={5} /><Row h={5} /></div>
          <div className="space-y-1"><Row h={7} /><Row h={7} /><Row h={7} /><Row h={7} /></div>
        </div>
      </div>
    );
  }

  return (
    <div className={root}>
      <div className="h-[8px] rounded-[3px] border border-zinc-300 bg-zinc-50" />
      <div className="mt-1 grid h-[18px] grid-cols-2 gap-1"><Row h={18} /><div className="rounded-[3px] border border-zinc-300 bg-zinc-200" /></div>
      <div className="mt-1 space-y-1"><Row h={5} /><Row h={5} /><Row h={5} /></div>
    </div>
  );
}
