<template>
    <v-container class="fill-height">
        <v-row justify="center" align="center">
            <v-col cols="12" sm="6" md="4">
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
                            <div class="d-flex justify-center">
                                <v-btn 
                                    color="#c0c1ff" 
                                    block
                                    class="mb-4"
                                    @click="doLogin()" 
                                    @keyup.enter="doLogin()"
                                >
                                    로그인
                                </v-btn>
                            </div>
                        </v-form>

                        <!-- oauth 로그인 -->
                        <v-divider class="mb-4"></v-divider>
                        <div class="d-flex justify-center gap-4">
                            <img 
                                src="@/assets/google_login.png" 
                                class="oauth-btn"
                                @click="googleLogin"
                            />
                            <img 
                                src="@/assets/kakao_login.png" 
                                class="oauth-btn"
                                @click="kakaoLogin"
                            />
                        </div>
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
            trueOrFalse:false,

            googleOAuthUrl: "https://accounts.google.com/o/oauth2/auth", // Google OAuth URL
            googleClientId: "906300369324-bj1gkpi8ltlkr4jjq40pq8orl90ulvbg.apps.googleusercontent.com", // Google Cloud Console에서 생성한 Client ID
            googleRedirectUri: "http://localhost:3000/oauth/google/redirect", // Google API에 등록된 Redirect URI
            // https://www.googleapis.com/auth/userinfo.email 또는 email로 사용가능
            googleScope: "openid email profile", // openid와 picture는 기본적으로 제공. email은 요청시 별도의 console설정없이도 제공

            kakaoOAuthUrl: "https://kauth.kakao.com/oauth/authorize", // Kakao OAuth URL
            kakaoClientId: "d4582d3d057eb4fcd270886537698cd9", // Kakao Cloud Console에서 생성한 Client ID
            kakaoRedirectUri: "http://localhost:3000/oauth/kakao/redirect", // Kakao API에 등록된 Redirect URI
            // kakaoScope: "" // 카카오의 scope는 developers 세팅에서 결정되므로, 요청을 보낼때 의미가 없음.
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
        },
        googleLogin() {
            const auth_url = `${this.googleOAuthUrl}?client_id=${this.googleClientId}&redirect_uri=${this.googleRedirectUri}&response_type=code&scope=${this.googleScope}`;
            window.location.href = auth_url;
        },
        googleLoginServer(){
            // 이 요청은 서버를통해 OAuth 제공자(Google)로 이동하므로, 서버로부터 jwt토큰을 받을때 리다이렉트 방식으로 밖에 받을수 없음.
            window.location.href = "http://localhost:8080/oauth2/authorization/google";
        },
        kakaoLogin() {
            const auth_url = `${this.kakaoOAuthUrl}?client_id=${this.kakaoClientId}&redirect_uri=${this.kakaoRedirectUri}&response_type=code`;
            window.location.href = auth_url;
        },
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

/* 컨테이너가 전체 높이를 사용하도록 설정 */
.fill-height {
    height: 100vh;
}

.oauth-btn {
    height: 40px;
    width: auto;
    cursor: pointer;
    transition: transform 0.2s;
}

.oauth-btn:hover {
    transform: scale(1.05);
}

.mb-4 {
    margin-bottom: 16px;
}

.gap-4 {
    gap: 16px;
}
</style>