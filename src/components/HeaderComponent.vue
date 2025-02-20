<template>
  <v-app-bar>
    <v-container>
      <v-menu open-on-hover offset-y>
        <template #activator="{ props }">
          <v-row v-bind="props">
            <v-col>
              <v-btn :to="{path:'/'}">TTT</v-btn>
            </v-col>
            <v-col>
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
            <v-col>
              <v-btn v-if="isLogin" :to="{path:'/ttt/user/myInformation'}">마이페이지</v-btn>
            </v-col>
            <v-col class="justify-end">
              <v-btn v-if="!isLogin" :to="{path:'/ttt/user/create'}">회원가입</v-btn>
              <v-btn v-if="!isLogin" :to="{path:'/ttt/user/login'}">로그인</v-btn>
              <v-btn v-if="isLogin" @click="doLogout">로그아웃</v-btn>
            </v-col>
          </v-row>
        </template>
        <v-card class="pa-3">
          <v-row>
            <v-col>
              <v-btn>TTT 목록 1</v-btn><br />
              <v-btn>TTT 목록 2</v-btn>
            </v-col>
            <v-col>
              <v-btn>커뮤니티 목록 1</v-btn><br />
              <v-btn>커뮤니티 목록 2</v-btn>
            </v-col>
            <v-col>
              <v-btn>채팅방 목록 1</v-btn><br />
              <v-btn>채팅방 목록 2</v-btn>
            </v-col>
            <v-col>
              <v-btn>리스트 목록 1</v-btn><br />
              <v-btn>리스트 목록 2</v-btn>
            </v-col>
            <v-col>
              <!-- 관리자 목록 (관리자 메뉴가 있을 때만 보이도록) -->
              <div v-if="userRole === 'ADMIN'">
                <v-btn>관리자 목록 1</v-btn><br />
                <v-btn>관리자 목록 2</v-btn>
              </div>
            </v-col>
          </v-row>
        </v-card>
      </v-menu>
    </v-container>
  </v-app-bar>
</template>

<script>
  import {jwtDecode} from "jwt-decode";

  export default{
    data(){
      return{
        menuItems1: ["항목 1-1", "항목 1-2", "항목 1-3"],
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