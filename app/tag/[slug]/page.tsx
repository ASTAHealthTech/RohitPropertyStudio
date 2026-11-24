import { permanentRedirect } from "next/navigation";

/** Old 100yards.in blog listing addresses. They all lead to the guides page now. */
export default function OldBlogListing() {
  permanentRedirect("/blog");
}
