<template>
  <div class="fiendList">
    <ul>
      <li @click="addNotice">
        <div class="list_item_wrap">
          <img class="avatar" src="@/assets/image/add_notice.png" />
          <p class="nickName">
            好友验证消息
            <span class="bradge" v-if="verifyCount">{{verifyCount}}</span>
          </p>
        </div>
      </li>
      <li v-for="item in friendListData" :key="item.id" @click="selectChat(item.id)">
        <div class="list_item_wrap">
          <!-- <span class="bradge">10</span> -->
          <img class="avatar" :src="item.headImgUrl" />
          <p class="nickName">{{item.remark?item.remark:item.nickName}}</p>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  name: "friendList",
  data() {
    return {};
  },
  created() {
    // this.getFriendList();
  },
  computed: {
    ...mapState({
      friendListData: state => state.home.friendList,
      currentTargetId: state => state.home.currentTargetId,
      rightBoxStatus: state => state.home.rightBoxStatus,
      verifyCount: state => state.home.verifyCount,
    })
  },
  methods: {
    getFriendList() {
      this.$store.dispatch("getFriendList");
    },
    selectChat(targetId) {
      if (targetId == this.currentTargetId) return;
      this.$store.commit("SETRIGHTSTATUS", "chat");
      this.$store.commit("CONVERSATIONTYPE", 1);
      this.$store.commit("SETCURRENTTARGETID", targetId);
      this.$store.commit("SETHISTORYLIST", []);
      var conversationType = RongIMLib.ConversationType.PRIVATE;
      RongIMClient.getInstance().clearUnreadCount(conversationType, targetId, {
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
      });
      // this.getHistory(targetId);
    },
    addNotice() {
      // this.$emit("addNoticeFn", true);
      if (this.rightBoxStatus !== "addNotice") {
        this.$store.commit("SETRIGHTSTATUS", "addNotice");
        this.$store.commit("SETCURRENTTARGETID", "");
      } else {
        this.$store.commit("SETRIGHTSTATUS", " ");
      }
    }
  }
};
</script>

<style scoped lang="scss">
.fiendList {
  height: 100%;
  user-select: none;
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
      height: 50px;
      padding-left: 10px;
      cursor: pointer;
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
          width: 13px;
          height: 13px;
          background-color: #df0003;
          text-align: center;
          line-height: 13px;
          font-size: 8px;
          color: #fff;
          border-radius: 50%;
          display: inline-block;
          vertical-align: middle;
          margin-left: 10px;
          margin-bottom: 2px;
        }
      }
      .avatar {
        width: 34px;
        height: 34px;
        border-radius: 2px;
        margin-right: 10px;
      }
      .nickName {
        display: inline-block;
        width: 100%;
        font-size: 14px;
        color: #333333;
      }
    }
  }
}
</style>
