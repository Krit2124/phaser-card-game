import { Outlet } from 'react-router-dom';
import s from './MainLayout.module.css';

const MainLayout = () => {
  return (
    <main
      className={s.layout}
      style={{ backgroundImage: `url(./img/backgrounds/bg_default.jpg)` }} // На билде фон не работает, если добавлять его через css
    >
      <Outlet />
    </main>
  );
};

export default MainLayout;