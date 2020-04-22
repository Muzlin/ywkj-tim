# 封装腾讯IM 即时通讯SDK

```
  // 初始化
  Tim.initSdk({ SDKAppID: "1400356743" }, {
      // 监听事件
      onSdkReady: this.onSdkReady,
      onConversationListUpdated: this.onConversationListUpdated
  })

  // 登录
  Tim.login(user, window.genTestUserSig(user).userSig) // 返回promise对象

  // 其他参见lib/index.js
```
