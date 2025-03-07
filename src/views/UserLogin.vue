<template>
    <v-container class="fill-height">
        <v-row justify="center" align="center">
            <v-col cols="12" sm="6" md="4">
                <v-card>
                    <v-card-title class="text-center flex-column">
                        <h1 class="logo mb-4">
                            <span class="highlight">T</span><span class="small-text">ik </span>
                            <span class="highlight">T</span><span class="small-text">ak </span>
                            <span class="highlight">T</span><span class="small-text">ok</span>
                        </h1>
                        <div class="d-flex flex-column align-center">
                            <span class="welcome-text text-h5">TTT에 오신것을 환영합니다</span>
                            <span class="description-text text-caption text-grey-darken-1 mt-2">TTT는 한화 BEYOND SW 캠프 커뮤니티입니다</span>
                        </div>
                    </v-card-title>
                    <div></div>
                    <v-card-text>
                        <v-form @keydown.enter="doLogin" class="d-flex flex-column align-center">
                            <v-text-field
                                label="아이디"
                                v-model="loginId"
                                prepend-icon="mdi-account"
                                variant="outlined"
                                hide-details
                                class="mb-4"
                                density="comfortable"
                                bg-color="white"
                                style="width: 300px;"
                                required
                            />
                            <v-text-field
                                label="비밀번호"
                                v-model="password"
                                type="password"
                                prepend-icon="mdi-lock"
                                variant="outlined"
                                hide-details
                                class="mb-6"
                                density="comfortable"
                                bg-color="white"
                                style="width: 300px;"
                                required
                            />

                          
                          <br>
                            <div class="d-flex justify-center">
                                <v-btn
                                    color="#c0c1ff"
                                    style="width: 300px;"
                                    class="mb-4"
                                    @click="doLogin()"
                                    @keyup.enter="doLogin()"
                                >
                                    로그인
                                </v-btn>
                            </div>
                            <div class="d-flex align-center justify-center mt-2">
                              <span class="text-body-2 text-grey-darken-1 text-center">아직 회원이 아니신가요?</span>
                              <v-btn
                                variant="text"
                                class="text-none"
                                color="#6200ea"
                                @click="toCreate"
                              >
                                회원가입
                              </v-btn>
                            </div>
                        </v-form>

                        <!-- oauth 로그인 -->
                        <v-divider class="my-4"></v-divider>
                        <div class="d-flex flex-column align-center gap-4">
                            <button class="gsi-material-button" @click="googleLogin">
                              <div class="gsi-material-button-state"></div>
                              <div class="gsi-material-button-content-wrapper">
                                <div class="gsi-material-button-icon">
                                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" xmlns:xlink="http://www.w3.org/1999/xlink" style="display: block;">
                                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                                    <path fill="none" d="M0 0h48v48H0z"></path>
                                  </svg>
                                </div>
                                <span class="gsi-material-button-contents">구글 로그인</span>
                                <span style="display: none;">구글 로그인</span>
                              </div>
                            </button>
                            <img
                                src="@/assets/kakao_login_medium_wide.png"
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
import {jwtDecode} from 'jwt-decode';

export default {
    data() {
        return {
            loginId:"",
            password:"",
            errorMessage:"",
            trueOrFalse:false,

            googleOAuthUrl: "https://accounts.google.com/o/oauth2/auth", // Google OAuth URL
            googleClientId: "906300369324-bj1gkpi8ltlkr4jjq40pq8orl90ulvbg.apps.googleusercontent.com", // Google Cloud Console에서 생성한 Client ID
            googleRedirectUri: "https://www.tiktaktok.site/oauth/google/redirect", // Google API에 등록된 Redirect URI
            // https://www.googleapis.com/auth/userinfo.email 또는 email로 사용가능
            googleScope: "openid email profile", // openid와 picture는 기본적으로 제공. email은 요청시 별도의 console설정없이도 제공

            kakaoOAuthUrl: "https://kauth.kakao.com/oauth/authorize", // Kakao OAuth URL
            kakaoClientId: "d4582d3d057eb4fcd270886537698cd9", // Kakao Cloud Console에서 생성한 Client ID
            kakaoRedirectUri: "https://www.tiktaktok.site/oauth/kakao/redirect", // Kakao API에 등록된 Redirect URI
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
            window.location.href = '/ttt';
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
      toCreate() {
        this.$router.push('/ttt/user/create');
      },
        googleLoginServer(){
            // 이 요청은 서버를통해 OAuth 제공자(Google)로 이동하므로, 서버로부터 jwt토큰을 받을때 리다이렉트 방식으로 밖에 받을수 없음.
            window.location.href = "https://server.tiktaktok.site/oauth2/authorization/google";
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

.gsi-material-button {
  -moz-user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
  -webkit-appearance: none;
  background-color: WHITE;
  background-image: none;
  border: 1px solid #dadce0;
  -webkit-border-radius: 4px;
  border-radius: 4px;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  color: #1f1f1f;
  cursor: pointer;
  font-family: 'Roboto', arial, sans-serif;
  font-size: 14px;
  height: 40px;
  letter-spacing: 0.25px;
  outline: none;
  overflow: hidden;
  padding: 0 12px;
  position: relative;
  text-align: center;
  -webkit-transition: background-color .218s, border-color .218s, box-shadow .218s;
  transition: background-color .218s, border-color .218s, box-shadow .218s;
  vertical-align: middle;
  white-space: nowrap;
  width: 265px;
  max-width: 400px;
  min-width: min-content;
}

.gsi-material-button .gsi-material-button-icon {
  height: 20px;
  margin-right: 12px;
  min-width: 20px;
  width: 20px;
}

.gsi-material-button .gsi-material-button-content-wrapper {
  -webkit-align-items: center;
  align-items: center;
  display: flex;
  -webkit-flex-direction: row;
  flex-direction: row;
  -webkit-flex-wrap: nowrap;
  flex-wrap: nowrap;
  height: 100%;
  justify-content: space-between;
  position: relative;
  width: 100%;
}

.gsi-material-button .gsi-material-button-contents {
  -webkit-flex-grow: 1;
  flex-grow: 1;
  font-family: 'Roboto', arial, sans-serif;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: top;
}

.gsi-material-button .gsi-material-button-state {
  -webkit-transition: opacity .218s;
  transition: opacity .218s;
  bottom: 0;
  left: 0;
  opacity: 0;
  position: absolute;
  right: 0;
  top: 0;
}

.gsi-material-button:disabled {
  cursor: default;
  background-color: #ffffff61;
  border-color: #1f1f1f1f;
}

.gsi-material-button:disabled .gsi-material-button-contents {
  opacity: 38%;
}

.gsi-material-button:disabled .gsi-material-button-icon {
  opacity: 38%;
}

.gsi-material-button:not(:disabled):active .gsi-material-button-state, 
.gsi-material-button:not(:disabled):focus .gsi-material-button-state {
  background-color: #303030;
  opacity: 12%;
}

.gsi-material-button:not(:disabled):hover {
  -webkit-box-shadow: 0 1px 2px 0 rgba(60, 64, 67, .30), 0 1px 3px 1px rgba(60, 64, 67, .15);
  box-shadow: 0 1px 2px 0 rgba(60, 64, 67, .30), 0 1px 3px 1px rgba(60, 64, 67, .15);
}

.gsi-material-button:not(:disabled):hover .gsi-material-button-state {
  background-color: #303030;
  opacity: 8%;
}

.logo .highlight {
  font-size: 2rem;
  font-weight: bold;
  color: #6200ea;
}

.logo .small-text {
  font-size: 1.2rem;
  color: black;
  font-weight: normal;
}

.welcome-text {
  font-family: 'Noto Sans KR', 'sans-serif';
  font-weight: 600;
}

.description-text {
  font-family: 'Pretendard', sans-serif;
  font-weight: 400;
}
</style>