import { defineStore } from 'pinia';
import request from '../api/request';

export const useLoginManage = defineStore('multiAuth', {
  state: () => ({
    accounts: localStorage.getItem('userAccounts')
      ? JSON.parse(localStorage.getItem('userAccounts')!)
      : []
  }),

  getters: {
    // 获取当前登录账号
    currentAccount: (state) => state.accounts.find((acc: any) => acc.isCurrent) || null,
    // 获取账号总数
    accountCount: (state) => state.accounts.length,
    // 判断是否有用户登录
    isLoggedIn: (state) => state.accounts.some((acc: any) => acc.isCurrent),
    // 获取所有用户名
    allUsernames: (state) => state.accounts.map((acc: any) => acc.username)
  },

  actions: {
    // 注册新账号 —— 使用 JWT 认证接口
    async addAccountFromForm(formData: { UserName: string; PassWord: string }) {
      try {
        // 调用后端注册接口（密码由后端 bcrypt 加密）
        const res = await request.post('/auth/register', {
          username: formData.UserName,
          password: formData.PassWord,
          realName: formData.UserName,
          phone: formData.UserName
        });

        // 保存 JWT token
        const token = res.data?.token;
        if (token) {
          localStorage.setItem('token', token);
        }

        // 将所有账号的 isCurrent 设为 false
        this.accounts = this.accounts.map((acc: any) => ({ ...acc, isCurrent: false }));
        // 创建新账号对象，将新账号作为登录的用户
        const newAccount = {
          username: formData.UserName,
          id: res.data?.user?._id || Date.now().toString(),
          isCurrent: true,
          lastLogin: new Date().toISOString()
        };
        this.accounts.push(newAccount);
        this.persistAccounts();
      } catch {
        // 后端不可用时，回退到本地存储
        this.accounts = this.accounts.map((acc: any) => ({ ...acc, isCurrent: false }));
        const newAccount = {
          username: formData.UserName,
          password: formData.PassWord,
          id: Date.now().toString(),
          isCurrent: true,
          lastLogin: new Date().toISOString()
        };
        this.accounts.push(newAccount);
        this.persistAccounts();
      }
    },

    // 使用表单数据登录 —— 优先通过 JWT 认证接口
    async loginWithForm(formData: { UserName: string; PassWord: string }, token: any) {
      // 先尝试通过后端 JWT 认证登录
      try {
        const res = await request.post('/auth/login', {
          username: formData.UserName,
          password: formData.PassWord
        });

        const authToken = res.data?.token;
        if (authToken) {
          // 保存 JWT token（与 request.js 拦截器中的 key 保持一致）
          localStorage.setItem('token', authToken);
          localStorage.setItem('Logintoken', token);

          // 创建或更新本地账户记录
          const existingIndex = this.accounts.findIndex(
            (acc: any) => acc.username === formData.UserName
          );
          this.accounts = this.accounts.map((acc: any) => ({ ...acc, isCurrent: false }));

          if (existingIndex >= 0) {
            this.accounts[existingIndex] = {
              ...this.accounts[existingIndex],
              isCurrent: true,
              lastLogin: new Date().toISOString()
            };
          } else {
            this.accounts.push({
              username: formData.UserName,
              id: res.data?.user?._id || Date.now().toString(),
              isCurrent: true,
              lastLogin: new Date().toISOString()
            });
          }
          this.persistAccounts();
          return true;
        }
      } catch {
        // 后端不可用，回退到本地账户验证
      }

      // 回退：本地账户匹配
      const matchedAccount = this.accounts.find(
        (acc: any) => acc.username === formData.UserName && acc.password === formData.PassWord
      );
      if (matchedAccount) {
        localStorage.setItem('Logintoken', token);
        this.switchAccount(matchedAccount.id);
        return true;
      }

      return false;
    },

    // 切换当前账号
    switchAccount(accountId: string) {
      this.accounts = this.accounts.map((acc: any) => ({
        ...acc,
        isCurrent: acc.id === accountId,
        lastLogin: acc.id === accountId ? new Date().toISOString() : acc.lastLogin
      }));
      this.persistAccounts();
    },

    // 删除指定账号
    removeAccount(accountId: string) {
      const wasCurrent = this.accounts.some((acc: any) => acc.id === accountId && acc.isCurrent);
      this.accounts = this.accounts.filter((acc: any) => acc.id !== accountId);
      if (wasCurrent && this.accounts.length > 0) {
        this.accounts[0].isCurrent = true;
      }
      this.persistAccounts();
    },

    // 退出登录
    logout() {
      this.accounts = this.accounts.map((acc: any) => ({ ...acc, isCurrent: false }));
      localStorage.removeItem('token');
      localStorage.removeItem('Logintoken');
      this.persistAccounts();
    },

    // 清除所有账号
    clearAllAccounts() {
      this.accounts = [];
      this.persistAccounts();
    },

    // 持久化到 localStorage（仅保留账户缓存，核心数据在后端）
    persistAccounts() {
      localStorage.setItem('userAccounts', JSON.stringify(this.accounts));
    }
  }
});
