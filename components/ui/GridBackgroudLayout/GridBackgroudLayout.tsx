import React from "react";

const GridBackgroudLayout = ({ children }: Readonly<{
  children?: React.ReactNode;
}>) => {
  return (
    <div className="w-full h-auto bg-background dark:bg-grid-white/[0.03] bg-grid-black/[0.03]">
      {/* Radial gradient for the container to give a faded look */}
      {/* <div className="absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-black bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div> */}
      {children}
    </div>
  );
}

export default GridBackgroudLayout;
