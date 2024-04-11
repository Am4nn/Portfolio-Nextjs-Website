import React from "react";

const GridBackgroudLayout = ({ children }: Readonly<{
  children?: React.ReactNode;
}>) => (
  <div className="w-full h-auto bg-background text-foreground dark:bg-grid-white/[0.03] bg-grid-black/[0.03]">
    {children}
  </div>
);

export default GridBackgroudLayout;
