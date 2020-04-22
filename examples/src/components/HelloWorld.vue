<template>
  <div class="hello">
    <p>当前用户： {{currentUser}}</p>
    <div class="chatroom">
      <div class="wrapper" v-for="(msg, index) in showList" :key="index">
        <span>{{msg.fromAccount}}</span>|
        <span>{{msg.lastTime}}</span>
        :
        {{msg.messageForShow}}
      </div>
    </div>
    <button @click="login('admin')">群主登录</button>
    <button @click="login('user01')">user01登录</button>
    <button @click="login('user02')">user02登录</button>
    <button @click="createGroup">创建群</button>
    <br />
    <el-input v-model="message" type="textarea" placeholder="请输入聊天内容"></el-input>
    <el-button type="primary" @click="sendMessage">发送</el-button>
    <br />
    <button @click="addAnonymity">匿名群成员+1</button>
  </div>
</template>

<script>
import Tim from "../../../lib/index";
// import Tim from '@ywkj/tim'
export default {
  name: "HelloWorld",
  props: {
    msg: String
  },
  data() {
    return {
      currentUser: "",
      message: "",
      showList: []
    };
  },
  created() {
    Tim.initSdk(
      { SDKAppID: "1400356743" },
      {
        onSdkReady: this.onSdkReady,
        onConversationListUpdated: this.onConversationListUpdated
      }
    );
  },
  methods: {
    onSdkReady() {
      console.log("11");
    },
    onSdkNotReady() {
      console.log("22");
    },
    login(user) {
      this.currentUser = user;
      Tim.login(user, window.genTestUserSig(user).userSig)
        .then(data => {
          console.log(data);
          this.joinGroup();
        })
        .catch(err => {
          console.log(err);
        });
    },
    joinGroup() {
      Tim.joinGroup("test01").then(data => {
        console.log(data);
      });
    },
    createGroup() {
      Tim.createGroup({
        name: "测试群01",
        groupID: "test01",
        notification: "暂无公告"
      })
        .then(data => {
          if (data.code === 0) {
            // 创建音视频群 需要joinGroup
            this.joinGroup();
          }
        })
        .catch(err => {
          console.log(err);
        });
    },
    // 匿名加群
    addAnonymity() {
      this.joinGroup();
    },
    // 会话列表更新
    onConversationListUpdated(event) {
      let data = event.data;
      // 过滤出type为group的消息
      let groupData = data.filter(item => item.type === "GROUP");
      console.log("收到新消息", groupData);
      groupData.map(item => {
        console.log("lastMessage", item.lastMessage.messageForShow);
        this.showList.push(JSON.parse(JSON.stringify(item.lastMessage)));
      });
      console.log(this.showList);
    },
    // 发送消息
    sendMessage() {
      Tim.sendMessage({ to: "test01", text: this.message });
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.chatroom {
  border: 1px solid;
  height: 300px;
  text-align: left;
  overflow: auto;
}
.wrapper {
  border-bottom: 1px solid #ccc;
}
</style>
