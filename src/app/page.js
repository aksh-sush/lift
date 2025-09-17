// Server component shell for the homepage.
// Renders the interactive client island without making the entire page a client component.

import HomeClient from "./page.client";

export const dynamic = "force-static"; // inherit default caching behavior from layout, keep explicit here for clarity

export default function Page() {
  return <HomeClient />;
}

