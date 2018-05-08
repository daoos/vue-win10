import querystring from 'querystring'
import toastr from './misc/toastr.esm'
import {errors} from './constants'
import axios from 'axios'

export const baseURL = process.env.NODE_ENV === 'production' ? '' : '/api'  // 所有请求的根路径

export const http = axios.create({
  baseURL: baseURL,
  timeout: 15000,
  withCredentials: true,
  headers: {'X-Requested-With': 'XMLHttpRequest'},
  transformRequest: [data => querystring.stringify(data)]
})

// Add a response interceptor handing global errors
http.interceptors.response.use(response => response, error => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    toastr.error(error.response.data.msg || errors[error.response.status] || errors.default)
    if (error.status == 401) {
      location.href = '/'
    }
    console.log(error.response)
  } else if (error.request) {
    // The request was made but no response was received
    // `error.request` is an instance of XMLHttpRequest in the browser
    // and an instance of http.ClientRequest in node.js
    toastr.error(errors.busy)
    console.log(error.request)
  } else {
    // Something happened in setting up the request that triggered an Error
    toastr.error(error.message)
    console.log(error.config)
  }
  return Promise.reject(error)
})

export const Auth = {
  authorizations (to, from, next) { // 身份验证, 成功后返回当前用户所有权限
    http.get('/authorizations').then(response => {
      Auth.permissions = response.data
      next()
    }).catch(() => { // 验证失败后台会抛出401异常, 注销当前用户, 转到登录页并带上当前请求路径
      next('/login?redirect=' + to.path)
      localStorage.removeItem('user')
    })
  },
  login (data, cb) {
    http.post('/login', data).then(res => {
      if (res.data.success) {
        localStorage.setItem('user', JSON.stringify(res.data.user))
        Auth.currentUser = res.data.user
      }
      cb && cb(res)
    })
  },
  logout (to, from, next) {
    localStorage.removeItem('user')
    http.get('/logout')
    next('/login')
  },
  updateCurrentUser (obj) {
    localStorage.setItem('user', JSON.stringify(Object.assign(Auth.currentUser, obj)))
  },
  isLogin () {
    return Auth.currentUser != null
  },
  has (perm) {
    return this.permissions.includes(perm) // 权限验证
  }
}

var value = localStorage.getItem('user')
if (value) {
  Auth.currentUser = JSON.parse(value)
}

export const User = resource('user', http, {
  paging: params => http.get('user', {params}),
  query: params => http.get('user/query', {params}),
  /*
   * 搜索用户
   * keyword        搜索关键字
   * type           过滤用户类型
   * dept           过滤部门ID
   * include        需包含的用户
   * excludeCurrent 是否排除当前用户
   */
  search: params => http.get('user/search', {params}),
  profile: (user) => user ? http.put('user/profile', user) : http.get('user/profile'),
  status: (id, status) => http.put('user/status', {id, status}),  // 更新状态
  roles: (id = '') => http.get('user/roles?id=' + id),            // 获取用户所有角色
  role: (id, roleId) => http.put('user/role', {id, roleId}),      // 更新角色
  partial: (params) => http.put('user/partial', params)           // 局部更新用户信息
})

export const Department = resource('department', http, {
  priority: (param) => http.put('department/priority', param),  // 更新排序 param: {id:权限ID, parent:权限父ID, from:fromIndex, to:toIndex}
  treetable: () => http.get('department/treetable'),
  jstree: (selected) => http.get('department/jstree', {         // 获取所有部门
    params: {
      selected: [].concat(selected || '')
    }
  }),
  tree: (map) => http.get('department/tree?map=' + !!map),  // map为true时额外返回一个{id -> 部门}的映射对象
  all: () => http.get('department/all')  // 获取所有部门
})

export const Permission = resource('permission', http, {
  treetable: () => http.get('permission/treetable'),
  priority: (param) => http.put('permission/priority', param),  // 更新排序 param: {id:权限ID, parent:权限父ID, from:fromIndex, to:toIndex}
  jstree: () => http.get('permission/jstree'),
  perms: () => http.get('permission/perms'),
  tree: () => http.get('permission/tree')
})

export const Role = resource('role', http, {
  putperms: (params) => http.put('role/perms', params),   // 保存角色权限更改
  perms: (id) => http.get('role/perms?id=' + id),         // 获取角色所有权限字符串
  owns: (id) => http.get('role/owns?id=' + (id || '')),   // 获取角色所有权限ID
  all: (skip = 0) => http.get('role/all?skip=' + skip),                    // 获取所有角色
  map: () => http.get('role/map')                         // 获取 角色ID=>角色 的映射对象
})

export const Dict = resource('dict', http, {
  // save 与 update 方法需要传递复杂的JSON对象
  // 因此不能以默认的`application/x-www-form-urlencoded`方式传递参与
  // 要修改为`application/json`并以JSON字符串传递, 后端才可以接收整个JSON对象
  save: (data) => jsonRequest('/dict', 'post', data),
  update: (data) => jsonRequest('/dict', 'put', data),
  bycode: (code) => http.get('dict/bycode?code=' + code)    // 按字典编码查询单个字典对象
})

export const FileMapping = resource('filemapping', http, {
  parents: (id) => http.get('filemapping/parents?parent=' + id), // 获取所有父文件夹
  deleteBatch: (items) => http.delete('filemapping', {params: {items}}) // 批量删除文件 items：文件数组
})

/**
 * send reqeust with Content-Type: `application/json`
 * @param path request path
 * @param method  request method
 * @param data JSON data
 * @returns {AxiosPromise}
 */
export const jsonRequest = function (path, method, data) {
  return http[method](path, data, {
    headers: {'Content-Type': 'application/json'},
    transformRequest: [data => JSON.stringify(data)]
  })
}

/**
 * upload file
 * @param file
 * @param options
 * @returns fileitem
 */
export const upload = function (file, options) {
  if (!options.url) {
    return console.error('[options.url] is not present')
  }
  var formdata = new FormData()
  // 添加文件
  formdata.append('file', file)
  // 添加额外参数
  if (options.data) {
    Object.keys(options.data).forEach(k => {
      formdata.append(k, options.data[k])
    })
  }
  // 构建上传文件对象
  var fileitem = {
    name: file.name,
    size: file.size,
    type: file.type,
    url: file.url,
    progress: 0,
    loaded: 0,
    total: 0
  }
  http.post(options.url, formdata, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress: function (e) {
      fileitem.loaded = e.loaded
      fileitem.total = e.total
      if (e.lengthComputable) {
        fileitem.progress = e.loaded / e.total * 100
      }
    }
  }).then(resposne => {
    console.log(resposne)
    fileitem.url = resposne.data.file_path
    // Object.assign(fileitem, xhr.response.file)
    // options.onload.call(this, e.currentTarget)
  }).catch(err => {
    console.log(err)
  })
  return fileitem
}

/**
 * create vue-resource's resource like object
 *
 * Default Actions
 *   get: {method: 'GET'}
 *   save: {method: 'POST'}
 *   query: {method: 'GET'}
 *   update: {method: 'PUT'}
 *   delete: {method: 'DELETE'}
 *
 * @param path the resource path
 * @param http axios instance
 * @param actions custom actions
 * @returns the resource object
 */
function resource (path, http, actions) {
  var obj = {
    get: id => http.get(path + '/' + id),
    save: obj => http.post(path, obj),
    query: params => http.get(path, {params}),
    update: obj => http.put(path, obj),
    delete: id => http.delete(path + '/' + id),
    paging (vm, pn, ps) {
      vm.loading = 1
      vm.params.pn = pn
      vm.params.ps = ps || 10
      return new Promise((resolve, reject) => {
        http.get(path, {params: vm.params}).then(response => {
          vm.page = response.data
          vm.$nextTick(() => {
            resolve(response)
            vm.loading = 0
          })
        }, reject)
      })
    },
    http
  }
  return Object.assign(obj, actions)
}

export default http
