import { Outlet } from 'react-router';
import { AppShell, Group, Text, Button, Stack } from '@mantine/core';
import { NavLink } from 'react-router';
import { motion } from 'framer-motion';
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
            <Text size="xl" fw={400} c="dark.9" className={classes.logoText}>
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
        >
          <Outlet />
        </motion.div>
      </AppShell.Main>
    </AppShell>
  );
}
