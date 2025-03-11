
import React from 'react';
import classNames from 'classnames/bind';
import styles from './Modal1.module.css';

const cx = classNames.bind(styles);

// import { FunctionComponent } from 'react';
// import styles from './AllFrame.module.css';


const Modal1 = () => {
  	return (
    		<div className={cx.allFrame}>
      			<div className={cx.header}>
        				<div className={cx.group}>
          					<div className={cx.div}>운영현황</div>
          					<div className={cx.dropdownTriggerbox}>
            						<div className={cx.text}>
              							<img className={cx.iconmemo} alt="" src="icon/Memo.png" />
              							<div className={cx.div}>메모</div>
            						</div>
            						<img className={cx.icon} alt="" src="....svg" />
          					</div>
        				</div>
        				<div className={cx.textGroup}>
          					<b className={cx.b}>베어하우스 노량진 1호점</b>
          					<img className={cx.icondowncircle} alt="" src="icon/DownCircle.svg" />
        				</div>
      			</div>
      			<div className={cx.section}>
        				<div className={cx.card}>
          					<div className={cx.group}>
            						<b className={cx.b1}>임대현황</b>
            						<div className={cx.iconcalendarsearchParent}>
              							<img className={cx.iconcalendarsearch} alt="" src="icon/CalendarSearch.svg" />
              							<div className={cx.div1}>일자별 조회</div>
            						</div>
          					</div>
          					<div className={cx.content}>
            						<div className={cx.graph}>
              							<img className={cx.graphIcon} alt="" src="graph.svg" />
              							<div className={cx.textGroup1}>
                								<div className={cx.textGroup2}>
                  									<b className={cx.n}>N</b>
                  									<div className={cx.b1}>/</div>
                  									<div className={cx.b1}>N</div>
                								</div>
                								<div className={cx.div3}>현재 공실</div>
              							</div>
            						</div>
            						<div className={cx.labelGroup}>
              							<div className={cx.label}>
                								<div className={cx.tabItem}>
                  									<div className={cx.statusDot}>
                    										<img className={cx.heightIcon} alt="" src="height.png" />
                    										<div className={cx.width}>
                      											<div className={cx.widthChild} />
                      											<div className={cx.widthChild} />
                    										</div>
                  									</div>
                  									<div className={cx.div1}>입실</div>
                								</div>
                								<div className={cx.badge}>
                  									<div className={cx.div5}>N</div>
                								</div>
              							</div>
              							<div className={cx.label}>
                								<div className={cx.tabItem}>
                  									<div className={cx.statusDot1}>
                    										<img className={cx.heightIcon} alt="" src="height.png" />
                    										<div className={cx.width}>
                      											<div className={cx.widthChild} />
                      											<div className={cx.widthChild} />
                    										</div>
                  									</div>
                  									<div className={cx.div1}>예약</div>
                								</div>
                								<div className={cx.badge}>
                  									<div className={cx.div5}>N</div>
                								</div>
              							</div>
              							<div className={cx.label}>
                								<div className={cx.tabItem}>
                  									<div className={cx.statusDot2}>
                    										<img className={cx.heightIcon} alt="" src="height.png" />
                    										<div className={cx.width}>
                      											<div className={cx.widthChild} />
                      											<div className={cx.widthChild} />
                    										</div>
                  									</div>
                  									<div className={cx.div1}>공실</div>
                								</div>
                								<div className={cx.badge}>
                  									<div className={cx.div5}>N</div>
                								</div>
              							</div>
            						</div>
          					</div>
        				</div>
        				<div className={cx.card}>
          					<div className={cx.group}>
            						<b className={cx.b1}>입퇴실 예정</b>
            						<div className={cx.button}>
              							<div className={cx.div1}>7일 이내</div>
              							<img className={cx.icondown} alt="" src="icon/Down.svg" />
            						</div>
          					</div>
          					<div className={cx.content1}>
            						<div className={cx.box}>
              							<div className={cx.textGroup2}>
                								<div className={cx.div1}>입실 예정</div>
                								<img className={cx.iconright} alt="" src="icon/Right.svg" />
              							</div>
              							<b className={cx.b3}>5건</b>
            						</div>
            						<div className={cx.box1}>
              							<div className={cx.textGroup2}>
                								<div className={cx.div1}>퇴실 예정</div>
                								<img className={cx.iconright} alt="" src="icon/Right.svg" />
              							</div>
              							<b className={cx.b3}>4건</b>
            						</div>
          					</div>
        				</div>
        				<div className={cx.card}>
          					<div className={cx.group}>
            						<b className={cx.b1}>1월 수납현황</b>
            						<div className={cx.button1}>
              							<div className={cx.div1}>총 금액</div>
              							<img className={cx.icondown} alt="" src="icon/InfoCircle.svg" />
            						</div>
          					</div>
          					<div className={cx.content2}>
            						<div className={cx.textGroup6}>
              							<b className={cx.b6}>1,400만원</b>
              							<div className={cx.div14}>/ 2,000만원</div>
            						</div>
            						<div className={cx.group1}>
              							<div className={cx.graph1}>
                								<div className={cx.bar} />
                								<div className={cx.bar1} />
                								<div className={cx.bar2} />
              							</div>
              							<div className={cx.labelGroup1}>
                								<div className={cx.label}>
                  									<div className={cx.tabItem}>
                    										<div className={cx.statusDot}>
                      											<img className={cx.heightIcon} alt="" src="height.png" />
                      											<div className={cx.width}>
                        												<div className={cx.widthChild} />
                        												<div className={cx.widthChild} />
                      											</div>
                    										</div>
                    										<div className={cx.div1}>완납</div>
                  									</div>
                  									<div className={cx.badge}>
                    										<div className={cx.div5}>4</div>
                  									</div>
                								</div>
                								<div className={cx.label}>
                  									<div className={cx.tabItem}>
                    										<div className={cx.statusDot1}>
                      											<img className={cx.heightIcon} alt="" src="height.png" />
                      											<div className={cx.width}>
                        												<div className={cx.widthChild} />
                        												<div className={cx.widthChild} />
                      											</div>
                    										</div>
                    										<div className={cx.div1}>예정</div>
                  									</div>
                  									<div className={cx.badge}>
                    										<div className={cx.div5}>2</div>
                  									</div>
                								</div>
                								<div className={cx.label}>
                  									<div className={cx.tabItem}>
                    										<div className={cx.statusDot5}>
                      											<img className={cx.heightIcon} alt="" src="height.png" />
                      											<div className={cx.width}>
                        												<div className={cx.widthChild} />
                        												<div className={cx.widthChild} />
                      											</div>
                    										</div>
                    										<div className={cx.div1}>미납</div>
                  									</div>
                  									<div className={cx.badge}>
                    										<div className={cx.div5}>2</div>
                  									</div>
                								</div>
              							</div>
            						</div>
          					</div>
        				</div>
        				<div className={cx.card}>
          					<div className={cx.group}>
            						<b className={cx.b1}>민원현황</b>
            						<div className={cx.iconcalendarsearchParent}>
              							<img className={cx.iconcalendarsearch} alt="" src="icon/Tool.svg" />
              							<div className={cx.div1}>민원센터 관리</div>
            						</div>
          					</div>
          					<div className={cx.content3}>
            						<div className={cx.box2}>
              							<div className={cx.textGroup2}>
                								<div className={cx.div1}>접수</div>
                								<img className={cx.iconright} alt="" src="icon/Right.svg" />
              							</div>
              							<div className={cx.parent}>
                								<b className={cx.div}>1건</b>
                								<div className={cx.statusDot5}>
                  									<img className={cx.heightIcon} alt="" src="height.png" />
                  									<div className={cx.width}>
                    										<div className={cx.widthChild} />
                    										<div className={cx.widthChild} />
                  									</div>
                								</div>
              							</div>
            						</div>
            						<div className={cx.box}>
              							<div className={cx.div1}>처리대기</div>
              							<b className={cx.b3}>2건</b>
            						</div>
            						<div className={cx.box4}>
              							<div className={cx.div1}>처리중</div>
              							<b className={cx.b10}>0건</b>
            						</div>
          					</div>
        				</div>
      			</div>
      			<div className={cx.tab}>
        				<div className={cx.componenttab}>
          					<div className={cx.tab1}>
            						<b className={cx.div}>임대현황</b>
          					</div>
          					<div className={cx.ink} />
        				</div>
        				<div className={cx.componenttab1}>
          					<div className={cx.tab2}>
            						<div className={cx.div}>수납현황</div>
          					</div>
        				</div>
        				<div className={cx.componenttab1}>
          					<div className={cx.tab2}>
            						<div className={cx.div}>민원현황</div>
          					</div>
        				</div>
      			</div>
      			<div className={cx.section1}>
        				<div className={cx.group2}>
          					<div className={cx.ceohostOperationunitState}>
            						<div className={cx.width}>
              							<div className={cx.statusDot}>
                								<img className={cx.heightIcon} alt="" src="height.png" />
                								<div className={cx.width}>
                  									<div className={cx.widthChild} />
                  									<div className={cx.widthChild} />
                								</div>
              							</div>
              							<div className={cx.div27}>입실</div>
            						</div>
            						<div className={cx.divider} />
            						<div className={cx.width}>
              							<div className={cx.statusDot1}>
                								<img className={cx.heightIcon} alt="" src="height.png" />
                								<div className={cx.width}>
                  									<div className={cx.widthChild} />
                  									<div className={cx.widthChild} />
                								</div>
              							</div>
              							<div className={cx.div27}>예약</div>
            						</div>
            						<div className={cx.divider} />
            						<div className={cx.unitStatus2}>
              							<div className={cx.statusDot9}>
                								<img className={cx.heightIcon} alt="" src="height.png" />
                								<div className={cx.width}>
                  									<div className={cx.widthChild} />
                  									<div className={cx.widthChild} />
                								</div>
              							</div>
              							<div className={cx.div}>공실</div>
            						</div>
          					</div>
          					<div className={cx.group3}>
            						<div className={cx.ceohostOperationunitState}>
              							<div className={cx.tabItem}>
                								<img className={cx.iconappstore} alt="" src="icon/Appstore.svg" />
                								<div className={cx.div27}>카드</div>
              							</div>
              							<div className={cx.divider} />
              							<div className={cx.tabItem1}>
                								<img className={cx.iconappstore} alt="" src="icon/Table.svg" />
                								<div className={cx.div}>표</div>
              							</div>
            						</div>
            						<div className={cx.dropdownTriggerbox1}>
              							<div className={cx.text}>
                								<img className={cx.iconappstore} alt="" src="icon/Plus.svg" />
                								<div className={cx.div}>입실자 등록</div>
              							</div>
              							<img className={cx.icon} alt="" src="....svg" />
            						</div>
          					</div>
        				</div>
        				<div className={cx.content4}>
          					<div className={cx.row}>
            						<div className={cx.card4}>
              							<div className={cx.title4}>
                								<div className={cx.textGroup6}>
                  									<b className={cx.b12}>101호</b>
                  									<img className={cx.iconright3} alt="" src="icon/Right.svg" />
                								</div>
                								<div className={cx.textGroup10}>
                  									<div className={cx.value}>value 타입</div>
                  									<div className={cx.divider3} />
                  									<div className={cx.value}>N인실</div>
                								</div>
              							</div>
              							<div className={cx.list}>
                								<div className={cx.group4}>
                  									<div className={cx.div32}>김입실</div>
                  									<div className={cx.textGroup11}>
                    										<div className={cx.yymmdd}>~YY.MM.DD</div>
                    										<div className={cx.nn}>NN일 남음</div>
                  									</div>
                								</div>
              							</div>
            						</div>
            						<div className={cx.card4}>
              							<div className={cx.title4}>
                								<div className={cx.textGroup6}>
                  									<b className={cx.b12}>102호</b>
                  									<img className={cx.iconright3} alt="" src="icon/Right.svg" />
                								</div>
                								<div className={cx.textGroup10}>
                  									<div className={cx.value}>value 타입</div>
                  									<div className={cx.divider3} />
                  									<div className={cx.value}>N인실</div>
                								</div>
              							</div>
              							<div className={cx.list1}>
                								<div className={cx.group4}>
                  									<div className={cx.div32}>김입실</div>
                  									<div className={cx.textGroup11}>
                    										<div className={cx.yymmdd}>~YY.MM.DD</div>
                    										<div className={cx.nn}>NN일 남음</div>
                  									</div>
                								</div>
                								<div className={cx.group4}>
                  									<div className={cx.div32}>이입실</div>
                  									<div className={cx.textGroup11}>
                    										<div className={cx.yymmdd}>~YY.MM.DD</div>
                    										<div className={cx.nn}>NN일 남음</div>
                  									</div>
                								</div>
              							</div>
            						</div>
            						<div className={cx.card6}>
              							<div className={cx.title4}>
                								<div className={cx.textGroup6}>
                  									<b className={cx.b12}>103호</b>
                  									<img className={cx.iconright3} alt="" src="icon/Right.svg" />
                								</div>
                								<div className={cx.textGroup10}>
                  									<div className={cx.value}>value 타입</div>
                  									<div className={cx.divider3} />
                  									<div className={cx.value}>N인실</div>
                								</div>
              							</div>
              							<div className={cx.list1}>
                								<div className={cx.group7}>
                  									<div className={cx.div35}>김입실</div>
                  									<div className={cx.textGroup11}>
                    										<div className={cx.yymmdd}>~YY.MM.DD</div>
                    										<div className={cx.nn}>NN일 남음</div>
                  									</div>
                								</div>
                								<div className={cx.group7}>
                  									<div className={cx.div32}>이입실</div>
                  									<div className={cx.textGroup11}>
                    										<div className={cx.yymmdd}>~YY.MM.DD</div>
                    										<div className={cx.nn}>NN일 남음</div>
                  									</div>
                								</div>
                								<div className={cx.group7}>
                  									<div className={cx.div32}>박입실</div>
                  									<div className={cx.textGroup11}>
                    										<div className={cx.yymmdd}>~YY.MM.DD</div>
                    										<div className={cx.nn}>NN일 남음</div>
                  									</div>
                								</div>
              							</div>
            						</div>
          					</div>
          					<div className={cx.row}>
            						<div className={cx.card6}>
              							<div className={cx.title4}>
                								<div className={cx.textGroup6}>
                  									<b className={cx.b12}>104호</b>
                  									<img className={cx.iconright3} alt="" src="icon/Right.svg" />
                								</div>
                								<div className={cx.textGroup10}>
                  									<div className={cx.value}>value 타입</div>
                  									<div className={cx.divider3} />
                  									<div className={cx.value}>N인실</div>
                								</div>
              							</div>
              							<div className={cx.list3}>
                								<div className={cx.div}>현재 입실자가 없습니다.</div>
                								<div className={cx.button2}>
                  									<div className={cx.div39}>지난 내역 보기</div>
                  									<img className={cx.iconright} alt="" src="icon/ArrowRightTop.svg" />
                								</div>
              							</div>
            						</div>
            						<div className={cx.card4}>
              							<div className={cx.title12}>
                								<div className={cx.textGroup20}>
                  									<div className={cx.textGroup6}>
                    										<b className={cx.b12}>105호</b>
                    										<img className={cx.iconright3} alt="" src="icon/Right.svg" />
                  									</div>
                  									<div className={cx.textGroup10}>
                    										<div className={cx.value}>value 타입</div>
                    										<div className={cx.divider3} />
                    										<div className={cx.value}>N인실</div>
                  									</div>
                								</div>
                								<div className={cx.tagWrap}>
                  									<div className={cx.tag}>
                    										<div className={cx.div1}>예약 N건</div>
                    										<img className={cx.iconright} alt="" src="icon/Right.svg" />
                  									</div>
                								</div>
              							</div>
              							<div className={cx.list}>
                								<div className={cx.group4}>
                  									<div className={cx.div32}>김입실</div>
                  									<div className={cx.textGroup11}>
                    										<div className={cx.yymmdd}>~YY.MM.DD</div>
                    										<div className={cx.nn}>NN일 남음</div>
                  									</div>
                								</div>
              							</div>
            						</div>
            						<div className={cx.card4}>
              							<div className={cx.title12}>
                								<div className={cx.textGroup20}>
                  									<div className={cx.textGroup6}>
                    										<b className={cx.b12}>106호</b>
                    										<img className={cx.iconright3} alt="" src="icon/Right.svg" />
                  									</div>
                  									<div className={cx.textGroup10}>
                    										<div className={cx.value}>value 타입</div>
                    										<div className={cx.divider3} />
                    										<div className={cx.value}>N인실</div>
                  									</div>
                								</div>
                								<div className={cx.tagWrap}>
                  									<div className={cx.tag}>
                    										<div className={cx.div1}>예약 N건</div>
                    										<img className={cx.iconright} alt="" src="icon/Right.svg" />
                  									</div>
                								</div>
              							</div>
              							<div className={cx.list1}>
                								<div className={cx.group4}>
                  									<div className={cx.div32}>김입실</div>
                  									<div className={cx.textGroup11}>
                    										<div className={cx.yymmdd}>~YY.MM.DD</div>
                    										<div className={cx.nn}>NN일 남음</div>
                  									</div>
                								</div>
                								<div className={cx.group4}>
                  									<div className={cx.div32}>이입실</div>
                  									<div className={cx.textGroup11}>
                    										<div className={cx.yymmdd}>~YY.MM.DD</div>
                    										<div className={cx.nn}>NN일 남음</div>
                  									</div>
                								</div>
              							</div>
            						</div>
          					</div>
        				</div>
      			</div>
    		</div>);
};

export default Modal1;
