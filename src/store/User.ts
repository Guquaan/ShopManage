import { defineStore } from 'pinia';
import request from '../api/request';
import { ElMessage } from 'element-plus';

// 用户数据类型
export interface User {
  _id?: string;
  id?: string;
  username: string;
  realName: string;
  phone: string;
  address: string;
  status: string;
  createTime: string;
  updateTime?: string;
  password?: string;
}

// 将 MongoDB 的 _id 映射为 id 便于前端使用
function normalizeUser(item: any): User {
  return {
    ...item,
    id: item._id || item.id,
    _id: item._id
  };
}

export const UserManage = defineStore('user', {
  state: (): { users: User[]; loading: boolean } => ({
    users: [],
    loading: false
  }),

  actions: {
    // 获取用户列表（支持筛选参数）
    async getUsers(params?: Record<string, string>) {
      this.loading = true;
      try {
        const res = await request.get('/users/list', { params });
        this.users = (res.data || []).map(normalizeUser);
        return this.users;
      } catch (err: any) {
        ElMessage.warning('无法连接后端服务');
        return this.users;
      } finally {
        this.loading = false;
      }
    },

    // 获取单个用户详情
    async getUserById(id: string) {
      try {
        const res = await request.get(`/users/detail/${id}`);
        return normalizeUser(res.data);
      } catch (err: any) {
        ElMessage.error('获取用户详情失败');
        throw err;
      }
    },

    // 添加用户
    async addUser(user: User) {
      try {
        const res = await request.post('/users/add', {
          username: user.username,
          realName: user.realName,
          phone: user.phone,
          address: user.address || '',
          status: user.status || '正常',
          password: user.password || ''
        });
        const newItem = normalizeUser(res.data);
        this.users.unshift(newItem);
        ElMessage.success('用户添加成功');
        return newItem;
      } catch (err: any) {
        ElMessage.error('添加用户失败: ' + (err.message || '网络错误'));
        throw err;
      }
    },

    // 编辑用户
    async editUser(user: User) {
      try {
        const id = user._id || user.id;
        const res = await request.put(`/users/update/${id}`, {
          username: user.username,
          realName: user.realName,
          phone: user.phone,
          address: user.address || '',
          status: user.status
        });
        const updated = normalizeUser(res.data);
        const index = this.users.findIndex(
          item => (item._id || item.id) === id
        );
        if (index !== -1) {
          this.users[index] = updated;
        }
        ElMessage.success('用户编辑成功');
        return updated;
      } catch (err: any) {
        ElMessage.error('编辑用户失败: ' + (err.message || '网络错误'));
        throw err;
      }
    },

    // 更改用户状态
    async changeUserStatus(id: string, status: string) {
      try {
        const res = await request.put(`/users/update/${id}`, { status });
        const updated = normalizeUser(res.data);
        const index = this.users.findIndex(
          item => (item._id || item.id) === id
        );
        if (index !== -1) {
          this.users[index] = updated;
        }
        return true;
      } catch (err: any) {
        ElMessage.error('更改用户状态失败');
        throw err;
      }
    },

    // 删除用户
    async deleteUser(id: string) {
      try {
        await request.delete(`/users/delete/${id}`);
        this.users = this.users.filter(
          item => (item._id || item.id) !== id
        );
        ElMessage.success('用户删除成功');
        return true;
      } catch (err: any) {
        ElMessage.error('删除用户失败: ' + (err.message || '网络错误'));
        throw err;
      }
    }
  }
});
