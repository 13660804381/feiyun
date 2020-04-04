<template>
  <div class="rightSide" @click="clearUnreadMsg">
    <div class="operate">
      <img src="@/assets/image/close_icon.png" alt @click="closeWindow" />
      <img src="@/assets/image/small_icon.png" alt @click="hideWindow" />
    </div>
    <header v-if="!isGroup" :class="{'drag': !chatDrawer}">
      {{targetUserInfo.remark?targetUserInfo.remark:targetUserInfo.nickName}}
      <span
        class="icon"
        @click="showChatDrawer"
      >
        <i class="el-icon-more"></i>
      </span>
    </header>
    <header v-else :class="{'drag': !drawer}">
      {{targetUserInfo.name}}
      <span class="icon" @click="showDrawer">
        <i class="el-icon-more"></i>
      </span>
    </header>
    <el-drawer
      size="260px"
      title="我是标题"
      :visible.sync="drawer"
      :with-header="false"
      :destroy-on-close="true"
    >
      <groupChatDetails @hideDrawer="hideDrawer"></groupChatDetails>
    </el-drawer>
    <el-drawer
      size="260px"
      title="我是标题"
      :visible.sync="chatDrawer"
      :with-header="false"
      :destroy-on-close="true"
    >
      <friendChatDetails @hideChatDrawer="hideChatDrawer"></friendChatDetails>
    </el-drawer>
    <div class="chat_content">
      <div class="wrap" id="wrap" v-if="!isGroup">
        <div
          class="chat_item"
          v-for="(item, i) in historyList"
          :key="i"
          @click.right="rightClick(item, i)"
        >
          <div class="timeText" v-if="item.showTime">{{item.timeText}}</div>
          <div
            v-if="item.content.extra.operation !== 'recallMessage'"
            :class="[{'leftChat':item.targetId == item.senderUserId},{'rightChat':item.targetId !== item.senderUserId}]"
          >
            <div
              v-if="showMenu == i"
              :class="['menu_tip',item.targetId !== item.senderUserId ? 'rightPosition' : 'leftPosition', {'top': i == historyList.length-1}]"
            >
              <div v-if="item.targetId == item.senderUserId">
                <span
                  v-for="(menuItem, j) in leftMenuArr"
                  :key="j"
                  @click="menuOperate(menuItem,item,i)"
                >{{menuItem.text}}</span>
              </div>
              <div v-else>
                <span
                  v-for="(menuItem, j) in rightMenuArr"
                  :key="j"
                  @click="menuOperate(menuItem,item,i)"
                >{{menuItem.text}}</span>
              </div>
            </div>
            <div :class="['avatar',{'mouseType':item.targetId == item.senderUserId}]">
              <img :src="item.content.extra.avatar1" alt />
            </div>
            <div
              class="text_message"
              v-if="item.objectName == 'RC:TxtMsg' && item.content.extra.operation !== 'sendRed'"
            >
              <p class="text" v-html="item.content.content"></p>
            </div>
            <div class="img_message" v-else-if="item.objectName == 'RC:ImgMsg'">
              <!-- <img class="image" :src="item.content.imageUri" alt /> -->
              <!-- <el-image :src="item.content.imageUri"></el-image> -->
              <el-image
                style="width: 100px; height: 100px"
                :src="item.content.imageUri"
                :preview-src-list="srcList"
              >
                <div slot="placeholder" class="image-slot">
                  加载中
                  <span class="dot">...</span>
                </div>
              </el-image>
            </div>
            <div
              class="text_message"
              v-else-if="item.objectName == 'RC:TxtMsg' && item.content.extra.operation == 'sendRed' && item.targetId == item.senderUserId"
              @click="openRed(item)"
            >
              <div class="text">红包消息，请在手机端查看</div>
            </div>
            <div
              class="redpack_message"
              v-else-if="item.objectName == 'RC:TxtMsg' && item.content.extra.operation == 'sendRed' && item.targetId !== item.senderUserId"
              @click="openRed(item)"
            >
              <div class="top_content">
                <img src="@/assets/image/redPack_icon.png" alt />
                <span>{{item.content.extra.redMessage}}</span>
              </div>
              <div class="bottom_content">Chat红包</div>
            </div>
            <div class="voice_text text_message" v-else-if="item.objectName == 'RC:VcMsg'">
              <p class="text">语音消息，请在手机端查看</p>
            </div>
          </div>
          <div v-else class="recallMessage">
            <span v-if="item.targetId == item.senderUserId">对方</span>
            <span v-else>你</span>撤回了一条消息
          </div>
        </div>
      </div>
      <div class="wrap" id="wrap" v-else>
        <div class="chat_item" v-for="(item, i) in historyList" :key="i">
          <div class="timeText" v-if="item.showTime">{{item.timeText}}</div>
          <div
            v-if="item.objectName !== 'RC:GrpNtf' && item.content.extra.operation !== 'recallMessage'"
            :class="[{'leftChat':myId !== item.senderUserId},{'rightChat':myId == item.senderUserId}]"
            @click.right="rightClick(item,i)"
          >
            <div
              v-if="showMenu == i"
              :class="['menu_tip',myId !== item.senderUserId ? 'leftPosition' : 'rightPosition', {'top': i == historyList.length-1}]"
            >
              <div v-if="myId !== item.senderUserId">
                <span
                  v-for="(menuItem, j) in leftMenuArr"
                  :key="j"
                  @click="menuOperate(menuItem,item,i)"
                >{{menuItem.text}}</span>
              </div>
              <div v-else>
                <span
                  v-for="(menuItem, j) in rightMenuArr"
                  :key="j"
                  @click="menuOperate(menuItem,item,i)"
                >{{menuItem.text}}</span>
              </div>
            </div>
            <div class="avatar">
              <img :src="item.content.extra.avatar1" alt />
            </div>
            <div
              class="text_message"
              v-if="item.objectName == 'RC:TxtMsg' && item.content.extra.operation !== 'sendRed' && item.content.extra.operation !== 'announcement'"
            >
              <span class="nickName">{{item.content.extra.name1}}</span>
              <p class="text mt5" v-html="item.content.content"></p>
            </div>
            <div
              class="text_message"
              v-else-if="item.objectName == 'RC:TxtMsg' && item.content.extra.operation == 'announcement'"
            >
              <span class="nickName">{{item.content.extra.name1}}</span>
              <p class="text mt5">
                @所有人
                <br />修改了群公告,请前往手机APP查看
              </p>
            </div>
            <div class="img_message" v-else-if="item.objectName == 'RC:ImgMsg'">
              <span class="nickName">{{item.content.extra.name1}}</span>
              <!-- <img class="image" :src="item.content.imageUri" alt /> -->
              <el-image
                style="width: 100px; height: 100px"
                :src="item.content.imageUri"
                :preview-src-list="srcList"
              >
                <div slot="placeholder" class="image-slot">
                  加载中
                  <span class="dot">...</span>
                </div>
              </el-image>
            </div>
            <div
              class="text_message"
              v-else-if="item.objectName == 'RC:TxtMsg' && item.content.extra.operation == 'sendRed' && myId !== item.senderUserId"
            >
              <p class="text">红包消息，请在手机端查看</p>
            </div>
            <div
              class="redpack_message"
              v-else-if="item.objectName == 'RC:TxtMsg' && item.content.extra.operation == 'sendRed' && myId == item.senderUserId"
              @click="openRed(item)"
            >
              <div class="top_content">
                <img src="@/assets/image/redPack_icon.png" alt />
                <span>{{item.content.extra.redMessage}}</span>
              </div>
              <div class="bottom_content">Chat红包</div>
            </div>
            <div class="voice_text text_message" v-else-if="item.objectName == 'RC:VcMsg'">
              <p class="text">语音消息，请在手机端查看</p>
            </div>
          </div>
          <div
            class="system_list"
            v-if="item.objectName == 'RC:GrpNtf' && item.content.extra.operation !== 'recallMessage'"
          >
            <span>{{item.content.extra.name1}} {{item.content.message}}</span>
          </div>
          <div
            v-else-if="item.content.extra.operation == 'recallMessage'"
            class="recallMessage"
          >{{item.content.extra.name1}}撤回了一条消息</div>
        </div>
      </div>
    </div>
    <div class="input_box">
      <div class="banner_wrap" v-if="isGroup">
        <div class="mark" v-if="isBanner && isInWhiteList == 0">您已被禁言</div>
        <div class="mark" v-else-if="isInBlackList == 1">您已被禁言</div>
      </div>
      <div class="tool_bar">
        <ul>
          <!-- <li>
            <img src="@/assets/image/upload.png" alt />
          </li>-->
          <li class="upLoadImg">
            <input
              type="file"
              name="file"
              id="input_file"
              @change="upLoadImgFn"
              accept="image/gif, image/jpeg, image/jpg, image/png, image/svg"
            />
            <img src="@/assets/image/picture.png" alt />
          </li>
          <li>
            <el-popover placement="top-start" trigger="click">
              <div class="faceList">
                <div
                  class="faceItem"
                  v-for="(item,i) in faceList"
                  :key="i"
                  @click="insertEmoji(item)"
                >
                  <span v-html="item.html"></span>
                </div>
              </div>
              <span slot="reference">
                <img src="@/assets/image/emoji.png" alt />
              </span>
            </el-popover>
          </li>
          <li>
            <el-popover
              placement="top-start"
              trigger="click"
              @hide="hideSendRed"
              @show="showSendRed"
            >
              <sendRed v-if="sendRedStatus"></sendRed>
              <span slot="reference">
                <img src="@/assets/image/sendRed.png" alt />
              </span>
            </el-popover>
          </li>
          <li @click="screenShot">
            <img src="@/assets/image/screenShot.png" alt />
          </li>
        </ul>
      </div>
      <div class="text_input">
        <!-- <textarea v-model="msg" autofocus @keydown.enter="sendMsg"></textarea> -->
        <div
          class="editor"
          contenteditable="true"
          ref="editor"
          @keyup="getCursor"
          @keydown.enter.prevent="submit"
          @click="getCursor"
        ></div>
      </div>
      <div class="send_btn" @click="btn_submit">
        发送
        <i class="el-icon-s-promotion"></i>
      </div>
    </div>
    <el-dialog :visible.sync="showRedDetails" width="230px">
      <openRedPack :redPacketObj="redPacketObj" v-if="showRedDetails"></openRedPack>
    </el-dialog>
    <el-dialog title="提示" :visible.sync="imgDialog" class="sendImgPrewiew">
      <img :src="imgDialogUrl" alt />
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelSendPic">取消发送该图片</el-button>
        <el-button type="primary" @click="confirmSendPic">确认发送该图片</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
const { ipcRenderer: ipc } = require("electron");
import sendRed from "./sendRed";
import openRedPack from "./showRedPack";
import groupChatDetails from "./groupChatDetails";
import friendChatDetails from "./friendChatDetails";
import { mapState } from "vuex";
import {
  getUserInfo,
  getGroupInfo,
  upload,
  getMemberDetails
} from "../../request/api";
import paste from "../../assets/js/paste.js";
import {
  getCursorPosition,
  setCursorPosition
} from "../../assets/js/cursorPosition.js";
const faceListJson = require("../../assets/js/emotion.json");
export default {
  data() {
    return {
      msg: "",
      hasHistroy: 0,
      faceList: [],
      faceList2: [],
      historyTime: 0,
      editor: null,
      cursorPosition: 0,
      showRedDetails: false,
      redPacketObj: "",
      isGroup: false,
      myId: JSON.parse(window.localStorage.getItem("userInfo")).id,
      imgDialog: false,
      imgDialogUrl: "",
      imgDialogUrl2: "",
      sendRedStatus: false,
      hasHistroyMsg: "",
      showMenu: null,
      leftMenuArr: [
        { text: "复制", type: "copy" },
        { text: "删除", type: "delete" }
      ],
      rightMenuArr: [
        { text: "复制", type: "copy" },
        { text: "删除", type: "delete" },
        { text: "撤回", type: "recall" }
      ],
      memberObj: {},
      drawer: false,
      chatDrawer: false,
      userInfoDialog: false,
      isBanner: false,
      isCreator: "",
      isInBlackList: "",
      isAdmin: "",
      isInWhiteList: "",
      bottomArrvie: true,
      copyImg: "",
      srcList: []
    };
  },
  components: {
    sendRed,
    openRedPack,
    groupChatDetails,
    friendChatDetails
  },
  computed: {
    ...mapState({
      historyList: state => state.home.historyList,
      nickName: state => state.user.userInfo.nickName,
      userAvatar: state => state.user.userAvatar,
      targetUserInfo: state => state.user.targetUserInfo,
      currentTargetId: state => state.home.currentTargetId,
      conversationType: state => state.home.conversationType,
      remarkList: state => state.home.remarkList
    })
  },
  watch: {
    currentTargetId() {
      this.srcList = [];
      if (this.conversationType == 1) {
        this.getUserInfo();
      } else {
        this.getGroupInfo();
        this.getGroupDetailsInfo();
      }
    },
    historyList: {
      deep: true,
      handler: function(newValue, oldValue) {
        let clientHeight = document.getElementById("wrap").clientHeight;
        let scrollHeight = document.getElementById("wrap").scrollHeight;
        let scrollTopHeight = document.getElementById("wrap").scrollTop;
        if (clientHeight + scrollTopHeight >= scrollHeight) {
          // 滚动条不在底部
          this.$nextTick(() => {
            var box = document.getElementById("wrap");
            box.scrollTop = box.scrollHeight;
          });
        } else {
        }
      }
    }
  },
  created() {
    for (let i = 0; i < faceListJson.length; i++) {
      let obj = {
        text: faceListJson[i].text,
        html: `<img src="${require(`../../assets/image/emotion/${faceListJson[i].name}.png`)}"/>`
      };
      obj[faceListJson[i].text] = obj.html;
      this.faceList.push(obj);
    }
    this.formatFace();
    if (this.conversationType == 1) {
      this.getUserInfo();
    } else {
      this.getGroupInfo();
      this.getGroupDetailsInfo();
    }
  },
  mounted() {
    document
      .querySelector("#wrap")
      .addEventListener(
        "scroll",
        this.debounce(this.getHistoryListByScroll, 100)
      );
    this.editor = this.$refs["editor"];
    document
      .querySelector(".editor")
      .addEventListener("paste", this.pastePic, false);
  },
  methods: {
    hideWindow() {
      ipc.send("min");
    },
    closeWindow() {
      ipc.send("close");
    },
    clearUnreadMsg() {
      this.showMenu = null;
      let conversationType;
      if (this.conversationType == 1) {
        conversationType = RongIMLib.ConversationType.PRIVATE;
      } else if (this.conversationType == 3) {
        conversationType = RongIMLib.ConversationType.GROUP;
      }
      RongIMClient.getInstance().clearUnreadCount(
        conversationType,
        this.currentTargetId,
        {
          onSuccess: () => {
            var conversationTypes = null;
            var count = 150;
            RongIMClient.getInstance().getConversationList(
              {
                onSuccess: list => {
                  let conversationList = list;
                  this.$store.dispatch("getConversation", conversationList);
                },
                onError: function(error) {
                  console.log("获取会话列表失败", error);
                }
              },
              conversationTypes,
              count
            );
            // this.getUserInfo(targetId);
          },
          onError: function(error) {
            console.log("清除指定会话未读消息数失败", error);
          }
        }
      );
    },
    recallMessage() {
      RongIMClient.getInstance().sendRecallMessage(recallMessage, {
        onSuccess: function(message) {
          console.log("撤回成功", message);
        },
        onError: function(errorCode) {
          console.log("撤回失败", errorCode);
        }
      });
    },
    btn_submit() {
      let value = document.querySelector(".editor").innerHTML;
      this.sendMsg(value);
      document.querySelector(".editor").innerHTML = "";
    },
    submit(e) {
      const value = e.target.innerHTML.replace(/[\n\r]$/, "");
      if (value) {
        this.sendMsg(value);
        e.target.innerText = "";
      }
    },
    getCursor() {
      this.cursorPosition = getCursorPosition(this.editor);
    },
    insertEmoji(emoji) {
      const text = this.editor.innerHTML;
      this.editor.innerHTML += emoji.text;
    },
    sendMsg(value) {
      if (!value.trim()) return;
      let extraObj;
      if (this.isGroup) {
        extraObj = {
          name1: JSON.parse(window.localStorage.getItem("userInfo")).nickName,
          avatar1: window.localStorage.getItem("defaultAvatar"),
          groupName: this.targetUserInfo.name,
          groupAvatar: this.targetUserInfo.groupImgUrl
        };
      } else {
        extraObj = {
          name1: JSON.parse(window.localStorage.getItem("userInfo")).nickName,
          avatar1: window.localStorage.getItem("defaultAvatar"),
          name2: this.targetUserInfo.nickName,
          avatar2: this.targetUserInfo.headImgUrl
        };
      }
      var msg = new RongIMLib.TextMessage({
        content: value,
        extra: JSON.stringify(extraObj)
      });
      var conversationType;
      var targetId = this.targetUserInfo.id; // 目标 Id
      if (this.conversationType == 1) {
        conversationType = RongIMLib.ConversationType.PRIVATE;
      } else if (this.conversationType == 3) {
        conversationType = RongIMLib.ConversationType.GROUP;
      }
      RongIMClient.getInstance().sendMessage(conversationType, targetId, msg, {
        onSuccess: message => {
          var reg = /\[.+?\]/g;
          message.content.extra = JSON.parse(message.content.extra);
          if (message.content.content) {
            message.content.content = message.content.content.replace(
              reg,
              (a, b) => {
                return this.faceList2[a] ? this.faceList2[a] : a;
              }
            );
          } else {
          }
          this.$store.commit("PUSHHISTORY", message);
          this.$nextTick(() => {
            var box = document.getElementById("wrap");
            box.scrollTop = box.scrollHeight;
          });
          this.getConversationList();
        },
        onError: errorCode => {
          console.log("发送消息失败", errorCode);
          if (errorCode == 22408) {
            this.$message("群组被禁言");
          }
        }
      });
    },
    getUserInfo() {
      getUserInfo({ ids: this.currentTargetId })
        .then(res => {
          if (res) {
            this.isGroup = false;
            let memberObj = {};
            memberObj = res.result.friends[0];
            this.memberObj = memberObj;
            this.$store.commit("USER_TARGETUSERINFO", memberObj);
            this.getHistory(0);
          }
        })
        .catch(err => {});
    },
    getGroupInfo() {
      getGroupInfo({ groupIds: this.currentTargetId })
        .then(res => {
          if (res) {
            this.isGroup = true;
            let groupObj = {};
            groupObj = res.result[0];
            if (groupObj.isBlock == 0) {
              this.isBanner = false;
            } else {
              this.isBanner = true;
            }
            this.$store.commit("USER_TARGETUSERINFO", groupObj);
            this.getHistory(0);
          }
        })
        .catch(err => {});
    },
    getGroupDetailsInfo() {
      getMemberDetails({ id: this.currentTargetId }).then(res => {
        if (res) {
          this.leftMenuArr = [
            { text: "复制", type: "copy" },
            { text: "删除", type: "delete" }
          ];
          this.isCreator = res.result.isCreator;
          this.isAdmin = res.result.isAdmin;
          this.isInWhiteList = res.result.isInWhiteList;
          this.isInBlackList = res.result.isInBlackList;
          if (this.isAdmin || this.isCreator) {
            this.leftMenuArr.push({ text: "撤回", type: "recall" });
          }
        }
      });
    },
    // 获取历史消息
    getHistory(historyTime) {
      var conversationType;
      if (this.conversationType == 1) {
        conversationType = RongIMLib.ConversationType.PRIVATE;
      } else if (this.conversationType == 3) {
        conversationType = RongIMLib.ConversationType.GROUP;
      }
      var targetId = this.targetUserInfo.id;
      var count = 20;
      RongIMLib.RongIMClient.getInstance().getHistoryMessages(
        conversationType,
        targetId,
        historyTime,
        count,
        {
          onSuccess: (list, hasMsg) => {
            this.hasHistroyMsg = hasMsg;
            /* 
              list: 获取的历史消息列表
              hasMsg: 是否还有历史消息可以获取
            */
            let historyList = list;
            console.log(historyList);
            if (historyList.length == 0) {
              // this.$store.commit("SETHISTORYLIST", []);
              return;
            }
            // this.timeStrap = historyList[0].sentTime;
            for (let i = 0; i < historyList.length; i++) {
              if (historyList[i].objectName == "RC:ImgMsg") {
                this.srcList.push(historyList[i].content.imageUri);
              }
              if (i >= 1) {
                let time =
                  historyList[i].sentTime - historyList[i - 1].sentTime;
                if (time > 3000000) {
                  historyList[i].showTime = true;
                  historyList[i].timeText = this.formatFn(
                    historyList[i].sentTime
                  );
                } else {
                  historyList[i].showTime = false;
                }
              }
              if (
                historyList[i].content.messageName == "RecallCommandMessage"
              ) {
                historyList.splice(i, 1);
              }
              historyList[i].content.extra = this.transExtra(
                historyList[i].content.extra
              );
              var reg = /\[.+?\]/g;
              if (historyList[i].content.content) {
                historyList[i].content.content = historyList[
                  i
                ].content.content.replace(reg, (a, b) => {
                  return this.faceList2[a] ? this.faceList2[a] : a;
                });
              }
              for (let j = 0; j < this.remarkList.length; j++) {
                if (
                  this.remarkList[j].friendId == historyList[i].senderUserId
                ) {
                  if (this.remarkList[j].remark) {
                    if (historyList[i].content.extra) {
                      historyList[i].content.extra.name1 = this.remarkList[
                        j
                      ].remark;
                    }
                  }
                }
              }
            }
            if (historyTime > 0) {
              historyList = historyList.reverse();
              for (let i = 0; i < historyList.length; i++) {
                this.$store.commit("UNSHIFTHISTORY", historyList[i]);
              }
            } else {
              this.$store.commit("SETHISTORYLIST", historyList);
            }
          },
          onError: function(error) {
            // 请排查：单群聊消息云存储是否开通
            console.log("获取历史消息失败", error);
          }
        }
      );
    },
    // 获取会话列表
    getConversationList() {
      var conversationTypes = null;
      var count = 150;
      RongIMClient.getInstance().getConversationList(
        {
          onSuccess: list => {
            console.log(list);
            let conversationList = list;
            this.$store.dispatch("getConversation", conversationList);
          },
          onError: function(error) {
            console.log("获取会话列表失败", error);
          }
        },
        conversationTypes,
        count
      );
    },
    // 滚动防抖
    debounce(fn, wait) {
      var timeout = null;
      return function() {
        if (timeout !== null) clearTimeout(timeout);
        timeout = setTimeout(fn, wait);
      };
    },
    getHistoryListByScroll() {
      if (!this.hasHistroyMsg) return;
      let scrollTopHeight = document.querySelector("#wrap").scrollTop;
      let clientHeight = document.querySelector("#wrap").clientHeight;
      let scrollHeight = document.querySelector("#wrap").scrollHeight;
      if (scrollTopHeight + clientHeight >= scrollHeight) {
        this.bottomArrvie = true;
      } else {
        this.bottomArrvie = false;
      }
      if (scrollTopHeight == 0) {
        if (this.historyList.length <= 0) return;
        let historyTime = this.historyList[0].sentTime;
        setTimeout(() => {
          this.getHistory(historyTime);
        }, 250);
      }
    },
    formatFace() {
      let faceObj = {};
      let obj = faceListJson;
      for (let i = 0; i < obj.length; i++) {
        faceObj[
          obj[i].text
        ] = `<img src="${require(`../../assets/image/emotion/${obj[i].name}.png`)}"/>`;
      }
      this.faceList2 = faceObj;
    },
    openRed(item) {
      this.showRedDetails = true;
      this.redPacketObj = item;
      if (item.targetId == item.senderUserId) {
      }
    },
    transExtra(arg) {
      var result = "";
      try {
        result = eval("(" + arg + ")");
      } catch (e) {
        // result = arg.slice(1, -1);
      } finally {
      }
      return result;
    },
    upLoadImgFn(event) {
      let base64src;
      let file = event.target.files[0];
      let size = file.size;
      if (size > 2000000) {
        this.$message("发送图片大小不能大于2m");
        return;
      }
      let reader = new FileReader();
      let img = new Image();
      // 读取图片
      reader.readAsDataURL(file);
      // 读取完毕后的操作
      reader.onloadend = e => {
        img.src = e.target.result;
        // 这里的e.target就是reader
        // console.log(reader.result)
        // reader.result就是图片的base64字符串
        base64src = reader.result;
        // 上传图片
        upload({ img: base64src }).then(res => {
          if (res) {
            this.imgDialog = true;
            this.imgDialogUrl = res.result;
            this.imgDialogUrl2 = base64src;
          }
        });
      };
    },
    // 发送图片消息
    sendImgMsg(src, base64src) {
      var base64Str = this.zip(src); // 压缩后的 base64 略缩图, 用来快速展示图片
      base64src.replace(/^data:image\/\w+;base64,/, "");
      var imageUri = src; // 上传到自己服务器的 url. 用来展示高清图片
      let extraObj;
      if (this.isGroup) {
        extraObj = {
          name1: JSON.parse(window.localStorage.getItem("userInfo")).nickName,
          avatar1: window.localStorage.getItem("defaultAvatar"),
          groupName: this.targetUserInfo.name,
          groupAvatar: this.targetUserInfo.groupImgUrl
        };
      } else {
        extraObj = {
          name1: JSON.parse(window.localStorage.getItem("userInfo")).nickName,
          avatar1: window.localStorage.getItem("defaultAvatar"),
          name2: this.targetUserInfo.nickName,
          avatar2: this.targetUserInfo.headImgUrl
        };
      }
      var msg = new RongIMLib.ImageMessage({
        content: base64Str,
        imageUri: imageUri,
        extra: JSON.stringify(extraObj)
      });
      var conversationType;
      var targetId = this.targetUserInfo.id; // 目标 Id
      if (this.conversationType == 1) {
        conversationType = RongIMLib.ConversationType.PRIVATE;
      } else if (this.conversationType == 3) {
        conversationType = RongIMLib.ConversationType.GROUP;
      }
      RongIMClient.getInstance().sendMessage(conversationType, targetId, msg, {
        onSuccess: message => {
          console.log("发送消息成功, 用户信息为: ", message);
          message.content.extra = JSON.parse(message.content.extra);
          this.$store.commit("PUSHHISTORY", message);
          this.srcList.push(imageUri);
          this.getConversationList();
        },
        onError: function(errorCode) {
          console.log("发送图片消息失败", errorCode);
        }
      });
    },
    zip(src) {
      // 调用函数处理图片
      let base64;
      this.dealImage(
        src,
        {
          // 注意：在pc端可以用绝对路径或相对路径，移动端最好用绝对路径
          // width: 1000,
          quality: 0.1
        },
        base => {
          base64 = base;
          // document.getElementById("transform").src = base;
          // var mb = this.showSize(base);
        }
      );
      return base64;
    },
    dealImage(path, obj, callback) {
      var img = new Image();
      img.src = path;
      img.onload = function() {
        var that = this;
        var ext = path.substring(path.lastIndexOf(".") + 1).toLowerCase();
        // 默认按比例压缩
        var w = that.width,
          h = that.height,
          scale = w / h;
        w = obj.width || w;
        h = obj.height || w / scale;
        var quality = obj.quality; // 默认图片质量为0.7,可以为image/jpeg或image/webp类型的图片设置图片质量，取值0-1，超出则以默认值0.92替代
        //生成canvas
        var canvas = document.createElement("canvas");
        var ctx = canvas.getContext("2d");
        // 创建属性节点
        var anw = document.createAttribute("width");
        anw.nodeValue = w;
        var anh = document.createAttribute("height");
        anh.nodeValue = h;
        canvas.setAttributeNode(anw);
        canvas.setAttributeNode(anh);
        ctx.drawImage(that, 0, 0, w, h);
        // 图像质量
        if (obj.quality && obj.quality <= 1 && obj.quality > 0) {
          quality = obj.quality;
        }
        // quality值越小，所绘制出的图像越模糊
        console.log("tup", ext);
        var base64 = canvas.toDataURL("image/jpeg", quality);
        // 回调函数返回base64的值
        callback(base64);
      };
    },
    rightClick(item, i) {
      this.showMenu = i;
    },
    menuOperate(item, messageItem, i) {
      var targetId = this.targetUserInfo.id; // 目标 Id
      let conversationType;
      if (this.conversationType == 1) {
        conversationType = RongIMLib.ConversationType.PRIVATE;
      } else if (this.conversationType == 3) {
        conversationType = RongIMLib.ConversationType.GROUP;
      }
      if (item.type == "copy") {
        this.copyImg = "";
        if (messageItem.objectName == "RC:TxtMsg") {
          this.$copyText(messageItem.content.content).then(e => {
            this.$message("复制成功");
          });
        } else if (messageItem.objectName == "RC:ImgMsg") {
          this.getBase64(messageItem.content.imageUri);
        }
      } else if (item.type == "delete") {
        var messages = [
          {
            messageUId: messageItem.messageUId,
            sentTime: messageItem.sentTime,
            messageDirection: messageItem.messageDirection
          }
        ];
        RongIMLib.RongIMClient.getInstance().deleteRemoteMessages(
          conversationType,
          targetId,
          messages,
          {
            onSuccess: () => {
              if (this.historyList.length > 0) {
                this.historyList.splice(i, 1);
                this.$store.commit("SETHISTORYLIST", this.historyList);
              }
            },
            onError: function(error) {
              console.log("清除失败", error);
            }
          }
        );
      } else {
        // recallMessage 为需要撤回的消息对象
        messageItem.senderUserId = window.localStorage.getItem("myId");
        RongIMClient.getInstance().sendRecallMessage(messageItem, {
          onSuccess: message => {
            if (this.historyList.length > 0) {
              this.historyList.splice(i, 1);
              this.$store.commit("SETHISTORYLIST", this.historyList);
            }
            let extraObj;
            if (this.isGroup) {
              extraObj = {
                name1: JSON.parse(window.localStorage.getItem("userInfo"))
                  .nickName,
                avatar1: window.localStorage.getItem("defaultAvatar"),
                groupName: this.targetUserInfo.name,
                groupAvatar: this.targetUserInfo.groupImgUrl,
                operation: "recallMessage"
              };
            } else {
              extraObj = {
                name1: JSON.parse(window.localStorage.getItem("userInfo"))
                  .nickName,
                avatar1: window.localStorage.getItem("defaultAvatar"),
                name2: this.targetUserInfo.nickName,
                avatar2: this.targetUserInfo.headImgUrl,
                operation: "recallMessage"
              };
            }
            var msg = new RongIMLib.TextMessage({
              content: "撤回了一条消息",
              extra: JSON.stringify(extraObj)
            });
            var conversationType;
            var targetId = this.targetUserInfo.id; // 目标 Id
            if (this.conversationType == 1) {
              conversationType = RongIMLib.ConversationType.PRIVATE;
            } else if (this.conversationType == 3) {
              conversationType = RongIMLib.ConversationType.GROUP;
            }
            RongIMClient.getInstance().sendMessage(
              conversationType,
              targetId,
              msg,
              {
                onSuccess: message => {
                  console.log("发送消息成功, 用户信息为: ", message);
                  var reg = /\[.+?\]/g;
                  message.content.extra = JSON.parse(message.content.extra);
                  if (message.content.content) {
                    message.content.content = message.content.content.replace(
                      reg,
                      (a, b) => {
                        return this.faceList2[a] ? this.faceList2[a] : a;
                      }
                    );
                  } else {
                  }
                  this.$store.commit("PUSHHISTORY", message);
                  this.$nextTick(() => {
                    var box = document.getElementById("wrap");
                    box.scrollTop = box.scrollHeight;
                  });
                  this.getConversationList();
                },
                onError: errorCode => {
                  console.log("发送消息失败", errorCode);
                  if (errorCode == 22408) {
                    this.$message("群组被禁言");
                  }
                }
              }
            );
          },
          onError: function(errorCode) {
            console.log("撤回失败", errorCode);
          }
        });
      }
    },
    getBase64(imgUrl) {
      let _self = this;
      _self.$copyText(imgUrl).then(e => {
        _self.$message("复制成功");
      });
      window.URL = window.URL || window.webkitURL;
      var xhr = new XMLHttpRequest();
      xhr.open("get", imgUrl, true);
      // 至关重要
      xhr.responseType = "blob";
      xhr.onload = function() {
        if (this.status == 200) {
          //得到一个blob对象
          var blob = this.response;
          // 至关重要
          let oFileReader = new FileReader();
          oFileReader.onloadend = function(e) {
            // 此处拿到的已经是 base64的图片了
            let base64 = e.target.result;
            _self.copyImg = base64;
          };
          oFileReader.readAsDataURL(blob);
        }
      };
      xhr.send();
    },
    hideSendRed() {
      this.sendRedStatus = false;
    },
    showSendRed() {
      this.sendRedStatus = true;
    },
    showDrawer() {
      this.drawer = true;
    },
    showChatDrawer() {
      this.chatDrawer = true;
    },
    hideDrawer(data) {
      if (data.a == 0) {
        this.drawer = false;
      } else {
        this.getGroupDetailsInfo();
      }
    },
    hideChatDrawer(data) {
      if (data.a == 0) {
        this.chatDrawer = false;
      } else {
        // this.getGroupDetailsInfo();
      }
    },
    screenShot() {
      return new Promise((resolve, reject) => {
        const { execFile } = require("child_process");
        var screenWin = execFile(`${__static}/PrintScr.exe`);
        screenWin.on("exit", function(code) {
          if (code == 1) {
            let pngs = require("electron")
              .clipboard.readImage()
              .toPNG();
            let imgData = new Buffer.from(pngs, "base64");
            let imgs =
              "data:image/png;base64," +
              btoa(
                new Uint8Array(imgData).reduce(
                  (data, byte) => data + String.fromCharCode(byte),
                  ""
                )
              );
            resolve(imgs);
          } else {
            reject();
          }
        });
      })
        .then(res => {
          if (res.length > 22) {
            upload({ img: res }).then(res1 => {
              if (res1) {
                this.imgDialog = true;
                this.imgDialogUrl = res1.result;
                this.imgDialogUrl2 = res;
                // this.sendImgMsg(res1.result, res);
              }
            });
          }
        })
        .catch(err => {
          console.log();
        });
    },
    confirmSendPic() {
      this.imgDialog = false;
      this.copyImg = "";
      document.querySelector(".editor").innerHTML = "";
      this.sendImgMsg(this.imgDialogUrl, this.imgDialogUrl2);
    },
    cancelSendPic() {
      this.imgDialog = false;
      this.copyImg = "";
    },
    pastePic(e) {
      if (this.copyImg.indexOf("base64") > -1) {
        upload({ img: this.copyImg }).then(res => {
          if (res) {
            this.imgDialog = true;
            this.imgDialogUrl = res.result;
            this.imgDialogUrl2 = this.copyImg;
          }
        });
        return;
      }
      var cbd = e.clipboardData;
      var ua = window.navigator.userAgent;
      // 如果是 Safari 直接 return
      if (!(e.clipboardData && e.clipboardData.items)) {
        return;
      }
      // Mac平台下Chrome49版本以下 复制Finder中的文件的Bug Hack掉
      if (
        cbd.items &&
        cbd.items.length === 2 &&
        cbd.items[0].kind === "string" &&
        cbd.items[1].kind === "file" &&
        cbd.types &&
        cbd.types.length === 2 &&
        cbd.types[0] === "text/plain" &&
        cbd.types[1] === "Files" &&
        ua.match(/Macintosh/i) &&
        Number(ua.match(/Chrome\/(\d{2})/i)[1]) < 49
      ) {
        return;
      }
      for (var i = 0; i < cbd.items.length; i++) {
        var item = cbd.items[i];
        if (item.kind == "file") {
          var blob = item.getAsFile();
          if (blob.size === 0) {
            return;
          }
          let reader = new FileReader();
          let img = new Image();
          let base64src = "";
          // 读取图片
          reader.readAsDataURL(blob);
          // 读取完毕后的操作
          reader.onloadend = e => {
            img.src = e.target.result;
            // 这里的e.target就是reader
            // console.log(reader.result)
            // reader.result就是图片的base64字符串
            base64src = reader.result;
            // 上传图片
            upload({ img: base64src }).then(res => {
              if (res) {
                this.imgDialog = true;
                this.imgDialogUrl = res.result;
                this.imgDialogUrl2 = base64src;
              }
            });
          };
        }
      }
    },
    formatFn(now) {
      let type;
      let nowDay = new Date().getDate().toString();
      let nowYear = new Date().getFullYear().toString();
      let nowMonth = (new Date().getMonth() + 1).toString();
      now = new Date(now);
      // 判断type
      var show_day = new Array(
        "星期日",
        "星期一",
        "星期二",
        "星期三",
        "星期四",
        "星期五",
        "星期六"
      );
      var year = now.getFullYear().toString();
      var month = (now.getMonth() + 1).toString();
      var day = now.getDate().toString();
      var tian = now.getDay().toString();
      var hour = now.getHours().toString();
      var minute = now.getMinutes().toString();
      var second = now.getSeconds().toString();
      let dayDfference = nowDay - day;
      let yearDfference = nowYear - year;
      let monthDfference = nowMonth - month;
      if (dayDfference > 0 && dayDfference <= 7 && yearDfference <= 0) {
        type = 2;
      } else if (dayDfference > 7 && yearDfference <= 0) {
        type = 6;
      } else if (yearDfference > 0) {
        type = 3;
      } else {
        type = 1;
      }
      if (monthDfference > 0) {
        type = 6;
      }
      if (hour.length == 1) {
        hour = "0" + hour;
      }
      if (minute.length == 1) {
        minute = "0" + minute;
      }
      if (second.length == 1) {
        second = "0" + second;
      }
      if (type == 1) {
        var dateTime = hour + ":" + minute;
      } else if (type == 2) {
        // var dateTime = show_day[tian] + " " + hour + ":" + minute
        var dateTime = show_day[tian];
      } else if (type == 3) {
        var dateTime = year + "年" + month + "月" + day + "日";
      } else if (type == 4) {
        var dateTime =
          year +
          "年" +
          month +
          "月" +
          day +
          "日" +
          hour +
          ":" +
          minute +
          ":" +
          second;
      } else if (type == 5) {
        var dateTime = show_day[tian];
      } else if (type == 6) {
        var dateTime = month + "月" + day + "日";
      }
      return dateTime;
    }
  }
};
</script>

<style lang="scss">
.rightSide {
  width: calc(100vw - 40%);
  height: 100%;
  float: left;
  user-select: none;
  .operate {
    overflow: hidden;
    -webkit-app-region: drag;
    padding-top: 10px;
    height: 20px;
    img {
      float: right;
      -webkit-app-region: no-drag;
      width: 10px;
      margin-right: 20px;
      cursor: pointer;
    }
  }
  header {
    width: 100%;
    height: 50px;
    line-height: 50px;
    padding-left: 20px;
    background: #fff;
    border-bottom: 1px solid #eee;
    position: relative;
    .icon {
      position: absolute;
      right: 20px;
      top: 0;
      font-size: 20px;
      -webkit-app-region: no-drag;
      cursor: pointer;
    }
  }
  .drag {
    -webkit-app-region: drag;
  }
  .chat_content {
    width: 100%;
    height: calc(100vh - 70px - 130px);
    background-color: #f7fbfe;
    .wrap {
      width: 100%;
      height: 100%;
      padding: 20px;
      overflow-y: auto;
      .chat_item {
        margin-bottom: 10px;
        position: relative;
        .timeText {
          text-align: center;
          font-size: 12px;
          color: #999;
        }
        .recallMessage {
          width: 200px;
          margin: 0 auto;
          height: 20px;
          font-size: 14px;
          background: #ccc;
          border-radius: 5px;
          color: #fff;
          text-align: center;
          line-height: 20px;
        }
        .menu_tip {
          position: absolute;
          top: 40px;
          background-color: #fff;
          width: 60px;
          border-radius: 5px;
          z-index: 99999;
          border: 1px solid #ccc;
          span {
            display: block;
            width: 100%;
            height: 30px;
            line-height: 30px;
            font-size: 12px;
            color: #333;
            text-align: center;
            cursor: pointer;
            // border-bottom: 1px solid #333;
            &:last-child {
              // border-bottom: none;
            }
            &:hover {
              background-color: #ccc;
            }
          }
        }
        .rightPosition {
          right: 45px;
        }
        .leftPosition {
          left: 45px;
        }
        .top {
          top: -40px;
        }
      }
      .leftChat,
      .rightChat {
        display: flex;
        align-items: flex-start;
        width: 100%;
        .avatar {
          width: 34px;
          height: 34px;
          img {
            border-radius: 3px;
          }
        }
        .text_message {
          max-width: 60%;
          .nickName {
            font-size: 12px;
            color: #999;
            vertical-align: text-top;
            line-height: 1;
          }
          .text {
            position: relative;
            min-height: 34px;
            padding: 5px 10px;
            word-wrap: break-word;
            word-break: break-all;
            border-radius: 5px;
            font-size: 15px;
            line-height: 24px;
          }
          img {
            width: 24px;
            height: 24px;
            vertical-align: middle;
            margin: 0 1px;
          }
        }
        .img_message {
          display: flex;
          flex-direction: column;
          .nickName {
            font-size: 12px;
            color: #999;
            vertical-align: text-top;
            line-height: 1;
          }
          img {
            max-width: 100px;
            max-height: 150px;
            cursor: pointer;
          }
        }
        .redpack_message {
          color: #fff;
          position: relative;
          width: 200px;
          box-sizing: border-box;
          cursor: pointer;
          .top_content {
            width: 100%;
            height: 58px;
            background-color: #fa9932;
            display: flex;
            align-items: center;
            border-radius: 5px 5px 0 0;
            padding-left: 13px;
            box-sizing: border-box;
            img {
              width: 30px;
              height: 37px;
              margin-right: 13px;
            }
            span {
              font-size: 13px;
            }
          }
          .bottom_content {
            height: 22px;
            line-height: 22px;
            width: 100%;
            box-sizing: border-box;
            padding-left: 13px;
            background-color: #f8f8f8;
            color: #999;
            font-size: 10px;
            border-radius: 0px 0px 5px 5px;
          }
        }
      }
      .leftChat {
        .avatar {
          margin-right: 10px;
        }
        .text_message {
          .text {
            color: #333;
            background-color: #ecf3f2;
            &::after {
              content: "";
              border-top: solid 6px transparent;
              border-left: solid 0px transparent;
              border-right: solid 8px #ecf3f2;
              border-bottom: solid 6px transparent;
              position: absolute;
              left: -8px;
              top: 16px;
              transform: translateY(-50%);
            }
          }
        }
        .img_message {
          .nickName {
            margin-bottom: 5px;
          }
        }

        .redpack_message::after {
          content: "";
          border-top: solid 6px transparent;
          border-left: solid 0px transparent;
          border-right: solid 8px #fa9932;
          border-bottom: solid 6px transparent;
          position: absolute;
          left: -8px;
          top: 19px;
          transform: translateY(-50%);
        }
      }
      .rightChat {
        flex-direction: row-reverse;
        .avatar {
          margin-left: 10px;
        }
        .text_message {
          text-align: right;
          .text {
            background-color: #3288fd;
            color: #fff;
            text-align: left;
            &::after {
              content: "";
              border-top: solid 6px transparent;
              border-left: solid 8px #3288fd;
              border-right: solid 0 transparent;
              border-bottom: solid 6px transparent;
              position: absolute;
              right: -8px;
              top: 16px;
              transform: translateY(-50%);
            }
          }
        }
        .img_message {
          .nickName {
            text-align: right;
            margin-bottom: 5px;
          }
        }
        .redpack_message::after {
          content: "";
          border-top: solid 6px transparent;
          border-left: solid 8px #fa9932;
          border-right: solid 0px transparent;
          border-bottom: solid 6px transparent;
          position: absolute;
          right: -8px;
          top: 19px;
          transform: translateY(-50%);
        }
      }
    }
  }
  .input_box {
    width: 100%;
    height: 130px;
    padding: 0 15px;
    background-color: #fff;
    border-top: 1px solid #eee;
    position: relative;
    .mark {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #000;
      opacity: 0.2;
      font-size: 20px;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .tool_bar {
      width: 100%;
      height: 35px;
      ul {
        display: flex;
        align-items: center;
        height: 100%;
        li {
          width: 30px;
          height: 30px;
          cursor: pointer;
          line-height: 30px;
          text-align: center;
          margin-right: 5px;
          &:hover {
            background-color: #e6e6e6;
          }
          span {
            display: inline-block;
            width: 100%;
            height: 100%;
          }
        }
      }
      img {
        width: 18px;
        height: 18px;
        vertical-align: middle;
      }
      .upLoadImg {
        position: relative;
        #input_file {
          width: 100%;
          height: 100%;
          position: absolute;
          left: 0;
          top: 0;
          opacity: 0;
          overflow: hidden;
          cursor: pointer;
        }
      }
    }

    .text_input {
      textarea {
        width: 100%;
        height: 65px;
        resize: none;
        overflow-y: auto;
      }
      .editor {
        width: 100%;
        height: 65px;
        resize: none;
        outline: none;
        overflow-y: auto;
        img {
          width: 24px;
          vertical-align: middle;
        }
      }
    }
    .send_btn {
      position: absolute;
      right: 30px;
      bottom: 15px;
      width: 60px;
      height: 25px;
      background-color: #eeeeee;
      border-radius: 2px;
      text-align: center;
      font-size: 14px;
      color: #14141c;
      line-height: 25px;
      cursor: pointer;
      &:hover {
        background-color: #3288fd;
        color: #fff;
      }
    }
  }
  .mt5 {
    margin-top: -5px;
  }
  .system_list {
    font-size: 14px;
    text-align: center;
    span {
      background: #ccc;
      color: #fff;
      padding: 0 15px;
      border-radius: 5px;
    }
  }
  .mouseType {
    cursor: pointer;
  }
  .sendImgPrewiew {
    /deep/ .el-dialog {
      box-shadow: none !important;
      background: transparent;
      .el-dialog__body {
        text-align: center;
        img {
          width: auto;
          max-height: 300px;
        }
      }
      .el-dialog__footer {
        padding: 100px 0 0 0;
        text-align: center;
      }
    }
  }
  .el-image-viewer__close {
    -webkit-app-region: no-drag;
  }
}
</style>
