<template>
    <v-container>
        <v-row justify="center">
            <v-col cols="12" sm="8" md="6">
                <v-card class="card-container">
                    <v-card-title class="text-h5 text-center">
                        회원가입 ({{ step + 1 }} / 7)
                    </v-card-title><br>
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
                                UI 1
                            </v-card-title>
                        </v-carousel-item>
                            <!-- Step 1: 이름 입력 -->
                            <v-carousel-item>
                                <v-text-field label="이름" v-model="name" prepend-icon="mdi-account" required @keydown.enter="nextStep"/>
                                <div class="btn-group">
                                    <v-btn v-if="step > 0" color="grey" class="prev-btn" @click="prevStep">이전</v-btn>
                                    <v-btn color="primary" class="next-btn" @click="nextStep" :disabled="!isStepValid">
                                        다음
                                    </v-btn>
                                </div>
                            </v-carousel-item>
                            <v-carousel-item>
                                <v-card-title class="text-h5 text-center">
                                    UI 2
                                </v-card-title>
                            </v-carousel-item>
                            <!-- Step 2: 이메일 입력 -->
                            <v-carousel-item>
                                <v-text-field label="이메일" v-model="email" type="email" prepend-icon="mdi-email" required @keydown.enter="nextStep"/>
                                <v-text-field label="블로그 링크" v-model="blogLink" prepend-icon="mdi-link-box-variant" required @keydown.enter="nextStep"/>
    
                                <div class="btn-group">
                                    <v-btn v-if="step > 0" color="grey" class="prev-btn" @click="prevStep">이전</v-btn>
                                    <v-btn color="primary" class="next-btn" @click="nextStep" :disabled="!isStepValid">
                                        다음
                                    </v-btn>
                                </div>
                            </v-carousel-item>
                            <v-carousel-item>
                                <v-card-title class="text-h5 text-center">
                                    UI 3
                                </v-card-title>
                            </v-carousel-item>
                           

                            <!-- Step 4: 로그인 아이디 입력 -->
                            <v-carousel-item>
                                <v-text-field label="아이디" v-model="loginId" prepend-icon="mdi-login" required @keydown.enter="nextStep"/>
                                <div class="btn-group">
                                    <v-btn v-if="step > 0" color="grey" class="prev-btn" @click="prevStep">이전</v-btn>
                                    <v-btn color="primary" class="next-btn" @click="nextStep" :disabled="!isStepValid">
                                        다음
                                    </v-btn>
                                </div>
                            </v-carousel-item>
                            <v-carousel-item>
                                <v-card-title class="text-h5 text-center">
                                    UI 4
                                </v-card-title>
                            </v-carousel-item>
                            <!-- Step 5: 비밀번호 입력 -->
                            <v-carousel-item>
                                <v-text-field label="비밀번호" v-model="password" type="password" prepend-icon="mdi-lock" required @keydown.enter="nextStep"/>
                                <v-text-field label="비밀번호 확인" v-model="passwordCheck" type="password" prepend-icon="mdi-lock" required @keydown.enter="nextStep"/>
                                <div class="btn-group">
                                    <v-btn v-if="step > 0" color="grey" class="prev-btn" @click="prevStep">이전</v-btn>
                                    <v-btn color="primary" class="next-btn" @click="nextStep" :disabled="!isStepValid">
                                        다음
                                    </v-btn>
                                </div>
                            </v-carousel-item>
                            <v-carousel-item>
                                <v-card-title class="text-h5 text-center">
                                    UI 5
                                </v-card-title>
                            </v-carousel-item>
                            <!-- Step 6: 휴대폰 인증 -->
                            <v-carousel-item>
                                <v-text-field label="전화번호 (- 없이 입력)" v-model="phoneNumber" prepend-icon="mdi-phone" required @keydown.enter="nextStep"/>
                                <v-btn color="primary" @click="sendAuthCode" :disabled="authSent || isVerified">
                                    인증 요청
                                </v-btn>
                                <v-text-field v-if="authSent" label="인증번호" v-model="authCode" prepend-icon="mdi-key" required @keydown.enter="verifyAuthCode"/>
                                <v-btn v-if="authSent" color="success" @click="verifyAuthCode" :disabled="isVerified">
                                    인증 확인
                                </v-btn>
                                <p v-if="isVerified" class="text-green">인증 완료! 수정 불가</p>
                                <p v-if="verifyError" class="text-red">인증 실패! 다시 입력해주세요.</p>
                                <div class="btn-group">
                                    <v-btn v-if="step > 0" color="grey" class="prev-btn" @click="prevStep">이전</v-btn>
                                    <v-btn color="primary" class="next-btn" @click="nextStep" :disabled="!isStepValid">
                                        다음
                                    </v-btn>
                                </div>
                            </v-carousel-item>
                            <v-carousel-item>
                                <v-card-title class="text-h5 text-center">
                                    UI 
                                </v-card-title>
                            </v-carousel-item>
                            <!-- Step 7: 닉네임 & 기수 입력 -->
                            <v-carousel-item>
                                <v-text-field label="닉네임" v-model="nickName" prepend-icon="mdi-rename" required @keydown.enter="nextStep"/>
                                <v-text-field label="기수" v-model="batch" prepend-icon="mdi-flag" required @keydown.enter="create"/>
                                <div class="btn-group">
                                    <v-btn v-if="step > 0" color="grey" class="prev-btn" @click="prevStep">이전</v-btn>
                                    <v-btn color="success" class="next-btn" @click="create">
                                        회원가입 완료
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
import axios from "axios";

export default {
    data() {
        return {
            step: 0,
            name: "",
            email: "",
            blogLink: "",
            loginId: "",
            password: "",
            passwordCheck: "",
            phoneNumber: "",
            authCode: "",
            authSent: false,
            isVerified: false,
            verifyError: false,
            nickName: "",
            batch: "",
        };
    },
    computed: {
        isStepValid() {
            switch (this.step) {
                case 1: return !!this.name;
                case 3: return !!this.email && !!this.blogLink; // 이메일과 블로그 링크가 모두 입력되어야 함
                case 5: return !!this.loginId;
                case 7: return this.password === this.passwordCheck && !!this.password;
                case 9: return this.isVerified;
                case 11: return !!this.nickName && !!this.batch;
                default: return true; // UI 단계는 자동 이동
            }
        }
    },
    methods: {
        nextStep() {
            if (this.isStepValid) {
                this.step++;
            }
        },
        prevStep() {
            if (this.step > 0) {
                this.step--;
            }
        },
        autoSlideUI() {
            if ([0, 2, 4, 6, 8, 10].includes(this.step)) { 
                setTimeout(() => {
                    this.step++;
                }, 1000);
            }
        },
        async create() {
            if (this.password !== this.passwordCheck) {
                alert("비밀번호가 일치하지 않습니다.");
                return;
            }

            if (!this.isVerified) {
                alert("전화번호 인증을 완료해주세요.");
                return;
            }

            const data = {
                name: this.name,
                email: this.email,
                blogLink: this.blogLink,
                loginId: this.loginId,
                password: this.password,
                phoneNumber: this.phoneNumber,
                nickName: this.nickName,
                batch: this.batch,
                authCode: this.authCode,
            };

            try {
                await axios.post(`${process.env.VUE_APP_API_BASE_URL}/user/create`, data);
                this.$router.push("/ttt/user/login");
            } catch (error) {
                console.error("회원가입 실패", error);
                alert("회원가입에 실패했습니다.");
            }
        },
    },
    watch: {
        step(newStep, oldStep) {
            if ([0, 2, 4, 6, 8, 10].includes(newStep) && newStep !== oldStep) {
                this.autoSlideUI();
            }
        }
    },
    mounted() {
        this.autoSlideUI();
    }
};
</script>







<style scoped>
/* ✅ 카드 스타일 */
.v-card {
    border: 2px solid #6200ea;
    border-radius: 12px;
    box-shadow: 0 4px 10px rgba(98, 0, 234, 0.2);
    padding: 24px;
    transition: all 0.3s ease-in-out;
    height: 400px;
}

/* ✅ 버튼 스타일 */
.v-btn {
    background: linear-gradient(90deg, #6200ea, #a35aff);
    color: white;
    font-size: 1rem;
    font-weight: bold;
    border-radius: 10px;
    text-transform: none;
    transition: all 0.3s ease-in-out;
    padding: 12px;
}

/* ✅ 버튼 호버 효과 */
.v-btn:hover {
    background: linear-gradient(90deg, #311b92, #6200ea);
    transform: scale(1.05);
}

/* ✅ 성공/실패 메시지 */
.text-green {
    color: #2e7d32;
    font-weight: bold;
}

.text-red {
    color: #d32f2f;
    font-weight: bold;
}

/* ✅ 캐러셀 높이 설정 */
.v-carousel {
    height: 280px;
}

/* ✅ 타이틀 */
.v-card-title {
    font-size: 1.8rem;
    font-weight: bold;
    color: #6200ea;
    text-align: center;
}
</style>
