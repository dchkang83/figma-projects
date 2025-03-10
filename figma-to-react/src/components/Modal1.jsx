
import React from 'react';
import classNames from 'classnames/bind';
import styles from './Modal1.module.css';

const cx = classNames.bind(styles);

/**
 * Modal1 컴포넌트
 */
const Modal1 = (props) => {
  return (
    <div className={cx('container')} {...props}>
      <div className={cx('header')}>
        <div className={cx('title')}>
          <h3 className={cx('element-650')}>김네오님</h3>
        </div>
        <div className={cx('button')}>
          <div className={cx('icon-close')}>
            <div className={cx('vector')}></div>
          </div>
        </div>
      </div>
      <div className={cx('tab')}>
        <div className={cx('component-tab')}>
          <div className={cx('tab')}>
            <p className={cx('element-110･element-110')}>수납관리</p>
          </div>
        </div>
        <div className={cx('component-tab')}>
          <div className={cx('tab')}>
            <p className={cx('element-794')}>민원관리</p>
          </div>
          <div className={cx('dot-wrap')}>
            <div className={cx('status-dot')}>
              <div className={cx('height')}>
                <div className={cx('rectangle-1')}></div>
                <div className={cx('rectangle-2')}></div>
              </div>
              <div className={cx('width')}>
                <div className={cx('rectangle-1')}></div>
                <div className={cx('rectangle-2')}></div>
              </div>
            </div>
          </div>
        </div>
        <div className={cx('component-tab')}>
          <div className={cx('tab')}>
            <p className={cx('element-794')}>계약관리</p>
          </div>
        </div>
        <div className={cx('component-tab')}>
          <div className={cx('tab')}>
            <p className={cx('element-794')}>메시지 발송내역</p>
          </div>
          <div className={cx('dot-wrap')}>
            <div className={cx('status-dot')}>
              <div className={cx('height')}>
                <div className={cx('rectangle-1')}></div>
                <div className={cx('rectangle-2')}></div>
              </div>
              <div className={cx('width')}>
                <div className={cx('rectangle-1')}></div>
                <div className={cx('rectangle-2')}></div>
              </div>
            </div>
          </div>
        </div>
        <div className={cx('component-tab')}>
          <div className={cx('tab')}>
            <p className={cx('element-794')}>메모</p>
          </div>
          <div className={cx('badge')}>
            <p className={cx('n-99')}>N</p>
          </div>
        </div>
      </div>
      <div className={cx('content')}>
        <div className={cx('title')}>
          <h3 className={cx('yyyyelement-841-melement-841')}>YYYY년 M월</h3>
          <div className={cx('button')}>
            <div className={cx('button')}>
              <div className={cx('icon-left')}>
                <div className={cx('vector')}></div>
              </div>
            </div>
            <div className={cx('button')}>
              <div className={cx('icon-right')}>
                <div className={cx('vector')}></div>
              </div>
            </div>
          </div>
        </div>
        <div className={cx('group')}>
          <div className={cx('card-group')}>
            <div className={cx('card')}>
              <div className={cx('text-group')}>
                <div className={cx('icon-wrap')}>
                  <div className={cx('icon-close-circle')}>
                    <div className={cx('vector')}></div>
                  </div>
                </div>
                <p className={cx('melement-983-element-983')}>M월 수납상태</p>
              </div>
              <div className={cx('switch')}>
                <div className={cx('-hash-component-switch')}>
                  <div className={cx('rectangle-3')}></div>
                </div>
                <div className={cx('content')}>
                  <p className={cx('off')}>미납</p>
                  <div className={cx('spacer-4px')}>
                    <div className={cx('-spacer')}></div>
                  </div>
                </div>
              </div>
            </div>
            <div className={cx('card')}>
              <div className={cx('text-group')}>
                <div className={cx('icon-exclamation-circle')}>
                  <div className={cx('vector')}></div>
                </div>
                <p className={cx('element-340-element-340')}>누적 미납</p>
              </div>
              <div className={cx('text-group')}>
                <p className={cx('element-836-3element-836')}>총 3건</p>
                <div className={cx('icon-right')}>
                  <div className={cx('vector')}></div>
                </div>
              </div>
            </div>
          </div>
          <div className={cx('group')}>
            <p className={cx('element-197')}>수납내용</p>
            <div className={cx('frame-3244')}>
              <div className={cx('row2')}>
                <div className={cx('frame-129')}>
                  <p className={cx('element-949')}>납부일</p>
                  <p className={cx('n-20element-217')}>20일</p>
                </div>
                <div className={cx('frame-129')}>
                  <p className={cx('element-923')}>수납상태</p>
                  <div className={cx('payment-status')}>
                    <div className={cx('status-dot')}>
                      <div className={cx('height')}>
                        <div className={cx('rectangle-1')}></div>
                        <div className={cx('rectangle-2')}></div>
                      </div>
                      <div className={cx('width')}>
                        <div className={cx('rectangle-1')}></div>
                        <div className={cx('rectangle-2')}></div>
                      </div>
                    </div>
                    <p className={cx('element-438')}>미납</p>
                  </div>
                </div>
              </div>
              <div className={cx('row2')}>
                <div className={cx('frame-129')}>
                  <p className={cx('element-464')}>월세</p>
                  <p className={cx('n-35element-662')}>35만원</p>
                </div>
                <div className={cx('frame-129')}>
                  <p className={cx('element-668')}>관리비</p>
                  <p className={cx('n-5element-611')}>5만원</p>
                </div>
              </div>
              <div className={cx('row3')}>
                <div className={cx('frame-130')}>
                  <p className={cx('element-150')}>부가세</p>
                  <p className={cx('n-4element-899--paren-element-899-plus-element-899-paren-')}>4만원 (월세+관리비)</p>
                </div>
                <div className={cx('frame-131')}>
                  <div className={cx('frame-3902')}>
                    <p className={cx('element-954-element-954')}>월 납부총액</p>
                    <div className={cx('button')}>
                      <div className={cx('icon-edit')}>
                        <div className={cx('vector')}></div>
                      </div>
                      <p className={cx('element-635')}>조정</p>
                    </div>
                  </div>
                  <p className={cx('n-44element-662')}>44만원</p>
                </div>
              </div>
            </div>
          </div>
          <div className={cx('group')}>
            <p className={cx('title')}>수납자 정보</p>
            <div className={cx('group')}>
              <div className={cx('row')}>
                <div className={cx('frame-129')}>
                  <p className={cx('element-943')}>수납자명</p>
                  <p className={cx('element-425-paren-101element-425-paren-')}>김이름(101호)</p>
                </div>
                <div className={cx('text-group')}>
                  <div className={cx('frame-3142')}>
                    <p className={cx('element-596')}>계약기간</p>
                    <div className={cx('frame-3065')}>
                      <p className={cx('yy-dot-mm-dot-dd--tilde--yy-dot-mm-dot-dd')}>YY.MM.DD ~ YY.MM.DD</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={cx('button-group')}>
          <div className={cx('button')}>
            <div className={cx('text-group')}>
              <div className={cx('icon-mail')}>
                <div className={cx('vector')}></div>
              </div>
              <p className={cx('element-810-element-810-element-810')}>미납 고지서 발송</p>
            </div>
            <div className={cx('icon-partner-16')}>
              <div className={cx('ellipse-61')}></div>
              <div className={cx('union')}></div>
            </div>
          </div>
        </div>
      </div>
      {props.children}
    </div>
  );
};

export default Modal1;
