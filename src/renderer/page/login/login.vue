<template>
  <div class="login" v-loading="loading">
    <div class="header">
      <img src="@/assets/image/close_icon.png" alt @click="closeWindow" />
      <img src="@/assets/image/large_icon.png" alt @click="largeWindow" />
      <img src="@/assets/image/small_icon.png" alt @click="hideWindow" />
    </div>
    <div class="left_box">
      <div class="title">Welcome !</div>
      <div class="content">第一次了解到我们，您可以创建一个账号。随时随地登录，飞云国度交友聊天吧，一个缤纷绚丽的世界，有你才够精彩！让信任，从此刻开始！</div>
      <div class="regist_btn" @click="dialogTableVisible = true">注册</div>
    </div>
    <div class="right_box">
      <div class="title">
        <img src="@/assets/image/logo.png" alt />
        <span>飞云</span>
      </div>
      <div class="form_wrap">
        <div class="form_item">
          <img src="@/assets/image/account.png" alt />
          <input type="text" v-model="account" @keydown.enter="loginSubmit" autofocus placeholder="请输入用户名"/>
        </div>
        <div class="form_item">
          <img src="@/assets/image/password.png" alt />
          <input type="password" v-model="password" @keydown.enter="loginSubmit" placeholder="请输入密码"/>
        </div>
      </div>
      <div :class="['login_btn', {'not_allow': rule}]" @click="loginSubmit">登录</div>
      <div class="forget_pwd"><span>忘记密码？</span></div>
    </div>
    <el-dialog :visible.sync="dialogTableVisible" width="339px" center>
      <registerBox @closeRegisterBox="dialogTableVisible=false" v-if="dialogTableVisible"></registerBox>
    </el-dialog>
  </div>
</template>

<script>
const { ipcRenderer: ipc } = require("electron");
import registerBox from "./register";
import { login } from "../../request/api";
import axios from "axios";
export default {
  data() {
    return {
      account: "",
      password: "",
      dialogTableVisible: false,
      loading: false
    };
  },
  components: {
    registerBox
  },
  computed: {
    rule: function() {
      if (this.account && this.password) return true;
      else return false;
    }
  },
  created() {
    if(window.localStorage.getItem('account')) {
      this.account = window.localStorage.getItem('account')
      this.password = window.localStorage.getItem('password')
    }
  },
  methods: {
    loginSubmit() {
      if (!this.account) {
        this.$message("账号不能为空");
        return;
      } else if (!this.password) {
        this.$message("密码不能为空");
        return;
      }
      this.loading = true;
      login({ account: this.account, password: this.password })
        .then(res => {
          this.loading = false;
          // 用户信息存本地
          window.localStorage.setItem("account", this.account);
          window.localStorage.setItem("password", this.password);
          window.localStorage.setItem("userToken", res.result.token);
          window.localStorage.setItem("rongToken", res.result.user.token);
          window.localStorage.setItem(
            "userInfo",
            JSON.stringify(res.result.user)
          );
          this.$store.commit("SETACCOUNTMONEY", res.result.user.money);
          window.localStorage.setItem(
            "defaultAvatar",
            res.result.user.headImgUrl
          );
          this.$router.push({ path: "/home" });
        })
        .catch(err => {
          this.loading = false;
          this.$message(err.msg);
        });
    },
    largeWindow() {
      ipc.send("max");
    },
    hideWindow() {
      ipc.send("min");
    },
    closeWindow() {
      ipc.send("close");
    }
  }
};
</script>

<style scoped lang="scss">
.login {
  width: 100%;
  height: 100%;
  background: url("../../assets/image/login_bg.png");
  background-size: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  position: relative;
  .header {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 50px;
    cursor: pointer;
    -webkit-app-region: drag;
    padding: 10px;
    img {
      margin-left: 20px;
      width: 15px;
      -webkit-app-region: no-drag;
      float: right;
    }
  }
  .left_box {
    width: 35%;
    height: 50%;
    color: #fff;
    border-radius: 15px 0px 0px 15px;
    background: url("../../assets/image/login_bg2.png");
    background-size: 100%;
    .title {
      font-size: 30px;
      text-align: center;
      margin-top: 20px;
    }
    .content {
      margin: 50px auto 60px;
      font-size: 12px;
      padding: 0 20px;
      text-align: left;
      text-indent: 2em;
      line-height: 1.8;
    }
    .regist_btn {
      width: 115px;
      height: 30px;
      border-radius: 14px;
      border: solid 1px #ffffff;
      text-align: center;
      line-height: 30px;
      font-size: 12px;
      margin: 0 auto;
      cursor: pointer;
      &:hover {
        background-image: linear-gradient(-43deg, #4777ff 0%, #2dd3ff 100%);
      }
    }
  }
  .right_box {
    width: 35%;
    height: 50%;
    border-radius: 0px 15px 15px 0px;
    background-color: #fff;
    .title {
      font-size: 25px;
      margin: 20px 0;
      text-align: center;
      img {
        width: 40px;
        height: 40px;
        vertical-align: middle;
      }
      span {
        font-family: BigruixianBlackGBV1.0;
        font-size: 22px;
        font-weight: normal;
        font-stretch: normal;
        color: #242424;
      }
    }
    .form_wrap {
      width: 100%;
      .form_item {
        width: 211px;
        height: 44px;
        background-color: #ffffff;
        border-radius: 22px;
        border: solid 1px #eae8eb;
        display: flex;
        align-items: center;
        margin: 0 auto 25px;
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
    .login_btn {
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
    .forget_pwd {
      text-align: center;
      color: #cfd4df;
      font-size: 12px;
      margin-top: 10px;
      span {
        cursor: pointer;
      }
    }
  }
  /deep/.el-dialog {
    box-shadow: 0px 20px 20px rgba(30, 0, 0, 0.2);
    border-radius: 8px;
  }
  /deep/.el-dialog__header {
    display: none;
  }
  /deep/.el-dialog__body {
    padding: 0 !important;
  }
  /deep/ .el-loading-spinner .path {
    stroke: rgba(251, 54, 48, 1);
  }
}
</style>
