import { Outlet } from 'react-router-dom';

import s from './MainLayout.module.css'

const MainLayout = () => {
  return (
    <main className={s.layout}>
      <Outlet />
    </main>
  );
};

export default MainLayout;