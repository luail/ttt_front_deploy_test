<template>
    <v-container>
        <v-row justify="center">
            <v-col cols="12" sm="4" md="6">
                <v-card>
                    <v-card-title class="text-h5 text-center">
                        Tic Tac Toc
                    </v-card-title>
                    <v-card-text>
                        <v-carousel 
                            v-model="step" 
                            hide-delimiters 
                            :touchless="true" 
                            :show-arrows="false" 
                            delimiter-icon="mdi-circle"
                        >
                            <v-carousel-item>
                                <v-card-title class="text-h5 text-center">
                                    안녕하세요.
                                </v-card-title>
                            </v-carousel-item>
                            <!-- step 1 -->
                            <v-carousel-item>
                                <v-text-field
                                label="name"
                                v-model="name"
                                prepend-icon="mdi-account"
                                required
                                @keydown.enter="nextStep"
                                />
                                <div class="btn-group">
                                    <v-btn color="primary" class="next-btn" @click="nextStep" :disabled="!isStepValid">
                                        다음
                                    </v-btn>
                                </div>
                            </v-carousel-item>
                            <v-carousel-item>
                                <v-card-title class="text-h5 text-center">
                                    중간 프로젝트
                                </v-card-title>
                            </v-carousel-item>
                            <!-- step 2 --> 
                            <v-carousel-item>
                                <div class="email-container">
                                    <div class="email-fields">
                                        <v-text-field
                                            label="email"
                                            v-model="email"
                                            prepend-icon="mdi-email"
                                            required
                                            class="email-input"
                                            @input="validateEmail"
                                        />
                                        <div class="email-requirements">
                                            <div :class="['requirement', { 'requirement-met': isEmailValid }]">
                                                <v-icon x-small>{{ isEmailValid ? 'mdi-check' : 'mdi-close' }}</v-icon>
                                                <span>이메일 형식</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <v-text-field
                                    label="blogLink"
                                    v-model="blogLink"
                                    prepend-icon="mdi-link"
                                    required
                                />
                                <div class="btn-group">
                                    <v-btn color="primary" class="next-btn" @click="nextStep" :disabled="!isStepValid">
                                        다음
                                    </v-btn>
                                </div>
                            </v-carousel-item>
                            <v-carousel-item>
                                <v-card-title class="text-h5 text-center">
                                    다들 고생많으셨습니다.
                                </v-card-title>
                            </v-carousel-item>
                            <!-- step 3 --> 
                            <v-carousel-item>
                                <div class="id-container">
                                    <div class="id-fields">
                                        <v-text-field
                                            label="loginId"
                                            v-model="loginId"
                                            prepend-icon="mdi-account"
                                            required
                                            class="id-input"
                                            @input="resetIdCheck"
                                        />
                                        <v-btn
                                            small
                                            :loading="isCheckingId"
                                            :disabled="!loginId || isCheckingId"
                                            @click="checkLoginId"
                                            class="check-btn"
                                            :color="isIdAvailable ? 'success' : 'primary'"
                                        >
                                            중복확인
                                        </v-btn>
                                    </div>
                                    <div class="id-status" v-if="idCheckMessage">
                                        <v-icon small :color="isIdAvailable ? 'success' : 'error'">
                                            {{ isIdAvailable ? 'mdi-check' : 'mdi-close' }}
                                        </v-icon>
                                        <span :class="{ 'success--text': isIdAvailable, 'error--text': !isIdAvailable }">
                                            {{ idCheckMessage }}
                                        </span>
                                    </div>
                                </div>
                                <div class="btn-group">
                                    <v-btn color="primary" class="next-btn" @click="nextStep" :disabled="!isStepValid">
                                        다음
                                    </v-btn>
                                </div>
                            </v-carousel-item>
                            <v-carousel-item>
                                <v-card-title class="text-h5 text-center">
                                    최종 프로젝트
                                </v-card-title>
                            </v-carousel-item>
                            <!-- step 4 -->
                            <v-carousel-item>
                                <div class="password-container">
                                    <div class="password-fields">
                                        <v-text-field
                                            label="password"
                                            v-model="password"
                                            type="password"
                                            prepend-icon="mdi-lock"
                                            required
                                            :rules="passwordRules"
                                            class="password-input"
                                        />
                                        <div class="password-requirements">
                                            <div :class="['requirement', { 'requirement-met': hasLetter }]">
                                                <v-icon x-small>{{ hasLetter ? 'mdi-check' : 'mdi-close' }}</v-icon>
                                                <span>문자 포함</span>
                                            </div>
                                            <div :class="['requirement', { 'requirement-met': hasNumber }]">
                                                <v-icon x-small>{{ hasNumber ? 'mdi-check' : 'mdi-close' }}</v-icon>
                                                <span>숫자 포함</span>
                                            </div>
                                            <div :class="['requirement', { 'requirement-met': hasSpecial }]">
                                                <v-icon x-small>{{ hasSpecial ? 'mdi-check' : 'mdi-close' }}</v-icon>
                                                <span>특수문자 포함</span>
                                            </div>
                                            <div :class="['requirement', { 'requirement-met': lengthValid }]">
                                                <v-icon x-small>{{ lengthValid ? 'mdi-check' : 'mdi-close' }}</v-icon>
                                                <span>8-20자 이내</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="password-container">
                                    <div class="password-fields">
                                        <v-text-field
                                            label="passwordCheck"
                                            v-model="passwordCheck"
                                            type="password"
                                            prepend-icon="mdi-lock"
                                            required
                                            class="password-input"
                                        />
                                        <div class="password-requirements">
                                            <div class="requirement-placeholder" v-if="!passwordCheck">
                                                <div class="requirement">
                                                    <v-icon x-small>mdi-close</v-icon>
                                                    <span>비밀번호 확인 필요</span>
                                                </div>
                                            </div>
                                            <div :class="['requirement', { 'requirement-met': passwordsMatch }]" v-else>
                                                <v-icon x-small>{{ passwordsMatch ? 'mdi-check' : 'mdi-close' }}</v-icon>
                                                <span>비밀번호 일치</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="btn-group">
                                    <v-btn color="primary" class="next-btn" @click="nextStep" :disabled="!isStepValid">
                                        다음
                                    </v-btn>
                                </div>
                            </v-carousel-item>
                            <v-carousel-item>
                                <v-card-title class="text-h5 text-center">
                                    다같이 힘내서 최고의<br> 프로젝트를 만들어봅시다.
                                </v-card-title>
                            </v-carousel-item>
                            <!-- step 5 --> 
                            <v-carousel-item>
                                
                                <!-- 전화번호 입력 -->
                                <div class="input-group">
                                    <v-text-field
                                    label="phone number"
                                    v-model="phoneNumber"
                                    prepend-icon="mdi-phone"
                                    :disabled="isVerified"
                                    required
                                    :hint="showHint ? `- 빼고 입력해주세요.` : ''"
                                    persistent-hint
                                    @input="showHint = !phoneNumber"
                                    class="mb-0"
                                    />
                                    <v-btn @click="sendAuthCode" :disabled="authSent || isVerified" color="primary" class="mt-n2">
                                    인증요청
                                    </v-btn>
                                </div>

                                <!-- 인증번호 입력 (전송 후 표시) -->
                                <div v-if="authSent" class="input-group">
                                    <v-text-field
                                        label="인증번호"
                                        v-model="authCode"
                                        prepend-icon="mdi-key"
                                        :disabled="isVerified"
                                        required
                                        class="mb-0"
                                    />
                                    <v-btn @click="verifyAuthCode" :disabled="isVerified" color="success" class="mt-n2">
                                    인증확인
                                    </v-btn>
                                </div>

                                <!-- 인증 결과 표시 -->
                                <p v-if="isVerified" class="text-green">인증 완료! 수정 불가</p>
                                <p v-if="verifyError" class="text-red">인증 실패! 다시 입력해주세요.</p>
                                <div class="btn-group">
                                    <v-btn color="primary" class="next-btn" @click="nextStep" :disabled="!isStepValid">
                                        다음
                                    </v-btn>
                                </div>
                            </v-carousel-item>
                            <v-carousel-item>
                                <v-card-title class="text-h5 text-center">
                                    개그튼거.
                                </v-card-title>
                            </v-carousel-item>
                            <!-- step 6 -->
                            <v-carousel-item>
                                <v-text-field
                                label="nickName"
                                v-model="nickName"
                                prepend-icon="mdi-rename"
                                required
                                :rules="nicknameRules"
                                @input="validateNickname"
                                @keydown.enter.prevent
                                />
                                <div class="btn-group">
                                    <v-btn color="primary" class="next-btn" @click="nextStep" :disabled="!isNicknameValid">
                                        다음
                                    </v-btn>
                                </div>
                            </v-carousel-item>
                                
                            <v-carousel-item>
                                <v-card-title class="text-h5 text-center">
                                    죄송합니다.
                                </v-card-title>
                            </v-carousel-item>
                            <!-- step 7 -->
                            <v-carousel-item>
                                <v-text-field
                                label="batch"
                                v-model="batch"
                                prepend-icon="mdi-flag"
                                required
                                />
                                    <v-btn color="#c0c1ff" block @click="create()">가입완료</v-btn>
                            </v-carousel-item>
                        </v-carousel>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
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
            errorMessage:"",
            step: 0,
            nicknameRules: [
                v => !!v || '닉네임을 입력해주세요',
                v => (v && v.length >= 2) || '닉네임은 2자 이상이어야 합니다',
                // 필요한 다른 규칙들 추가
            ],
            isNicknameValid: false,
            passwordRules: [
                v => !!v || '비밀번호를 입력해주세요',
                v => (v && v.length >= 8) || '비밀번호는 최소 8자 이상이어야 합니다',
                v => (v && v.length <= 20) || '비밀번호는 최대 20자까지 가능합니다',
                v => /[a-zA-Z]/.test(v) || '최소 하나의 문자를 포함해야 합니다',
                v => /[0-9]/.test(v) || '최소 하나의 숫자를 포함해야 합니다',
                v => /[!@#$%^&*(),.?":{}|<>]/.test(v) || '최소 하나의 특수문자를 포함해야 합니다'
            ],
            isCheckingId: false,
            isIdAvailable: false,
            idCheckMessage: '',
            isEmailValid: false,
        }
    },
    computed: {
        isStepValid() {
            switch (this.step) {
                case 1: return this.name.trim() !== ""; 
                case 3: return this.isEmailValid && this.email.trim() !== "" && this.blogLink.trim() !== "";
                case 5: return this.loginId.trim() !== "" && this.isIdAvailable;
                case 7: return this.isPasswordValid && this.password === this.passwordCheck.trim();
                case 9: return this.isVerified;
                case 11: return this.isNicknameValid;
                case 13: return this.batch.trim() !== "";
                default: return true;
            }
        },
        isPasswordValid() {
            const password = this.password;
            
            // 길이 검사 (8-20자)
            const lengthValid = password.length >= 8 && password.length <= 20;
            
            // 문자 포함 검사
            const hasLetter = /[a-zA-Z]/.test(password);
            
            // 숫자 포함 검사
            const hasNumber = /[0-9]/.test(password);
            
            // 특수문자 포함 검사
            const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

            // 모든 조건을 만족하는지 확인
            return lengthValid && hasLetter && hasNumber && hasSpecial;
        },
        hasLetter() {
            return /[a-zA-Z]/.test(this.password);
        },
        hasNumber() {
            return /[0-9]/.test(this.password);
        },
        hasSpecial() {
            return /[!@#$%^&*(),.?":{}|<>]/.test(this.password);
        },
        lengthValid() {
            return this.password.length >= 8 && this.password.length <= 20;
        },
        passwordsMatch() {
            return this.password === this.passwordCheck && this.password !== '';
        }
    },
    methods: {
        nextStep() {
            if (this.isStepValid) {
                this.step++;
            }
        },
        autoSlideUI() {
            if ([0, 2, 4, 6, 8, 10, 12].includes(this.step)) { 
                setTimeout(() => {
                    this.step++;
                }, 2000);  // 1000ms -> 2000ms로 증가
            }
        },
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
                    this.$router.push('/ttt/user/login')
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
        },
        validateNickname() {
            this.isNicknameValid = this.nickName.length >= 2;
        },
        // ID 중복 확인 리셋
        resetIdCheck() {
            this.isIdAvailable = false;
            this.idCheckMessage = '';
        },

        // ID 중복 확인
        async checkLoginId() {
            if (!this.loginId) return;
            
            this.isCheckingId = true;
            try {
                const response = await axios.get(
                    `${process.env.VUE_APP_API_BASE_URL}/user/checkLoginId`,
            { params: { loginId: this.loginId } });

            console.log("Server response:", response); // 🛠 서버 응답 확인

                if (response.data.result) {
                    this.isIdAvailable = true;
                    this.idCheckMessage = '사용 가능한 아이디입니다.';
                } else {
                    this.isIdAvailable = false;
                    this.idCheckMessage = '이미 사용 중인 아이디입니다.';
                }
            } catch (error) {
                console.error('ID 중복 확인 실패:', error);
                this.isIdAvailable = false;
                this.idCheckMessage = '중복 확인 중 오류가 발생했습니다.';
            } finally {
                this.isCheckingId = false;
            }
        },
        validateEmail() {
            // 이메일 정규식 패턴
            const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
            this.isEmailValid = emailPattern.test(this.email);
        },
    },
    watch: {
        step(newStep, oldStep) {
            if ([0, 2, 4, 6, 8, 10, 12].includes(newStep) && newStep !== oldStep) {
                this.autoSlideUI();
            }
        }
    },
    mounted() {
        this.autoSlideUI();
    }
}
</script>

<style scoped>
/* 전체 컨테이너 스타일 */
.v-container {
    background: linear-gradient(135deg, #f0f0ff 0%, #e6e7ff 100%);
    min-height: 100vh;
    padding: 4rem 0;
    position: relative;
    overflow: hidden;
}

/* 배경 장식 요소 */
.v-container::before {
    content: '';
    position: absolute;
    width: 60vw;
    height: 60vw;
    background: linear-gradient(45deg, rgba(192, 193, 255, 0.4), rgba(139, 92, 246, 0.4));
    border-radius: 50%;
    filter: blur(80px);
    top: -20vw;
    right: -20vw;
    z-index: 0;
}

.v-container::after {
    content: '';
    position: absolute;
    width: 50vw;
    height: 50vw;
    background: linear-gradient(45deg, rgba(139, 92, 246, 0.4), rgba(192, 193, 255, 0.4));
    border-radius: 50%;
    filter: blur(80px);
    bottom: -20vw;
    left: -20vw;
    z-index: 0;
}

/* 카드 디자인 - 배경 더 진하게 수정 */
.v-card {
    border: none;
    border-radius: 30px;
    box-shadow: 
        0 20px 60px rgba(0, 0, 0, 0.1),
        0 0 0 1px rgba(255, 255, 255, 0.8) inset;
    padding: 48px;
    background: rgba(255, 255, 255, 0.99); /* 거의 불투명하게 변경 */
    backdrop-filter: blur(20px);
    transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    height: 450px;  /* 카드 높이 축소 */
    max-width: 800px;
    margin: 0 auto;
    position: relative;
    z-index: 1;
    overflow: visible;  /* overflow 제거 */
    display: flex;        /* flex 추가 */
    flex-direction: column; /* 세로 방향 정렬 */
}

/* TTT 배경 패턴 - 더 선명하게 수정 */
.v-card::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 100%;
    height: 100%;
    background: 
        linear-gradient(135deg, transparent 0%, rgba(192, 193, 255, 0.2) 100%),
        url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-weight='bold' font-size='20' fill='rgba(192, 193, 255, 0.2)'%3ETTT%3C/text%3E%3C/svg%3E") repeat;
    opacity: 0.85; /* 불투명도 증가 */
    z-index: -1;
}

/* 타이틀 스타일 */
.v-card-title {
    font-size: 2.4rem;
    font-weight: 800;
    background: linear-gradient(135deg, #c0c1ff 0%, #8b5cf6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-align: center;
    margin-bottom: 2.5rem;
    letter-spacing: -0.5px;
    position: relative;
}

.v-card-title::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 3px;
    background: linear-gradient(90deg, #c0c1ff, #8b5cf6);
    border-radius: 3px;
}

/* 카드 컨텐츠 중앙 정렬 */
.v-card-text {
    flex: 1;             /* 남은 공간 차지 */
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
}

/* 텍스트 필드 간격 최소화 */
:deep(.v-text-field) {
    margin-bottom: 0 !important;     /* 하단 마진 제거 */
    padding-top: 8px !important;     /* 상단 패딩 축소 */
    margin-top: -8px !important;     /* 상단 마진 음수값으로 더 붙이기 */
}

/* 텍스트 필드 내부 여백 조정 */
:deep(.v-input__control) {
    min-height: unset !important;    /* 최소 높이 제거 */
}

:deep(.v-field__field) {
    padding-top: 8px !important;     /* 필드 내부 패딩 축소 */
}

/* 텍스트 필드 기본 스타일 */
:deep(.v-text-field .v-input__slot) {
    border-radius: 12px;
    background: #f5f5f7 !important;
    border: none;
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    height: 60px;
    padding: 0 20px;
    box-shadow: 
        inset 0 0 0 1px rgba(0, 0, 0, 0.1),
        0 2px 4px rgba(0, 0, 0, 0.02);
}

/* 라벨 스타일 */
:deep(.v-text-field .v-label) {
    font-size: 0.9rem;
    font-weight: 500;
    color: #86868b;
    letter-spacing: -0.2px;
    transform-origin: left center;
    top: 24px; /* 라벨 시작 위치 조정 */
    margin-left: 16px; /* 좌측 여백 추가 */
}

/* 포커스되거나 값이 있을 때의 라벨 */
:deep(.v-text-field--focused .v-label),
:deep(.v-text-field--label-active .v-label) {
    color: #0071e3;
    transform: translateY(-24px) scale(0.85); /* 위치 조정 */
    margin-left: 0; /* 활성화 시 여백 제거 */
}

/* 입력 텍스트 스타일 */
:deep(.v-text-field input) {
    font-size: 1rem;
    font-weight: 500;
    color: #1d1d1f;
    letter-spacing: -0.3px;
    padding: 8px 0 0 0; /* 상단 패딩 조정 */
    margin-top: 4px; /* 위치 미세 조정 */
}

/* 아이콘 스타일 */
:deep(.v-input__prepend-inner) {
    margin-top: 16px !important; /* 아이콘 위치 조정 */
    margin-right: 12px;
    color: #86868b;
}

/* 힌트 및 에러 메시지 */
:deep(.v-text-field .v-messages) {
    font-size: 0.85rem;
    min-height: 20px;
    padding-left: 16px;
}

:deep(.v-text-field .v-messages__message) {
    color: #86868b;
    line-height: 1.4;
}

/* 에러 상태 */
:deep(.v-text-field.error--text .v-input__slot) {
    box-shadow: 
        inset 0 0 0 2px #ff3b30,
        0 4px 8px rgba(255, 59, 48, 0.1);
    background: #ffffff !important;
}

:deep(.v-text-field.error--text .v-messages__message) {
    color: #ff3b30;
}

/* 비활성화 상태 */
:deep(.v-text-field.v-input--is-disabled .v-input__slot) {
    background: #f5f5f7 !important;
    opacity: 0.7;
}

/* 필수 입력 표시 */
:deep(.v-text-field--required .v-label::after) {
    content: ' *';
    color: #0071e3;
}

/* 반응형 디자인 */
@media (max-width: 600px) {
    :deep(.v-text-field .v-input__slot) {
        height: 54px;
    }

    :deep(.v-text-field .v-label) {
        font-size: 0.85rem;
    }

    :deep(.v-text-field input) {
        font-size: 0.95rem;
    }

    :deep(.v-input__prepend-inner) {
        margin-top: 16px !important;
    }
}

/* 입력 필드 포커스 애니메이션 */
@keyframes focusIn {
    0% { transform: scale(0.98); }
    100% { transform: scale(1); }
}

:deep(.v-text-field--focused) {
    animation: focusIn 0.2s ease-out;
}

/* 버튼 그룹 스타일 */
.btn-group {
    margin-top: auto;    /* 상단 여백 자동 */
    padding: 16px;       /* 여백 추가 */
    width: 100%;
    text-align: center;
}

/* 제출 버튼 스타일 */
.v-btn.block {
    background: linear-gradient(135deg, #c0c1ff 0%, #8b5cf6 100%);
    font-weight: 600;
    letter-spacing: -0.3px;
    height: 52px;
    border-radius: 14px;
    box-shadow: 0 4px 15px rgba(139, 92, 246, 0.2);
    margin-top: 1.5rem;
}

.v-btn.block:hover {
    box-shadow: 0 8px 25px rgba(139, 92, 246, 0.3);
    transform: translateY(-2px);
}

/* 상태 메시지 스타일 */
.text-green {
    color: #1d1d1f;
    font-weight: 500;
    font-size: 1rem;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    background: rgba(192, 193, 255, 0.1);
    border-radius: 14px;
    margin: 12px 0;
}

.text-red {
    color: #ff3b30;
    font-weight: 500;
    font-size: 1rem;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    background: rgba(255, 59, 48, 0.1);
    border-radius: 14px;
    margin: 12px 0;
}

/* 애니메이션 효과 */
@keyframes fadeIn {
    from { 
        opacity: 0; 
        transform: translateY(20px);
    }
    to { 
        opacity: 1; 
        transform: translateY(0);
    }
}

.v-carousel-item {
    animation: fadeIn 1.2s cubic-bezier(0.16, 1, 0.3, 1);
}

/* 캐러셀 트랜지션 속도 조정 */
:deep(.v-carousel__item) {
    height: 100% !important;
    padding: 20px;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

/* 인증 버튼 컨테이너 스타일 */
.verification-btn {
    margin-top: -8px !important;     /* 상단 마진을 음수값으로 설정 */
    margin-bottom: 8px !important;   /* 하단 여백 최소화 */
}

/* 인증번호 입력 필드와 버튼 컨테이너 */
.verification-group {
    display: flex;
    align-items: flex-start;         /* 상단 정렬 */
    gap: 8px;                        /* 요소 간 간격 */
    margin-top: -8px !important;     /* 상단 마진 음수값 */
}

/* 인증번호 입력 필드 */
.verification-group :deep(.v-text-field) {
    flex: 1;                         /* 남은 공간 차지 */
    margin-bottom: 0 !important;     /* 하단 마진 제거 */
}

.input-group {
    display: flex;
    flex-direction: column;
    gap: 4px;  /* 요소 간 간격 최소화 */
}

.v-btn {
    margin-top: -8px !important;  /* 버튼 위치 위로 당기기 */
}

/* 기존 스타일 유지 */
.password-container {
    position: relative;
    margin-bottom: 16px;
}

.password-fields {
    display: flex;
    align-items: flex-start;
    gap: 16px;
}

.password-input {
    flex: 1;
    min-width: 0; /* 텍스트 필드 크기 안정화 */
}

.password-requirements {
    min-width: 120px;
    width: 120px; /* 고정 너비 설정 */
    padding: 8px;
    background: #f8f9fa;
    border-radius: 8px;
    font-size: 0.75rem;
    margin-top: 8px;
}

.requirement {
    display: flex;
    align-items: center;
    gap: 4px;
    margin: 4px 0;
    color: #ff5252;
    font-size: 0.7rem;
    white-space: nowrap;
}

.requirement-met {
    color: #4caf50;
}

.requirement .v-icon {
    font-size: 12px !important;
}

.requirement-placeholder {
    min-height: 24px; /* 최소 높이 설정 */
    display: flex;
    align-items: center;
}

.password-match {
    margin: 8px 0;
    font-size: 0.8rem;
    color: #666;
    padding-left: 40px;
}

.id-container {
    margin-bottom: 16px;
}

.id-fields {
    display: flex;
    align-items: flex-start;
    gap: 8px;
}

.id-input {
    flex: 1;
}

.check-btn {
    margin-top: 8px;
    height: 36px;
    white-space: nowrap;
}

.id-status {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 8px;
    padding-left: 40px;
    font-size: 0.8rem;
}

.email-container {
    position: relative;
    margin-bottom: 16px;
}

.email-fields {
    display: flex;
    align-items: flex-start;
    gap: 16px;
}

.email-input {
    flex: 1;
    min-width: 0;
}

.email-requirements {
    min-width: 120px;
    width: 120px;
    padding: 8px;
    background: #f8f9fa;
    border-radius: 8px;
    font-size: 0.75rem;
    margin-top: 8px;
}

.requirement {
    display: flex;
    align-items: center;
    gap: 4px;
    margin: 4px 0;
    color: #ff5252;
    font-size: 0.7rem;
    white-space: nowrap;
}

.requirement-met {
    color: #4caf50;
}

.requirement .v-icon {
    font-size: 12px !important;
}
</style>