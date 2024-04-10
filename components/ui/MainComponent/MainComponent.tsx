import React from "react";

const MainComponent = ({ children }: Readonly<{
  children?: React.ReactNode;
}>) => (
  <main id='portfolio-main' className="flex flex-col items-center">
    {children}
  </main>
);

export default MainComponent;
