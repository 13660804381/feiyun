<template>
  <div class="changePassword">
    <div class="form_box">
      <div class="form_item">
        <span class="label">原始密码</span>
        <input type="password" placeholder="请输入原始密码" maxlength="12" v-model="oldPassword"/>
      </div>
      <div class="form_item">
        <span class="label">设置新密码</span>
        <input type="password" placeholder="请输入新密码" maxlength="12" v-model="newPassword" />
      </div>
      <div class="form_item">
        <span class="label">确认新密码</span>
        <input type="password" placeholder="请确认新密码" maxlength="12" v-model="cfmPassword" />
      </div>
      <div class="form_item">
        <span class="btn" @click="submit">确定</span>
      </div>
    </div>
  </div>
</template>
<script>
import { updatePwd } from "../../request/api";
export default {
  data() {
    return {
      oldPassword: "",
      newPassword: "",
      cfmPassword: ""
    };
  },
  methods: {
    submit() {
      if (!this.oldPassword) {
        this.$message("旧密码不能为空");
        return;
      }
      if (this.newPassword !== this.cfmPassword) {
        this.$message("新密码与确认密码不一致");
        return;
      }
      let params = {
        oldPassword: this.oldPassword,
        newPassword: this.newPassword,
        cfmPassword: this.cfmPassword
      };
      updatePwd(params).then(res => {
        if (res) {
          window.location.reload();
          RongIMClient.getInstance().logout();
          // RongIMClient.getInstance().disconnect();
          window.localStorage.removeItem("userToken");
          window.localStorage.removeItem("rongToken");
          this.$router.push({ path: "/login" });
        }
      }).catch(err => {
          this.$message(err.msg)
      });
    }
  }
};
</script>
<style scoped lang="scss">
.changePassword {
  .form_box {
    width: 330px;
    margin: 80px auto 0;
    .form_item {
      height: 50px;
      .label {
        display: inline-block;
        color: #848b96;
        width: 80px;
        font-size: 14px;
      }
      input {
        display: inline-block;
        width: calc(100% - 90px);
        height: 30px;
        line-height: 30px;
        padding-left: 10px;
        background-color: #f9fafb;
        border-radius: 2px;
        border: solid 1px #eeeeee;
      }
      .btn {
        display: inline-block;
        width: calc(100% - 90px);
        height: 30px;
        background-color: #318bfd;
        border-radius: 2px;
        border: solid 1px #eeeeee;
        text-align: center;
        line-height: 30px;
        font-size: 16px;
        color: #fff;
        margin-left: 85px;
      }
    }
  }
}
</style>