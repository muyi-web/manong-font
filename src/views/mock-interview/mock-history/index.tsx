import { useState, useEffect, FC, useCallback, useRef } from 'react'
import req from '@utils/request'
import styles from './index.module.less'
import { Button } from 'antd'
import dayjs from 'dayjs'
import cn from 'classnames'
import { useNavigate } from 'react-router-dom'

interface HistoryItem {
  id: number
  avgScore: number
  keyWords: string
  tip: string
  createdTime: number
}

const MockHistory: FC = () => {
  const navigate = useNavigate()
  const [historyList, setHistoryList] = useState<HistoryItem[]>([])
  const finished = useRef(false)
  const [pageInfo, setPageInfo] = useState({
    pageNo: 1,
    pageSize: 10
  })

  const fetchHistoryList = useCallback(() => {
    req(
      {
        method: 'post',
        url: '/interview/getHistory',
        data: { pageInfo }
      },
      '/interview'
    ).then(res => {
      setHistoryList(pre =>
        pageInfo.pageNo === 1 ? res.data.result : [...pre, ...res.data.result]
      )
      if (res.data.result < 10) {
        finished.current = true
      }
    })
  }, [pageInfo])

  useEffect(() => {
    fetchHistoryList()
  }, [fetchHistoryList, pageInfo])

  const toDetail = (id: number) => {
    navigate('/inter-detail/' + id)
  }

  const scrollHandler = e => {
    const scrollTop = e.target.scrollTop // listBox 滚动条向上卷曲出去的长度，随滚动变化
    const clientHeight = e.target.clientHeight // listBox 的视口可见高度，固定不变
    const scrollHeight = e.target.scrollHeight // listBox 的整体高度，随数据加载变化
    const safeHeight = 10 // 安全距离，距离底部XX时，触发加载
    const tempVal = scrollTop + clientHeight + safeHeight
    if (tempVal >= scrollHeight) {
      if (!finished.current) {
        setPageInfo({
          pageNo: pageInfo.pageNo + 1,
          pageSize: 10
        })
      }
    }
  }

  return (
    <div className={styles.wrapper} onScroll={scrollHandler}>
      {historyList.map(item => {
        return (
          <div key={item.id} className={styles.listItem}>
            <div className={styles.leftBox}>
              <div className={styles.scoreBox}>{item.avgScore}</div>
              <div className={styles.scoreLabel}>得分</div>
            </div>
            <div className={styles.rightBox}>
              <div className={cn(styles.rightItem, styles.title)}>{item.keyWords}</div>
              <div className={cn(styles.rightItem, styles.desc)}>{item.tip}</div>
              <div className={styles.rightItem}>
                <div>{dayjs(item.createdTime).format('YYYY-MM-DD HH:mm:ss')}</div>
                <Button type='primary' ghost onClick={() => toDetail(item.id)}>
                  查看详情
                </Button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
export default MockHistory
