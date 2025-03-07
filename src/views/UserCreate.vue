<template>
    <v-container class="pt-6">
        <v-row justify="center">
            <v-col cols="12" sm="8" md="6" lg="5">
                <v-card class="elevation-3" style="width: 500px; height: auto; min-height: 300px; margin: 0 auto; overflow-y: auto;">
                    <v-card-title class="text-h5 font-weight-bold text-center pa-1">
                        <h1 class="logo mb-2">
                            <span class="highlight">T</span><span class="small-text">ik </span>
                            <span class="highlight">T</span><span class="small-text">ak </span>
                            <span class="highlight">T</span><span class="small-text">ok</span>
                        </h1>
                    </v-card-title>
                    <v-divider></v-divider>
                    <v-card-text class="pa-6">
                        <v-carousel 
                            v-model="step" 
                            hide-delimiters 
                            :touchless="true" 
                            :show-arrows="false"
                            height="auto"
                        >
                            <!-- 환영 화면 -->
                            <v-carousel-item>
                                <v-card-title class="welcome-title text-center mb-6">
                                    <div class="welcome-text">
                                        <div class="main-text">TTT에 오신걸</div>
                                        <div class="sub-text">환영합니다</div>
                                    </div>
                                </v-card-title>
                            </v-carousel-item>

                            <!-- 이름 입력 -->
                            <v-carousel-item>
                                <div class="d-flex flex-column align-center pt-6">
                                    <v-text-field
                                        label="이름"
                                        v-model="name"
                                        prepend-icon="mdi-account"
                                        variant="outlined"
                                        hide-details
                                        class="mb-2"
                                        density="comfortable"
                                        bg-color="white"
                                        style="width: 300px;"
                                        required
                                        @keydown.enter="nextStep"
                                    />
                                    <v-btn 
                                        color="#6200ea"
                                        style="width: 300px;"
                                        class="mt-6"
                                        @click="nextStep"
                                        height="48"
                                        :disabled="!isStepValid"
                                    >
                                        다음
                                    </v-btn>
                                </div>
                            </v-carousel-item>

                            <!-- 이메일 및 블로그 입력 -->
                            <v-carousel-item>
                                <div class="d-flex flex-column align-center pt-6">
                                    <v-text-field
                                        label="이메일"
                                        v-model="email"
                                        prepend-icon="mdi-email"
                                        variant="outlined"
                                        :error-messages="!isEmailValid && email ? '올바른 이메일 형식이 아닙니다' : ''"
                                        class="mb-2"
                                        density="comfortable"
                                        bg-color="white"
                                        style="width: 300px;"
                                        required
                                        @input="validateEmail"
                                    />
                                    <v-text-field
                                        label="블로그 링크"
                                        v-model="blogLink"
                                        prepend-icon="mdi-link"
                                        variant="outlined"
                                        hide-details
                                        class="mb-2"
                                        density="comfortable"
                                        bg-color="white"
                                        style="width: 300px;"
                                        required
                                    />
                                    <v-btn 
                                        color="#6200ea"
                                        style="width: 300px;"
                                        class="mt-6"
                                        @click="nextStep"
                                        height="48"
                                        :disabled="!isStepValid"
                                    >
                                        다음
                                    </v-btn>
                                </div>
                            </v-carousel-item>

                            <!-- 로그인 ID -->
                            <v-carousel-item>
                                <div class="d-flex flex-column align-center pt-6">
                                    <div class="input-group" style="width: 300px;">
                                        <v-text-field
                                            label="로그인 ID"
                                            v-model="loginId"
                                            prepend-icon="mdi-account"
                                            variant="outlined"
                                            :error-messages="idCheckMessage && !isIdAvailable ? idCheckMessage : ''"
                                            density="comfortable"
                                            bg-color="white"
                                            class="flex-grow-1"
                                            required
                                            @input="resetIdCheck"
                                        />
                                        <v-btn
                                            :loading="isCheckingId"
                                            :disabled="!loginId || isCheckingId"
                                            @click="checkLoginId"
                                            :color="isIdAvailable ? 'success' : '#6200ea'"
                                            height="48"
                                            class="ml-1"
                                            min-width="70"
                                        >
                                            중복확인
                                        </v-btn>
                                    </div>
                                    <v-btn 
                                        color="#6200ea"
                                        style="width: 300px;"
                                        class="mt-6"
                                        @click="nextStep"
                                        height="48"
                                        :disabled="!isStepValid"
                                    >
                                        다음
                                    </v-btn>
                                </div>
                            </v-carousel-item>

                            <!-- 비밀번호 입력 -->
                            <v-carousel-item>
                                <div class="d-flex flex-column align-center pt-6">
                                    <v-text-field
                                        v-model="password"
                                        :type="showPassword ? 'text' : 'password'"
                                        label="비밀번호"
                                        :rules="passwordRules"
                                        required
                                        @input="validatePassword"
                                        :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                                        @click:append="showPassword = !showPassword"
                                        class="mb-2"
                                        density="comfortable"
                                        bg-color="white"
                                        style="width: 300px;"
                                    />
                                    <div class="requirements-container mb-4">
                                        <div :class="['requirement', { 'requirement-met': hasLetter }]">
                                            <v-icon size="small">{{ hasLetter ? 'mdi-check' : 'mdi-close' }}</v-icon>
                                            <span>문자 포함</span>
                                        </div>
                                        <div :class="['requirement', { 'requirement-met': hasNumber }]">
                                            <v-icon size="small">{{ hasNumber ? 'mdi-check' : 'mdi-close' }}</v-icon>
                                            <span>숫자 포함</span>
                                        </div>
                                        <div :class="['requirement', { 'requirement-met': hasSpecial }]">
                                            <v-icon size="small">{{ hasSpecial ? 'mdi-check' : 'mdi-close' }}</v-icon>
                                            <span>특수문자 포함</span>
                                        </div>
                                        <div :class="['requirement', { 'requirement-met': lengthValid }]">
                                            <v-icon size="small">{{ lengthValid ? 'mdi-check' : 'mdi-close' }}</v-icon>
                                            <span>8-20자 이내</span>
                                        </div>
                                    </div>
                                    <v-text-field
                                        v-model="passwordCheck"
                                        :type="showConfirmPassword ? 'text' : 'password'"
                                        label="비밀번호 확인"
                                        :rules="confirmPasswordRules"
                                        required
                                        @input="validatePassword"
                                        :append-icon="showConfirmPassword ? 'mdi-eye' : 'mdi-eye-off'"
                                        @click:append="showConfirmPassword = !showConfirmPassword"
                                        :error-messages="!passwordsMatch && passwordCheck ? '비밀번호가 일치하지 않습니다' : ''"
                                        class="mb-4"
                                        density="comfortable"
                                        bg-color="white"
                                        style="width: 300px;"
                                    />
                                    <v-btn 
                                        color="#6200ea"
                                        style="width: 300px;"
                                        class="mt-6"
                                        @click="nextStep"
                                        height="48"
                                        :disabled="!isStepValid"
                                    >
                                        다음
                                    </v-btn>
                                </div>
                            </v-carousel-item>

                            <!-- 전화번호 인증 -->
                            <v-carousel-item>
                                <div class="d-flex flex-column align-center pt-6">
                                    <div class="input-group" style="width: 300px;">
                                        <v-text-field
                                            label="전화번호"
                                            v-model="phoneNumber"
                                            prepend-icon="mdi-phone"
                                            variant="outlined"
                                            :disabled="isVerified"
                                            :hint="showHint ? '- 빼고 입력해주세요' : ''"
                                            persistent-hint
                                            density="comfortable"
                                            bg-color="white"
                                            class="flex-grow-1"
                                            required
                                            @input="showHint = !phoneNumber"
                                        />
                                        <v-btn
                                            :disabled="authSent || isVerified"
                                            @click="sendAuthCode"
                                            color="#6200ea"
                                            height="48"
                                            class="ml-2"
                                            min-width="70"
                                        >
                                            인증요청
                                        </v-btn>
                                    </div>

                                    <div v-if="authSent" class="input-group" style="width: 300px;">
                                        <v-text-field
                                            label="인증번호"
                                            v-model="authCode"
                                            prepend-icon="mdi-key"
                                            variant="outlined"
                                            :disabled="isVerified"
                                            density="comfortable"
                                            bg-color="white"
                                            class="flex-grow-1"
                                            required
                                        />
                                        <v-btn
                                            :disabled="isVerified"
                                            @click="verifyAuthCode"
                                            color="success"
                                            height="48"
                                            class="ml-2"
                                            min-width="70"
                                        >
                                            인증확인
                                        </v-btn>
                                    </div>

                                    <v-alert
                                        v-if="isVerified"
                                        type="success"
                                        variant="tonal"
                                        class="mb-4"
                                        style="width: 300px;"
                                    >
                                        인증이 완료되었습니다
                                    </v-alert>

                                    <v-alert
                                        v-if="verifyError"
                                        type="error"
                                        variant="tonal"
                                        class="mb-4"
                                        style="width: 300px;"
                                    >
                                        인증에 실패했습니다
                                    </v-alert>

                                    <v-btn 
                                        color="#6200ea"
                                        style="width: 300px;"
                                        class="mt-6"
                                        @click="nextStep"
                                        height="48"
                                        :disabled="!isStepValid"
                                    >
                                        다음
                                    </v-btn>
                                </div>
                            </v-carousel-item>

                            <!-- 닉네임 -->
                            <v-carousel-item>
                                <div class="d-flex flex-column align-center pt-6">
                                    <div class="input-group" style="width: 300px;">
                                        <v-text-field
                                            label="닉네임"
                                            v-model="nickname"
                                            prepend-icon="mdi-account"
                                            variant="outlined"
                                            :error-messages="nicknameCheckMessage && !isNicknameAvailable ? nicknameCheckMessage : ''"
                                            density="comfortable"
                                            bg-color="white"
                                            class="flex-grow-1"
                                            required
                                            @input="resetNicknameCheck"
                                        />
                                        <v-btn
                                            :loading="isCheckingNickname"
                                            :disabled="!isNicknameLengthValid || isCheckingNickname"
                                            @click="checkNickname"
                                            :color="isNicknameAvailable ? 'success' : '#6200ea'"
                                            height="48"
                                            class="ml-2"
                                            min-width="70"
                                        >
                                            중복확인
                                        </v-btn>
                                    </div>
                                    <div class="requirements-container mb-4" style="width: 300px;">
                                        <div :class="['requirement', { 'requirement-met': isNicknameLengthValid }]">
                                            <v-icon size="small">{{ isNicknameLengthValid ? 'mdi-check' : 'mdi-close' }}</v-icon>
                                            <span>2-8자 이내</span>
                                        </div>
                                    </div>
                                    <v-btn 
                                        color="#6200ea"
                                        style="width: 300px;"
                                        class="mt-6"
                                        @click="nextStep"
                                        height="48"
                                        :disabled="!isStepValid"
                                    >
                                        다음
                                    </v-btn>
                                </div>
                            </v-carousel-item>

                            <!-- 기수 입력 및 가입완료 -->
                            <v-carousel-item>
                                <div class="d-flex flex-column align-center pt-6">
                                    <v-text-field
                                        label="기수"
                                        v-model="batch"
                                        prepend-icon="mdi-flag"
                                        variant="outlined"
                                        hide-details
                                        class="mb-4"
                                        density="comfortable"
                                        bg-color="white"
                                        style="width: 300px;"
                                        required
                                    />
                                    <v-btn 
                                        color="#6200ea"
                                        style="width: 300px;"
                                        class="mt-6"
                                        @click="create()"
                                        height="48"
                                    >
                                        가입완료
                                    </v-btn>
                                </div>
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
            nickname:"",
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
            isCheckingNickname: false,
            isNicknameAvailable: false,
            nicknameCheckMessage: '',
            showPassword: false,
            showConfirmPassword: false,
            forbiddenWords: [], // 금지된 단어 목록
        }
    },
    computed: {
        isStepValid() {
            switch (this.step) {
                case 0: return true; // 환영 화면
                case 1: return this.name.trim() !== ""; // 이름 입력
                case 2: return this.isEmailValid && this.email.trim() !== "" && this.blogLink.trim() !== ""; // 이메일/블로그 입력 (3에서 2로 수정)
                case 3: return this.loginId.trim() !== "" && this.isIdAvailable; // 로그인 ID
                case 4: return this.isPasswordValid && this.password === this.passwordCheck.trim(); // 비밀번호
                case 5: return this.isVerified; // 전화번호 인증
                case 6: return this.isNicknameLengthValid && this.isNicknameAvailable; // 닉네임
                case 7: return this.batch.trim() !== ""; // 기수
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
        },
        isNicknameLengthValid() {
            const length = this.nickname?.trim().length || 0;
            return length >= 2 && length <= 8;
        },
    },
    methods: {
        nextStep() {
            if (this.isStepValid) {
                this.step++;
            }
        },
        autoSlideUI() {
            if ([0, 4, 6, 8, 10, 12].includes(this.step)) { 
                setTimeout(() => {
                    this.step++;
                }, 2200);
            }
        },
        async create() {
                const data = {
                    name:this.name, 
                    email:this.email, 
                    loginId:this.loginId, 
                    password:this.password,
                    phoneNumber:this.phoneNumber, 
                    nickName:this.nickname, 
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
                const response = await axios.post("https://server.tiktaktok.site/sms/send-auth", { phoneNumber: this.phoneNumber });
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
            const response = await axios.post("https://server.tiktaktok.site/sms/verify-auth", {phoneNumber: this.phoneNumber,
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
        resetNicknameCheck() {
            this.isNicknameAvailable = false;
            this.nicknameCheckMessage = '';
        },
        async checkNickname() {
            if (!this.isNicknameLengthValid) {
                this.nicknameCheckMessage = '닉네임은 2-8자 이내여야 합니다.';
                return;
            }

            // 금지어 검사
            if (this.containsForbiddenWord(this.nickname)) {
                this.isNicknameAvailable = false;
                this.nicknameCheckMessage = '부적절한 단어가 포함되어 있습니다.';
                return;
            }

            this.isCheckingNickname = true;
            try {
                const response = await axios.get(
                    `${process.env.VUE_APP_API_BASE_URL}/user/checkNickName`,
                    { params: { nickName: this.nickname } }
                );

                if (response.data.result) {
                    this.isNicknameAvailable = true;
                    this.nicknameCheckMessage = '사용 가능한 닉네임입니다.';
                } else {
                    this.isNicknameAvailable = false;
                    this.nicknameCheckMessage = '이미 사용 중인 닉네임입니다.';
                }
            } catch (error) {
                console.error('닉네임 중복 확인 실패:', error);
                this.isNicknameAvailable = false;
                this.nicknameCheckMessage = '중복 확인 중 오류가 발생했습니다.';
            } finally {
                this.isCheckingNickname = false;
            }
        },
        validateEmail() {
            // 이메일 정규식 패턴
            const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
            this.isEmailValid = emailPattern.test(this.email);
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
        async loadForbiddenWords() {
            try {
                const response = await fetch('/forbidden-words.txt');
                if (!response.ok) {
                    throw new Error('금지어 목록을 불러오는데 실패했습니다');
                }
                const text = await response.text();
                this.forbiddenWords = text.split('\n')
                    .map(word => word.trim())
                    .filter(word => word); // 빈 줄 제거
            } catch (error) {
                console.error('금지어 목록을 불러오는데 실패했습니다:', error);
            }
        },
        containsForbiddenWord(text) {
            if (!text) return false;
            return this.forbiddenWords.some(word => 
                text.toLowerCase().includes(word.toLowerCase())
            );
        },
    },
    watch: {
        step(newStep, oldStep) {
            if ([0].includes(newStep) && newStep !== oldStep) {
                this.autoSlideUI();
            }
        }
    },
    mounted() {
        this.autoSlideUI();
        this.loadForbiddenWords(); // 컴포넌트 마운트 시 금지어 목록 로드
    }
}
</script>

<style scoped>
.v-container {
    background: #ffffff;
    min-height: 100vh;
    padding: 2rem 0;
}

.v-card {
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.98);
}

.input-group {
    display: flex;
    gap: 8px;
    margin-bottom: 1rem;
}

.requirements-container {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 12px;
    width: 100%;
}

.requirement {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #6b7280;
    font-size: 0.875rem;
    margin-bottom: 4px;
}

.requirement-met {
    color: #10b981;
}

.v-btn {
    text-transform: none !important;
    letter-spacing: 0.5px;
    font-weight: 500;
    border-radius: 8px;
}

.v-btn:not(:disabled):hover {
    opacity: 0.9;
}

@media (max-width: 600px) {
    .v-card {
        margin: 1rem;
    }
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

.welcome-title {
    padding-top: 2rem;
}

.welcome-text {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
}

.main-text {
    font-size: 2rem;
    font-weight: 700;
    color: #6200ea;
    letter-spacing: -0.5px;
    margin-bottom: 0.5rem;
}

.sub-text {
    font-size: 1.8rem;
    font-weight: 600;
    background: linear-gradient(45deg, #6200ea, #b388ff);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: fadeIn 1s ease-in;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>