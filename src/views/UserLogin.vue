<template>
    <v-container>
        <v-row justify="center">
            <v-col cols="12" sm="2" md="4">
                <v-card>
                    <v-card-title class="text-h5 text-center">
                        로그인
                    </v-card-title>
                    <v-card-text>
                        <v-form @keydown.enter="doLogin">
                            <v-text-field
                            label="loginId"
                            v-model="loginId"
                            prepend-icon="mdi-login"
                            required
                            />
                            <v-text-field
                            label="password"
                            v-model="password"
                            type="password"
                            prepend-icon="mdi-lock"
                            required
                            />
                            <v-row>
                                <v-col cols="12">
                                    <v-btn color="#c0c1ff" block @click="doLogin()" @keyup.enter="doLogin()">로그인</v-btn>
                                </v-col>
                            </v-row>
                        </v-form>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
    <v-dialog v-model="trueOrFalse" max-width="400px" @keydown.enter="resetModal()">
        <v-card>
            <v-card-text class="error-message">
                {{errorMessage}}
            </v-card-text>
            <v-card-actions>
                <v-btn color="c0c1ff" @click="resetModal()">확인</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
<script>
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

export default {
    data() {
        return {
            loginId:"",
            password:"",
            errorMessage:"",
            trueOrFalse:false
        }
    },
    methods: {
        async doLogin() {
            try{
            const loginData = {loginId:this.loginId, password:this.password};
            const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/user/login`, loginData)
            const token = response.data.result.token
            const refreshToken = response.data.result.refreshToken
            const nickName = jwtDecode(token).nickName
            const role = jwtDecode(token).role
            localStorage.setItem('token', token)
            localStorage.setItem('refreshToken', refreshToken)
            localStorage.setItem('nickName', nickName)
            localStorage.setItem('role', role)
            window.location.href = '/';
            }catch(error) {
                console.log(error)
                this.trueOrFalse=true
                this.errorMessage = error.response.data.status_message
            }
        },
        resetModal() {
            this.trueOrFalse = false
        }
    }
}
</script>
<style scoped>
/* 에러 메시지가 너무 길 경우 짤려서 끝에 ...으로 표현되는것 전체가 나오도록 수정 */
.error-message {
  white-space: normal; /* 기본 줄바꿈 허용 */
  word-wrap: break-word; /* 단어가 너무 길어도 자동 줄바꿈 */
  overflow-wrap: break-word; /* 긴 단어도 줄바꿈 가능 */
  text-align: center; /* 가운데 정렬 */
}
</style>