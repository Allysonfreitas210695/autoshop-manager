import { cn } from "@/_lib/utils";

export type TimelineNode = {
  id: string;
  title: string;
  subtitle?: string;
  state?: "done" | "active" | "upcoming";
};

const dotState = {
  done: "bg-status-completed ring-status-completed/20",
  active: "bg-secondary ring-secondary/20",
  upcoming: "bg-outline ring-outline/10",
} as const;

export function ServiceTimeline({
  nodes,
  className,
  orientation = "horizontal",
}: {
  nodes: TimelineNode[];
  className?: string;
  orientation?: "horizontal" | "vertical";
}) {
  if (orientation === "vertical") {
    return (
      <ol className={cn("relative flex flex-col gap-6 pl-6", className)}>
        <span className="bg-outline-variant absolute top-2 bottom-2 left-[7px] w-0.5" />
        {nodes.map((node) => (
          <li key={node.id} className="relative flex flex-col">
            <span
              className={cn(
                "absolute top-1 -left-6 h-3.5 w-3.5 rounded-full ring-4 transition-transform",
                dotState[node.state ?? "upcoming"],
              )}
            />
            <span className="text-label-md text-on-surface font-mono">
              {node.title}
            </span>
            {node.subtitle ? (
              <span className="text-body-md text-on-surface-variant">
                {node.subtitle}
              </span>
            ) : null}
          </li>
        ))}
      </ol>
    );
  }

  return (
    <div
      className={cn(
        "relative flex flex-col items-start justify-between gap-6 px-4 py-2 md:flex-row md:items-center",
        className,
      )}
    >
      <span className="bg-outline-variant absolute top-1/2 right-4 left-4 hidden h-0.5 -translate-y-1/2 md:block" />
      {nodes.map((node) => (
        <div
          key={node.id}
          className="group relative z-10 flex flex-col items-center"
        >
          <span
            className={cn(
              "h-4 w-4 rounded-full ring-4 transition-transform group-hover:scale-125",
              dotState[node.state ?? "upcoming"],
            )}
          />
          <div className="mt-2 text-center">
            <p className="text-label-md text-on-surface font-mono">
              {node.title}
            </p>
            {node.subtitle ? (
              <p className="text-body-md text-on-surface-variant">
                {node.subtitle}
              </p>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
