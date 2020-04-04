const state = {
  targetUserInfo: {},
  accountMoney: 0
}
const mutations = {
  USER_TARGETUSERINFO(state, data) {
    state.targetUserInfo = data
  },
  SETACCOUNTMONEY(state, data) {
    state.accountMoney = data
  }
}
const action = {

}
export default {
  state,
  mutations
}