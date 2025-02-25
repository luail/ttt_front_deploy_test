<template>
    <v-container>
        <v-row justify="center">
            <v-col cols="12" sm="4" md="6">
                <v-card>
                    <v-card-title class="text-h5 text-center">
                        추가 정보 입력
                    </v-card-title>
                    <v-card-text>
                        <v-form @keydown.enter="create">
                            <v-text-field
                            label="name"
                            v-model="name"
                            prepend-icon="mdi-account"
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
            email: "",
            socialId: "",
            socialType: "",
            name: "",
            phoneNumber: "",
            authCode: "",
            authSent: false,
            isVerified: false,
            verifyError: false,
            showHint: true,
            nickName: "",
            blogLink: "",
            batch: "",
            trueOrFalse: false,
            errorMessage: "",
        }
    },
    created() {
        // URL 쿼리 파라미터에서 email과 socialId 가져오기
        const oauthInfo = JSON.parse(localStorage.getItem('oauthInfo') || '{}');
        localStorage.removeItem('oauthInfo');
        
        // socialType에 따라 다른 경로에서 이메일과 socialId 가져오기
        if (oauthInfo.socialType === "GOOGLE") {
            this.email = oauthInfo.email;
            this.socialId = oauthInfo.sub;
        } else {
            this.email = oauthInfo.kakao_account.email;
            this.socialId = oauthInfo.id;
        }
            
        this.socialType = oauthInfo.socialType;
    },
    methods: {
        async create() {
            const data = {
                email: this.email,
                socialId: this.socialId,
                socialType: this.socialType,
                name: this.name,
                phoneNumber: this.phoneNumber,
                nickName: this.nickName,
                blogLink: this.blogLink,
                batch: this.batch,
                authCode: this.authCode,
                loginId: this.email
            };
            console.log(data)

            try {
                if(this.isVerified){
                    await axios.post(`${process.env.VUE_APP_API_BASE_URL}/user/oauth/create`, data)
                    this.$router.push('/ttt/user/login')
                }else{
                    alert("휴대폰 인증을 완료해주세요.")
                }
            } catch(error) {
                console.log(error)
                this.trueOrFalse = true
                this.errorMessage = error.response.data.status_message
            }
        },
        // 인증번호 요청
        async sendAuthCode() {
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
                this.authSent = true;
            } catch (error) {
                console.error("인증번호 요청 실패", error);
                alert("인증번호 요청에 실패했습니다. 다시 시도해주세요.");
            }
        },

        // 인증번호 검증
        async verifyAuthCode() {
            try {
                const response = await axios.post("http://localhost:8080/sms/verify-auth", {
                    phoneNumber: this.phoneNumber,
                    authCode: this.authCode
                });
                if (response.data === "인증 성공!") {
                    this.isVerified = true;
                    this.verifyError = false;
                } else {
                    this.verifyError = true;
                }
            } catch (error) {
                console.error("인증 확인 실패", error);
                this.verifyError = true;
            }
        },
        resetModal() {
            this.trueOrFalse=false
        }
    }
}
</script>

<style scoped>
.error-message {
    white-space: normal;
    word-wrap: break-word;
    overflow-wrap: break-word;
    text-align: center;
}
</style>
