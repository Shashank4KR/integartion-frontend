import ComingSoon from "@/components/shared/layout/ComingSoon";

function formatTitle(slug: string[]): string {
  return slug
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, " "))
    .join(" / ");
}

export default function CatchAllPage({
  params,
}: {
  params: { slug?: string[] };
}) {
  const title = params.slug ? formatTitle(params.slug) : "Module Unavailable";
  return <ComingSoon title={title} />;
}
