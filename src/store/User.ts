import { defineStore } from 'pinia'

// 用户状态类型
type UserStatus = '正常' | '禁用'

// 用户接口定义
interface User {
  id: number
  username: string
  realName: string
  phone: string
  email: string
  role: '管理员' | '普通用户'
  status: UserStatus
  createTime: string
  updateTime?: string
}

export const userManage = defineStore('usermanage', {
  state: (): { users: User[] } => ({
    users: localStorage.getItem('users') ? JSON.parse(localStorage.getItem('users')!) : []
  }),

  actions: {
    // 获取虚拟用户数据
    getUsers(total: number) {
      const roles: ('管理员' | '普通用户')[] = ['管理员', '普通用户']
      const statuses: UserStatus[] = ['正常', '禁用']
      const users: User[] = []

      for (let i = 0; i < total; i++) {
        const id = i + 1
        users.push({
          id,
          username: `user${id}`,
          realName: `用户${id}`,
          phone: `13${Math.floor(Math.random() * 900000000 + 100000000)}`,
          email: `user${id}@example.com`,
          role: roles[Math.floor(Math.random() * roles.length)],
          status: statuses[Math.floor(Math.random() * statuses.length)],
          createTime: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toLocaleString()
        })
      }

      this.users = users
      localStorage.setItem('users', JSON.stringify(users))
    },

    // 添加用户
    addUser(user: User) {
      const id = this.users.length + 1
      const newUser: User = {
        ...user,
        id,
        createTime: new Date().toLocaleString()
      }
      this.users.unshift(newUser)
      localStorage.setItem('users', JSON.stringify(this.users))
      return newUser
    },

    // 编辑用户
    editUser(user: User) {
      const index = this.users.findIndex(item => item.id === user.id)
      if (index !== -1) {
        this.users[index] = {
          ...this.users[index],
          ...user,
          updateTime: new Date().toLocaleString()
        }
        localStorage.setItem('users', JSON.stringify(this.users))
        return this.users[index]
      }
      return null
    },

    // 更改用户状态
    changeUserStatus(id: number, status: UserStatus) {
      const index = this.users.findIndex(item => item.id === id)
      if (index !== -1) {
        this.users[index].status = status
        this.users[index].updateTime = new Date().toLocaleString()
        localStorage.setItem('users', JSON.stringify(this.users))
        return true
      }
      return false
    },

    // 删除用户
    deleteUser(id: number) {
      const index = this.users.findIndex(item => item.id === id)
      if (index !== -1) {
        this.users.splice(index, 1)
        localStorage.setItem('users', JSON.stringify(this.users))
        return true
      }
      return false
    }
  }
})