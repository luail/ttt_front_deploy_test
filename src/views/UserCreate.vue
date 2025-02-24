<template>
    <v-container>
        <v-row justify="center">
            <v-col cols="12" sm="4" md="6">
                <v-card>
                    <v-card-title class="text-h5 text-center">
                        회원가입
                    </v-card-title>
                    <v-card-text>
                        <v-form @keydown.enter="create">
                            <v-text-field
                            label="name"
                            v-model="name"
                            prepend-icon="mdi-account"
                            required
                            />
                            <v-text-field
                            label="email"
                            v-model="email"
                            type="email"
                            prepend-icon="mdi-email"
                            required
                            />
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
                            <v-text-field
                            label="passwordCheck"
                            v-model="passwordCheck"
                            type="password"
                            prepend-icon="mdi-lock"
                            required
                            />
                            <!-- 전화번호 입력 -->
                                <v-text-field
                                label="phone number"
                                v-model="phoneNumber"
                                prepend-icon="mdi-phone"
                                :disabled="isVerified"
                                required
                                :hint="showHint ? `- 빼고 입력해주세요.` : ''"
                                persistent-hint
                                @input="showHint = !phoneNumber"
                                />
                                <v-btn @click="sendAuthCode" :disabled="authSent || isVerified" color="primary">
                                인증요청
                                </v-btn>

                                <!-- 인증번호 입력 (전송 후 표시) -->
                                <div v-if="authSent">
                                <v-text-field
                                    label="인증번호"
                                    v-model="authCode"
                                    prepend-icon="mdi-key"
                                    :disabled="isVerified"
                                    required
                                />
                                <v-btn @click="verifyAuthCode" :disabled="isVerified" color="success">
                                인증확인
                                </v-btn>
                                </div>

                                <!-- 인증 결과 표시 -->
                                <p v-if="isVerified" class="text-green">인증 완료! 수정 불가</p>
                                <p v-if="verifyError" class="text-red">인증 실패! 다시 입력해주세요.</p>
                            <v-text-field
                            label="nickName"
                            v-model="nickName"
                            prepend-icon="mdi-rename"
                            required
                            />
                            <v-text-field
                            label="blogLink"
                            v-model="blogLink"
                            prepend-icon="mdi-link-box-variant"
                            required
                            />
                            <v-text-field
                            label="batch"
                            v-model="batch"
                            prepend-icon="mdi-flag"
                            required
                            />
                            <v-row>
                                <v-col cols="12">
                                    <v-btn color="#c0c1ff" block @click="create()">제출</v-btn>
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

export default {
    data() {
        return {
            name:"",
            email:"",
            loginId:"",
            password:"",
            passwordCheck:"",
            phoneNumber: "",  // 전화번호 입력 값
            authCode: "",  // 인증번호 입력 값
            authSent: false,  // 인증번호 요청 여부
            isVerified: false,  // 인증 성공 여부
            verifyError: false,  // 인증 실패 여부
            showHint: true, // 힌트 표시 여부
            nickName:"",
            blogLink:"",
            batch:"",
            trueOrFalse:false,
            errorMessage:""
            
        }
    },
    methods: {
        async create() {
                const data = {
                    name:this.name, 
                    email:this.email, 
                    loginId:this.loginId, 
                    password:this.password,
                    phoneNumber:this.phoneNumber, 
                    nickName:this.nickName, 
                    blogLink:this.blogLink, 
                    batch:this.batch,
                    authCode:this.authCode
                };

                if(this.password != this.passwordCheck) {
                    console.log(this.password)
                    console.log(this.passwordCheck)
                    this.errorMessage="password와 passwordCheck가 일치하지 않습니다."
                    this.trueOrFalse=true;
                    return
                }
            try{
                if(this.isVerified){
                    await axios.post(`${process.env.VUE_APP_API_BASE_URL}/user/create`, data)
                    this.$router.push('/')
                }else{
                    alert("다시요")
                }
            }  catch(error) {
                console.log(error)
                this.trueOrFalse=true
                this.errorMessage = error.response.data.status_message
            }

        },
        // 인증번호 요청
        async sendAuthCode() {
            console.log(this.phoneNumber);

            // 전화번호가 없거나 하이픈(-)이 포함된 경우 alert 처리
            if (!this.phoneNumber.trim()) {
                alert("전화번호를 입력해주세요.");
                return;
            }
            if (this.phoneNumber.includes("-")) {
                alert("전화번호에 '-'를 제거해주세요.");
                return;
            }

            try {
                const response = await axios.post("http://localhost:8080/sms/send-auth", { phoneNumber: this.phoneNumber });
                console.log("인증번호 전송 결과:", response.data);
                this.authSent = true; // 인증번호 입력란 활성화
            } catch (error) {
                console.error("인증번호 요청 실패", error);
                alert("인증번호 요청에 실패했습니다. 다시 시도해주세요.");
            }
        },

        // 인증번호 검증
        async verifyAuthCode() {
        try {
            const response = await axios.post("http://localhost:8080/sms/verify-auth", {phoneNumber: this.phoneNumber,
            authCode: this.authCode});
            console.log(response);
            if (response.data === "인증 성공!") {
            this.isVerified = true; // 인증 성공하면 입력 비활성화
            this.verifyError = false;
            } else {
            this.verifyError = true;
            }
        } catch (error) {
            console.error("인증 확인 실패", error);
            this.verifyError = true;
        }
        console.log("isVerified 상태:", this.isVerified);
        },
        resetModal() {
            this.trueOrFalse=false
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