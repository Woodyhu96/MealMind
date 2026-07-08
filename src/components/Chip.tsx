type ChipProps = {
  label: string;
  selected?: boolean;
  onClick: () => void;
};

export function Chip({ label, selected = false, onClick }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm font-medium transition active:scale-[0.98] ${
        selected
          ? "border-ink bg-ink text-white shadow-sm"
          : "border-line bg-white/75 text-ink hover:border-ink/30"
      }`}
    >
      {label}
    </button>
  );
}
