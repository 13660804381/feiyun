<template>
  <div class="removeGroupMember">
    <div class="left_side">
      <div class="title">请选择群成员</div>
      <ul>
        <li v-for="item in friendListData" :key="item.id" @click="selectFriend(item)" v-if="item.isCreator !== 1">
          <div class="list_item_wrap">
            <!-- <span class="bradge">10</span> -->
            <img class="avatar" :src="item.headImgUrl" />
            <p class="nickName">{{item.remark?item.remark:item.nickName}}</p>
            <div :class="['circle',{'active': item.selected}]"></div>
          </div>
        </li>
      </ul>
    </div>
    <div class="line"></div>
    <div class="right_side">
      <div class="title">已选群成员</div>
      <ul>
        <li v-for="item in selectList" :key="item.id">
          <div class="list_item_wrap">
            <!-- <span class="bradge">10</span> -->
            <img class="avatar" :src="item.headImgUrl" />
            <p class="nickName">{{item.remark?item.remark:item.nickName}}</p>
            <i class="el-icon-close" @click="deleteMember(item)"></i>
          </div>
        </li>
      </ul>
    </div>
    <div :class="['submit_btn',{'banner': selectList.length>0}]" @click="submit">确定</div>
  </div>
</template>
<script>
import { mapState } from "vuex";
import { getFriendList, joinGroupMember, removeMember } from "../../request/api";
export default {
  data() {
    return {
      selectList: [],
      friendListData: [],
      newMember: []
    };
  },
  props: {
    memberList: {
      type: Array,
      required: false
    },
    groupObj: {
        type: Object,
        required:false
    }
  },
  computed: {
    // ...mapState({
    //   friendListData: state => state.home.friendList
    // })
  },
  created() {
    this.friendListData = this.memberList
    console.log(this.friendListData)
    // this.getFriendList();
  },
  methods: {
    selectFriend(item) {
      if (item.selected) return;
      for (let i = 0; i < this.friendListData.length; i++) {
        if (item.id == this.friendListData[i].id) {
          if (this.friendListData[i].selected) {
            this.$set(this.friendListData[i], "selected", false);
            for (let j = 0; j < this.selectList.length; j++) {
              if (this.friendListData[i].id == this.selectList[j].id) {
                this.selectList.splice(j, 1);
              }
            }
          } else {
            this.$set(this.friendListData[i], "selected", true);
            this.selectList.unshift(item);
          }
          break;
        }
      }
    },
    deleteMember(item) {
      for (let i = 0; i < this.selectList.length; i++) {
        if (item.id == this.selectList[i].id) {
          this.selectList.splice(i, 1);
          for (let j = 0; j < this.friendListData.length; j++) {
            if (item.id == this.friendListData[j].id) {
              this.$set(this.friendListData[j], "selected", false);
            }
          }
        }
      }
    },
    submit() {
      if (this.selectList.length > 0) {
        let idArr = [];
        let nameArr = [];
        for (var i = 0; i < this.selectList.length; i++) {
          idArr.push(this.selectList[i].id);
          nameArr.push(this.selectList[i].nickName);
        }
        let data = {
          removeIds: idArr.join(),
          removeNames: nameArr.join(),
          groupName: this.groupObj.name,
          groupId: this.groupObj.id,
          groupHeadUrl: this.groupObj.groupImgUrl
        };
        removeMember(data).then(res => {
          if (res) {
            this.$message("删除成功");
            this.$emit('closeRemoveBox')
          }
        });
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.removeGroupMember {
  width: 100%;
  height: 350px;
  overflow: hidden;
  -moz-user-select: none; /*火狐*/
  -webkit-user-select: none; /*webkit浏览器*/
  -ms-user-select: none; /*IE10*/
  -khtml-user-select: none; /*早期浏览器*/
  user-select: none;
  .left_side,
  .right_side {
    width: 48%;
    height: 330px;
    display: inline-block;
    vertical-align: top;
    .title {
      margin-bottom: 10px;
    }
    ul {
      width: 100%;
      height: 300px;
      overflow-y: auto;
      li {
        width: 100%;
        height: 50px;
        cursor: pointer;
        .list_item_wrap {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          border-bottom: 1px solid #e8e8e8;
          position: relative;
          &:last-child {
            border-bottom: none;
          }
        }
        .avatar {
          width: 34px;
          height: 34px;
          border-radius: 2px;
          margin-right: 10px;
        }
        .nickName {
          display: inline-block;
          width: 70%;
          font-size: 14px;
          color: #333333;
        }
      }
    }
  }
  .line {
    display: inline-block;
    width: 1px;
    height: 330px;
    vertical-align: top;
    background-color: #999;
    margin-right: 5px;
  }
  .left_side {
    .circle {
      width: 15px;
      height: 15px;
      border-radius: 50%;
      border: 1px solid #3289fd;
    }
    .active {
      background-color: #3289fd;
    }
  }
  .right_side {
  }
  .submit_btn {
    position: absolute;
    bottom: 10px;
    left: 50%;
    transform: translateX(-58%);
    width: 40px;
    height: 25px;
    background: red;
    color: #fff;
    text-align: center;
    line-height: 25px;
    border-radius: 5px;
    cursor: pointer;
      opacity: .5;
  }
  .banner {
      opacity: 1;
  }
}
</style>