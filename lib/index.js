import TIM from 'tim-js-sdk'
// import COS from 'cos-js-sdk-v5'

/** 钩子 对应事件
 * （onSdkReady）SDK_READY SDK 进入 ready 状态时触发，接入侧监听此事件，然后可调用 SDK 发送消息等api，使用 SDK 的各项功能
 * （onSdkNotReady）SDK_NOT_READY SDK 进入 not ready 状态时触发，此时接入侧将无法使用 SDK 发送消息等功能。如果想恢复使用，接入侧需调用 login 接口，驱动 SDK 进入 ready 状态
 * （onMessageReceived）MESSAGE_RECEIVED SDK 收到推送的单聊、群聊、群提示、群系统通知的新消息，可通过遍历 event.data 获取消息列表数据并渲染到页面
 * （onConversationListUpdated）CONVERSATION_LIST_UPDATED 会话列表更新
 * （onProfileUpdated）PROFILE_UPDATED 自己或好友的资料发生变更时触发
 * （onKickedOut）KICKED_OUT 用户被踢下线时触发
 * （onError）ERROR SDK 遇到错误时触发
 * （onNetStateChange）NET_STATE_CHANGE 网络状态发生改变
 */

const defaultOptions = {
  logLevel: 1
}

function isObject(data) {
  return Object.prototype.toString.call(data) === '[object Object]'
}
let tim = null
let Tim = {
  /**
   * 初始化
   *
   * @param {*} options 配置参数
   * @param {*} hooks 监听钩子
   * @returns
   */
  initSdk(options, hooks) {
    if (!isObject(options)) {
      return console.error('options must is Object')
    }
    if (!options.SDKAppID) return console.error('options.SDKAppID is required')
    options = Object.assign(defaultOptions, options)
    // SDK实例
    tim = TIM.create(options)
    // 设置日志级别
    tim.setLogLevel(options.logLevel)
    // 监听事件调用钩子
    let hooksKey = Object.keys(hooks)
    hooksKey.forEach(key => {
      switch (key) {
        case 'onSdkReady':
          tim.on(TIM.EVENT.SDK_READY, hooks[key]) // SDK 进入 ready 状态
          break;
        case 'onSdkNotReady':
          tim.on(TIM.EVENT.SDK_NOT_READY, hooks[key]) // SDK 进入 not ready 状态 无法使用其他接口
          break;
        case 'onMessageReceived':
          tim.on(TIM.EVENT.MESSAGE_RECEIVED, hooks[key]) // SDK 收到推送的单聊、群聊、群提示、群系统通知的新消息
          break;
        case 'onConversationListUpdated':
          tim.on(TIM.EVENT.CONVERSATION_LIST_UPDATED, hooks[key]) // 会话列表更新
          break;
        case 'onProfileUpdated':
          tim.on(TIM.EVENT.PROFILE_UPDATED, hooks[key]) // 自己或好友的资料发生变更时触发
          break;
        case 'onKickedOut':
          tim.on(TIM.EVENT.KICKED_OUT, hooks[key]) // 用户被踢下线时触发
          break;
        case 'onError':
          tim.on(TIM.EVENT.ERROR, hooks[key]) // SDK出错
          break;
        case 'onNetStateChange':
          tim.on(TIM.EVENT.NET_STATE_CHANGE, hooks[key]) // 网络状态发生改变
          break;

        default:
          break;
      }
    })
  },

  /**
   * 登录
   *
   * @param {*} userID
   * @param {*} userSig
   * @returns
   * @memberof Tim
   */
  login(userID, userSig) {
    return tim.login({
      userID,
      userSig
    })
  },

  /**
   * 获取自身资料
   *
   * @returns
   * @memberof Tim
   */
  getMyProfile() {
    return tim.getMyProfile()
  },

  /**
   * 发送文本消息
   *
   * @param {*} {to: '发送对象', text: '发送文本', conversationType = "CONV_GROUP": '会话类型 CONV_GROUP/C2C'}
   * @returns
   * @memberof Tim
   */
  sendMessage({
    to,
    text,
    conversationType = "CONV_GROUP"
  }) {
    // 创建
    let message = tim.createTextMessage({
      to,
      conversationType: TIM.TYPES[conversationType],
      payload: {
        text
      }
    })
    // 发送
    return tim.sendMessage(message)
  },

  /**
   * 发送自定义消息
   *
   * @param {*} {to, msg: {data, description, extension}, conversationType = "GRP_CHATROOM"}
   * @returns
   * @memberof Tim
   */
  sendCustomMessage({
    to,
    msg,
    conversationType = "GRP_CHATROOM"
  }) {
    // msg 属性检查
    if (isObject(msg)) return console.error('options must is Object')
    if (!msg.data) return console.error('msg.data is required')
    if (!msg.description) return console.error('msg.description is required')
    // 创建
    let message = tim.createCustomMessage({
      to,
      conversationType: TIM.TYPES[conversationType],
      payload: {
        ...msg
      }
    })
    // 发送
    return tim.sendMessage(message)
  },

  /**
   * 重发消息
   *
   * @param {*} message
   * @returns
   * @memberof Tim
   */
  resendMessage(message) {
    return tim.resendMessage(message)
  },

  /**
   * 分页获取会话消息列表
   *
   * @param {*} {conversationID: '会话ID', count: '每页条数'}
   * @memberof Tim
   */
  getMessageList({
    conversationID,
    count = 15
  }) {
    tim.getMessageList({
      conversationID,
      count
    })
  },

  /**
   * 创建群
   * 音视频聊天室：适用于互动直播场景，管理上与聊天室相似，但群成员人数无上限；支持以游客身份（不登录）接收
   * 音视频聊天室创建后需调用 joinGroup 接口加入群组后，才能进行消息收发流程
   *
   * @param {*} {name: '群名', groupID: '群ID 不传会自动生成', notification: '公告', type: '类型'}
   * @returns
   * @memberof Tim
   */
  createGroup({
    name,
    groupID,
    notification,
    type = 'GRP_AVCHATROOM'
  }) {
    return tim.createGroup({
      type: TIM.TYPES[type],
      name,
      groupID,
      notification
    })
  },

  /**
   * 加入群
   * 音视频聊天室支持：
   * 正常加群，即登录加群。此时 SDK 内的所有接口都能正常调用。
   * 匿名加群，即不登录加群。此时只能收消息，其他任何需要鉴权的接口都不能调用
   *
   * @param {*} groupID 群ID
   * @param {string} type 群类型
   * @returns
   * @memberof Tim
   */
  joinGroup(groupID, type = 'GRP_AVCHATROOM') {
    return tim.joinGroup({
      groupID,
      type: TIM.TYPES[type]
    })
  },

  /**
   * 更新群资料
   * name: 群名
   * introduction: 公告
   * @param {*} {groupID, name, introduction}
   * @returns
   * @memberof Tim
   */
  updateGroupProfile({
    groupID,
    name,
    introduction
  }) {
    return tim.updateGroupProfile({
      groupID,
      name,
      introduction
    })
  },

  /**
   * 解散群
   *
   * @param {*} groupID
   * @returns
   * @memberof Tim
   */
  dismissGroup(groupID) {
    return tim.dismissGroup(groupID)
  },

  /**
   * 获取群成员列表
   * 该接口支持拉取群成员禁言截止时间戳（muteUntil），接入侧可根据此值判断群成员是否被禁言，以及禁言的剩余时间
   *
   * @param {*} {groupID, pageSize = 30, pageNo = 0}
   * @returns
   * @memberof Tim
   */
  getGroupMemberList({
    groupID,
    pageSize = 30,
    pageNo = 0
  }) {
    return tim.getGroupMemberList({
      groupID,
      count: pageSize,
      offset: pageNo * pageSize
    })
  },

  /**
   * 获取群成员资料
   * 可以获取禁言时间
   *
   * @param {*} {groupID, userIDList = []}
   * @returns
   * @memberof Tim
   */
  getGroupMemberProfile({
    groupID,
    userIDList = []
  }) {
    // 请注意：即使只拉取一个群成员的资料，也需要用数组类型，例如：userIDList: ['user1']
    return tim.getGroupMemberProfile({
      groupID,
      userIDList
    })
  },

  /**
   * 群成员禁言
   * 设为0，则表示取消禁言
   *
   * @param {*} {groupID, userID, muteTime = 600}
   * @memberof Tim
   */
  setGroupMemberMuteTime({
    groupID,
    userID,
    muteTime = 600
  }) {
    // 禁言10分钟；设为0，则表示取消禁言
    return tim.setGroupMemberMuteTime({
      groupID,
      userID,
      muteTime
    })
  },

  /**
   * 修改群成员角色
   * 只有群主拥有操作的权限
   * 比如 设置管理员
   * 管理员：GRP_MBR_ROLE_ADMIN 群主：GRP_MBR_ROLE_OWNER 成员：GRP_TIP_MBR_JOIN
   *
   * @param {*} {groupID, userID, role}
   * @returns
   * @memberof Tim
   */
  setGroupMemberRole({
    groupID,
    userID,
    roleType = 'GRP_TIP_MBR_JOIN'
  }) {
    return tim.setGroupMemberRole({
      groupID,
      userID,
      role: TIM.TYPES[roleType]
    })
  }
}

export default Tim
