<template>
  <div class="groupChatDetails">
    <div class="member_list">
      <div class="member_item add" @click="createGroupFn" style="-webkit-app-region: no-drag;">
        <img class="avatar" src="@/assets/image/addMember.png" alt />
        <span class="nickName">添加</span>
      </div>
      <div class="member_item">
        <img class="avatar" :src="memberObj.headImgUrl" alt />
        <span class="nickName">{{memberObj.remark?memberObj.remark:memberObj.nickName}}</span>
      </div>
    </div>
    <div class="line"></div>
    <div class="operate_list">
      <div class="nickName">
        <span>昵称：</span>
        {{memberObj.nickName}}
      </div>
      <div class="id">
        <span>身份：</span>
        {{memberObj.id}}
      </div>
      <div class="remark">
        <span>备注：</span>
        <p
          class="input edit"
          v-if="showRemarkInputBoxStatus"
          @mouseenter="showEditRemark()"
          @mouseleave="showEditRemarkLeaveFn()"
          @click="showRemarkInputBox"
        >
          {{memberObj.remark?memberObj.remark:memberObj.nickName}}
          <i
            class="el-icon-edit edit_icon"
            v-if="showRemark"
          ></i>
        </p>
        <p class="input" v-else>
          <input
            type="text"
            v-model="memberObj.remark"
            v-focus
            @blur="changeRemark"
            maxlength="200"
          />
        </p>
      </div>
    </div>
    <div class="delete_btn" @click="deleteFriend">删除好友</div>
    <el-dialog
      title="创建群聊"
      :visible.sync="createGroup"
      width="500px"
      height="500px"
      center
      append-to-body
    >
      <createGroup v-if="createGroup" @closeCreateBox="closeCreateBox"></createGroup>
    </el-dialog>
  </div>
</template>
<script>
import { mapState } from "vuex";
import { getUserInfo, markRemark, removeFriend } from "../../request/api";
import createGroup from "./createGroup.vue";
export default {
  data() {
    return {
      createGroup: false,
      memberObj: {},
      showRemark: false,
      showRemarkInputBoxStatus: true
    };
  },
  directives: {
    focus: {
      // 指令的定义
      inserted: function(el) {
        el.focus();
      }
    }
  },
  components: {
    createGroup
  },
  computed: {
    ...mapState({
      currentTargetId: state => state.home.currentTargetId
    })
  },
  created() {
    this.getUserInfo();
  },
  methods: {
    deleteFriend() {
      this.$confirm("确定要删除好友？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          removeFriend({ friendId: this.currentTargetId }).then(res => {
            if (res) {
              this.$message("删除成功");
              this.$store.commit("SETRIGHTSTATUS", " ");
              this.$emit("hideChatDrawer", { a: 0 });
              this.removeConversation();
            }
          });
        })
        .catch(() => {});
    },
    // 删除会话
    removeConversation() {
      var conversationType = RongIMLib.ConversationType.PRIVATE;
      var params = {
        conversationType: conversationType,
        targetId: this.currentTargetId,
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
        this.currentTargetId,
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
    // 获取会话列表
    getConversationList() {
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
    },
    getUserInfo() {
      getUserInfo({ ids: this.currentTargetId })
        .then(res => {
          if (res) {
            let memberObj = {};
            memberObj = res.result.friends[0];
            this.memberObj = memberObj;
          }
        })
        .catch(err => {});
    },
    showRemarkInputBox() {
      this.showRemarkInputBoxStatus = false;
    },
    changeRemark() {
      // markRemark()
      if (this.memberObj.remark == "") {
        this.memberObj.remark = this.memberObj.nickName;
      }
      let params = {
        remark: this.memberObj.remark,
        friendId: this.memberObj.id
      };
      markRemark(params).then(res => {
        if (res) {
          // 发送消息给自己
          this.$store.dispatch("getRemarkList").then(res => {
            this.getConversationList();
          });
          getUserInfo({ ids: this.currentTargetId })
            .then(res => {
              if (res) {
                let memberObj = {};
                memberObj = res.result.friends[0];
                this.memberObj = memberObj;
                this.$store.commit("USER_TARGETUSERINFO", memberObj);
              }
            })
            .catch(err => {});
        }
      });
      this.showRemarkInputBoxStatus = true;
    },
    showEditRemark() {
      this.showRemark = true;
    },
    showEditRemarkLeaveFn() {
      this.showRemark = false;
    },
    createGroupFn() {
      this.createGroup = true;
    },
    closeCreateBox() {
      this.createGroup = false;
    }
  }
};
</script>
<style scoped lang="scss">
.groupChatDetails {
  width: 100%;
  height: 100%;
  padding: 20px;
  overflow-y: auto;
  .member_list {
    width: 100%;
    max-height: 200px;
    display: flex;
    flex-wrap: wrap;
    .member_item {
      width: 55px;
      text-align: center;
      cursor: pointer;
      .avatar {
        display: inline-block;
        width: 36px;
        height: 36px;
      }
      .nickName {
        display: inline-block;
        width: 36px;
        height: 25px;
        color: #333;
        font-size: 12px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
  .delete_btn {
    margin-top: 50px;
    font-size: 16px;
    color: red;
    text-align: center;
    cursor: pointer;
  }
  .line {
    width: 100%;
    height: 1px;
    background: #ccc;
    margin: 15px 0;
  }
  .remark {
    display: flex;
    .edit {
      margin-left: 5px;
    }
    input {
      width: 150px;
      margin-left: 5px;
    }
  }
  .id {
    margin: 10px 0;
  }
}
</style>