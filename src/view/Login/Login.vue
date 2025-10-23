<template>
    <div class="main">
        <div class="image">
            <img src="../../data/photo/生成商品管理登录页图片.png" alt="">
        </div>
        <div class="login">
            <el-form class="formLogin" ref="LoginRef" :model="formData" :rules="rules">
                <h4>商品管理登陆页面</h4>
                <el-form-item prop="UserName">
                    <el-input :prefix-icon=User size="small" v-model="formData.UserName" placeholder="请输入你的账号" />
                </el-form-item>
                <el-form-item prop="PassWord">
                    <el-input
                    :show-password=true 
                    :prefix-icon=Lock size="small" type="password" v-model="formData.PassWord"
                        placeholder="请输入你的密码" />
                </el-form-item>
                <el-form-item v-show="formType" prop="ValidCode">
                    <el-input :prefix-icon=Lock size="small" v-model="formData.ValidCode" placeholder="请输入验证码">
                        <template #append>
                            <span class="validata" @click="handlevalidata">{{ valiData.text }}</span>
                        </template>
                    </el-input>
                </el-form-item>
                <div class="link">
                    <el-link type="primary" @click="handleChange">
                        {{ formType ? '返回登陆' : '注册账号' }}</el-link>
                </div>
                <el-form-item>
                    <el-button type="primary" size="small" @click="submit(LoginRef)">
                        {{ !formType ? '登陆' : '注册' }}
                    </el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script setup lang="ts">
import { User, Lock } from '@element-plus/icons-vue'
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
// 导入pinia
import { useMultiAuthStore } from '../../store/Login'

const router = useRouter()
// 登陆数据
const LoginRef = ref()
const formData = reactive({
    UserName: '',
    PassWord: '',
    ValidCode: '',
})

// 管理登陆注册
const formType = ref(false)
// 登陆注册函数
const handleChange = () => {
    formType.value = !formType.value
}

// 获取验证码校验
const valiData = reactive({
    text: '获取验证码',
    countdown: 60,

})
const timer = ref<number | null>(null)
// 生成随机四位数的函数
function getRandomFourDigits() {
  // 获取当前时间的毫秒数
  const time = new Date().getTime();
  const randomNum = time % 10000;
  return randomNum.toString().padStart(4, '0');
}
const handlevalidata = () => {
    // 这里是确保发送的时候计时器已有，实现防抖
    if (timer.value) return
    const phonereg = /^1(3[0-9]|4[01456789]|6[2567]|7[0-8]|8[0-9]|9[0-35-9])\d{8}$/
    if (!formData.UserName || !phonereg.test(formData.UserName)) {
        return ElMessage({
            message: '请检查手机号是否输入或者填写',
            type: 'warning',
        })
    }
    valiData.text = `剩余${valiData.countdown}s`
    timer.value = setInterval(() => {
        if (valiData.countdown <= 1) {
            valiData.countdown = 60
            valiData.text = '获取验证码'
            clearInterval(timer.value!)
            timer.value = null
        } else {
            valiData.countdown--
            if(valiData.countdown === 57){
                setTimeout(()=>{
                    ElMessage({
                        duration:3000,
                        message:`注册的验证码为：${getRandomFourDigits()}`,
                        type:'info'
                    })
                },2000)
            }
            valiData.text = `剩余${valiData.countdown}s`
        }
    }, 1000)
}

//账号校验规则
const validateUser = (rule: any, value: any, callback: any) => {
    //不能为空
    if (value === '') {
        callback(new Error('请输入账号'))
    } else {
        const phonereg = /^1(3[0-9]|4[01456789]|6[2567]|7[0-8]|8[0-9]|9[0-35-9])\d{8}$/
        phonereg.test(value) ? callback() : callback(new Error('手机号码格式不对，请输入正确的号码'))
    }
}

//密码校验
const validatePass = (rule: any, value: any, callback: any) => {
    //不能为空
    if (value === '') {
        callback(new Error('请输入密码'))
    } else {
        const reg = /^[a-zA-Z0-9_-]{4,16}$/
        reg.test(value) ? callback() : callback(new Error('密码格式不对，需要4到16为字符，请确认'))
    }
}
//表单校验
const rules = reactive({
    UserName: [{ validator: validateUser, trigger: 'blur' }],
    PassWord: [{ validator: validatePass, trigger: 'blur' }]
})

// 创建store实例
const authStore = useMultiAuthStore()
// 登录处理函数
const handleLogin = () => {
    const token = `321987${new Date().toString().replace(/\D/g, '')}`
    const loginSuccess = authStore.loginWithForm(formData,token);
    if (loginSuccess) {
        // 登录成功后的操作
        console.log(token)
        ElMessage({
            duration:2000,
            message:'登陆成功',
            type:'success'
        })
        router.push('/'); // 如有路由可使用
    } else {
        // 登录失败处理
        ElMessage({
            duration:3000,
            message: `${formData.UserName}该账号未注册，请先注册`,
            type:'warning'
        })
    }
};

// 注册处理函数
const handleRegister = () => {
    if (!formData.ValidCode) {
        ElMessage({
            message:'请输入验证码',
            type:'error'
        })
        return;
    }
    // 检查账号是否已存在
    const accountExists = authStore.accounts.some(
        (acc: any) => acc.username === formData.UserName
    );
    if (accountExists) {
        ElMessage({
            message:'该账号已被注册',
            type:'error'
        })
        return;
    }
    authStore.addAccountFromForm(formData);
    ElMessage({
        message:'注册成功，请登录',
        type:'success'
    })
    // 注册成功后切换到登录
    formType.value = false;
};


const submit = async (formEl: any) => {
    if (!formEl) return
    await formEl.validate((valid: boolean, fields: any) => {
        console.log('@', valid, '#', fields)
        if (valid) {
            if (formType.value) {
                // 注册逻辑：保存新账号
                handleRegister();
            } else {
                // 登录逻辑：验证账号并登录
                handleLogin();
            }
        }
    });
};
</script>

<style lang="less" scoped>
html,
body {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
}

.main {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
}

.image {
    position: relative;
    width: 70%;
    height: 100%;
}

img {
    position: absolute;
    opacity: 0.5;
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.login {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: skyblue;
    object-fit: cover;

    .formLogin {
        background-color: #fff;
        padding: 30px;
        border-radius: 8px;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
        text-align: center;
        width: 50%;

        h4 {
            text-align: center;
            margin-bottom: 20px;
            color: #333;
            font-size: 18px;
        }

        .el-form-item {
            display: flex;
            justify-content: center;
        }

        .el-button {
            background-color: #409eff;
            border-color: #409eff;
            color: #fff;
            margin: 0 auto;
            display: block;
        }

        .el-button:hover {
            background-color: #66b1ff;
            border-color: #66b1ff;
        }

        .validata:hover {
            cursor: pointer;
        }
    }

    .link {
        text-align: right;
        margin-bottom: 0.625rem;

    }
}
</style>