import Image from "next/image";
import Link from "next/link";
import type { MassageType } from "@/lib/spas";

// Rich colour pairs for tiles that do not have a photo yet.
const GRADIENTS = [
  "from-[#7a2e5c] to-[#ff6f61]",
  "from-[#3b1f5c] to-[#c2477e]",
  "from-[#ff8a5b] to-[#d6336c]",
  "from-[#4f1c3c] to-[#b85c8a]",
  "from-[#c2477e] to-[#ffb38a]",
  "from-[#2d1b4e] to-[#7a2e5c]",
];

function Lotus() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className="size-12 text-white/90">
      <path
        fill="currentColor"
        d="M32 10c5 7 7 14 6 21-2 6-4 9-6 11-2-2-4-5-6-11-1-7 1-14 6-21Zm-17 13c7 1 12 5 15 11 2 5 2 8 1 11-4 0-8-1-12-6-4-5-5-10-4-16Zm34 0c1 6 0 11-4 16-4 5-8 6-12 6-1-3-1-6 1-11 3-6 8-10 15-11ZM8 39c7-2 13 0 18 4 3 3 4 5 5 8-6 2-12 1-17-3-3-2-5-5-6-9Zm48 0c-1 4-3 7-6 9-5 4-11 5-17 3 1-3 2-5 5-8 5-4 11-6 18-4Z"
      />
    </svg>
  );
}

export function MassageTile({ type, index }: { type: MassageType; index: number }) {
  return (
    <Link
      href={`/spas?type=${type.id}`}
      className="group flex w-28 shrink-0 flex-col items-center gap-2 text-center sm:w-auto"
    >
      <span
        className={`relative flex size-24 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br shadow-md ring-4 ring-white transition duration-300 group-hover:-translate-y-1 group-hover:shadow-xl sm:size-28 ${GRADIENTS[index % GRADIENTS.length]}`}
      >
        {type.imageUrl ? (
          <Image
            src={type.imageUrl}
            alt=""
            fill
            sizes="112px"
            className="object-cover transition duration-500 group-hover:scale-110"
          />
        ) : (
          <span className="transition duration-500 group-hover:scale-110 group-hover:rotate-6">
            <Lotus />
          </span>
        )}
      </span>
      <span className="text-sm leading-tight font-semibold">{type.name}</span>
      {type.spaCount > 0 && (
        <span className="-mt-1 text-xs text-muted">
          {type.spaCount} {type.spaCount === 1 ? "spa" : "spas"}
        </span>
      )}
    </Link>
  );
}
