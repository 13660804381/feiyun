<template>
  <div class="memberCard">
    <div class="top_info">
      <img class="avatar" :src="memberObj.headImgUrl" alt />
      <div class="name_info">
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
              maxlength="10"
            />
          </p>
        </div>
        <div class="nickName">
          <span>昵称：</span>
          {{memberObj.nickName}}
        </div>
      </div>
    </div>
    <div class="bottom_info">
      <div class="addWhiteList">
        <span>加入白名单</span>
        <el-switch
          v-model="memberObj.isInWhiteList"
          active-color="#3289fd"
          inactive-color="#999999"
          @change="setWhiteList"
        ></el-switch>
      </div>
      <div class="addBlackList">
        <span>禁止该成员发言</span>
        <el-switch
          v-model="memberObj.isInBlackList"
          active-color="#3289fd"
          inactive-color="#999999"
          @change="setBlackList"
        ></el-switch>
      </div>
    </div>
  </div>
</template>
<script>
import {
  markRemark,
  addOrRemoveBlockSomeOne,
  addOrRemoveWhiteList
} from "../../request/api";
export default {
  data() {
    return {
      showRemarkInputBoxStatus: true,
      showRemark: false,
      black: "",
      white: ""
    };
  },
  props: {
    memberObj: {
      type: Object,
      required: false
    },
    groupId: {
      type: String,
      required: false
    }
  },
  directives: {
    focus: {
      // 指令的定义
      inserted: function(el) {
        el.focus();
      }
    }
  },
  created() {
    if (this.memberObj.isInWhiteList == 1) {
      this.memberObj.isInWhiteList = true;
    } else {
      this.memberObj.isInWhiteList = false;
    }
    if (this.memberObj.isInBlackList == 1) {
      this.memberObj.isInBlackList = true;
    } else {
      this.memberObj.isInBlackList = false;
    }
  },
  methods: {
    setWhiteList(val) {
      if (val) {
        this.white = 1;
      } else {
        this.white = 0;
      }
      let data = {
        groupId: this.groupId,
        members: this.memberObj.id,
        isAdd: this.white
      };
      addOrRemoveWhiteList(data).then(res => {
        if (res) {
          this.$emit("hideBanner");
        }
      });
    },
    setBlackList(val) {
      if (val) {
        this.black = 1;
      } else {
        this.black = 0;
      }
      let data = {
        groupId: this.groupId,
        members: this.memberObj.id,
        isAdd: this.black
      };
      addOrRemoveBlockSomeOne(data).then(res => {
        if (res) {
          this.$emit("hideBanner");
        }
      });
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
          this.$store.dispatch("getRemarkList").then(res => {
            this.getConversationList();
          });
        }
      });
      this.showRemarkInputBoxStatus = true;
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
    showEditRemark() {
      this.showRemark = true;
    },
    showEditRemarkLeaveFn() {
      this.showRemark = false;
    }
  }
};
</script>
<style scoped lang="scss">
.memberCard {
  .top_info {
    display: flex;
    align-items: center;
    .avatar {
      width: 50px;
      height: 50px;
    }
    .name_info {
      flex: 1;
      margin-left: 10px;
      .remark {
        display: flex;
        .input {
          flex: 1;
          width: 50px;
          margin-left: 5px;
          input {
            width: 100%;
          }
        }
      }
    }
  }
  .bottom_info {
    margin-top: 20px;
    border-top: 1px solid #ccc;
    .addWhiteList,
    .addBlackList {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 50px;
    }
    .addWhiteList {
      margin-top: 5px;
    }
  }
}
</style>