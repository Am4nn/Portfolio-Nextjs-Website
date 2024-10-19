"use client"

import React from "react";
import {
  Navbar as NextUINavbar, NavbarBrand,
  NavbarMenuToggle, NavbarMenuItem, NavbarMenu,
  NavbarContent, NavbarItem, Button, Link, Switch
} from "@nextui-org/react";
import Logo from "@/components/ui/Logo/Logo";
import ThemeSwitch from "@/components/ui/ThemeSwitch/ThemeSwitch";

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const menuItems = [
    "Profile",
    "Dashboard",
    "Activity",
    "Analytics",
    "System",
    "Deployments",
    "My Settings",
    "Team Settings",
    "Help & Feedback",
    "Log Out",
  ];

  return (
    <NextUINavbar
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
      isBlurred={false}
      maxWidth="full"
      className="bg-transparent fixed"
    >
      <NavbarContent className="pr-3" justify="start">
        <NavbarBrand as="li">
          <Logo />
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent justify="end">
        <NavbarContent className="hidden md:flex gap-4" justify="end">
          <NavbarItem>
            <Link color="foreground" href="#">
              Features
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link color="foreground" href="#">
              Customers
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link color="foreground" href="#">
              Integrations
            </Link>
          </NavbarItem>
        </NavbarContent>

        <NavbarItem>
          <Button as={Link} color="primary" href="mailto:125aryaaman@gmail.com" variant="solid">
            Contact Me
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

      {/* <NavbarMenu className="overflow-y-hidden pt-0">
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={`${item}-${index}`} className={index === 0 ? "pt-2" : ""}>
            <Link
              className="w-full"
              color={
                index === 2 ? "warning" : index === menuItems.length - 1 ? "danger" : "foreground"
              }
              href="#"
              size="lg"
            >
              {item}
            </Link>
          </NavbarMenuItem>
        ))}

        <NavbarContent className="pb-8 items-end">
          <NavbarItem>
            <Switch />
          </NavbarItem>
        </NavbarContent>
      </NavbarMenu > */}
    </NextUINavbar >
  );
}

export default Navbar;
