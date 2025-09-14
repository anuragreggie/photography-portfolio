import { Outlet } from 'react-router';
import { AppShell, Group, Text, Container, ActionIcon } from '@mantine/core';
import { NavLink } from 'react-router';
import { motion } from 'framer-motion';
import { IconMail, IconBrandInstagram } from '@tabler/icons-react';
import classes from './styles.module.css';

export default function MainLayout() {
  return (
    <AppShell
      header={{ height: 80 }}
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
          
          <nav className={classes.nav}>
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
        </div>
      </AppShell.Header>

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
              </div>
            </Container>
          </footer>
        </motion.div>
      </AppShell.Main>
    </AppShell>
  );
}
