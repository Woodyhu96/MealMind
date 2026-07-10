type ToggleProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
};

export function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between rounded-[22px] border border-white/70 bg-white/58 px-3.5 py-2.5 transition active:scale-[0.99]"
    >
      <span className="text-sm font-semibold text-ink">{label}</span>
      <span className={`relative h-7 w-12 rounded-full transition ${checked ? "bg-ink" : "bg-line"}`}>
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </span>
    </button>
  );
}
