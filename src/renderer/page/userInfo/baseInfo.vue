<template>
  <div class="baseInfo">
    <div class="avatar_box">
      <img :src="`${userInfo.headImgUrl}?t=${Math.random}`" alt />
    </div>
    <div class="nickName_box">
      <span class="label">昵称：</span>
      <div class="value_box">
        <span class="value" v-if="editNickName">{{nickNameInput}}</span>
        <input type="text" v-model="nickNameInput" v-focus v-else @blur="closeInput" maxlength="6" />
      </div>
      <div class="btn" @click="editNickNameFn">重新编辑</div>
    </div>
    <div class="ID_box">
      <span class="label">我的ID：</span>
      <span class="value">{{userInfo.id}}</span>
    </div>
    <div class="money_box">
      <span class="label">钱包余额：</span>
      <span class="value">￥{{userInfo.money}}</span>
    </div>
    <div class="add_time">
      <span class="label">注册时间：</span>
      <span class="value">{{userInfo.addTime}}</span>
    </div>
    <div class="login_time">
      <span class="label">上次登录时间：</span>
      <span class="value">{{userInfo.lastLoginTime}}</span>
    </div>
  </div>
</template>
<script>
import { updateNickName, getSelfInfo } from "../../request/api";
export default {
  data() {
    return {
      userInfo: JSON.parse(window.localStorage.getItem("userInfo")),
      editNickName: true,
      nickNameInput: JSON.parse(window.localStorage.getItem("userInfo"))
        .nickName
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
  created() {},
  methods: {
    editNickNameFn() {
      this.editNickName = false;
    },
    closeInput() {
      if (!this.nickNameInput) {
        this.$message("昵称不能为空！");
        return;
      }
      updateNickName({ nickName: this.nickNameInput }).then(res => {
        if (res) {
          this.$message("修改成功！");
          this.editNickName = true;
          getSelfInfo().then(res => {
            if (res) {
              window.localStorage.setItem("userInfo", JSON.stringify(res.result.user));
            }
          });
        }
      });
    }
  }
};
</script>
<style scoped lang="scss">
.baseInfo {
  width: 600px;
  height: 410px;
  margin: 0 auto;
  border-radius: 4px;
  border: solid 1px rgba(238, 238, 238, 1);
  padding: 20px;
  .avatar_box {
    height: 50px;
    img {
      width: 40px;
      border-radius: 3px;
    }
  }
  .nickName_box,
  .money_box,
  .add_time,
  .login_time,
  .ID_box {
    display: flex;
    align-items: center;
    height: 60px;
    border-bottom: solid 1px #eeeeee;
    .label {
      font-size: 14px;
      color: #848b96;
    }
    .value {
      font-size: 16px;
      color: #14141c;
    }
  }
  .nickName_box {
    .value_box {
      flex: 1;
      input {
        width: 50%;
        height: 20px;
        padding-left: 10px;
        background-color: #f9fafb;
        border-radius: 2px;
        border: solid 1px #eeeeee;
      }
    }
    .btn {
      width: 80px;
      height: 30px;
      text-align: center;
      line-height: 30px;
      font-size: 16px;
      color: #333;
      background-color: #ffffff;
      border-radius: 3px;
      border: solid 1px #dcdcdc;
      cursor: pointer;
      &:hover {
        background-color: #318bfd;
        color: #fff;
      }
    }
  }
}
</style>