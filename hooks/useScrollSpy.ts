import { useCallback, useEffect, useState } from "react";

export function useScrollSpy(sections: string[], offset: number = 0) {
  const [currentSection, setCurrentSection] = useState<string | null>(null);

  const refreshActiveNavLink = useCallback(() => {
    const currentPosition = window.scrollY + offset;
    const currentSection = sections.find((section) => {
      const sectionElement = document.getElementById(section);
      if (!sectionElement) return false;
      const sectionTop = sectionElement.offsetTop - offset;
      const sectionBottom = sectionTop + sectionElement.offsetHeight;
      return sectionTop <= currentPosition && sectionBottom > currentPosition;
    });

    setCurrentSection(currentSection ? currentSection : null);
  }, [sections, offset]);

  useEffect(() => {
    window.addEventListener("scroll", refreshActiveNavLink);
    return () => window.removeEventListener("scroll", refreshActiveNavLink);
  }, [refreshActiveNavLink]);

  return [currentSection, refreshActiveNavLink];
};
