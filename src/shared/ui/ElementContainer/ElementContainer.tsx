import { ReactNode } from 'react';

import s from './ElementContainer.module.css'

interface ElementContainerProps {
  children: ReactNode
  className?: string
}

const ElementContainer = ({children, className}: ElementContainerProps) => {
  return (
    <div className={`${s.container} ${className}`}>
      {children}
    </div>
  );
};

export default ElementContainer;