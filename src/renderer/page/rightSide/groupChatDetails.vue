<template>
  <div class="groupChatDetails">
    <div class="member_list">
      <div
        class="member_item add"
        @click="inviteMemberFn"
        style="-webkit-app-region: no-drag;"
        v-if="isAdmin || isCreator"
      >
        <img class="avatar" src="@/assets/image/addMember.png" alt />
        <span class="nickName">添加</span>
      </div>
      <div
        class="member_item add"
        @click="removeGroupMember"
        style="-webkit-app-region: no-drag;"
        v-if="isAdmin || isCreator"
      >
        <img class="avatar" src="@/assets/image/deleteMember.png" alt />
        <span class="nickName">移除</span>
      </div>
      <div
        class="member_item"
        v-for="(item, i) in memberList"
        :key="i"
        v-if="i < memberListFlag"
        @click="showMemberCard(item)"
      >
        <img class="avatar" :src="item.headImgUrl" alt />
        <span class="nickName">{{item.remark?item.remark:item.nickName}}</span>
      </div>
      <div
        class="show_more_member"
        v-if="memberList.length > memberListFlag"
        @click="showMoreMember"
      >查看更多群成员</div>
    </div>
    <div class="line"></div>
    <div class="operate_list">
      <div class="editName list_item">
        <p class="label">群名称</p>
        <p
          class="input edit"
          v-if="showNameInputBoxStatus"
          @mouseenter="showEditNameFn()"
          @mouseleave="showEditNameLeaveFn()"
          @click="showNameInputBox"
        >
          {{groupObj.name}}
          <i class="el-icon-edit edit_icon" v-if="showEditName"></i>
        </p>
        <p class="input" v-else>
          <input type="text" v-model="groupObj.name" v-focus @blur="changeGroupName" maxlength="15" />
        </p>
      </div>
      <div class="announce list_item">
        <p class="label">群公告</p>
        <p
          class="input edit"
          v-if="showAnnounceInputBoxStatus"
          @mouseenter="showEditAnnounceFn()"
          @mouseleave="showEditAnnounceLeaveFn()"
          @click="showAnnounceInputBox"
        >
          {{groupObj.announcement?groupObj.announcement:'暂无'}}
          <i
            class="el-icon-edit edit_icon"
            v-if="showEditAnnounce"
          ></i>
        </p>
        <p class="input" v-else>
          <input
            type="text"
            v-model="groupObj.announcement"
            v-focus
            @blur="changeGroupAnnounce"
            maxlength="200"
          />
        </p>
      </div>
      <div class="banner list_item" v-if="isAdmin || isCreator">
        <p class="label">全员禁言</p>
        <p class="input">
          <el-switch
            v-model="isBanner"
            active-color="#3289fd"
            inactive-color="#999999"
            @change="setBanner"
          ></el-switch>
        </p>
      </div>
      <div class="line"></div>
      <div class="setAdmin list_item" v-if="isAdmin || isCreator" @click="setAdminFn">
        <p class="label">设置管理员</p>
        <i class="el-icon-arrow-right"></i>
      </div>
      <div class="clearMsg list_item" @click="clearMsg">
        <p class="label">清空本地消息记录</p>
        <i class="el-icon-arrow-right"></i>
      </div>
    </div>
    <div class="deletAndQuit" v-if="isCreator == 1" @click="deleteGroup">解散群聊</div>
    <div class="deletAndQuit" v-else @click="quitGroup">删除并退出</div>
    <el-dialog
      title="添加群成员"
      :visible.sync="inviteMember"
      width="500px"
      height="500px"
      center
      append-to-body
    >
      <inviteGroupMember
        v-if="inviteMember"
        :memberList="memberList"
        :groupObj="groupObj"
        @closeInviteBox="closeInviteBox"
      ></inviteGroupMember>
    </el-dialog>
    <el-dialog
      title="删除群成员"
      :visible.sync="removeMember"
      width="500px"
      height="500px"
      center
      append-to-body
    >
      <removeGroupMember
        v-if="removeMember"
        :memberList="memberList"
        :groupObj="groupObj"
        @closeRemoveBox="closeRemoveBox"
      ></removeGroupMember>
    </el-dialog>
    <el-dialog
      title="设置群管理员"
      :visible.sync="setAdmin"
      width="500px"
      height="500px"
      center
      append-to-body
    >
      <setAdmin
        v-if="setAdmin"
        :memberList="memberList"
        :groupObj="groupObj"
        @closeAdminBox="closeAdminBox"
      ></setAdmin>
    </el-dialog>
    <el-dialog
      :visible.sync="showMemberCardStatus"
      width="400px"
      height="300px"
      center
      append-to-body
    >
      <memberCard
        v-if="showMemberCardStatus"
        @hideBanner="hideBanner"
        :memberObj="memberObj"
        :groupId="groupObj.id"
      ></memberCard>
    </el-dialog>
  </div>
</template>
<script>
import { mapState } from "vuex";
import {
  getMemberDetails,
  getGroupInfo,
  setGroupName,
  setGroupAnnounce,
  dismissGroup,
  quitGroup,
  addOrRemoveBlock
} from "../../request/api";
import inviteGroupMember from "./inviteGroupMember.vue";
import removeGroupMember from "./removeGroupMember.vue";
import memberCard from "./memberCard.vue";
import setAdmin from "./setAdmin.vue";
export default {
  data() {
    return {
      memberList: [],
      groupObj: {},
      banner: false,
      showEditName: false,
      showEditAnnounce: false,
      inviteMember: false,
      removeMember: false,
      setAdmin: false,
      showNameInputBoxStatus: true,
      showAnnounceInputBoxStatus: true,
      groupName: "",
      groupAnnounce: "",
      isCreator: false,
      isAdmin: false,
      isInWhiteList: false,
      isInBlackList: false,
      isBanner: false,
      memberObj: {},
      showMemberCardStatus: false,
      memberListFlag: 10
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
    inviteGroupMember,
    removeGroupMember,
    setAdmin,
    memberCard
  },
  computed: {
    ...mapState({
      currentTargetId: state => state.home.currentTargetId
    })
  },
  created() {
    this.getMemberDetails();
    this.getGroupInfo();
  },
  methods: {
    showNameInputBox() {
      if (this.isAdmin || this.isCreator) {
        this.showNameInputBoxStatus = false;
      }
    },
    showAnnounceInputBox() {
      if (this.isAdmin || this.isCreator) {
        this.showAnnounceInputBoxStatus = false;
      }
    },
    showEditNameFn() {
      if (this.isAdmin || this.isCreator) {
        this.showEditName = true;
      }
    },
    showEditNameLeaveFn() {
      this.showEditName = false;
    },
    showEditAnnounceFn() {
      if (this.isAdmin || this.isCreator) {
        this.showEditAnnounce = true;
      }
    },
    showEditAnnounceLeaveFn() {
      this.showEditAnnounce = false;
    },
    changeGroupAnnounce() {
      if (!this.groupObj.announcement) {
        this.showAnnounceInputBoxStatus = true;
        return;
      }
      if (this.groupAnnounce == this.groupObj.announcement) {
        this.showAnnounceInputBoxStatus = true;
        return;
      }
      let data = {
        groupId: this.groupObj.id,
        announcement: this.groupObj.announcement
      };
      setGroupAnnounce(data).then(res => {
        if (res) {
          this.showAnnounceInputBoxStatus = false;
          this.$message("修改成功");
          let extraObj = {
            name1: JSON.parse(window.localStorage.getItem("userInfo")).nickName,
            avatar1: window.localStorage.getItem("defaultAvatar"),
            groupName: this.groupObj.name,
            groupAvatar: this.groupObj.groupImgUrl,
            operation: "announcement"
          };
          var msg = new RongIMLib.TextMessage({
            content: this.groupObj.announcement,
            extra: JSON.stringify(extraObj)
          });
          var conversationType = RongIMLib.ConversationType.GROUP;
          var targetId = this.groupObj.id;
          RongIMClient.getInstance().sendMessage(
            conversationType,
            targetId,
            msg,
            {
              onSuccess: message => {
                var reg = /\[.+?\]/g;
                message.content.extra = JSON.parse(message.content.extra);
                this.$store.commit("PUSHHISTORY", message);
                this.getConversationList();
              },
              onError: errorCode => {
                console.log("发送消息失败", errorCode);
                if (errorCode == 22408) {
                  this.$message("群组被禁言");
                }
              }
            }
          );
        }
      });
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
    changeGroupName() {
      if (!this.groupObj.name) {
        this.$message("请输入群名称");
        return;
      }
      if (this.groupName == this.groupObj.name) {
        this.showNameInputBoxStatus = true;
        return;
      }
      let data = {
        groupId: this.groupObj.id,
        groupName: this.groupObj.name,
        groupHeadUrl: this.groupObj.groupImgUrl
      };
      setGroupName(data).then(res => {
        if (res) {
          this.showNameInputBoxStatus = true;
          this.$message("修改成功");
        }
      });
    },
    getMemberDetails() {
      getMemberDetails({ id: this.currentTargetId }).then(res => {
        if (res) {
          this.isCreator = res.result.isCreator;
          this.isAdmin = res.result.isAdmin;
          this.isInWhiteList = res.result.isInWhiteList;
          this.isInBlackList = res.result.isInBlackList;
          this.memberList = res.result.members;
          // this.memberList.push(res.result.members)
        }
      });
    },
    getGroupInfo() {
      getGroupInfo({ groupIds: this.currentTargetId })
        .then(res => {
          if (res) {
            this.groupObj = res.result[0];
            this.groupName = this.groupObj.name;
            this.groupAnnounce = this.groupObj.announcement;
            if (this.groupObj.isBlock == 1) {
              this.isBanner = true;
            } else {
              this.isBanner = false;
            }
          }
        })
        .catch(err => {});
    },
    inviteMemberFn() {
      this.inviteMember = true;
    },
    closeInviteBox() {
      this.getMemberDetails();
      this.inviteMember = false;
    },
    removeGroupMember() {
      this.removeMember = true;
    },
    closeRemoveBox() {
      this.getMemberDetails();
      this.removeMember = false;
    },
    setAdminFn() {
      this.setAdmin = true;
    },
    closeAdminBox() {
      this.getMemberDetails();
      this.setAdmin = false;
    },
    clearMsg() {
      var params = {
        conversationType: RongIMLib.ConversationType.PRIVATE,
        targetId: this.groupObj.id,
        timestamp: 1583820517134 // 可取 sentTime, 收发消息和历史消息中都有 sentTime 字段
      };
      RongIMLib.RongIMClient.getInstance().clearRemoteHistoryMessages(params, {
        onSuccess: function() {
          console.log("清除成功");
        },
        onError: function(error) {
          console.log("清除失败", error);
        }
      });
    },
    setBanner(val) {
      if (val) {
        this.isBanner = true;
      } else {
        this.isBanner = false;
      }
      let params = {
        groupId: this.groupObj.id,
        isAdd: this.isBanner ? 1 : 0
      };
      addOrRemoveBlock(params).then(res => {
        if (res) {
          this.$emit("hideDrawer", { a: 1 });
        }
      });
    },
    hideBanner() {
      this.$emit("hideDrawer", { a: 1 });
    },
    deleteGroup() {
      this.$confirm("确定要解散群聊？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          dismissGroup({ groupId: this.groupObj.id }).then(res => {
            if (res) {
              this.$message("解散成功");
              this.$store.commit("SETRIGHTSTATUS", " ");
              this.$emit("hideDrawer", { a: 0 });
            }
          });
        })
        .catch(() => {});
    },
    quitGroup() {
      let params = {
        groupId: this.groupObj.id,
        groupName: this.groupObj.name,
        groupHeadUrl: this.groupObj.groupImgUrl
      };
      this.$confirm("确定要退出群聊？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          quitGroup(params).then(res => {
            if (res) {
              this.$message("退出成功");
              this.$store.commit("SETRIGHTSTATUS", " ");
              this.$emit("hideDrawer", { a: 0 });
            }
          });
        })
        .catch(() => {});
    },
    showMemberCard(item) {
      if (this.isAdmin || this.isCreator) {
        this.memberObj = item;
        this.showMemberCardStatus = true;
      }
    },
    showMoreMember() {
      this.memberListFlag += 8;
      if (this.memberList.length <= this.memberListFlag) {
        this.memberListFlag = this.memberList.length;
      }
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
    min-height: 65px;
    display: flex;
    flex-wrap: wrap;
    overflow: hidden;
    .member_item {
      width: 55px;
      text-align: center;
      cursor: pointer;
      .avatar {
        display: inline-block;
        width: 36px;
        height: 36px;
        border-radius: 3px;
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
    .show_more_member {
      text-align: center;
      font-size: 12px;
      color: #6a7681;
      width: 100%;
      margin-top: 10px;
      cursor: pointer;
    }
  }
  .line {
    width: 100%;
    height: 1px;
    background: #eee;
    margin: 15px 0;
  }
  .operate_list {
    .list_item {
      margin-bottom: 20px;
    }
    .label {
      font-size: 14px;
      color: #999;
    }
    .input {
      color: #333;
      margin-top: 5px;
      font-size: 16px;
      cursor: pointer;
    }
    .edit {
      .edit_icon {
        margin-left: 5px;
        font-size: 12px;
      }
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 5;
      overflow: hidden;
    }
    .setAdmin,
    .clearMsg {
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
    }
  }
  .deletAndQuit {
    margin-top: 50px;
    font-size: 16px;
    color: red;
    text-align: center;
    cursor: pointer;
  }
}
</style>