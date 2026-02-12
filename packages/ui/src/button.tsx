type ButtonProps = {
  label: string;
  onClick?: () => void;
};

export function Button({ label, onClick }: ButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        borderRadius: "0.5rem",
        border: "1px solid #1f2937",
        padding: "0.5rem 0.9rem",
        backgroundColor: "#111827",
        color: "#f9fafb",
        fontWeight: 600,
        cursor: "pointer"
      }}
    >
      {label}
    </button>
  );
}
