<template>
  <div class="userInfo">
    <el-tabs v-model="activeName" stretch>
      <el-tab-pane label="基本信息" name="first">
        <baseInfo></baseInfo>
      </el-tab-pane>
      <el-tab-pane label="修改密码" name="second">
        <changePassword></changePassword>
      </el-tab-pane>
    </el-tabs>
    <div class="back">
      <img src="@/assets/image/back.png" alt @click="closeBox" />
    </div>
  </div>
</template>
<script>
import baseInfo from "./baseInfo.vue";
import changePassword from "./changePassword.vue";
export default {
  components: {
    changePassword,
    baseInfo
  },
  data() {
    return {
      activeName: "first"
    };
  },
  methods: {
    closeBox() {
      this.$store.commit("SHOWUSERINFO", false);
    }
  }
};
</script>
<style scoped lang="scss">
.userInfo {
  width: 100%;
  height: 100%;
  background-color: #fff;
  -webkit-app-region: no-drag;
  /deep/ .el-tabs__nav.is-stretch {
    height: 50px;
    .el-tabs__item {
      height: 50px;
      line-height: 50px;
    }
  }
  .back {
    padding-left: 75px;
    margin-top: 50px;
    img {
      width: 46px;
      cursor: pointer;
    }
  }
}
</style>