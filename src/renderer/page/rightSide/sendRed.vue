<template>
  <div class="sendRed">
    <div :class="['wrap',{'group': conversationType == 3}]">
      <div class="form_item money">
        <span>金额</span>
        <input v-model="inputMoney" type="number" placeholder="0.00" @input="watchInput" />
        <span>元</span>
      </div>
      <div class="form_item total" v-if="conversationType == 3">
        <span>红包个数</span>
        <input v-model="total" type="number" placeholder="1" />
        <span>个</span>
      </div>
      <div class="form_item mt">
        <input v-model="message" type="text" placeholder="恭喜发财，大吉大利！" />
      </div>
      <div class="money_text">
        <i>¥</i>
        {{money}}
      </div>
      <div class="button" @click="send">发送红包</div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { getUserInfo, getGroupInfo, sendRed } from "../../request/api";
export default {
  data() {
    return {
      inputMoney: "",
      money: "0.00",
      message: "",
      total: 1
    };
  },
  computed: {
    ...mapState({
      currentTargetId: state => state.home.currentTargetId,
      conversationType: state => state.home.conversationType,
      targetUserInfo: state => state.user.targetUserInfo,
      accountMoney: state => state.user.accountMoney
    })
  },
  created() {},
  methods: {
    send() {
      if(this.money > this.accountMoney) {
        this.$message('账户余额不足')
        return
      }
      let data = {
        money: this.money,
        total: this.conversationType == 1 ? 1 : this.total,
        targetId: this.currentTargetId,
        targetType: this.conversationType == 1 ? "private" : "group",
        message: this.message ? this.message : "恭喜发财，大吉大利！"
      };
      if (this.inputMoney) {
        sendRed(data)
          .then(res => {
            if (res) {
              this.$message("发送成功");
              let extraObj;
              if (this.conversationType == 3) {
                extraObj = {
                  name1: JSON.parse(window.localStorage.getItem("userInfo"))
                    .nickName,
                  avatar1: window.localStorage.getItem("defaultAvatar"),
                  groupName: this.targetUserInfo.name,
                  groupAvatar: this.targetUserInfo.groupImgUrl,
                  redMessage: this.message
                    ? this.message
                    : "恭喜发财，大吉大利！",
                  redMoneyCount: this.money,
                  operation: "sendRed",
                  redId: res.result
                };
              } else {
                extraObj = {
                  name1: JSON.parse(window.localStorage.getItem("userInfo"))
                    .nickName,
                  avatar1: window.localStorage.getItem("defaultAvatar"),
                  name2: this.targetUserInfo.nickName,
                  avatar2: this.targetUserInfo.headImgUrl,
                  redMessage: this.message
                    ? this.message
                    : "恭喜发财，大吉大利！",
                  redMoneyCount: this.money,
                  operation: "sendRed",
                  redId: res.result
                };
              }
              var msg = new RongIMLib.TextMessage({
                content: "[红包]",
                extra: JSON.stringify(extraObj)
              });
              var conversationType;
              if (this.conversationType == 1) {
                conversationType = RongIMLib.ConversationType.PRIVATE;
              } else if (this.conversationType == 3) {
                conversationType = RongIMLib.ConversationType.GROUP;
              }
              var targetId = this.targetUserInfo.id; // 目标 Id

              RongIMClient.getInstance().sendMessage(
                conversationType,
                targetId,
                msg,
                {
                  onSuccess: message => {
                    console.log("发送消息成功, 用户信息为: ", message);
                    let money = this.accountMoney - this.money
                    message.content.extra = JSON.parse(message.content.extra);
                    // 红包减少
                    this.$store.commit('SETACCOUNTMONEY', money)
                    this.$store.commit("PUSHHISTORY", message);
                    var conversationTypes = null;
                    var count = 150;
                    RongIMClient.getInstance().getConversationList(
                      {
                        onSuccess: list => {
                          console.log(list);
                          let conversationList = list;
                          this.$store.dispatch(
                            "getConversation",
                            conversationList
                          );
                        },
                        onError: function(error) {
                          console.log("获取会话列表失败", error);
                        }
                      },
                      conversationTypes,
                      count
                    );
                  },
                  onError: function(errorCode) {
                    console.log("发送消息失败", errorCode);
                  }
                }
              );
            }
          })
          .catch(err => {
            this.$message(err.msg);
          });
      }
    },
    watchInput() {
      if (this.inputMoney) {
        this.money = this.inputMoney;
      } else {
        this.money = "0.00";
      }
    }
  }
};
</script>

<style scoped lang="scss">
.sendRed {
  .wrap {
    width: 250px;
    height: 300px;
    background-color: #f5f5f5;
    padding-top: 35px;
    .form_item {
      width: 230px;
      height: 40px;
      background-color: #fff;
      border: 1px solid #eeeeee;
      border-radius: 2px;
      margin: 0 auto;
      padding: 0 15px;
      span {
        color: #333333;
        font-size: 14px;
      }
      input {
        height: 100%;
      }
    }
    .money {
      display: flex;
      align-items: center;
      input {
        text-align: right;
        width: 77%;
        padding-right: 10px;
        padding-top: 3px;
      }
    }
    .mt {
      margin-top: 20px;
    }
    .money_text {
      text-align: center;
      font-size: 30px;
      color: #333;
      margin-top: 50px;
      i {
        font-size: 14px;
        margin-right: 5px;
      }
    }
    .button {
      width: 83px;
      height: 32px;
      text-align: center;
      line-height: 32px;
      color: #fff;
      font-size: 14px;
      background: rgba(255, 43, 22, 1);
      border: 1px solid #eeeeee;
      border-radius: 5px;
      margin: 15px auto 0;
      cursor: pointer;
    }
  }
  .group {
    .total {
      display: flex;
      align-items: center;
      margin-top: 10px;
      input {
        text-align: right;
        width: 63%;
        padding-right: 10px;
        padding-top: 3px;
      }
    }
    .money_text {
      margin-top: 20px;
    }
    .mt {
      margin-top: 10px;
    }
  }
  input[type="number"]::-webkit-outer-spin-button,
  input[type="number"]::-webkit-inner-spin-button {
    -webkit-appearance: none !important;
    margin: 0;
  }
  /*在firefox下移除input[number]的上下箭头*/
  input[type="number"] {
    -moz-appearance: textfield;
  }
}
</style>
