<template>
  <div class="register" v-loading="loading">
    <div class="title">注册账号</div>
    <div class="form_wrap">
      <div class="form_item">
        <img src="@/assets/image/account.png" alt />
        <input type="text" v-model="account" autofocus placeholder="请输入用户名" />
      </div>
      <div class="form_item">
        <img src="@/assets/image/account.png" alt />
        <input type="text" v-model="nickName" placeholder="请输入昵称" />
      </div>
      <div class="form_item">
        <img src="@/assets/image/password.png" alt />
        <input type="password" v-model="password" placeholder="请输入密码" />
      </div>
      <div class="form_item">
        <img src="@/assets/image/password.png" alt />
        <input type="password" v-model="cfm_password" placeholder="请再次输入密码" />
      </div>
    </div>
    <div :class="['register_btn', {'not_allow': rule}]" @click="registerSubmit">注册</div>
  </div>
</template>

<script>
import { register } from "../../request/api";
export default {
  data() {
    return {
      account: "",
      password: "",
      nickName: "",
      cfm_password: "",
      loading: false
    };
  },
  computed: {
    rule: function() {
      if (this.account && this.password && this.nickName && this.cfm_password)
        return true;
    }
  },
  created() {},
  methods: {
    registerSubmit() {
      if (!this.account) {
        this.$message("账号不能为空");
        return;
      } else if (!this.password) {
        this.$message("密码不能为空");
        return;
      } else if (!this.nickName) {
        this.$message("昵称不能为空");
        return;
      } else if (this.password.length <= 8) {
        this.$message("密码长度不能小于8位");
        return;
      } else if (this.cfm_password !== this.password) {
        this.$message("两次密码不一致");
        return;
      }
      this.loading = true;
      let params = {
        nickName: this.nickName,
        account: this.account,
        password: this.password,
        cfm_password: this.cfm_password
      };
      register(params)
        .then(res => {
          this.loading = false;
          if (res) {
            this.$message("注册成功");
            this.$emit("closeRegisterBox", false);
          }
        })
        .catch(err => {
          this.loading = false;
          this.$message(err.msg);
        });
    }
  }
};
</script>

<style scoped lang="scss">
.register {
  position: relative;
  width: 339px;
  height: 378px;
  background: #fff;
  box-shadow: 0px 20px 20px rgba(30, 0, 0, 0.2);
  border-radius: 8px;
  padding: 30px 30px 0 30px;
  .title {
    font-size: 25px;
    margin-bottom: 30px;
  }
  .form_wrap {
    width: 100%;
    margin-bottom: 15px;
    .form_item {
      width: 211px;
      height: 44px;
      background-color: #ffffff;
      border-radius: 22px;
      border: solid 1px #eae8eb;
      display: flex;
      align-items: center;
      margin: 0 auto 10px;
      img {
        width: 26px;
        height: 26px;
        margin-left: 20px;
      }
      input {
        font-size: 15px;
        width: 80%;
        height: 100%;
        vertical-align: middle;
        padding-left: 15px;
      }
    }
  }
  .register_btn {
    width: 211px;
    height: 44px;
    background-color: #54a9ff;
    border-radius: 22px;
    line-height: 44px;
    text-align: center;
    font-size: 20px;
    color: #fff;
    cursor: not-allowed;
    margin: 0 auto;
    opacity: 0.5;
  }
  .not_allow {
    cursor: pointer;
    opacity: 1;
  }
}
</style>
