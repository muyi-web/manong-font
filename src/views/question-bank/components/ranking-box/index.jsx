import ClickImg from '@/imgs/clickImg.png'
import Ranking1Img from '@/imgs/ranking1Img.png'
import Ranking2Img from '@/imgs/ranking2Img.png'
import Ranking3Img from '@/imgs/ranking3Img.png'
import RankingImg from '@/imgs/rankingImg.png'
import { debounce } from '@utils'
import { Popover, Spin, message } from 'antd'
import { RankingTypeBtnText, RankingTypeText } from '../../constant'
import './index.less'

const rankingBackImg = {
  0: Ranking1Img,
  1: Ranking2Img,
  2: Ranking3Img
}

export default function RankingBox(props) {
  const { isLoading = false, currentActive, rankingType, contributionList } = props
  const onChangeRanking = index =>
    debounce(() => {
      props.onHandleRanking && props.onHandleRanking(index)
    })
  const onJump = debounce(() => {
    if (props.onHandleJump) {
      props.onHandleJump()
    } else {
      message.info('敬请期待')
    }
  })
  const tabList = [
    {
      tab: '总榜',
      key: 'total'
    }
  ]
  // 获得当前下标的数据
  let rankingList = contributionList || []

  return (
    <div className='ranking-list-box'>
      <div className='ranking-list-header'>
        <div className='ranking-list-title'>{RankingTypeText[rankingType]}</div>
        <div className='ranking-list-btns'>
          {tabList.length > 0 &&
            tabList.map((item, index) => {
              return (
                <div
                  key={`${rankingType}_${item.key}`}
                  onClick={onChangeRanking(index)}
                  className={`ranking-list-btn ${
                    currentActive === index ? 'ranking-list-btn-active' : ''
                  }`}
                >
                  {item.tab}
                </div>
              )
            })}
        </div>
      </div>
      <Spin spinning={isLoading}>
        <div className='ranking-list'>
          {rankingList?.length > 0 &&
            rankingList.map((item, index) => {
              return (
                <div className='ranking-item' key={index}>
                  <div className='ranking-left'>
                    <div
                      className='ranking-icon'
                      style={{
                        backgroundImage: `url(${index <= 2 ? rankingBackImg[index] : RankingImg})`
                      }}
                    >
                      {index > 2 && index + 1}
                    </div>
                    <div className='ranking-head-img'>
                      <img
                        src={item.createUserAvatar || item.avatar}
                        className='ranking-head-icon'
                      />
                    </div>
                    <Popover
                      title={<div>{item.createUser}</div>}
                      content={
                        <div className='tooltip-info'>
                          <div>{item.createUser || item.name}</div>
                          {/* <div>{item.organizationFullName}</div> */}
                        </div>
                      }
                    >
                      <div className='ranking-info'>
                        <div className='ranking-name'>{item.createUser || item.name}</div>
                        {/* <div className="ranking-department">{item.organizationName}</div> */}
                      </div>
                    </Popover>
                  </div>
                  <div className='ranking-right'>🔥 {item.subjectCount || item.count}</div>
                </div>
              )
            })}
        </div>
      </Spin>
      <div className='ranking-btn-go' onClick={onJump}>
        <div
          className='ranking-btn-go-icon'
          style={{
            backgroundImage: `url(${ClickImg})`
          }}
        ></div>
        <div className='ranking-btn-text'>{RankingTypeBtnText[rankingType]}</div>
      </div>
    </div>
  )
}
