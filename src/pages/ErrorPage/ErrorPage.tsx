import styles from "./ErrorPage.module.css";
import { DefaultTextButton } from "@/shared/ui";

const ErrorPage = () => {
  return (
    <section>
      <div className={styles.page}>
        <h1>Произошла неожиданная ошибка</h1>
        <DefaultTextButton text="Вернуться назад" onClick={() => window.history.back()} />
      </div>
    </section>
  );
};

export default ErrorPage;
