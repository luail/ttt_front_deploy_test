<template>
    <div>
        <p>카카오 로그인 중...</p>
    </div>
</template>

<script>
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

export default {
    created() {
        const code = new URL(window.location.href).searchParams.get('code');
        // 백엔드로 인가 코드를 전송
        this.sendCodeToBackend(code);
    },
    methods: {
        async sendCodeToBackend(code) {
            const response = await axios.post("http://localhost:8080/ttt/user/kakao/doLogin", { code })
            const token = response.data.result.token;
            const refreshToken = response.data.result.refreshToken
            const nickName = jwtDecode(token).nickName
            const role = jwtDecode(token).role
            localStorage.setItem('token', token)
            localStorage.setItem('refreshToken', refreshToken)
            localStorage.setItem('nickName', nickName)
            localStorage.setItem('role', role)
            window.location.href = '/'
        },
    },
}
</script>