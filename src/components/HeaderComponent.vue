<template>
  <div>
    <v-app-bar class="header-container">
      <v-container class="py-2">
        <v-row align="center" no-gutters>
          <!-- 로고 -->
          <v-col cols="2">
            <router-link to="/ttt" class="text-decoration-none">
              <h1 class="logo">TTT</h1>
            </router-link>
          </v-col>

          <!-- 메인 메뉴 -->
          <v-col cols="6">
            <v-menu open-on-hover offset-y v-model="showMenu" min-width="100%">
              <template v-slot:activator="{ props }">
                <v-row no-gutters class="menu-buttons">
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
                      :class="{ 'active-menu': hoveredMenu === 'additional' }"
                      @mouseover="hoveredMenu = 'additional'"
                      @mouseleave="hoveredMenu = null">
                      부가기능
                    </v-btn>
                  </v-col>
                  <v-col cols="3">
                    <v-btn v-bind="props" class="menu-btn" variant="text" block flat :ripple="false"
                      :class="{ 'active-menu': hoveredMenu === 'list' }"
                      @mouseover="hoveredMenu = 'list'"
                      @mouseleave="hoveredMenu = null">
                      리스트 조회
                    </v-btn>
                  </v-col>
                  <v-col cols="3" v-if="isAdmin">
                    <v-btn v-bind="props" class="menu-btn" variant="text" block flat :ripple="false"
                      :class="{ 'active-menu': hoveredMenu === 'admin' }"
                      @mouseover="hoveredMenu = 'admin'"
                      @mouseleave="hoveredMenu = null">
                      관리자탭
                    </v-btn>
                  </v-col>
                </v-row>
              </template>
              <v-card class="menu-card" flat>
                <v-row no-gutters class="menu-content">
                  <v-col cols="3">
                    <v-list>
                      <v-list-item to="/community/notice">전체 게시판</v-list-item>
                      <v-list-item to="/community/free">기수 게시판</v-list-item>
                      <v-list-item to="/community/qna">취업 게시판</v-list-item>
                      <v-list-item to="/community/study">알고리즘 게시판</v-list-item>
                    </v-list>
                  </v-col>
                  <v-col cols="3">
                    <v-list>
                      <v-list-item to="/additional/mentoring">멘(멘토링,멘국,국쉽상담기관)</v-list-item>
                      <v-list-item to="/additional/schedule">스케줄</v-list-item>
                      <v-list-item to="/additional/study">직석 예약</v-list-item>
                      <v-list-item to="/additional/library">도서 대여</v-list-item>
                    </v-list>
                  </v-col>
                  <v-col cols="3">
                    <v-list>
                      <v-list-item to="/list/all">전체 프로젝트 조회</v-list-item>
                      <v-list-item to="/list/popular">전체 블로그 조회</v-list-item>
                      <v-list-item to="/list/my">전체 팀킹 조회</v-list-item>
                      <v-list-item to="/list/promotions">Promotions</v-list-item>
                    </v-list>
                  </v-col>
                  <v-col cols="3" v-if="isAdmin">
                    <v-list>
                      <v-list-item to="/admin/users">학생 출결관리</v-list-item>
                      <v-list-item to="/admin/support">Support</v-list-item>
                      <v-list-item to="/admin/docs">Documentation</v-list-item>
                      <v-list-item to="/admin/privacy">Privacy Policy</v-list-item>
                    </v-list>
                  </v-col>
                </v-row>
              </v-card>
            </v-menu>
          </v-col>

          <!-- 우측 메뉴 -->
          <v-col cols="4" class="d-flex justify-end align-center">
            <v-btn
              icon
              class="chat-icon mr-2"
              to="/chat"
              color="#6200ea"
              size="40"
            >
              <v-icon size="24">mdi-message-outline</v-icon>
            </v-btn>

            <!-- 로그인 상태일 때 -->
            <template v-if="isLoggedIn">
              <!-- 관리자 탭 (ADMIN 권한일 때만 표시) -->
              <v-btn v-if="userRole === 'ADMIN'" class="menu-btn" variant="text" flat to="/admin">
                관리자
              </v-btn>
              
              <!-- 프로필 드롭다운 메뉴 -->
              <div class="profile-menu-container d-flex align-center">
                <v-menu
                  v-model="profileMenu"
                  :close-on-content-click="false"
                  location="bottom"
                >
                  <template v-slot:activator="{ props }">
                    <v-avatar 
                      class="profile-avatar" 
                      size="40"
                      v-bind="props"
                    >
                      <v-img
                        :src="profileImageUrl || require('@/assets/basicProfileImage.png')"
                        :alt="'프로필 이미지'"
                        @error="handleImageError"
                      >
                        <template v-slot:placeholder>
                          <v-icon>mdi-account-circle</v-icon>
                        </template>
                      </v-img>
                    </v-avatar>
                  </template>

                  <v-card min-width="200" class="profile-menu">
                    <v-list>
                      <v-list-item to="/user/my-information">
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
              </div>
            </template>

            <!-- 로그아웃 상태일 때 -->
            <template v-else>
              <v-btn 
                v-if="!isLogin" 
                class="menu-btn" 
                variant="text" 
                flat 
                :to="{path:'/ttt/user/login'}"
              >
                로그인
              </v-btn>
              <v-btn 
                v-if="!isLogin" 
                class="menu-btn" 
                variant="text" 
                flat 
                :to="{path:'/ttt/user/create'}"
              >
                회원가입
              </v-btn>
            </template>
          </v-col>
        </v-row>
      </v-container>
    </v-app-bar>
  </div>
</template>

<script>
  import {jwtDecode} from "jwt-decode";

  export default{
    data(){
      return{
        userRole:"",
        isLoggedIn: false,
        showMenu: false,
        hoveredMenu: null,
        isLogin: false,
        profileImageUrl: null,
        profileMenu: false,
        menuList: [
          {
            title: 'TTT',
            mainTo: '/',
            items: [
              { title: 'TTT 소개', to: '/ttt/intro' },
              { title: 'TTT 이용방법', to: '/ttt/guide' }
            ]
          },
          {
            title: '커뮤니티',
            mainTo: '/ttt/community',
            items: [
              { title: '공지사항', to: '/ttt/community/notice' },
              { title: '자유게시판', to: '/ttt/community/free' }
            ]
          },
          {
            title: '오픈채팅방',
            mainTo: '/ttt/chat/list',
            items: [
              { title: '채팅방 목록', to: '/ttt/chat/list' },
              { title: '인기 채팅방', to: '/ttt/chat/popular' }
            ]
          },
          {
            title: '리스트',
            mainTo: '/ttt/list/all',
            items: [
              { title: '전체 리스트', to: '/ttt/list/all' },
              { title: '인기 리스트', to: '/ttt/list/popular' }
            ]
          },
          {
            title: '관리자',
            mainTo: '/ttt/admin/users',
            adminOnly: true,
            items: [
              { title: '회원 관리', to: '/ttt/admin/users' },
              { title: '게시물 관리', to: '/ttt/admin/posts' }
            ]
          }
        ]
      }
    },
    created(){
      const token = localStorage.getItem('token');
      if(token){
        const payload = jwtDecode(token);
        this.isLoggedIn=true;
        this.userRole=payload.role;
        this.fetchProfileImage(payload.userId);
      }
    },
    methods:{
      doLogout(){
        localStorage.clear();
        window.location.href='/';
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

<style>
.header-container {
  background-color: white !important;
  border-bottom: 2px solid #6200ea !important;
  position: relative;
  z-index: 100;
  box-shadow: 0 2px 4px rgba(98, 0, 234, 0.1) !important;
}

.logo {
  font-size: 2rem;
  font-weight: bold;
  color: #6200ea;
  margin: 0;
}

.menu-buttons {
  width: 100%;
}

.menu-card {
  margin-top: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
}

.menu-content {
  padding: 8px 0;
  display: flex;
  justify-content: space-between;
}

.dropdown-content {
  display: flex;
  width: 100%;
  padding: 8px 0;
}

.dropdown-column {
  flex: 1;
  padding: 0;
  min-width: 25%;
}

.v-list {
  padding: 8px 16px;
  background: transparent;
}

.v-list-item {
  min-height: 32px !important;
  padding: 4px 0 !important;
  font-size: 0.875rem !important;
}

.v-list-item:hover::before {
  opacity: 0 !important;
}

.v-list-item__content {
  padding: 4px 0 !important;
}

.v-list-item-title {
  font-size: 0.875rem !important;
  line-height: 1.25rem !important;
}

.v-btn {
  text-transform: none !important;
}

/* 상단 메뉴 버튼 hover 효과 추가 */
.v-btn:hover {
  color: #6200ea !important;
}

.menu-btn {
  text-transform: none !important;
  background-color: transparent !important;
  color: #000000 !important;
  box-shadow: none !important;
  opacity: 1 !important;
  transition: none !important;
}

/* Vuetify의 모든 상태에 대한 스타일 제거 */
:deep(.menu-btn.v-btn) {
  background-color: transparent !important;
}

:deep(.menu-btn.v-btn:hover),
:deep(.menu-btn.v-btn:focus),
:deep(.menu-btn.v-btn:active),
:deep(.menu-btn.v-btn--variant-text:hover),
:deep(.menu-btn.v-btn--variant-text:focus),
:deep(.menu-btn.v-btn--variant-text:active) {
  background-color: transparent !important;
  opacity: 1 !important;
  box-shadow: none !important;
}

:deep(.menu-btn .v-btn__overlay) {
  opacity: 0 !important;
  background-color: transparent !important;
  display: none !important;
}

.active-menu {
  color: #6200ea !important;
  background-color: transparent !important;
}

/* v-menu 위치 조정을 위한 스타일 추가 */
:deep(.v-overlay__content) {
  width: 100% !important;
  max-width: none !important;
  left: 0 !important;
  position: absolute;
}

:deep(.v-menu__content) {
  width: 100% !important;
  max-width: none !important;
}

/* 드롭다운 메뉴 위치 조정 */
:deep(.v-overlay__content > .v-card) {
  width: 66.666% !important;
  margin-left: 16.666% !important;
}

/* 각 메뉴 열의 너비 고정 */
.menu-content > .v-col {
  flex: 0 0 25%;
  padding: 0 16px;
}

:deep(.v-menu > .v-overlay__content) {
  width: 45% !important; /* 상단 3개 메뉴 버튼의 전체 너비 */
  max-width: none !important;
  left: 16.666% !important; /* 로고 영역 이후 시작점 */
  position: absolute;
}

:deep(.v-menu__content) {
  width: 45% !important;
  max-width: none !important;
}

:deep(.v-overlay__content > .v-card) {
  width: 100% !important;
}

.v-menu > .v-overlay__content {
  width: 27% !important;
  max-width: none !important;
  left: 29% !important;
  position: absolute;
}

.v-menu__content {
  width: 27% !important;
  max-width: none !important;
}

.v-overlay__content > .v-card {
  width: 100% !important;
}

/* 호버 효과 제거 */
.v-btn:not(.v-btn--active):hover::before {
  opacity: 0 !important;
}

.v-btn::before {
  background-color: transparent !important;
}

/* 드롭다운 메뉴 스타일 */
.v-list {
  padding: 8px 16px;
  background: transparent;
}

.v-list-item {
  min-height: 32px !important;
  padding: 4px 0 !important;
  font-size: 0.875rem !important;
}

.v-list-item:hover::before {
  opacity: 0 !important;
}

.v-list-item__content {
  padding: 4px 0 !important;
}

.v-list-item-title {
  font-size: 0.875rem !important;
  line-height: 1.25rem !important;
}

/* 드롭다운 컬럼 컨테이너 */
.v-card > .v-container {
  display: flex !important;
  justify-content: space-between !important;
  padding: 0 !important;
}

.v-card > .v-container > .v-row {
  width: 100% !important;
  margin: 0 !important;
}

.v-card > .v-container > .v-row > .v-col {
  flex: 0 0 11.666% !important; /* 상단 메뉴 하나의 너비와 동일 */
  padding: 0 !important;
}

/* 호버 효과 완전 제거 */
.v-btn.v-btn--variant-text::before,
.v-btn.v-btn--variant-text::after,
.v-btn.v-btn--variant-text:hover::before,
.v-btn.v-btn--variant-text:hover::after {
  display: none !important;
  opacity: 0 !important;
  background-color: transparent !important;
}

/* 드롭다운 메뉴 스타일 */
.v-card > .v-container {
  display: flex !important;
  padding: 0 !important;
}

.v-card > .v-container > .v-row {
  width: 100% !important;
  margin: 0 !important;
}

.v-card > .v-container > .v-row > .v-col {
  width: 33.333% !important;
  flex: 0 0 33.333% !important;
  padding: 0 !important;
}

.v-list {
  padding: 8px 16px;
  background: transparent;
}

.v-list-item {
  min-height: 32px !important;
  padding: 4px 0 !important;
  font-size: 0.875rem !important;
}

.v-list-item:hover::before,
.v-list-item::before {
  display: none !important;
  opacity: 0 !important;
  background-color: transparent !important;
}

.v-list-item__content {
  padding: 4px 0 !important;
}

.v-list-item-title {
  font-size: 0.875rem !important;
  line-height: 1.25rem !important;
}

/* 드롭다운 컬럼 너비 조정 */
.v-row {
  display: flex !important;
  width: 100% !important;
}

.v-col {
  flex: 1 !important;
  width: 33.333% !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
}

/* 호버 효과 제거 */
.v-btn.v-btn--variant-text .v-btn__overlay {
  background-color: transparent !important;
  opacity: 0 !important;
}

.v-list-item .v-list-item__overlay {
  background-color: transparent !important;
  opacity: 0 !important;
}

/* 상단 메뉴 호버 효과 - 연보라색 배경 */
.v-btn.v-btn--variant-text:hover {
  background-color: #f3e5f5 !important;
}

/* 드롭다운 메뉴 호버 효과 - 보라색 텍스트 */
.v-list-item:hover {
  color: #9c27b0 !important;
}

.v-list-item:hover .v-list-item__content,
.v-list-item:hover .v-list-item-title {
  color: #9c27b0 !important;
}

/* 드롭다운 컬럼 너비 조정 */
.v-row {
  display: flex !important;
  width: 100% !important;
}

.v-col {
  flex: 1 !important;
  width: 33.333% !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
}

.v-list {
  padding: 8px 16px;
  background: transparent;
  text-align: center !important;
}

.v-list-item {
  min-height: 32px !important;
  padding: 4px 0 !important;
  font-size: 0.875rem !important;
  transition: all 0.2s ease !important;
  justify-content: center !important;
  border-radius: 4px !important;
}

.v-list-item__content {
  padding: 4px 0 !important;
  transition: color 0.2s ease !important;
  text-align: center !important;
  display: flex !important;
  justify-content: center !important;
}

.v-list-item-title {
  font-size: 0.875rem !important;
  line-height: 1.25rem !important;
  transition: color 0.2s ease !important;
  text-align: center !important;
}

/* 우측 메뉴 버튼 스타일 */
.v-col.justify-end .menu-btn {
  margin-left: 8px !important;
}

/* 우측 메뉴 호버 효과 */
.v-col.justify-end .v-btn.v-btn--variant-text:hover {
  background-color: #f3e5f5 !important;
}

.profile-avatar {
  cursor: pointer;
  border: 2px solid #6200ea;
  height: 40px !important;
  width: 40px !important;
  transition: all 0.3s ease;
}

.profile-avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 0 8px rgba(98, 0, 234, 0.4);
  border-color: #7c4dff;
}

.profile-avatar:active {
  transform: scale(0.95);
}

.ml-2 {
  margin-left: 8px;
}

/* 프로필 드롭다운 메뉴 스타일 */
.profile-menu {
  margin-top: 8px !important;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(98, 0, 234, 0.1) !important;
  position: relative !important;
}

.profile-menu .v-list-item {
  min-height: 44px;
  padding: 8px 16px;
  transition: background-color 0.2s;
}

.profile-menu .v-list-item:hover {
  background-color: #f3e5f5;
}

.profile-menu .v-list-item-title {
  font-size: 0.9rem;
  color: #333;
}

.profile-menu .v-icon {
  color: #6200ea;
  margin-right: 8px;
}

.profile-menu .v-divider {
  margin: 4px 0;
}

/* 프로필 드롭다운 메뉴 위치 조정 */
:deep(.v-menu > .v-overlay__content) {
  top: 100% !important;
  right: 0 !important;
  left: auto !important;
  position: absolute !important;
  transform-origin: top right !important;
}

/* 프로필 메뉴 컨테이너 위치 설정 */
.v-menu {
  position: relative !important;
}

/* 프로필 아바타 컨테이너 위치 설정 */
.profile-avatar {
  position: relative !important;
  z-index: 1;
}

.profile-menu-container {
  position: relative;
}

/* 프로필 드롭다운 메뉴 위치 조정 */
:deep(.v-overlay__content) {
  position: absolute !important;
  top: 100% !important;
  right: 0 !important;
}

.profile-menu {
  margin-top: 5px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(98, 0, 234, 0.1) !important;
}

.profile-avatar {
  cursor: pointer;
}

.chat-icon {
  opacity: 0.8;
  transition: opacity 0.2s;
  height: 40px !important;
  width: 40px !important;
}

.chat-icon:hover {
  opacity: 1;
}

.mr-2 {
  margin-right: 8px;
}

.d-flex {
  display: flex !important;
}

.align-center {
  align-items: center !important;
}
</style>
