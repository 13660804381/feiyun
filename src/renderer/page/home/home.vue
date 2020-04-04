<template>
  <div class="home">
    <audio src="http://data.huiyi8.com/yinxiao/mp3/83766.mp3" ref="audio"></audio>
    <div class="chat_content">
      <LeftSide></LeftSide>
      <keep-alive>
        <RightSide v-if="rightBoxStatus == 'chat'"></RightSide>
      </keep-alive>
      <addNoticeList v-if="rightBoxStatus == 'addNotice'"></addNoticeList>
    </div>
    <div class="userInfo_content" v-if="showUserInfo">
      <UserInfo></UserInfo>
    </div>
  </div>
</template>

<script>
import LeftSide from "../leftSide/leftSide";
import RightSide from "../rightSide/rightSide";
import UserInfo from "../userInfo/userInfo";
import addNoticeList from "../rightSide/addNoticeList";
import { mapState } from "vuex";
require("@/assets/js/RongIMLib-2.5.5.min.js");
require("@/assets/js/protobuf-2.3.6.min.js");
var RongIMLib = window.RongIMLib;
var RongIMClient = RongIMLib.RongIMClient;
const { ipcRenderer: ipc } = require("electron");
function init(params) {}
export default {
  data() {
    return {
      appkey: "cpj2xarlctgjn"
    };
  },
  components: {
    LeftSide,
    RightSide,
    addNoticeList,
    UserInfo
  },
  computed: {
    ...mapState({
      rightBoxStatus: state => state.home.rightBoxStatus,
      showUserInfo: state => state.home.showUserInfo,
      currentTargetId: state => state.home.currentTargetId,
      historyList: state => state.home.historyList,
      remarkList: state => state.home.remarkList
    })
  },
  created() {
    this.init();
  },
  methods: {
    init: function() {
      // 初始化融云
      RongIMClient.init(this.appkey, null);
      // 监听链接状态
      this.setConnectionStatusListener();
      // 监听消息接收
      this.setOnReceiveMessageListener();
      // 链接融云服务器
      RongIMClient.connect(
        window.localStorage.getItem("rongToken"),
        {
          onSuccess: userId => {
            console.log("链接成功，用户id：" + userId);
            window.localStorage.setItem("myId", userId);
            // 连接已成功, 此时可通过 getConversationList 获取会话列表并展示
            // 获取的会话类型, 获取所有会话类型传 null
            this.getRemarkList();
          },
          onTokenIncorrect: function() {
            console.log("token无效");
          },
          onError: function(errorCode) {
            console.log(errorCode);
          }
        },
        null
      );
    },
    //监听链接状态
    setConnectionStatusListener() {
      RongIMClient.setConnectionStatusListener({
        onChanged: function(status) {
          switch (status) {
            case RongIMLib.ConnectionStatus["CONNECTED"]:
            case 0:
              console.log("连接成功");
              break;
            case RongIMLib.ConnectionStatus["CONNECTING"]:
            case 1:
              console.log("连接中");
              break;
            case RongIMLib.ConnectionStatus["DISCONNECTED"]:
            case 2:
              console.log("当前用户主动断开链接");
              break;
            case RongIMLib.ConnectionStatus["NETWORK_UNAVAILABLE"]:
            case 3:
              console.log("网络不可用");
              var callback = {
                onSuccess: function(userId) {
                  console.log("reconnect success. " + userId);
                },
                onTokenIncorrect: function() {
                  console.log("token 无效");
                },
                onError: function(errorCode) {
                  console.log(errorcode);
                }
              };
              var config = {
                auto: true,
                url: "cdn.ronghub.com/RongIMLib-2.2.6.min.js?d=" + Date.now(),
                rate: [
                  1000,
                  2000,
                  3000,
                  4000,
                  5000,
                  6000,
                  7000,
                  8000,
                  9000,
                  10000,
                  13000,
                  16000,
                  19000
                ]
              };
              RongIMClient.reconnect(callback, config);
              break;
            case RongIMLib.ConnectionStatus["CONNECTION_CLOSED"]:
            case 4:
              console.log("未知原因，连接关闭");
              break;
            case RongIMLib.ConnectionStatus["KICKED_OFFLINE_BY_OTHER_CLIENT"]:
            case 6:
              console.log("用户账户在其他设备登录，本机会被踢掉线");
              break;
            case RongIMLib.ConnectionStatus["DOMAIN_INCORRECT"]:
            case 12:
              console.log("当前运行域名错误，请检查安全域名配置");
              break;
          }
        }
      });
    },
    // 监听接收消息
    setOnReceiveMessageListener() {
      RongIMClient.setOnReceiveMessageListener({
        // 接收到的消息
        onReceived: message => {
          this.$refs["audio"].play();
          console.log(message);
          // this.getConversationList();
          // return
          if (
            message.objectName !== "RC:GrpNtf" ||
            message.objectName !== "RC:ContactNtf" ||
            message.objectName !== "RC:RcCmd"
          ) {
            if (
              this.rightBoxStatus == "chat" &&
              this.currentTargetId == message.targetId
            ) {
              if (message.content.extra) {
                message.content.extra = JSON.parse(message.content.extra);
                if (message.content.extra.operation == "recallMessage") {
                  if (this.historyList.length > 0) {
                    for (let i = 0; i < this.historyList.length; i++) {
                      if (
                        this.historyList[i].content.extra.randomFlag ==
                        message.content.extra.randomFlag
                      ) {
                        this.historyList.splice(i, 1);
                      }
                    }
                    this.$store.commit("SETHISTORYLIST", this.historyList);
                  }
                }
                for (let j = 0; j < this.remarkList.length; j++) {
                  if(this.remarkList[j].friendId == message.senderUserId) {
                    message.content.extra.name1 = this.remarkList[j].remark
                  }
                }
                this.$store.commit("PUSHHISTORY", message);
              }
            }
          }

          switch (message.objectName) {
            case "RC:ContactNtf":
              if (message.content.operation == "RC:FRemove") {
                var conversationType = RongIMLib.ConversationType.PRIVATE;
                var targetId = message.targetId;
                RongIMClient.getInstance().removeConversation(
                  conversationType,
                  targetId,
                  {
                    onSuccess: bool => {
                      console.log("删除指定会话成功");
                      this.getConversationList();
                      setTimeout(() => {
                        this.$store.dispatch("getFriendList");
                        this.$store.dispatch("getGroupList");
                      }, 2000);
                    },
                    onError: function(error) {
                      console.log("删除指定会话失败", error);
                    }
                  }
                );
              } else {
                ipc.send("flashFrame");
                this.getConversationList();
              }
              break;
            case "RC:GrpNtf":
              if (message.content.operation == "Dismiss") {
                this.removeConversation(message.targetId);
              } else if (message.content.operation == "Kicked") {
                let myId = JSON.parse(window.localStorage.getItem("userInfo"))
                  .id;
                let extra = JSON.parse(message.content.extra);
                if (extra.targetUserIds.indexOf(myId) < 0) return;
                this.removeConversation(message.targetId);
              } else if (message.content.operation == "Quit") {
                let myId = JSON.parse(window.localStorage.getItem("userInfo"))
                  .id;
                let extra = JSON.parse(message.content.extra);
                if (extra.targetUserIds.indexOf(myId) < 0) return;
                this.removeConversation(message.targetId);
              } else if (message.content.operation == "Rename") {
                this.getConversationList();
              } else {
                this.getConversationList();
              }
              setTimeout(() => {
                this.$store.dispatch("getFriendList");
                this.$store.dispatch("getGroupList");
              }, 2000);
              break;
            case "RC:RcCmd":
              if (
                this.rightBoxStatus == "chat" &&
                this.currentTargetId == message.targetId
              ) {
                // message.content.extra = JSON.parse(message.content.extra);
                // this.$store.commit("PUSHHISTORY", message);
              }
            default:
              this.getConversationList();
              ipc.send("flashFrame");
          }
        }
      });
    },
    // 删除会话
    removeConversation(targetId) {
      var conversationType = RongIMLib.ConversationType.GROUP;
      var params = {
        conversationType: conversationType,
        targetId: targetId,
        timestamp: 1575447722435 // 可取 sentTime, 收发消息和历史消息中都有 sentTime 字段
      };
      RongIMLib.RongIMClient.getInstance().clearRemoteHistoryMessages(params, {
        onSuccess: function() {
          console.log("清除成功");
        },
        onError: function(error) {
          console.log("清除失败", error);
        }
      });
      RongIMClient.getInstance().removeConversation(
        conversationType,
        targetId,
        {
          onSuccess: bool => {
            console.log("删除指定会话成功");

            this.getConversationList();
          },
          onError: function(error) {
            console.log("删除指定会话失败", error);
          }
        }
      );
    },
    getRemarkList() {
      this.$store.dispatch("getRemarkList").then(res => {
        this.getConversationList();
      });
    },
    // 获取会话列表
    getConversationList() {
      var conversationTypes = null;
      var count = 150;
      RongIMClient.getInstance().getConversationList(
        {
          onSuccess: list => {
            console.table(list);
            let conversationList = list;
            this.$store.dispatch("getConversation", conversationList);
          },
          onError: function(error) {
            console.log("获取会话列表失败", error);
          }
        },
        conversationTypes,
        count
      );
    }
  }
};
</script>

<style scoped lang="scss">
.home {
  width: 100%;
  height: 100%;
  overflow: hidden;
  /deep/.el-dialog {
    box-shadow: 0px 20px 20px rgba(30, 0, 0, 0.2);
    border-radius: 8px;
  }
  /deep/.el-dialog__header {
    display: none;
  }
  /deep/.el-dialog__body {
    padding: 0 !important;
  }
  /deep/ .el-loading-spinner .path {
    stroke: rgba(251, 54, 48, 1);
  }
  .chat_content {
    width: 100%;
    height: 100%;
  }
  .userInfo_content {
    width: calc(100vw - 60px);
    height: 100%;
    position: fixed;
    top: 0;
    left: 60px;
  }
}
</style>
