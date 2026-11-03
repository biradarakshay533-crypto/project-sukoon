import Image from "next/image";
import Link from "next/link";
import type { MassageType } from "@/lib/spas";

export function MassageTile({ type }: { type: MassageType }) {
  return (
    <Link
      href={`/spas?type=${type.id}`}
      className="group flex w-28 shrink-0 flex-col items-center gap-2 text-center sm:w-auto"
    >
      <span className="relative block size-24 overflow-hidden rounded-full bg-line ring-1 ring-line transition duration-300 group-hover:ring-2 group-hover:ring-night sm:size-28">
        {type.imageUrl && (
          <Image
            src={type.imageUrl}
            alt=""
            fill
            sizes="112px"
            className="object-cover transition duration-500 group-hover:scale-110"
          />
        )}
      </span>
      <span className="text-sm leading-tight font-medium">{type.name}</span>
      {type.spaCount > 0 && (
        <span className="-mt-1 text-xs text-muted">
          {type.spaCount} {type.spaCount === 1 ? "spa" : "spas"}
        </span>
      )}
    </Link>
  );
}
