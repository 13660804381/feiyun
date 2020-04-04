import axios from 'axios'
import QS from 'qs'
import router from '../router'
// import router from '../router';
axios.defaults.timeout = 10000
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8'
// 环境判断
if (process.env.NODE_ENV == 'development') {
    axios.defaults.baseURL = '/api'
} else {
    axios.defaults.baseURL = 'http://150.109.40.251:9501/'
}
// 请求拦截
axios.interceptors.request.use(
    config => {
        const token = window.localStorage.getItem('userToken')
        token && (config.headers.token = token)
        return config
    },
    error => {
        return Promise.error(error)
    }
)

// 响应拦截
axios.interceptors.response.use(
    response => {
        if (response.status === 200) {
            return Promise.resolve(response)
        } else {
            return Promise.reject(response)
        }
    },
    error => {
        if (error.response.status) {
            switch (error.response.status) {
                case 401:
                    // alert('NetWork error!')登录过期
                    window.location.reload();
                    // RongIMClient.getInstance().disconnect();
                    window.localStorage.removeItem("userToken");
                    window.localStorage.removeItem("rongToken");
                    router.push({ path: "/login" });
                    break
                default:
                // alert(error.response.data.message)
            }
            return Promise.reject(error.response)
        }
    }
)
export function get(url, params) {
    return new Promise((resolve, reject) => {
        axios.get(url, {
            params: params
        }).then(res => {
            resolve(res.data)
        }).catch(err => {
            reject(err.data)
        })
    })
}
export function post(url, params) {
    return new Promise((resolve, reject) => {
        axios.post(url, params).then(res => {
            resolve(res.data)
        }).catch(err => {
            reject(err.data)
        })
    })
}
export function formSubmit(url, params) {
    return new Promise((resolve, reject) => {
        axios.post(url, QS.stringify(params)).then(res => {
            resolve(res.data)
        }).catch(err => {
            reject(err.data)
        })
    })
}
