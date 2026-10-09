"use client";

/** The collapsed floating trigger for the conversation panel. */
export function SuziAvatarButton({
  onClick,
  hasUnread,
}: {
  onClick: () => void;
  hasUnread?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Open Suzi, your AI real estate partner"
      className="relative flex h-14 w-14 items-center justify-center rounded-full shadow-card cursor-pointer"
      style={{
        background: "radial-gradient(circle at 35% 30%, #E8CFA0 0%, #B3945A 45%, #0F1B33 100%)",
      }}
    >
      <span className="font-display text-base font-semibold text-ivory">S</span>
      {hasUnread ? (
        <span
          className="absolute top-0 right-0 h-3 w-3 rounded-full bg-terra-500 ring-2 ring-ivory"
          aria-hidden
        />
      ) : null}
    </button>
  );
}
