import { Popover } from 'antd'
import './index.less'

const emojiStr =
  '😑 😶 😏 😒 🙄 😬 🤥 😌 😔 😪 🤤 😴 😷 🤒 🤕 🤢 🤮 🤧 🥵 🥶 🥴 😵 🤯 🤠 🥳 🥸 😎 🤓 🧐 😕 😟 🙁 😮 😯 😲 😳 🥺 😦 😧 😨 😰 😥 😢 😭 😱 😖 😣 😞 😓 😩 😫 🥱 😤 😡 😠 🤬 😈 👿 💀 ☠ * 🤡 👹 👺 👻 👽 👾 🤖 😺 😸 😹 😻 😼 😽 🙀 😿 😾 🙈 🙉 🙊 💋 💌 💘 💝 💖 💗 💓 💞 💕 💟 ❣ 💔 ❤ 🧡 💛 💚 💙 💜 🤎 🖤 🤍 💯 💢 💥 💫 💦 💨 🕳 💣 💬 👁‍🗨 🗨 🗯 💭 '

import { FC } from 'react'
const EmojiPicker: FC<any> = ({ onChoose, children }) => {
  const emojiList = emojiStr.split(' ')

  const content = (
    <div className='emoji-wrapper'>
      {emojiList.map(item => {
        return (
          <div key={item} className='emoji-item' onClick={() => onChoose(item)}>
            {item}
          </div>
        )
      })}
    </div>
  )

  return <Popover content={content}>{children}</Popover>
}
export default EmojiPicker
