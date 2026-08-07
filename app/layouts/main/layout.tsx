import {
  AppShell,
  Group,
  Text,
  Container,
  ActionIcon,
  Burger,
} from '@mantine/core';
import { NavLink, Outlet } from 'react-router';
import { motion } from 'framer-motion';
import {
  IconMail,
  IconBrandInstagram,
  IconBrandGithub,
  IconBrandLinkedin,
} from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import classes from './styles.module.css';

const NAV_ITEMS = [
  { to: '/', label: 'Home' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/about', label: 'About' },
];

function navClassName(baseClass: string, isActive: boolean) {
  return `${baseClass} ${isActive ? classes.active : ''}`;
}

export default function MainLayout() {
  const [opened, { toggle, close }] = useDisclosure();

  return (
    <AppShell
      header={{ height: 80 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { mobile: !opened, desktop: true },
      }}
      padding={0}
      className={classes.shell}
    >
      <AppShell.Header className={classes.header}>
        <div className={classes.headerContent}>
          <NavLink to="/" className={classes.logo}>
            <Text size="xl" fw={400} c="dark.0" className={classes.logoText}>
              Anurag S
            </Text>
          </NavLink>

          <nav className={classes.desktopNav}>
            <Group gap="2rem">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    navClassName(classes.navLink, isActive)
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </Group>
          </nav>

          <Burger
            opened={opened}
            onClick={toggle}
            hiddenFrom="sm"
            size="sm"
            color="var(--mantine-color-dark-0)"
          />
        </div>
      </AppShell.Header>

      <AppShell.Navbar className={classes.navbar}>
        <div className={classes.navbarContent}>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                navClassName(classes.mobileNavLink, isActive)
              }
              onClick={close}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </AppShell.Navbar>

      <AppShell.Main>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className={classes.mainContent}
        >
          <Outlet />

          <footer className={classes.footer}>
            <Container size="xl" className={classes.footerContainer}>
              <div className={classes.footerContent}>
                <Text className={classes.footerName}>ANURAG SURESH</Text>
                <Text className={classes.footerAddress}>London, UK</Text>
                <Group
                  gap="lg"
                  justify="center"
                  className={classes.footerIcons}
                >
                  <ActionIcon
                    component="a"
                    href="mailto:anuragreggie@gmail.com"
                    aria-label="Email"
                    variant="subtle"
                    size="lg"
                    className={classes.iconButton}
                  >
                    <IconMail size={20} />
                  </ActionIcon>
                  <ActionIcon
                    component="a"
                    href="https://instagram.com/anurag.r_"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    variant="subtle"
                    size="lg"
                    className={classes.iconButton}
                  >
                    <IconBrandInstagram size={20} />
                  </ActionIcon>
                  <ActionIcon
                    component="a"
                    href="https://www.linkedin.com/in/anurag-suresh/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn"
                    variant="subtle"
                    size="lg"
                    className={classes.iconButton}
                  >
                    <IconBrandLinkedin size={20} />
                  </ActionIcon>
                </Group>
                <Text className={classes.footerCredit}>
                  Designed by me
                  <ActionIcon
                    component="a"
                    href="https://github.com/anuragreggie/photography-portfolio"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="GitHub repository"
                    variant="subtle"
                    size="sm"
                    className={classes.iconButton}
                    style={{ display: 'inline-flex', verticalAlign: 'middle' }}
                  >
                    <IconBrandGithub size={16} />
                  </ActionIcon>
                </Text>
              </div>
            </Container>
          </footer>
        </motion.div>
      </AppShell.Main>
    </AppShell>
  );
}
