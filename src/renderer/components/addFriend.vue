<template>
  <div class="addFriend">
    <div class="header_title">
      <span>查找</span>
      <img @click="closeBox" class="close" src="@/assets/image/addFriendClose.png" alt />
    </div>
    <div class="content">
      <p>请输入用户ID：</p>
      <div class="form_item">
        <input type="text" autofocus v-model="userId" @keydown.enter="searchFriend" />
        <span :class="['submitBtn',{'active':showBtnActive}]" @click="searchFriend">搜索好友</span>
      </div>
      <div class="result_box" v-if="showDetails && haveData">
        <div class="user_box">
          <img :src="`${userInfo.headImgUrl}?t=${Math.random()}`" alt />
          <div class="right_box">
            <p class="nickName">{{userInfo.nickName}}</p>
            <p class="add_btn" @click="applyFriend">+好友</p>
          </div>
        </div>
      </div>
      <div class="noData" v-if="showDetails && !haveData">该用户不存在</div>
    </div>
  </div>
</template>

<script>
import { searchUser, applyFriend } from "@/request/api";
export default {
  data() {
    return {
      userId: "",
      userInfo: {},
      showDetails: false,
      haveData: false
    };
  },
  created() {
    // this.$message('123');
  },
  computed: {
    showBtnActive() {
      if (this.userId) return true;
      else return false;
    }
  },
  methods: {
    closeBox() {
      this.$emit("hideAddFriendFn", false);
    },
    searchFriend() {
      searchUser({ ids: this.userId })
        .then(res => {
          this.showDetails = true;
          if (res.result.friends.length > 0) {
            this.userInfo = res.result.friends[0];
            this.haveData = true;
          } else {
            this.haveData = false;
          }
        })
        .catch(err => {
          this.$message(err.msg);
        });
    },
    applyFriend() {
      applyFriend({ friendId: this.userId, message: "" })
        .then(res => {
          this.$message("请求已发送！");
        })
        .catch(err => {
          this.$message("已经是好友关系");
        });
    }
  }
};
</script>

<style scoped lang="scss">
.addFriend {
  width: 100%;
  height: 280px;
  border-radius: 5px;
  .header_title {
    width: 100%;
    height: 40px;
    background-color: #f9fbfc;
    padding: 0 20px;
    display: flex;
    align-items: center;
    border-bottom: 1px solid #dddddd;
    border-radius: 5px 5px 0px 0px;
    span {
      font-size: 18px;
      color: #333;
      flex: 1;
    }
    img {
      width: 17px;
      height: 17px;
      cursor: pointer;
    }
  }
  .content {
    width: 100%;
    height: 240px;
    background-color: #f5f5f5;
    border-radius: 0px 0px 5px 5px;
    padding: 20px;
    .form_item {
      width: 100%;
      display: flex;
      height: 38px;
      align-items: center;
      margin-top: 6px;
      input {
        flex: 1;
        height: 100%;
        background-color: #fff;
        border: 1px solid #eee;
        padding-left: 15px;
      }
      .submitBtn {
        width: 80px;
        height: 38px;
        line-height: 38px;
        text-align: center;
        background-color: rgba(50, 137, 253, .5);
        border: 1px solid rgba(238, 238, 238, 1);
        font-size: 14px;
        color: #fff;
        cursor: pointer;
      }
      .active {
        background-color: rgba(50, 137, 253, 1);
      }
    }
    .result_box {
      width: 173px;
      height: 76px;
      background: rgba(255, 255, 255, 1);
      border: 1px solid rgba(238, 238, 238, 1);
      border-radius: 2px;
      padding: 8px 10px;
      margin: 35px auto 0;
      transition: all 0.5s;
      &:hover {
        transform: scale(1.1);
      }
      .user_box {
        display: flex;
        align-items: center;
      }
      img {
        width: 60px;
        height: 60px;
        border-radius: 2px;
        margin-right: 15px;
      }
      .right_box {
        .nickName {
          font-size: 16px;
          color: #333;
          width: 80%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .add_btn {
          width: 56px;
          height: 26px;
          text-align: center;
          line-height: 26px;
          background: rgba(50, 137, 253, 1);
          border-radius: 3px;
          color: #fff;
          font-size: 12px;
          margin-top: 10px;
          cursor: pointer;
        }
      }
    }
  }
  .noData {
    margin-top: 35px;
  }
}
</style>
