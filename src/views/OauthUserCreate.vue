<template>
    <v-container class="pt-6">
        <v-row justify="center">
            <v-col cols="12" sm="8" md="6" lg="5">
                <v-card class="elevation-3">
                    <v-card-title class="text-h5 font-weight-bold text-center pa-4">
                        추가 정보 입력
                    </v-card-title>
                    <v-divider></v-divider>
                    <v-card-text class="pa-6">
                        <v-form @keydown.enter="create" class="d-flex flex-column align-center">
                            <v-text-field
                                label="이름"
                                v-model="name"
                                prepend-icon="mdi-account"
                                variant="outlined"
                                hide-details
                                class="mb-4"
                                density="comfortable"
                                bg-color="white"
                                style="width: 300px;"
                                required
                            />
                            
                            <!-- 전화번호 입력 -->
                            <v-row no-gutters class="mb-4" style="width: 300px;">
                                <v-col cols="9">
                                    <v-text-field
                                        label="전화번호"
                                        v-model="phoneNumber"
                                        prepend-icon="mdi-phone"
                                        :disabled="isVerified"
                                        variant="outlined"
                                        hide-details
                                        density="comfortable"
                                        bg-color="white"
                                        required
                                        :hint="showHint ? `- 빼고 입력해주세요.` : ''"
                                        persistent-hint
                                        @input="showHint = !phoneNumber"
                                    />
                                </v-col>
                                <v-col cols="3" class="pl-2">
                                    <v-btn 
                                        @click="sendAuthCode" 
                                        :disabled="authSent || isVerified" 
                                        color="#6200ea"
                                        block
                                        class="mt-1"
                                        height="40"
                                    >
                                        인증요청
                                    </v-btn>
                                </v-col>
                            </v-row>

                            <!-- 인증번호 입력 -->
                            <div v-if="authSent" class="mb-4" style="width: 300px;">
                                <v-row no-gutters>
                                    <v-col cols="9">
                                        <v-text-field
                                            label="인증번호"
                                            v-model="authCode"
                                            prepend-icon="mdi-key"
                                            :disabled="isVerified"
                                            variant="outlined"
                                            hide-details
                                            density="comfortable"
                                            bg-color="white"
                                            required
                                        />
                                    </v-col>
                                    <v-col cols="3" class="pl-2">
                                        <v-btn 
                                            @click="verifyAuthCode" 
                                            :disabled="isVerified" 
                                            color="success" 
                                            block
                                            class="mt-1"
                                            height="40"
                                        >
                                            인증확인
                                        </v-btn>
                                    </v-col>
                                </v-row>
                            </div>

                            <!-- 인증 결과 표시 -->
                            <div style="width: 300px;">
                                <v-alert
                                    v-if="isVerified"
                                    type="success"
                                    dense
                                    text
                                    class="mb-4"
                                >
                                    인증이 완료되었습니다.
                                </v-alert>
                                <v-alert
                                    v-if="verifyError"
                                    type="error"
                                    dense
                                    text
                                    class="mb-4"
                                >
                                    인증에 실패했습니다. 다시 시도해주세요.
                                </v-alert>
                            </div>

                            <v-text-field
                                v-for="(field, index) in [{
                                    label: '닉네임',
                                    model: 'nickName',
                                    icon: 'mdi-rename'
                                }, {
                                    label: '블로그 링크',
                                    model: 'blogLink',
                                    icon: 'mdi-link-box-variant'
                                }, {
                                    label: '기수',
                                    model: 'batch',
                                    icon: 'mdi-flag'
                                }]"
                                :key="index"
                                :label="field.label"
                                v-model="$data[field.model]"
                                :prepend-icon="field.icon"
                                variant="outlined"
                                hide-details
                                class="mb-4"
                                density="comfortable"
                                bg-color="white"
                                style="width: 300px;"
                                required
                            />
                            
                            <v-btn 
                                color="#c0c1ff"
                                style="width: 300px;"
                                class="mt-6"
                                @click="create()"
                                height="48"
                            >
                                가입하기
                            </v-btn>
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

.v-btn {
    text-transform: none !important;
    letter-spacing: 0.5px;
    font-weight: 500;
}

.v-text-field ::v-deep .v-input__slot {
    min-height: 40px !important;
}

.v-btn:not(:disabled):hover {
    opacity: 0.9;
}
</style>
