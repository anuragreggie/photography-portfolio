import { Outlet } from 'react-router';
import { AppShell, Group, Text, Container, ActionIcon, Burger } from '@mantine/core';
import { NavLink } from 'react-router';
import { motion } from 'framer-motion';
import { IconMail, IconBrandInstagram, IconBrandGithub } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import classes from './styles.module.css';

export default function MainLayout() {
  const [opened, { toggle }] = useDisclosure();

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
          
          {/* Desktop Navigation */}
          <nav className={classes.desktopNav}>
            <Group gap="2rem">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `${classes.navLink} ${isActive ? classes.active : ''}`
                }
              >
                Home
              </NavLink>
              <NavLink
                to="/gallery"
                className={({ isActive }) =>
                  `${classes.navLink} ${isActive ? classes.active : ''}`
                }
              >
                Gallery
              </NavLink>
              <NavLink
                to="/about"
                className={({ isActive }) =>
                  `${classes.navLink} ${isActive ? classes.active : ''}`
                }
              >
                About
              </NavLink>
            </Group>
          </nav>

          {/* Mobile Burger Menu */}
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
          <NavLink
            to="/"
            className={({ isActive }) =>
              `${classes.mobileNavLink} ${isActive ? classes.active : ''}`
            }
            onClick={toggle}
          >
            Home
          </NavLink>
          <NavLink
            to="/gallery"
            className={({ isActive }) =>
              `${classes.mobileNavLink} ${isActive ? classes.active : ''}`
            }
            onClick={toggle}
          >
            Gallery
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              `${classes.mobileNavLink} ${isActive ? classes.active : ''}`
            }
            onClick={toggle}
          >
            About
          </NavLink>
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
          
          {/* Footer as scrollable content */}
          <footer className={classes.footer}>
            <Container size="xl" className={classes.footerContainer}>
              <div className={classes.footerContent}>
                <Text className={classes.footerName}>
                  ANURAG SURESH
                </Text>
                <Text className={classes.footerAddress}>
                  London, UK
                </Text>
                <Group gap="lg" justify="center" className={classes.footerIcons}>
                  <ActionIcon
                    component="a"
                    href="anuragreggie@gmail.com"
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
                    variant="subtle"
                    size="lg"
                    className={classes.iconButton}
                  >
                    <IconBrandInstagram size={20} />
                  </ActionIcon>
                </Group>
                <Text className={classes.footerCredit}>
                  Designed by me
                  <ActionIcon
                    component="a"
                    href="https://github.com/anuragreggie/photography-portfolio"
                    target="_blank"
                    rel="noopener noreferrer"
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
