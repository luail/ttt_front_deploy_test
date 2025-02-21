<template>
  <div>
    <v-app-bar class="header-container">
      <v-container class="py-2">
        <v-row align="center" no-gutters>
          <!-- 로고 -->
          <v-col cols="2">
            <router-link to="/" class="text-decoration-none">
              <h1 class="logo">TTT</h1>
            </router-link>
          </v-col>

          <!-- 메인 메뉴 -->
          <v-col cols="6">
            <v-menu open-on-hover offset-y>
              <template v-slot:activator="{ props }">
                <v-row no-gutters>
                  <v-col cols="3">
                    <v-btn v-bind="props" class="menu-btn" variant="text" block flat :ripple="false"
                      :class="{ 'active-menu': hoveredMenu === 'community' }"
                      @mouseover="hoveredMenu = 'community'"
                      @mouseleave="hoveredMenu = null">
                      커뮤니티
                    </v-btn>
                  </v-col>
                  <v-col cols="3">
                    <v-btn v-bind="props" class="menu-btn" variant="text" block flat :ripple="false"
                      :class="{ 'active-menu': hoveredMenu === 'chat' }"
                      @mouseover="hoveredMenu = 'chat'"
                      @mouseleave="hoveredMenu = null">
                      오픈채팅
                    </v-btn>
                  </v-col>
                  <v-col cols="3">
                    <v-btn v-bind="props" class="menu-btn" variant="text" block flat :ripple="false"
                      :class="{ 'active-menu': hoveredMenu === 'list' }"
                      @mouseover="hoveredMenu = 'list'"
                      @mouseleave="hoveredMenu = null">
                      리스트
                    </v-btn>
                  </v-col>
                  <v-col cols="3" v-if="userRole === 'ADMIN'">
                    <v-btn v-bind="props" class="menu-btn" variant="text" block flat :ripple="false"
                      :class="{ 'active-menu': hoveredMenu === 'admin' }"
                      @mouseover="hoveredMenu = 'admin'"
                      @mouseleave="hoveredMenu = null">
                      관리자
                    </v-btn>
                  </v-col>
                </v-row>
              </template>

              <!-- 드롭다운 메뉴 -->
              <v-card class="dropdown-menu" flat>
                <v-row no-gutters>
                  <v-col cols="3">
                    <v-list>
                      <v-list-item to="/ttt/post/list/0">전체게시판</v-list-item>
                      <v-list-item to="/ttt/post/list/1">자유게시판</v-list-item>
                      <v-list-item to="/ttt/post/list/2">정보게시판</v-list-item>
                    </v-list>
                  </v-col>
                  <v-col cols="3">
                    <v-list>
                      <v-list-item to="/ttt/chat/list">오픈채팅리스트</v-list-item>
                    </v-list>
                  </v-col>
                  <v-col cols="3">
                    <v-list>
                      <v-list-item to="/ttt/project/find">프로젝트</v-list-item>
                    </v-list>
                  </v-col>
                  <v-col cols="3" v-if="userRole === 'ADMIN'">
                    <v-list>
                      <v-list-item to="/ttt/blog/list">블로그</v-list-item>
                      <v-list-item to="/ttt/user/list">회원목록조회</v-list-item>
                    </v-list>
                  </v-col>
                </v-row>
              </v-card>
            </v-menu>
          </v-col>

          <!-- 우측 메뉴 -->
          <v-col cols="4" class="d-flex justify-end align-center">
            <!-- 채팅 아이콘 (로그인 상태일 때만 표시) -->
            <v-btn v-if="isLoggedIn" icon class="chat-icon mr-2" to="/ttt/chatpage" color="#6200ea">
              <v-icon>mdi-message-outline</v-icon>
            </v-btn>

            <!-- 로그인 상태 -->
            <template v-if="isLoggedIn">
              <!-- 프로필 메뉴 -->
              <v-menu v-model="profileMenu" :close-on-content-click="false" location="bottom">
                <template v-slot:activator="{ props }">
                  <v-avatar class="profile-avatar" size="40" v-bind="props">
                    <v-img :src="profileImageUrl || require('@/assets/basicProfileImage.png')"
                          :alt="'프로필 이미지'"
                          @error="handleImageError">
                      <template v-slot:placeholder>
                        <v-icon>mdi-account-circle</v-icon>
                      </template>
                    </v-img>
                  </v-avatar>
                </template>

                <v-card min-width="200" class="profile-menu">
                  <v-list>
                    <v-list-item to="/ttt/user/myInformation">
                      <template v-slot:prepend>
                        <v-icon>mdi-account-circle</v-icon>
                      </template>
                      <v-list-item-title>마이페이지</v-list-item-title>
                    </v-list-item>
                    <v-divider></v-divider>
                    <v-list-item @click="doLogout">
                      <template v-slot:prepend>
                        <v-icon>mdi-logout</v-icon>
                      </template>
                      <v-list-item-title>로그아웃</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-card>
              </v-menu>
            </template>

            <!-- 로그아웃 상태 -->
            <template v-else>
              <v-btn class="menu-btn" variant="text" flat to="/ttt/user/login">로그인</v-btn>
              <v-btn class="menu-btn" variant="text" flat to="/ttt/user/create">회원가입</v-btn>
            </template>
          </v-col>
        </v-row>
      </v-container>
    </v-app-bar>
  </div>
</template>

<script>
import { jwtDecode } from "jwt-decode";

export default {
  data() {
    return {
      userRole: "",
      isLoggedIn: false,
      hoveredMenu: null,
      profileImageUrl: null,
      profileMenu: false
    }
  },
  created() {
    const token = localStorage.getItem('token');
    if (token) {
      const payload = jwtDecode(token);
      this.isLoggedIn = true;
      this.userRole = payload.role;
      this.fetchProfileImage(payload.userId);
    }
  },
  methods: {
    doLogout() {
      localStorage.clear();
      window.location.href = '/';
    },
    async fetchProfileImage(userId) {
      try {
        const response = await fetch(`/api/users/${userId}/profile-image`);
        const data = await response.json();
        if (data.status === 200) {
          this.profileImageUrl = data.data || require('@/assets/basicProfileImage.png');
        } else {
          this.profileImageUrl = require('@/assets/basicProfileImage.png');
        }
      } catch (error) {
        console.error('프로필 이미지 로드 실패:', error);
        this.profileImageUrl = require('@/assets/basicProfileImage.png');
      }
    },
    handleImageError() {
      this.profileImageUrl = require('@/assets/basicProfileImage.png');
    }
  }
}
</script>

<style scoped>
.header-container {
  background-color: white !important;
  border-bottom: 2px solid #6200ea !important;
  position: relative;
  z-index: 100;
}

.logo {
  font-size: 2rem;
  font-weight: bold;
  color: #6200ea;
  margin: 0;
}

.menu-btn {
  text-transform: none !important;
  height: 48px !important;
  font-size: 1rem !important;
}

.menu-btn:hover, .active-menu {
  color: #6200ea !important;
  background-color: #f3e5f5 !important;
}

.dropdown-menu {
  margin-top: 8px;
  min-width: 100%;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
}

.v-list-item {
  min-height: 40px !important;
  padding: 0 16px !important;
  justify-content: center !important;
}

.v-list-item:hover {
  color: #6200ea !important;
  background-color: #f3e5f5 !important;
}

.chat-icon {
  width: 40px !important;
  height: 40px !important;
}

.profile-avatar {
  cursor: pointer;
  border: 2px solid #6200ea;
  transition: all 0.3s ease;
}

.profile-avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 0 8px rgba(98, 0, 234, 0.4);
}

.profile-menu {
  margin-top: 8px;
  border-radius: 8px;
  overflow: hidden;
}

.mr-2 {
  margin-right: 8px;
}
</style>