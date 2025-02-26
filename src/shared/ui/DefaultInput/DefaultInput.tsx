import { InputHTMLAttributes } from 'react';
import s from './DefaultInput.module.css'

const DefaultInput = ({type = "text", className, ...props}: InputHTMLAttributes<HTMLInputElement>) => {
  return (
    <input type={type} className={`${s.defaultInput} ${className}`} {...props} />
  );
};

export default DefaultInput;