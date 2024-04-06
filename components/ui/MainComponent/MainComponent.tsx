import React from "react";

const MainComponent = ({ children }: { children?: React.ReactNode }) => (
  <main id='portfolio-main' className="my-0 mx-auto flex flex-col items-center">
    {children}
  </main>
);

export default MainComponent;
