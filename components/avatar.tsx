import Image from "next/image";

function initials(name: string | null | undefined) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const SIZE_CLASSES: Record<string, string> = {
  xs: "h-8 w-8 text-xs rounded-lg",
  sm: "h-10 w-10 text-sm rounded-xl",
  md: "h-14 w-14 text-base rounded-2xl",
  lg: "h-20 w-20 text-2xl rounded-3xl",
};

export function Avatar({
  url,
  name,
  size = "md",
  className = "",
}: {
  url?: string | null;
  name?: string | null;
  size?: keyof typeof SIZE_CLASSES;
  className?: string;
}) {
  const sizeCls = SIZE_CLASSES[size];

  if (url) {
    return (
      <div className={`relative shrink-0 overflow-hidden ${sizeCls} ${className}`}>
        <Image
          src={url}
          alt={name ? `${name}'s avatar` : "Avatar"}
          fill
          sizes="80px"
          className="object-cover"
          unoptimized
        />
      </div>
    );
  }

  return (
    <div
      className={`grid shrink-0 place-items-center bg-brand-100 font-bold text-brand-700 ${sizeCls} ${className}`}
      aria-label={name ? `${name}'s avatar placeholder` : "Avatar placeholder"}
    >
      {initials(name)}
    </div>
  );
}
