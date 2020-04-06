import { getFriendList, getGroupList, getRemarkList } from "../../request/api";
const state = {
  rightBoxStatus: '',
  friendList: [],
  groupChatList: [],
  conversationList: [],
  unReadMsgCount: 0,
  historyList: [],
  verifyCount: 0,
  tabStatus: 1,
  currentTargetId: '',
  conversationType: '',
  showUserInfo: false,
  searchList: [],
  remarkList: []
}
const mutations = {
  SETRIGHTSTATUS(state, data) {
    state.rightBoxStatus = data
  },
  SETTABSTATUS(state, data) {
    state.tabStatus = data
  },
  SETCURRENTTARGETID(state, data) {
    state.currentTargetId = data
  },
  CONVERSATIONTYPE(state, data) {
    state.conversationType = data
  },
  SETFRIENDLIST(state, data) {
    state.friendList = data
  },
  SETGROUPCHATLIST(state, data) {
    state.groupChatList = data
  },
  SETCONVERSATIONLIST(state, data) {
    state.conversationList = JSON.parse(JSON.stringify(data))
  },
  SETUNREADMSGCOUNT(state, data) {
    state.unReadMsgCount = data
  },
  VERIFYCOUNT(state, data) {
    state.verifyCount = data
  },
  SETHISTORYLIST(state, data) {
    state.historyList = data
  },
  PUSHHISTORY(state, data) {
    state.historyList.push(data)
  },
  UNSHIFTHISTORY(state, data) {
    state.historyList.unshift(data)
  },
  SHOWUSERINFO(state, data) {
    state.showUserInfo = data
  },
  SETSEARCHLIST(state, data) {
    state.searchList = data
  },
  SETREMARKLIST(state, data) {
    state.remarkList = data
  }
}
const actions = {
  getFriendList(context, value) {
    return new Promise((resolve, reject) => {
      getFriendList().then(res => {
        resolve(res)
        let list = res.result
        context.commit('SETFRIENDLIST', list)
      }).catch(err => {
        reject(err)
      })
    })
  },
  getRemarkList(context, value) {
    return new Promise((resolve, reject) => {
      getRemarkList().then(res => {
        resolve(res)
        context.commit('SETREMARKLIST', res.result)
      }).catch(err => {
        reject(err)
      })
    })
  },
  getGroupList(context, value) {
    return new Promise((resolve, reject) => {
      getGroupList().then(res => {
        resolve(res)
        context.commit('SETGROUPCHATLIST', res.result.reverse())
      }).catch(err => {
        reject(err)
      })
    })
  },
  getConversation(context, value) {
    if (value.length == 0) {
      context.commit('SETCONVERSATIONLIST', [])
      context.commit('SETUNREADMSGCOUNT', 0)
      context.commit('VERIFYCOUNT', 0)
    } else {
      let obj = formatConversation(value)
      context.commit('SETCONVERSATIONLIST', obj.conversationList)
      context.commit('SETUNREADMSGCOUNT', obj.unReadMsgCount)
      context.commit('VERIFYCOUNT', obj.verifyCount)
    }
  },
  getHistory(context, value) {
    formatHistory(value)
    context.commit('SETHISTORYLIST', value)
  }
}
export default {
  state,
  mutations,
  actions
}

function formatConversation(arr) {
  let ids = [];
  for(let i = 0; i < state.friendList.length; i++) {
    ids.push(state.friendList[i].id);
  }
  let conversationList = arr;
  let arr2 = []
  let obj = {}
  let unReadMsgCount = 0;
  let verifyCount = 0;
  for (let i = 0; i < conversationList.length; i++) {
    if (conversationList[i].conversationType == 6) {
      if (conversationList[i].objectName == 'RC:ContactNtf' && conversationList[i].latestMessage.content.operation == 'RC:FApply' && !ids.includes(conversationList[i].latestMessage.senderUserId)) {
        verifyCount += 1;
      }
    }
    if (conversationList[i].conversationType == 1 || conversationList[i].conversationType == 3) {
      conversationList[i].latestMessage.content.extra = transExtra(
        conversationList[i].latestMessage.content.extra
      );
      conversationList[i].time = formatFn(
        conversationList[i].latestMessage.sentTime
      );
      unReadMsgCount += conversationList[i].unreadMessageCount;
    }
    if (conversationList[i].conversationType == 1) {
      for (let j = 0; j < state.remarkList.length; j++) {
        if (state.remarkList[j].friendId == conversationList[i].targetId) {
          if (state.remarkList[j].remark) {
            conversationList[i].latestMessage.content.extra.name2 = state.remarkList[j].remark
          }
        }
      }
    }
    if (conversationList[i].latestMessage.content.operation == 'Dismiss' || conversationList[i].latestMessage.content.messageName == 'RecallCommandMessage') {

    } else {
      arr2.push(conversationList[i])
    }
  }
  obj.conversationList = arr2
  obj.unReadMsgCount = unReadMsgCount
  obj.verifyCount = verifyCount
  return obj
}
function formatHistory(arr) {
  let list = arr
  for (let i = 0; i < list.length; i++) {
    list[i].content.extra = transExtra(
      list[i].content.extra
    );
    var reg = /\[.+?\]/g
    list[i].content.content = resultArr.content.content.replace(reg, function (a, b) {
      return _self.faceList[a] ? _self.faceList[a] : a
    })
  }
}
//json格式转换
function transExtra(arg) {
  var result = "";
  try {
    result = eval("(" + arg + ")");
  } catch (e) {
    // result = arg.slice(1, -1);
  } finally {
  }
  return result;
}
function formatFn(now) {
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