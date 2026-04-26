import { useState, FC, useEffect, useCallback } from 'react'
import { Button, Card, Divider, Empty, Input, message, Modal, Rate, Steps, Tag, Upload } from 'antd'
import { InboxOutlined } from '@ant-design/icons'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import 'react-pdf/dist/esm/Page/TextLayer.css'
import req from '@utils/request'

import styles from './index.module.less'
import { useDebounceEffect } from 'ahooks'
import { useNavigate } from 'react-router-dom'

pdfjs.GlobalWorkerOptions.workerSrc =
  '//cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/build/pdf.worker.mjs'

const { Dragger } = Upload

type QuestionItem = {
  labelName: string
  subjectName: string
  userAnswer: string
  userScore: number
}

const desc = ['1分', '2分', '3分', '4分', '5分']

const MockInterView: FC = () => {
  const navigate = useNavigate()
  const userInfoStorage = localStorage.getItem('userInfo')
  const { tokenValue = '' } = userInfoStorage ? JSON.parse(userInfoStorage) : {}

  const [pdfUrl, setPdfUrl] = useState()

  const [pageNum, setPageNum] = useState(1)
  const [keywords, setKeywords] = useState([])
  const [mockList, setMockList] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)

  const changeUpload = info => {
    const { status, response } = info.file
    if (status === 'error') {
      message.error('文件上传失败，请重试')
      return
    }
    if (status === 'done' && response.success) {
      setPdfUrl(response.data)
    }
  }

  const renderEmptyPage = () => {
    return (
      <div className='empty-page-box'>
        <Empty description='暂无简历' />
      </div>
    )
  }

  useEffect(() => {
    const toAnalyse = () => {
      req(
        {
          method: 'post',
          url: '/interview/analyse',
          data: {
            url: pdfUrl
          }
        },
        '/interview'
      ).then(res => {
        if (res.success && res.data && Array.isArray(res.data.questionList)) {
          setKeywords(res.data.questionList)
        } else {
          setKeywords([])
        }
      })
    }

    if (pdfUrl) {
      toAnalyse()
    }
  }, [pdfUrl])

  const getInterQuestion = useCallback(async () => {
    const res = await req(
      {
        method: 'post',
        url: '/interview/start',
        data: {
          engine: 'JI_CHI',
          questionList: keywords
        }
      },
      '/interview'
    )
    if (res.data?.questionList?.length) {
      setMockList(res.data?.questionList || [])
    }
  }, [keywords])

  useEffect(() => {
    if (keywords.length) {
      getInterQuestion()
    }
  }, [keywords, getInterQuestion])

  const [answer, setAnswer] = useState('')
  const [inputValue, setInputValue] = useState<Record<number, string>>({})

  useDebounceEffect(
    () => {
      setInputValue(val => ({ ...val, [currentIndex]: answer }))
    },
    [answer],
    {
      wait: 500
    }
  )

  const changeAnswer = (e: { target: { value: string } }) => {
    const value = e.target.value
    setAnswer(value)
  }

  const [userScore, setUserScore] = useState<Record<number, number>>({})

  const changeScore = (score: number) => {
    setUserScore(pre => ({ ...pre, [currentIndex]: score }))
  }

  const reset = () => {
    setCurrentIndex(0)
    setAnswer('')
    setInputValue({})
    setUserScore({})
  }

  const showRightAnswer = () => {
    Modal.info({
      title: '正确答案',
      width: '50%',
      content: (
        <div
          dangerouslySetInnerHTML={{ __html: mockList[currentIndex].subjectAnswer }}
          style={{ maxHeight: '500px', overflow: 'scroll' }}
        ></div>
      )
    })
  }

  const submitAnswer = async () => {
    const questionList = mockList.map((item, index) => {
      return {
        labelName: item.labelName,
        subjectName: item.subjectName,
        userAnswer: inputValue?.[index] ?? '',
        userScore: userScore?.[index] ?? 0
      }
    })

    const res = await req(
      {
        method: 'post',
        url: '/interview/submit',
        data: {
          interviewUrl: pdfUrl,
          engine: 'JI_CHI',
          questionList
        }
      },
      '/interview'
    )
    if (res.success) {
      Modal.confirm({
        title: '面试结果',
        okText: '再面一次',
        cancelText: '历史面试',
        onOk: () => {
          reset()
          getInterQuestion()
        },
        onCancel: () => {
          navigate('/inter-history')
        },
        content: (
          <div>
            <div>平均分：{res.data.avgScore}</div>
            <div>各项内容结果：{res.data.avgTips}</div>
            <div>总结：{res.data.tips}</div>
          </div>
        )
      })
    }
  }

  const changeStep = (step: number) => {
    setCurrentIndex(step)
    setAnswer(inputValue?.[step] ?? '')
  }

  return (
    <div className={styles.container}>
      <div className={styles.leftBox}>
        {pdfUrl ? (
          <div className={styles.pdfBox}>
            <Document
              file={pdfUrl?.replace('http:', '')} //文件路径
              onLoadSuccess={page => setPageNum(page.numPages)} //成功加载文档后调用
              loading='正在努力加载中' //加载时提示语句
              noData={() => renderEmptyPage()}
            >
              {Array.from(new Array(pageNum), (_, index) => (
                <Page key={`page_${index + 1}`} pageNumber={index + 1} scale={0.9} />
              ))}
            </Document>
          </div>
        ) : (
          <Dragger
            name='uploadFile'
            className='avatar-uploader'
            accept='.pdf'
            showUploadList={false}
            withCredentials
            action='/oss/upload'
            headers={{
              satoken: tokenValue
            }}
            data={{
              bucket: 'user',
              objectName: 'icon'
            }}
            onDrop={e => {
              console.log(e)
            }}
            onChange={changeUpload}
          >
            <p className='ant-upload-drag-icon'>
              <InboxOutlined />
            </p>
            <p className='ant-upload-text'>点击或拖拽上传简历，仅支持pdf</p>
          </Dragger>
        )}
      </div>
      <div className={styles.rightBox}>
        <Card title='简历关键字' className={styles.rightTop}>
          {keywords.length > 0
            ? keywords.map(item => {
                return <Tag key={item.labelId}>{item.keyWord}</Tag>
              })
            : '分析简历后展示关键字'}
        </Card>
        <Divider style={{ margin: '4px 0' }} />
        {mockList.length > 0 && (
          <Card title='根据简历关键字，为您推荐如下模拟面试题目'>
            <Steps
              items={mockList.map((_, index) => ({
                status:
                  index < currentIndex && inputValue[index]
                    ? 'finish'
                    : index === currentIndex
                    ? 'process'
                    : 'wait'
              }))}
              onChange={changeStep}
              current={currentIndex}
            />
            <div className={styles.questionWrapper}>
              <div className={styles.questionTitle}>
                <div className={styles.title}>
                  {currentIndex + 1}、{mockList[currentIndex].subjectName}
                </div>
                <div className={styles.tag}>
                  <Tag>{mockList[currentIndex].keyWord}</Tag>
                </div>
              </div>
              <div className={styles.label}>你的答案：</div>
              <div className={styles.answerContent}>
                <Input.TextArea
                  placeholder='请输入答案~~'
                  rows={8}
                  onChange={changeAnswer}
                  value={answer}
                ></Input.TextArea>
                <div className={styles.bottomAction}>
                  <div className={styles.rateBox}>
                    自我评分：
                    <Rate
                      tooltips={desc}
                      onChange={changeScore}
                      value={userScore?.[currentIndex] ?? 0}
                    ></Rate>
                  </div>
                  <Button type='primary' onClick={showRightAnswer}>
                    查看参考答案
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}
        {mockList.length > 0 && (
          <div className={styles.submit}>
            <Button type='primary' size='large' onClick={submitAnswer}>
              提交面试
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
export default MockInterView
