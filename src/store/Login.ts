import { defineStore } from 'pinia';

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
    // 注册新账号
    addAccountFromForm(formData: {UserName: string; PassWord: string}) {
      // 将所有账号的isCurrent设为false
      this.accounts = this.accounts.map((acc: any) => ({ ...acc, isCurrent: false }));
      // 创建新账号对象，将新账号作为登陆的用户
      const newAccount = {
        username: formData.UserName,
        password: formData.PassWord,
        id: Date.now().toString(),  // 这里为了确保后续登陆的时候唯一性
        isCurrent: true,
        lastLogin: new Date().toISOString()
      };
      this.accounts.push(newAccount);
      this.persistAccounts();
    },
    
    // 使用表单数据登录
    loginWithForm(formData: {UserName: string; PassWord: string} , token:any) {
      const matchedAccount = this.accounts.find(
        (acc: any) => acc.username === formData.UserName && acc.password === formData.PassWord
      );
      if (matchedAccount) {
        localStorage.setItem('Logintoken',token)
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
      localStorage.removeItem('Logintoken')
      this.persistAccounts();
    },
    
    // 清除所有账号
    clearAllAccounts() {
      this.accounts = [];
      this.persistAccounts();
    },
    
    // 持久化到localStorage
    persistAccounts() {
      localStorage.setItem('userAccounts', JSON.stringify(this.accounts));
    }
  }
});
