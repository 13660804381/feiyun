<template>
  <div class="leftSide">
    <div class="tab_bar">
      <div class="avatar" @click="showUserInfo">
        <img :src="`${defaultAvatar}?t=${Math.random()}`" alt />
      </div>
      <ul>
        <li :class="{'active': tabStatus == 1}" @click="selectTab(1)">
          <img src="@/assets/image/message.png" alt />
          <span class="bradge" v-if="unReadMsgCount">{{unReadMsgCount}}</span>
          <!-- <span class="bradge">5</span> -->
        </li>
        <li :class="{'active': tabStatus == 2}" @click="selectTab(2)">
          <img src="@/assets/image/address-book.png" alt />
          <span class="bradge" v-if="verifyCount">{{verifyCount}}</span>
        </li>
        <li :class="{'active': tabStatus == 3}" @click="selectTab(3)">
          <img src="@/assets/image/people.png" alt />
        </li>
        <li @click="addFriend">
          <img src="@/assets/image/add-people.png" alt />
        </li>
      </ul>
      <div class="bottom_operate">
        <el-dropdown placement="top" size="small" @command="handleCommand" :show-timeout="0">
          <span class="el-dropdown-link">
            <img src="@/assets/image/menu.png" alt />
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="b">设置</el-dropdown-item>
            <el-dropdown-item command="logout">退出</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>
    <div class="content_box">
      <div class="drag_box"></div>
      <div class="search_header">
        <div class="search_box">
          <span class="serach_icon">
            <img src="@/assets/image/search.png" alt />
          </span>
          <input type="text" placeholder="搜索" v-model="serchValue" />
        </div>
        <span class="add_icon" @click="createGroupFn">
          <img src="@/assets/image/addFriend.png" alt />
        </span>
      </div>
      <friendList v-if="tabStatus == 2 && !showSearchList"></friendList>
      <groupList v-else-if="tabStatus == 3 && !showSearchList"></groupList>
      <keep-alive v-else-if="tabStatus == 1 && !showSearchList">
        <conversationList></conversationList>
      </keep-alive>
      <searchList v-else></searchList>
    </div>
    <!-- <div class="bottom_operate">
      <ul>
        <li @click="showSearchFn">
          <img src="@/assets/image/search.png" alt />
        </li>
        <li>
          <img src="@/assets/image/addFriend.png" alt />
        </li>
        <li @click="addNotice">
          <img src="@/assets/image/message.png" alt />
        </li>
        <li>
          
        </li>
      </ul>
      <div :class="['search_input',{'showSearch':showSearch}]">
        <div class="input_wrap">
          <span class="searchIcon">
            <img src="@/assets/image/search.png" alt />
          </span>
          <input type="text" />
          <span @click="hideSearch" class="closeSearchBox">
            <img src="@/assets/image/clearSearch.png" alt />
          </span>
        </div>
      </div>
    </div>-->
    <el-dialog :visible.sync="showAddFriend" width="400px" center>
      <addFriend @hideAddFriendFn="showAddFriend = false"></addFriend>
    </el-dialog>
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
const { ipcRenderer: ipc } = require("electron");
import { mapState } from "vuex";
import friendList from "./contentList/friendList";
import groupList from "./contentList/groupList";
import searchList from "./contentList/searchList";
import conversationList from "./contentList/conversationList";
import addFriend from "@/components/addFriend";
import createGroup from "../rightSide/createGroup.vue";
export default {
  components: {
    friendList,
    groupList,
    conversationList,
    addFriend,
    createGroup,
    searchList
  },
  data() {
    return {
      showSearch: false,
      userInfo: JSON.parse(window.localStorage.getItem("userInfo")),
      defaultAvatar: window.localStorage.getItem("defaultAvatar"),
      showAddFriend: false,
      showUserInfoStatus: false,
      createGroup: false,
      serchValue: "",
      concatList: [],
      showSearchList: false
    };
  },
  computed: {
    ...mapState({
      unReadMsgCount: state => state.home.unReadMsgCount,
      verifyCount: state => state.home.verifyCount,
      rightBoxStatus: state => state.home.rightBoxStatus,
      tabStatus: state => state.home.tabStatus
    })
  },
  watch: {
    serchValue(value) {
      if (value) {
        this.showSearchList = true;
        let newList = [];
        for (let i = 0; i < this.concatList.length; i++) {
          if (this.concatList[i].serchValueName.indexOf(value) > -1) {
            newList.push(this.concatList[i]);
          }
          if (this.concatList[i].serachRemark) {
            if (this.concatList[i].serachRemark.indexOf(value) > -1) {
              newList.push(this.concatList[i]);
            }
          }
        }
        this.$store.commit("SETSEARCHLIST", newList);
      } else {
        this.showSearchList = false;
      }
    }
  },
  created() {
    this.getSearchList();
  },
  methods: {
    getSearchList() {
      this.$store.dispatch("getGroupList").then(res => {
        let groupList = res.result;
        this.$store.dispatch("getFriendList").then(res1 => {
          let friendList = res1.result;
          let newArr = friendList.concat(groupList);
          this.concatList = newArr;
          for (let i = 0; i < this.concatList.length; i++) {
            if (this.concatList[i].name) {
              this.concatList[i].serchValueName = this.concatList[i].name;
            } else if (this.concatList[i].nickName) {
              this.concatList[i].serchValueName = this.concatList[i].nickName;
              this.concatList[i].serachRemark = this.concatList[i].remark;
            }
          }
        });
      });
    },
    createGroupFn() {
      this.createGroup = true;
    },
    closeCreateBox() {
      this.createGroup = false;
    },
    addFriend() {
      this.showAddFriend = true;
    },
    selectTab(i) {
      this.$store.commit("SETTABSTATUS", i);
    },
    showSearchFn() {
      this.showSearch = true;
    },
    hideSearch() {
      this.showSearch = false;
    },
    handleCommand(command) {
      if (command == "logout") {
        window.location.reload();
        RongIMClient.getInstance().logout();
        // RongIMClient.getInstance().disconnect();
        window.localStorage.removeItem("userToken");
        window.localStorage.removeItem("rongToken");
        this.$router.push({ path: "/login" });
      }
    },
    addNotice() {
      // this.$emit("addNoticeFn", true);
      if (this.rightBoxStatus !== "addNotice") {
        this.$store.commit("SETRIGHTSTATUS", "addNotice");
        this.$store.commit("SETCURRENTTARGETID", "");
      } else {
        this.$store.commit("SETRIGHTSTATUS", " ");
      }
    },
    selectChat(i) {
      this.active = i;
    },
    hideWindow() {
      ipc.send("min");
    },
    closeWindow() {
      ipc.send("close");
    },
    showUserInfo() {
      this.$store.commit("SHOWUSERINFO", !this.showUserInfoStatus);
    }
  }
};
</script>

<style scoped lang="scss">
.leftSide {
  width: 40%;
  height: 100%;
  position: relative;
  border-right: 1px solid #ddd;
  float: left;
  display: flex;
  .content_box {
    flex: 1;
    .drag_box {
      height: 20px;
      -webkit-app-region: drag;
    }
    .search_header {
      display: flex;
      justify-content: center;
      height: 35px;
      border-bottom: 1px solid #eef5ff;
      padding: 0 20px;
      .search_box {
        position: relative;
        width: 100%;
        height: 21px;
        .serach_icon {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          img {
            width: 10px;
            height: 10px;
          }
        }
      }
      input {
        width: 100%;
        height: 100%;
        background-color: #eef5ff;
        border-radius: 8px;
        padding-left: 30px;
        border-radius: 5px;
      }
      img {
        vertical-align: middle;
      }
      .add_icon {
        margin-left: 10px;
        cursor: pointer;
        img {
          width: 20px;
        }
      }
    }
  }
  .tab_bar {
    width: 60px;
    height: 100%;
    background-color: #3288fd;
    padding: 10px;
    box-sizing: border-box;
    text-align: center;
    position: relative;
    .avatar {
      width: 100%;
      cursor: pointer;
      img {
        width: 100%;
        border-radius: 3px;
      }
    }
    ul {
      width: 100%;
      margin-top: 50px;
      li {
        display: inline-block;
        width: 40px;
        height: 40px;
        line-height: 53px;
        margin-bottom: 15px;
        position: relative;
        cursor: pointer;
        img {
          width: 24px;
        }
        &:hover {
          background-color: rgba(240, 244, 253, 0.5);
          border-radius: 50%;
        }
        .bradge {
          position: absolute;
          top: 8px;
          right: 6px;
          min-width: 15px;
          height: 15px;
          line-height: 15px;
          font-size: 12px;
          color: #fff;
          border-radius: 10px;
          text-align: center;
          background-image: linear-gradient(-90deg, #ff5b5b 0%, #f71a1a 100%);
        }
      }
      .active {
        background-color: rgba(240, 244, 253, 0.5);
        border-radius: 50%;
      }
    }
  }
  .bottom_operate {
    position: absolute;
    bottom: 20px;
    left: 0;
    width: 100%;
    img {
      width: 24px;
      cursor: pointer;
    }
  }
}
</style>
