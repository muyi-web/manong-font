import { saveUserInfo } from '@features/userInfoSlice.ts'
import LoginQrcode from '@imgs/login_qrcode.jpg'
import req from '@utils/request'
import { Button, Input, Space, message } from 'antd'
import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'

import './index.less'

const loginApiName = '/user/doLogin'

const Login = () => {
  const [validCode, setValidCode] = useState('')
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const changeCode = e => {
    setValidCode(e.target.value)
  }

  const getUserInfo = async loginId => {
    req(
      {
        method: 'post',
        url: '/user/getUserInfo',
        data: {
          userName: loginId
        }
      },
      '/auth'
    ).then(res => {
      if (res?.success && res?.data) {
        dispatch(saveUserInfo(res.data))
      }
    })
  }

  const doLogin = () => {
    if (!validCode) return
    req(
      {
        method: 'get',
        url: loginApiName,
        params: { validCode }
      },
      '/auth'
    ).then(async res => {
      if (res.success && res.data) {
        message.success('登录成功')
        localStorage.setItem('userInfo', JSON.stringify(res.data))
        await getUserInfo(res.data.loginId)
        setTimeout(() => {
          navigate('/question-bank')
        }, 500)
      } else {
        message.error('登录失败，请重试')
      }
    })
  }

  return (
    <div className='login-box'>
      <div className='login-container-inner'>
        <div className='decor'>
          <span className='dot d1' />
          <span className='dot d2' />
          <span className='dot d3' />
        </div>

        <div className='notes'>
          <h2>欢迎来到</h2>
          <h1>码农Club</h1>
          <p>专业的编程学习平台，与数千名开发者一起成长</p>

          <div className='features'>
            <div className='feature'>
              <div className='icon'>💡</div>
              <div className='text'>
                <strong>实战题库</strong>
                <span>海量真题，覆盖面广</span>
              </div>
            </div>
            <div className='feature'>
              <div className='icon'>🧠</div>
              <div className='text'>
                <strong>智能解析</strong>
                <span>逐题解析，查缺补漏</span>
              </div>
            </div>
            <div className='feature'>
              <div className='icon'>🤝</div>
              <div className='text'>
                <strong>社区互助</strong>
                <span>问答交流，快速提升</span>
              </div>
            </div>
          </div>

          <div className='help-links'>
            <a href='#'>查看课程</a>
            <span className='sep'>·</span>
            <a href='#'>加入社区</a>
          </div>
        </div>

        <div className='qrcode-box'>
          <div className='qrcode-desc'>
            <p>微信扫码关注公众号</p>
            <p>公众号发送 “验证码”开启加薪之路</p>
          </div>
          <div className='qrcode-img'>
            <img src={LoginQrcode} alt='' />
          </div>
          <div className='qrcode-form'>
            <Space>
              <Input maxLength={3} placeholder='验证码' onChange={changeCode} value={validCode} />
              <Button type='primary' onClick={doLogin}>
                登 录
              </Button>
            </Space>
          </div>
          <div className='qrcode-hint'>
            扫码后在公众号回复“验证码”获取登录码，或联系客服获取帮助
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
