<template>
    <p>구글 로그인 중...</p>
</template>

<script>
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

export default {
    created() {
        const code = new URL(window.location.href).searchParams.get('code');
        this.sendCodeToBackend(code);
    },
    methods: {
        async sendCodeToBackend(code) {
            const response = await axios.post("http://localhost:8080/ttt/user/google/doLogin", { code })
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