<template>
  <div>
    <v-app-bar class="header-container">
      <v-container class="py-2">
        <v-row align="center" no-gutters>
          <!-- 로고 -->
          <v-col cols="2">
            <router-link to="/ttt" class="text-decoration-none">
              <h1 class="logo">
                <span class="highlight">T</span><span class="small-text">ik</span>
                <span class="highlight">T</span><span class="small-text">ak</span>
                <span class="highlight">T</span><span class="small-text">ok</span>
              </h1>
            </router-link>
          </v-col>

          <!-- 메인 메뉴 -->
          <v-col cols="6">
            <v-row no-gutters>
              <v-col cols="3">
                <v-menu open-on-hover offset-y>
                  <template v-slot:activator="{ props }">
                    <v-btn v-bind="props" class="menu-btn" variant="text" block flat :ripple="false"
                      :class="{ 'active-menu': hoveredMenu === 'community' }"
                      @mouseover="hoveredMenu = 'community'"
                      @mouseleave="hoveredMenu = null">
                      <v-icon>mdi-text</v-icon>&nbsp;커뮤니티
                    </v-btn>
                  </template>
                  <v-card class="dropdown-menu" flat>
                    <v-list>
                      <v-list-item to="/ttt/post/list/0">전체게시판</v-list-item>
                      <v-list-item to="/ttt/post/list/1">자유게시판</v-list-item>
                      <v-list-item to="/ttt/post/list/2">정보게시판</v-list-item>
                      <v-list-item to="/ttt/post/list/3">알고리즘게시판</v-list-item>
                    </v-list>
                  </v-card>
                </v-menu>
              </v-col>
              <v-col cols="3">
                <v-btn class="menu-btn" variant="text" block flat :ripple="false"
                  :class="{ 'active-menu': hoveredMenu === 'list' }"
                  @mouseover="hoveredMenu = 'list'"
                  @mouseleave="hoveredMenu = null"
                  to="/ttt/project/find">
                  프로젝트
                </v-btn>
              </v-col>
              <v-col cols="3">
                <v-btn class="menu-btn" variant="text" block flat :ripple="false"
                  :class="{ 'active-menu': hoveredMenu === 'chat' }"
                  @mouseover="hoveredMenu = 'chat'"
                  @mouseleave="hoveredMenu = null"
                  to="/ttt/chat/list">
                  라운지
                </v-btn>
              </v-col>

              

              <v-col cols="3" v-if="userRole === 'ADMIN'">
                <v-menu open-on-hover offset-y>
                  <template v-slot:activator="{ props }">
                    <v-btn v-bind="props" class="menu-btn" variant="text" block flat :ripple="false"
                      :class="{ 'active-menu': hoveredMenu === 'admin' }"
                      @mouseover="hoveredMenu = 'admin'"
                      @mouseleave="hoveredMenu = null">
                      <v-icon>mdi-text</v-icon>&nbsp;관리자
                    </v-btn>
                  </template>
                  <v-card class="dropdown-menu" flat>
                    <v-list>
<!--                      <v-list-item to="/ttt/blog/list">블로그</v-list-item>-->
                      <v-list-item to="/ttt/user/list">회원목록조회</v-list-item>
                    </v-list>
                  </v-card>
                </v-menu>
              </v-col>
            </v-row>
          </v-col>

          <!-- 우측 메뉴 -->
          <v-col cols="4" class="d-flex justify-end align-center">
            <!-- 메시지 아이콘을 로그인 상태일 때만 표시 -->
            <template v-if="isLoggedIn">
              <v-btn icon class="chat-icon mr-2" to="/ttt/chatpage" color="#6200ea" :class="{ 'pulse': isNewMessage }">
                <v-icon>
                  {{ hasUnreadMessages ? 'mdi-message-badge' : 'mdi-message-outline' }}
                </v-icon>
              </v-btn>
            </template>

            <!-- 로그인 상태 -->
            <template v-if="isLoggedIn">
              <!-- 프로필 메뉴 -->
              <v-menu v-model="profileMenu" :close-on-content-click="true">
                <template v-slot:activator="{ props }">
                  <v-avatar class="profile-avatar" size="32" v-bind="props">
                    <v-img :src="profileImageUrl || require('@/assets/basicProfileImage.png')"
                          :alt="'프로필 이미지'"
                          @error="handleImageError">
                    </v-img>
                  </v-avatar>
                </template>
                <v-card min-width="200" class="profile-menu">
                  <v-list>
                    <v-list-item class="profile-menu-item" to="/ttt/user/myInformation" @click="profileMenu = false">
                      <template v-slot:prepend>
                        <v-icon>mdi-account-circle</v-icon>
                      </template>
                      <v-list-item-title>프로필</v-list-item-title>
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
import { EventSourcePolyfill } from 'event-source-polyfill';
import axios from 'axios';

export default {
  data() {
    return {
      userRole: "",
      isLoggedIn: false,
      hoveredMenu: null,
      profileImageUrl: null,
      profileMenu: false,
      eventSource: null,
      reconnectTimeout: null,
      isNewMessage: false,
    }
  },
  computed: {
    hasUnreadMessages() {
        return this.$store.getters.totalUnreadCount > 0;
    }
  },
  async created() {
    const token = localStorage.getItem('token');
    if (token) {
        const payload = jwtDecode(token);
        this.isLoggedIn = true;
        this.userRole = payload.role;
        
        try {
            // 프로필 이미지와 채팅방 목록을 병렬로 가져오기
            const [profileResponse, chatListResponse] = await Promise.all([
                axios.get(`${process.env.VUE_APP_API_BASE_URL}/user/myInformation`),
                axios.get(`${process.env.VUE_APP_API_BASE_URL}/chat/my/rooms`)
            ]);
            
            // 프로필 이미지 설정
            this.profileImageUrl = profileResponse.data.result.profileImage;
            
            // 채팅방 목록을 Vuex store에 저장
            this.$store.dispatch('setChatList', chatListResponse.data.result);
        } catch (error) {
            console.error('데이터 로드 실패:', error);
            if (error.response?.status === 401) {
                // 토큰이 만료된 경우 처리
                localStorage.clear();
                window.location.href = '/ttt/user/login';
            }
        }
        
        // SSE 연결
        this.connectSSE();
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }
  },
  unmounted() {
    if (this.eventSource) {
      this.eventSource.close();
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
  },
  methods: {
    connectSSE() {
      if (this.eventSource) {
        this.eventSource.close();
      }

      const token = localStorage.getItem('token');
      
      const options = {
        heartbeatTimeout: 120000,
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      this.eventSource = new EventSourcePolyfill('https://server.tiktaktok.site/subscribe', options);

      this.eventSource.onopen = () => {
        console.log('SSE 연결됨');
      };

      this.eventSource.addEventListener('connect', (e) => {
        console.log('SSE Connected:', e.data);
      });

      this.eventSource.addEventListener('chat-message', (e) => {
        const chatMessage = JSON.parse(e.data);
        
        // Vuex store를 통해 새 메시지 처리
        this.$store.dispatch('handleNewMessage', chatMessage);
        
        // 새 메시지 알림 효과
        this.isNewMessage = true;
        setTimeout(() => {
          this.isNewMessage = false;
        }, 1000);

        // 브라우저 알림
        if (Notification.permission === 'granted' && 
          this.$route.path !== `/ttt/chatpage/${chatMessage.roomId}`) {
          const notification = new Notification('TikTakTalk', {
            body: `${chatMessage.senderNickName}: ${chatMessage.message}`,
            icon: chatMessage.senderImagePath || require('@/assets/basicProfileImage.png'),
            tag: 'chat-message',
            silent: false,
            dir: 'auto',
            timestamp: Date.now()
          });

          setTimeout(() => {
            notification.close();
          }, 3000);
        }
      });

      this.eventSource.onerror = (error) => {
        console.error('SSE Error:', error);
        this.eventSource.close();
        
        setTimeout(() => {
          console.log('SSE 재연결 시도');
          this.connectSSE();
        }, 3000);
      };
    },
    disconnectSSE() {
      if (this.eventSource) {
        this.eventSource.close();
      }
    },
    doLogout() {
        // SSE 연결 종료
        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
        }
        
        // 기존 로그아웃 로직
        localStorage.clear();
        window.location.href = '/ttt';
    },
    async fetchProfileImage() {
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/user/myInformation`);
        console.log("프로필 API 응답:", response.data); // 🔍 응답 데이터 확인
        this.profileImageUrl = response.data.result.profileImage;
        
      } catch (error) {
        console.error('프로필 이미지 로드 실패:', error);
        this.profileImageUrl = require('@/assets/basicProfileImage.png'); // 기본 이미지 설정
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

.logo .highlight {
  font-size: 2rem;
  font-weight: bold;
  color: #6200ea;
}

.logo .small-text {
  font-size: 0.8rem;
  color: #666666;
  font-weight: normal;
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
  left: 0;
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
  position: relative;
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

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(98, 0, 234, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(98, 0, 234, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(98, 0, 234, 0);
  }
}

.pulse {
  animation: pulse 1s;  /* infinite 제거하여 한 번만 실행 */
  border-radius: 50%;
}
</style>