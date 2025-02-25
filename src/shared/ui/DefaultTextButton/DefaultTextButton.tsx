import { ButtonHTMLAttributes } from 'react';
import s from './DefaultTextButton.module.css'

interface DefaultButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  text: string
}

const DefaultTextButton = ({text, className, ...props}: DefaultButtonProps) => {
  return (
    <button className={`${s.defaultButton} ${className}`} {...props}>
      {text}
    </button>
  );
};

export default DefaultTextButton;