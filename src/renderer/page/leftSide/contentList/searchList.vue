<template>
  <div class="groupList">
    <ul>
      <li v-for="item in searchList" :key="item.id" @click="selectChat(item.id,item)">
        <div class="list_item_wrap" v-if="item.headImgUrl">
          <!-- <span class="bradge">10</span> -->
          <img class="avatar" :src="item.headImgUrl" />
          <p class="nickName">{{item.remark?item.remark:item.nickName}}</p>
        </div>
        <div class="list_item_wrap" v-else>
          <!-- <span class="bradge">10</span> -->
          <img class="avatar" :src="item.groupImgUrl" />
          <p class="nickName">{{item.name}}</p>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  name: "groupList",
  data() {
    return {};
  },
  computed: {
    ...mapState({
      searchList: state => state.home.searchList,
      currentTargetId: state => state.home.currentTargetId
    })
  },
  created() {
    // this.getGroupList();
  },
  methods: {
    selectChat(targetId, item) {
      if (targetId == this.currentTargetId) return;
      var conversationType;
      if (item.headImgUrl) {
        // 单聊
        this.$store.commit("CONVERSATIONTYPE", 1);
        conversationType = RongIMLib.ConversationType.GROUP;
      } else {
        this.$store.commit("CONVERSATIONTYPE", 3);
        conversationType = RongIMLib.ConversationType.PRIVATE;
      }
      this.$store.commit("SETRIGHTSTATUS", "chat");
      this.$store.commit("SETCURRENTTARGETID", targetId);
      this.$store.commit("SETHISTORYLIST", []);
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
    }
  }
};
</script>

<style scoped lang="scss">
.groupList {
  height: 100%;
  user-select: none;
  ul {
    width: 100%;
    height: calc(100vh - 55px);
    overflow: hidden;
    padding-top: 5px;
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
          position: absolute;
          width: 13px;
          height: 13px;
          background-color: #df0003;
          text-align: center;
          line-height: 13px;
          left: 28px;
          top: 2px;
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
