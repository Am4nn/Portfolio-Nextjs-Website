"use client"

import React from "react";
import {
  Navbar as NextUINavbar, NavbarBrand, Button, Link,
  NavbarMenuToggle, NavbarContent, NavbarItem
} from "@nextui-org/react";
import Logo from "@/components/ui/Logo/Logo";
import ThemeSwitch from "@/components/ui/ThemeSwitch/ThemeSwitch";

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <NextUINavbar
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
      isBlurred={false}
      maxWidth="full"
      className={`${isMenuOpen ? "bg-background" : "bg-transparent"} fixed transition-colors-400`}
    >
      <NavbarContent justify="start">
        <NavbarBrand as="li">
          <Logo />
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="transition-colors-400" justify="end">
        <NavbarItem>
          <Button as={Link} color="primary" href="mailto:125aryaaman@gmail.com" variant="solid">
            Contact
          </Button>
        </NavbarItem>
        <NavbarItem>
          <Button as={Link} color="primary" target="_blank" href="/resume.pdf" variant="flat">
            Resume
          </Button>
        </NavbarItem>
        <NavbarItem>
          <ThemeSwitch />
        </NavbarItem>
        <NavbarMenuToggle className="md:hidden" aria-label={isMenuOpen ? "Close menu" : "Open menu"} />
      </NavbarContent>
    </NextUINavbar >
  );
}

export default Navbar;
