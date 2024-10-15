import { ReadOnlyChildren } from "@/utils/types";

const GridBackgroudLayout = ({ children }: ReadOnlyChildren) => (
  <div className="w-full h-auto bg-background transition-colors-400 text-foreground dark:bg-grid-white/[0.03] bg-grid-black/[0.03]">
    {children}
  </div>
);

export default GridBackgroudLayout;
