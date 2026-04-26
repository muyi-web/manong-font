import { useState, useEffect, FC, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import req from '@utils/request'
import cn from 'classnames'
import styles from './index.module.less'
import { Tag } from 'antd'

interface DetailItem {
  score: number
  keyWords: string
  question: string
  userAnswer: string
  answer?: string
}

const MockDetail: FC = () => {
  const { id } = useParams()
  const [detail, setDetail] = useState<DetailItem[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  const fetchDetail = useCallback(() => {
    req(
      {
        method: 'get',
        url: '/interview/detail',
        params: { id }
      },
      '/interview'
    ).then(res => {
      if (res.success && res.data && Array.isArray(res.data)) {
        setDetail(res.data)
      } else {
        setDetail([])
      }
    })
  }, [id])

  useEffect(() => {
    if (id) {
      fetchDetail()
    }
  }, [id, fetchDetail])

  return (
    <div className={styles.wrapper}>
      <div className={styles.title}>面试题解析</div>
      <div className={styles.orderBox}>
        {detail.map((_, index) => {
          return (
            <div
              className={cn(styles.orderItem, {
                [styles.active]: index === currentIndex
              })}
              key={index}
              onClick={() => setCurrentIndex(index)}
            >
              {index + 1}
            </div>
          )
        })}
      </div>
      <div className={styles.questionBox}>
        <div className={styles.questionTitle}>题目：{detail[currentIndex]?.question}</div>
      </div>
      <div className={styles.userAnswerBox}>
        <div>你的答案：</div>
        <div className={styles.questionContent}>{detail[currentIndex]?.userAnswer || '未作答'}</div>
      </div>
      <div className={styles.tagBox}>
        <div className={styles.tagTitle}>本题知识点</div>
        <div>
          <Tag color='blue'>{detail[currentIndex]?.keyWords}</Tag>
        </div>
      </div>
      <div className={styles.answer}></div>
    </div>
  )
}
export default MockDetail
