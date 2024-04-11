import { ReadOnlyChildren } from "@/utils/types";

const MainComponent = ({ children }: ReadOnlyChildren) => (
  <main id='portfolio-main' className="flex flex-col items-center">
    {children}
  </main>
);

export default MainComponent;
