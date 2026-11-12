import Image from "next/image";
import Link from "next/link";
import type { MassageType } from "@/lib/spas";

export function MassageTile({ type }: { type: MassageType }) {
  return (
    <Link
      href={`/spas?type=${type.id}`}
      className="press group flex w-[5.5rem] shrink-0 flex-col items-center gap-2 text-center sm:w-auto"
    >
      <span className="relative block size-20 overflow-hidden rounded-full bg-line ring-2 ring-white shadow-md transition duration-300 group-hover:ring-brand sm:size-24">
        {type.imageUrl && (
          <Image
            src={type.imageUrl}
            alt=""
            fill
            sizes="96px"
            className="object-cover transition duration-500 group-hover:scale-110"
          />
        )}
      </span>
      <span className="text-sm leading-tight font-medium group-hover:text-brand">{type.name.replace(" Massage", "")}</span>
      {type.spaCount > 0 && (
        <span className="-mt-1 text-xs text-muted">
          {type.spaCount} {type.spaCount === 1 ? "spa" : "spas"}
        </span>
      )}
    </Link>
  );
}
