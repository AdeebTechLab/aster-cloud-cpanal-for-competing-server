type SectionEyebrowProps = {
  label: string;
  small?: boolean;
};

export function SectionEyebrow({ label, small = false }: SectionEyebrowProps) {
  return (
    <div className={`eyebrow light${small ? " small-tag" : ""}`}>
      <span className="dot" />
      <span>{label}</span>
    </div>
  );
}
