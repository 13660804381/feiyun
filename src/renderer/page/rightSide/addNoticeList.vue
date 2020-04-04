<template>
  <div class="addNoticeList">
    <header>好友验证信息</header>
    <div class="wrap">
      <ul>
        <li v-for="(item,i) in listData" :key="i">
          <div class="left_box">
            <img :src="item.headImgUrl" alt />
            <div class="right_info">
              <span class="name">
                {{item.nickName}}
              </span>
              <span class="add_message">{{item.message?item.message:'请求添加为好友'}}</span>
              <span class="id">来源：ID查找</span>
            </div>
          </div>
          <div class="right_box" v-if="item.isAgree == 0 && item.isRefuse == 0">
            <span class="agree btn" @click="agree(item)">同意</span>
            <span class="refuse btn" @click="refuse(item.userId)">拒绝</span>
          </div>
          <div class="right_box">
            <span class="have_agree" v-if="item.isAgree == 1">已同意</span>
            <span class="have_refuse" v-if="item.isRefuse == 1">已拒绝</span>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { getApplyList, agree, refuse } from "../../request/api";
export default {
  data() {
    return {
      listData: []
    };
  },
  created() {
    this.getList();
  },
  methods: {
    getList() {
      getApplyList()
        .then(res => {
          if (res) {
            this.listData = res.result;
          }
        })
        .catch(err => {});
    },
    agree(item) {
      agree({ userId: item.userId })
        .then(res => {
          if (res) {
            this.getList();
            this.$store.dispatch("getFriendList");
            var conversationType = RongIMLib.ConversationType.SYSTEM;
            var targetId = item.userId;
            RongIMClient.getInstance().clearUnreadCount(
              conversationType,
              targetId,
              {
                onSuccess: () => {
                  console.log("清除指定会话未读消息数成功");
                  // 阻止默认换行
                  // if (e.preventDefault) e.preventDefault();
                  // else window.event.value = false;
                  let extraObj = {
                    name1: JSON.parse(window.localStorage.getItem("userInfo"))
                      .nickName,
                    avatar1: window.localStorage.getItem("defaultAvatar"),
                    name2: item.nickName,
                    avatar2: item.headImgUrl
                  };
                  var msg = new RongIMLib.TextMessage({
                    content: "我们已经是好友了，开始聊天吧！",
                    extra: JSON.stringify(extraObj)
                  });
                  var conversationType = RongIMLib.ConversationType.PRIVATE;
                  RongIMClient.getInstance().sendMessage(
                    conversationType,
                    targetId,
                    msg,
                    {
                      onSuccess: message => {
                        console.log("发送消息成功, 用户信息为: ", message);
                        var reg = /\[.+?\]/g;
                        message.content.extra = JSON.parse(
                          message.content.extra
                        );
                        this.getConversationList();
                      },
                      onError: function(errorCode) {
                        console.log("发送消息失败", errorCode);
                      }
                    }
                  );
                },
                onError: function(error) {
                  console.log("清除指定会话未读消息数失败", error);
                }
              }
            );
          }
        })
        .catch(err => {});
    },
    refuse(id) {
      refuse({ userId: id }).then(res => {
        if (res) {
          this.getList();
          var conversationType = RongIMLib.ConversationType.SYSTEM;
          var targetId = id;
          RongIMClient.getInstance().clearUnreadCount(
            conversationType,
            targetId,
            {
              onSuccess: function() {
                console.log("清除指定会话未读消息数成功");
              },
              onError: function(error) {
                console.log("清除指定会话未读消息数失败", error);
              }
            }
          );
        }
      });
    },
    getConversationList() {
      var conversationTypes = null;
      var count = 150;
      RongIMClient.getInstance().getConversationList(
        {
          onSuccess: list => {
            console.log(list);
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
.addNoticeList {
  width: calc(100vw - 40%);
  height: 100%;
  float: left;
  header {
    width: 100%;
    height: 50px;
    line-height: 50px;
    padding-left: 20px;
    background: #f9fbfc;
    -webkit-app-region: drag;
    border-bottom: 1px solid #dddddd;
  }
  .wrap {
    width: 100%;
    height: calc(100vh - 50px);
    background-color: #f3f7f8;
    padding: 20px 20px 0;
    overflow-y: scroll;
    ul {
      height: 100%;
      width: 100%;
      li {
        width: 100%;
        height: 70px;
        background: #fff;
        border: 1px solid #eee;
        border-radius: 6px;
        display: flex;
        align-items: center;
        padding: 0 20px;
        margin-bottom: 20px;
        &:hover {
          box-shadow: 0px 5px 5px #e1e1e1;
        }
        .left_box {
          flex: 1;
          align-items: center;
          display: flex;
          img {
            width: 34px;
            height: 34px;
            border-radius: 2px;
            margin-right: 15px;
          }
          .name {
            font-size: 14px;
          }
          .right_info {
            display: flex;
            flex-direction: column;
            color: #14141c;
            .id {
              color: #6a7681;
              font-size: 12px;
            }
            .add_message {
              font-size: 14px;
            }
          }
        }
        .right_box {
          display: flex;
          align-items: center;
          .btn {
            width: 45px;
            height: 22px;
            line-height: 22px;
            text-align: center;
            border-radius: 2px;
            font-size: 12px;
            color: #fff;
            cursor: pointer;
          }
          .agree {
            background: #3288fd;
            margin-right: 10px;
          }
          .refuse {
            background: rgba(153, 153, 153, 1);
          }
          .have_agree,
          .have_refuse {
            font-size: 14px;
            color: #666;
          }
        }
      }
    }
  }
  /* 设置滚动条的样式 */
  ::-webkit-scrollbar {
    width: 6px;
  }
}
</style>
