<template>
  <div class="histroyList">
    <ul>
      <li
        v-for="(item,i) in conversationList"
        :key="item.targetId"
        v-if="item.conversationType !== 6"
        :class="{'active': item.targetId == currentTargetId && rightBoxStatus == 'chat'}"
        @click="selectChat(i,item)"
      >
        <div class="list_item_wrap" v-if="item.conversationType == 1">
          <span class="bradge" v-if="item.unreadMessageCount">{{item.unreadMessageCount}}</span>
          <img
            class="avatar"
            v-if="item.latestMessage.senderUserId == item.latestMessage.targetId"
            :src="item.latestMessage.content.extra.avatar1"
            alt
          />
          <img class="avatar" v-else :src="item.latestMessage.content.extra.avatar2" alt />
          <div class="chat_info">
            <p class="top_info">
              <span
                class="nickName"
                v-if="item.latestMessage.senderUserId == item.targetId"
              >{{item.latestMessage.content.extra.name1}}</span>
              <span class="nickName" v-else>{{item.latestMessage.content.extra.name2}}</span>
              <span class="time">{{item.time}}</span>
            </p>
            <p
              class="message"
              v-if="item.objectName == 'RC:TxtMsg'"
            >{{item.latestMessage.content.content}}</p>
            <p class="message" v-else-if="item.objectName == 'RC:ImgMsg'">[图片]</p>
            <p class="message" v-else-if="item.objectName == 'RC:VcMsg'">[语音]</p>
            <p class="message" v-else-if="item.objectName == 'RC:InfoNtf'">[红包]</p>
          </div>
        </div>
        <div class="list_item_wrap" v-if="item.conversationType == 3">
          <span class="bradge" v-if="item.unreadMessageCount">{{item.unreadMessageCount}}</span>
          <img class="avatar" :src="item.latestMessage.content.extra.groupAvatar" alt />
          <div class="chat_info">
            <p class="top_info">
              <span class="nickName">{{item.latestMessage.content.extra.groupName}}</span>
              <span class="time">{{item.time}}</span>
            </p>
            <p
              class="message"
              v-if="item.objectName == 'RC:TxtMsg' && item.latestMessage.content.extra.operation == 'announcement'"
            >
              <span v-if="item.latestMessage.senderUserId == item.latestMessage.targetId">有人@你</span>
              <span v-else>你@所有人</span>
            </p>
            <p
              class="message"
              v-if="item.objectName == 'RC:TxtMsg' && item.latestMessage.content.extra.operation !== 'announcement'"
            >
              <span>{{item.latestMessage.content.extra.name1}}：{{item.latestMessage.content.content}}</span>
            </p>
            <p
              class="message"
              v-else-if="item.objectName == 'RC:ImgMsg'"
            >{{item.latestMessage.content.extra.name1}}：[图片]</p>
            <p
              class="message"
              v-else-if="item.objectName == 'RC:VcMsg'"
            >{{item.latestMessage.content.extra.name1}}：[语音]</p>
            <p
              class="message"
              v-else-if="item.objectName == 'RC:InfoNtf'"
            >{{item.latestMessage.content.extra.name1}}：[红包]</p>
            <p
              class="message"
              v-else-if="item.objectName == 'RC:GrpNtf'"
            >{{item.latestMessage.content.extra.name1}}{{item.latestMessage.content.message}}</p>
            <!-- <p
              class="message"
              v-else-if="item.objectName == 'RC:GrpNtf' && item.latestMessage.content.operation == 'Rename'"
            >{{item.latestMessage.content.extra.name1}}：修改群名称</p>-->
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  data() {
    return {
      active: ""
    };
  },
  created() {
    // var conversationType = RongIMLib.ConversationType.PRIVATE;
    // var targetId = "k7z43i";
    // RongIMClient.getInstance().removeConversation(conversationType, targetId, {
    //   onSuccess: function(bool) {
    //     console.log("删除指定会话成功");
    //   },
    //   onError: function(error) {
    //     console.log("删除指定会话失败", error);
    //   }
    // });
  },
  computed: {
    ...mapState({
      rightBoxStatus: state => state.home.rightBoxStatus,
      conversationList: state => state.home.conversationList,
      unReadMsgCount: state => state.home.unReadMsgCount,
      currentTargetId: state => state.home.currentTargetId
    })
  },
  methods: {
    selectChat(i, item) {
      if (item.targetId == this.currentTargetId) return;
      this.$store.commit("SETRIGHTSTATUS", "chat");
      this.$store.commit("CONVERSATIONTYPE", item.conversationType);
      this.$store.commit("SETCURRENTTARGETID", item.targetId);
      this.$store.commit("SETHISTORYLIST", []);
      if (item.unreadMessageCount == 0) return;
      var conversationType;
      if (item.conversationType == 1) {
        conversationType = RongIMLib.ConversationType.PRIVATE;
      } else if (item.conversationType == 3) {
        conversationType = RongIMLib.ConversationType.GROUP;
      }
      RongIMClient.getInstance().clearUnreadCount(
        conversationType,
        item.targetId,
        {
          onSuccess: () => {
            console.log("清除指定会话未读消息数成功");
            var conversationTypes = null;
            var count = 150;
            RongIMClient.getInstance().getConversationList(
              {
                onSuccess: list => {
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
            // this.getUserInfo(targetId);
          },
          onError: function(error) {
            console.log("清除指定会话未读消息数失败", error);
          }
        }
      );
      // this.getHistory(targetId);
    },
    // 获取历史消息
    getHistory(targetId) {
      var conversationType = RongIMLib.ConversationType.PRIVATE;
      var targetId = targetId;
      var timestrap = 0; // 默认传 null, 若从头开始获取历史消息, 请赋值为 0
      var count = 20;
      RongIMLib.RongIMClient.getInstance().getHistoryMessages(
        conversationType,
        targetId,
        timestrap,
        count,
        {
          onSuccess: (list, hasMsg) => {
            console.log("获取历史消息成功", list);
            /* 
              list: 获取的历史消息列表
              hasMsg: 是否还有历史消息可以获取
            */
            let histroyList = list;
            for (let i = 0; i < histroyList.length; i++) {
              histroyList[i].content.extra = JSON.parse(
                histroyList[i].content.extra
              );
            }
            // this.$store.dispatch("getHistory", histroyList);
            this.$store.commit("SETHISTORYLIST", histroyList);
          },
          onError: function(error) {
            // 请排查：单群聊消息云存储是否开通
            console.log("获取历史消息失败", error);
          }
        }
      );
    }
  }
};
</script>

<style scoped lang="scss">
.histroyList {
  height: 100%;
  ul {
    width: 100%;
    height: calc(100vh - 55px);
    overflow: hidden;
    &:hover {
      overflow-y: scroll;
      overflow-y: overlay;
    }
    li {
      width: 100%;
      height: 55px;
      cursor: pointer;
      padding-left: 10px;
      &:hover {
        background-color: #eef5ff;
      }
      .list_item_wrap {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        position: relative;
        .bradge {
          position: absolute;
          width: 13px;
          height: 13px;
          background-color: #df0003;
          text-align: center;
          line-height: 13px;
          right: 11px;
          top: 31px;
          font-size: 8px;
          color: #fff;
          border-radius: 50%;
        }
      }
      .avatar {
        width: 34px;
        height: 34px;
        border-radius: 2px;
        margin-right: 10px;
      }
      .chat_info {
        width: calc(100% - 44px);
        .top_info {
          display: flex;
          width: 100%;
          font-size: 14px;
          color: #333333;
          align-items: center;
          padding-right: 10px;
          .nickName {
            flex: 1;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          .time {
            font-size: 12px;
            color: #bbb;
          }
        }
        .message {
          display: inline-block;
          width: 180px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 12px;
          color: #999999;
        }
      }
    }
    .active {
      background-color: #eef5ff;
    }
  }
  user-select: none;
}
</style>
