<template>
  <div class="showRedPack">
    <!-- 好友点击开红包 -->
    <div class="redWrap" v-if="friendRed">
      <div class="openRedPack" v-if="redStatus">
        <img
          :class="['open_btn', {'rotateAnimate': rotateAnimate}]"
          @click="openRedFn"
          src="@/assets/image/openBtn.png"
          alt
        />
      </div>
      <div class="redPackDetail" v-else>
        <div class="money">
          ¥
          <i>{{details[0].money}}</i>
        </div>
        <div class="tips">
          红包已经已存入账户，
          <i>去查看></i>
        </div>
      </div>
    </div>

    <!-- 我查看红包详情 -->
    <div v-else>
      <div class="no_redPackDetail" v-if="detailsStatus">
        <div class="avatar">
          <img :src="redPacketObj.content.extra.avatar1" alt />
        </div>
        <div class="text">{{redPacketObj.content.extra.name1}}的红包</div>
        <div class="money">
          ¥
          <i>{{redPacketObj.content.extra.redMoneyCount}}</i>
        </div>
        <div class="wait_text">等待对方领取</div>
        <div class="bottom_text">未领取的红包将在24小时后退款</div>
      </div>
      <div class="no_redPackDetail" v-else>
        <div class="avatar">
          <img :src="redPacketObj.content.extra.avatar1" alt />
        </div>
        <div class="text">{{redPacketObj.content.extra.name1}}的红包</div>
        <div class="money">
          ¥
          <i>{{redPacketObj.content.extra.redMoneyCount}}</i>
        </div>
        <div class="list_wrap">
          <div class="recordList" v-for="(item,i) in details" :key="i">
            <span class="info"><i>{{item.remark?item.remark:item.nickName}}</i>领取了红包</span>
            <span class="moneyList">{{item.money}}元</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { receivedRed, getRedInfo } from "../../request/api";
import { mapState } from "vuex";
export default {
  data() {
    return {
      friendRed: true,
      redStatus: true,
      rotateAnimate: false,
      details: {},
      detailsStatus: true
    };
  },
  props: {
    redPacketObj: {
      type: Object
    }
  },
  computed: {
    ...mapState({
      currentTargetId: state => state.home.currentTargetId,
      conversationType: state => state.home.conversationType,
      accountMoney: state => state.user.accountMoney
    })
  },
  created() {
    let myId = JSON.parse(window.localStorage.getItem("userInfo")).id;
    if (this.redPacketObj.senderUserId == myId) {
      this.friendRed = false;
    }
      this.getDetails();
  },
  methods: {
    openRedFn() {
      let data = {
        redId: this.redPacketObj.content.extra.redId,
        targetId: this.conversationType == 1?this.redPacketObj.senderUserId:this.redPacketObj.targetId,
        targetType: this.conversationType == 1 ? "private" : "group",
      };
      this.rotateAnimate = true;
      receivedRed(data)
        .then(res => {
          if (res) {
            setTimeout(() => {
              this.redStatus = false;
            }, 1000);
            // this.$store.commit("SETACCOUNTMONEY", res.result.user.money);
            this.getDetails();
          }
        })
        .catch(err => {
          this.$message(err.msg);
        });
    },
    getDetails() {
      getRedInfo({ redPacketId: this.redPacketObj.content.extra.redId })
        .then(res => {
          if (res) {
            if (res.result.records.length > 0) {
              this.details = res.result.records;
              this.detailsStatus = false;
              this.redStatus = false
            let money = this.accountMoney + this.details[0].money
            this.$store.commit("SETACCOUNTMONEY", money);
            } else {
              this.detailsStatus = true;
              this.redStatus = true
            }
          }
        })
        .catch(err => {});
    }
  }
};
</script>

<style scoped lang="scss">
.showRedPack {
  .openRedPack {
    width: 230px;
    height: 300px;
    background: url("../../assets/image/openRedBg.png") no-repeat;
    background-size: cover;
    border-radius: 5px;
    position: relative;
    .open_btn {
      width: 88px;
      position: absolute;
      top: 77px;
      left: 50%;
      margin-left: -44px;
      cursor: pointer;
    }
  }
  .redPackDetail {
    width: 230px;
    height: 300px;
    background: url("../../assets/image/openDetailBg.png") no-repeat;
    background-size: cover;
    border-radius: 5px;
    .money {
      padding-top: 40px;
      text-align: center;
      color: #f5c97f;
      font-size: 20px;
      i {
        font-size: 44px;
      }
    }
    .tips {
      margin-top: 140px;
      text-align: center;
      font-size: 14px;
      color: #999;
      i {
        color: #2077db;
        cursor: pointer;
      }
    }
  }
  .no_redPackDetail {
    width: 230px;
    height: 300px;
    background: url("../../assets/image/no_redPackDetail.jpg") no-repeat;
    background-size: cover;
    border-radius: 5px;
    text-align: center;
    .avatar {
      padding-top: 50px;
      img {
        width: 40px;
        height: 40px;
        border-radius: 5px;
      }
    }
    .text {
      font-size: 14px;
      color: #333;
      margin-top: 5px;
    }
    .money {
      margin-top: 15px;
      color: #333;
      font-size: 20px;
      i {
        font-size: 44px;
      }
    }
    .wait_text {
      color: #fa9932;
      font-size: 12px;
    }
    .bottom_text {
      margin-top: 60px;
      font-size: 12px;
      color: #999;
    }
  }
  .rotateAnimate {
    animation: rotateA 1s linear;
  }

  @keyframes rotateA {
    from {
      transform: rotateY(0);
    }
    to {
      transform: rotateY(720deg);
    }
  }
  .list_wrap {
    width: 100%;
    max-height: 100px;
    overflow-y: auto;
    text-align: left;
    .recordList {
      display: flex;
      align-items: center;
      padding: 5px 10px;
      .info{
        flex: 1;
        font-size: 12px;
        color: #666;
        i {
          color: #F45E4B;
        }
      }
      .moneyList {
        font-size: 12px;
        color: #666;
        font-weight: 700;
      }
    }
  }
}
</style>
