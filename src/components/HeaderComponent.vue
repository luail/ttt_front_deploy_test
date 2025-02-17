<template>
    <v-app-bar>
        <v-container>
                <v-row>
                    <v-col>
                        <v-btn :to="{path:'/'}">TTT</v-btn>
                        <v-btn>커뮤니티</v-btn>
                    </v-col>
                    <v-col>
                        <v-btn :to="{path:'/ttt/chat/list'}">오픈채팅방</v-btn>
                    </v-col>
                    <v-col>
                      <v-btn>리스트</v-btn>
                    </v-col>
                    <v-col>
                      <div v-if="userRole==='ADMIN'">
                        <v-btn>관리자</v-btn>
                      </div>
                    </v-col>
                    <v-col class="justify-end">
                      <v-btn v-if="!isLogin" :to="{path:'/ttt/user/create'}">회원가입</v-btn>
                      <v-btn v-if="!isLogin" :to="{path:'/ttt/user/login'}">로그인</v-btn>
                      <v-btn v-if="isLogin" @click="doLogout">로그아웃</v-btn>
                    </v-col>
                </v-row>
        </v-container>
    </v-app-bar>
</template>

<script>
    import {jwtDecode} from "jwt-decode";

    export default{
      data(){
        return{
          userRole:"",
          isLogin:false,
        }
      },
      created(){
        const token = localStorage.getItem('token');
        if(token){
          const payload = jwtDecode(token);
          this.isLogin=true;
          this.userRole=payload.role;
        }
      },
      methods:{
        doLogout(){
          localStorage.clear();
          window.location.href='/';
        }
      }

    }
</script>