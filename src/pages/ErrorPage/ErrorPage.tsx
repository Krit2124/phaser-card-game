import { Link } from "react-router-dom";

import styles from "./ErrorPage.module.css";

const ErrorPage = () => {
  return (
    <section>
      <div className={styles.page}>
        <h1>Произошла неожиданная ошибка</h1>
        <Link to="#" onClick={() => window.history.back()}>
          Вернуться назад
        </Link>
      </div>
    </section>
  );
};

export default ErrorPage;
