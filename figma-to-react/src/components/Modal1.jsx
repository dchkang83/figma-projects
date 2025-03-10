import React from 'react';
import classNames from 'classnames/bind';
import styles from './Modal1.module.css';

const cx = classNames.bind(styles);

const Modal1 = () => {
  return (
    <div className={cx('container')}>
      <h1>내 애플리케이션</h1>
    </div>
  );
};

export default Modal1;