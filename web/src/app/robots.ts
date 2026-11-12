import type { MetadataRoute } from "next";

// While Sukoonam is a private preview, ask search engines not to list it.
// At launch on sukoonam.in, change this to allow everything:
//   rules: { userAgent: "*", allow: "/" }
// and remove `robots` from the metadata in app/layout.tsx.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", disallow: "/" },
  };
}
