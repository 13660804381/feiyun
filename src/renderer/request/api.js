import {get, post, formSubmit} from './http'
export const login = p => formSubmit('User/Login/login', p)
export const getFriendList = p => formSubmit('User/Friend/getList', p)
export const getGroupList = p => formSubmit('User/Query/getGroups', p)
export const searchUser = p => formSubmit('User/Query/getList', p)
export const applyFriend = p => formSubmit('User/Friend/apply', p)
export const getApplyList = p => formSubmit('User/Friend/getApplyList', p)
export const agree = p => formSubmit('User/Friend/agree', p)
export const refuse = p => formSubmit('User/Friend/refuse', p)
export const getUserInfo = p => formSubmit('User/Query/getFriends', p)
export const getGroupInfo = p => formSubmit('User/Group/getInfo', p)
export const register = p => formSubmit('User/Register/register', p)
export const upload = p => formSubmit('User/File/uploadBase64', p)
export const sendRed = p => formSubmit('User/Wallet/send', p)
export const receivedRed = p => formSubmit('User/Wallet/received', p)
export const getRedInfo = p => formSubmit('User/Wallet/getRedInfo', p)
export const getMemberDetails = p => formSubmit('User/GroupMember/getDetailInfo', p)
export const joinGroupMember = p => formSubmit('User/Group/join', p)
export const removeMember = p => formSubmit('User/GroupMember/remove', p)
export const setAdmin = p => formSubmit('User/GroupMember/setAdmin', p)
export const setGroupName = p => formSubmit('User/Group/setName', p)
export const setGroupAnnounce = p => formSubmit('User/Group/setAnnouncement', p)
export const quitGroup = p => formSubmit('User/GroupMember/quit', p)
export const dismissGroup = p => formSubmit('User/Group/dismiss', p)
export const markRemark = p => formSubmit('User/Remark/markRemark', p)
export const addOrRemoveBlock = p => formSubmit('User/Group/addOrRemoveBlock', p)
export const addOrRemoveWhiteList = p => formSubmit('User/GroupMember/addOrRemoveWhiteList', p)
export const addOrRemoveBlockSomeOne = p => formSubmit('User/GroupMember/addOrRemoveBlockSomeOne', p)
export const createGroup = p => formSubmit('User/Group/create', p)
export const updateNickName = p => formSubmit('User/Update/updateNickName', p)
export const getSelfInfo = p => formSubmit('User/Query/getSelfInfo', p)
export const updatePwd = p => formSubmit('User/Update/updatePwd', p)
export const removeFriend = p => formSubmit('User/Friend/remove', p)
export const getRemarkList = p => formSubmit('User/Remark/query', p)










