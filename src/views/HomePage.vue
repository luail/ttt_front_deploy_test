<template>
  <div class="home-wrapper">
    <!-- 최상단 배너 슬라이더 -->
    <v-carousel
      v-model="currentBanner"
      :show-arrows="true"
      :continuous="true"
      :cycle="true"
      interval="5000"
      hide-delimiter-background
      delimiter-icon="mdi-minus"
      height="250"
      class="banner-carousel"
    >
      <v-carousel-item
        v-for="(banner, i) in banners"
        :key="i"
      >
        <div class="banner-container">
          <img 
            :src="banner.image"
            class="banner-img"
            alt="banner"
          />
        </div>
      </v-carousel-item>
    </v-carousel>
    <!-- 🔹 배너 아래 얇은 선 추가 -->
    <v-divider class="banner-divider"></v-divider>

    <!-- 메인 컨텐츠를 하나의 컨테이너로 통합 -->
    <div class="content-wrapper">
      <v-container fluid class="main-content px-6">
        <v-row>
          <!-- 왼쪽 사이드바 -->
          <v-col cols="2" class="sidebar-col">
            <div class="sticky-sidebar">
              <!-- Top Writers 섹션 -->
              <v-card class="top-writers-card">
                <v-card-title
                  class="top-writers-title"
                >
                  <v-icon left small color="amber darken-2">mdi-trophy</v-icon>
                  T-랭킹
                </v-card-title>
                <v-list>
                  <v-list-item v-for="(writer, index) in topWriters" :key="index" class="writer-item">
                    <v-list-item-avatar size="32">
                      <v-img :src="writer.avatar"></v-img>
                    </v-list-item-avatar>
                    <v-list-item-content class="writer-content">
                      <v-list-item-title class="d-flex align-center">
                        <div class="rank-badge" :class="`rank-${index + 1}`">
                          <template v-if="index === 0">
                            <v-icon small color="amber darken-2">mdi-crown</v-icon>
                          </template>
                          <template v-else>
                            <v-icon small :color="getMedalColor(index)">mdi-medal</v-icon>
                          </template>
                        </div>
                        <span class="ranker-name">{{ writer.nickName }}</span>
                        <v-list-item-subtitle class="d-flex justify-end">
                        <v-chip x-small :color="getRankColor(index)" text-color="white">
                          {{ writer.rankingPoint }}
                        </v-chip>
                      </v-list-item-subtitle>
                      </v-list-item-title>
              
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-card>

              <!-- 채팅방 섹션 -->
              <v-card class="chat-rooms-card mt-4">
                <v-card-title class="chat-rooms-title">
                  <v-icon left small>mdi-chat</v-icon>
                  T-톡
                </v-card-title>
                
                <v-list dense>
                  <v-list-item
                    v-for="chat in activeChats"
                    :key="chat.roomId"
                    :to="`/ttt/chatpage/${chat.roomId}`"
                    class="chat-room-item"
                  >
                    <v-list-item-content>
                      <v-list-item-title class="chat-room-title">
                        {{ chat.roomName }}
                      </v-list-item-title>
                      <v-list-item-subtitle class="chat-room-info">
                        <span class="participants">
                          <v-icon x-small class="mr-1">mdi-account</v-icon>
                          {{ chat.chatPaticipantCount }}
                        </span>
                      </v-list-item-subtitle>
                    </v-list-item-content>
                    
                  </v-list-item>
                </v-list>
              </v-card>
            </div>
          </v-col>

          <!-- 메인 컨텐츠 영역 -->
          <v-col cols="8">
            <!-- 상단 2개 섹션: 전체게시글 & 인기글 -->
            <v-row>
              <v-col cols="6">
                <v-card class="board-card">
                  <v-card-title class="board-title">
                    커뮤니티
                    <v-btn small class="ml-auto" :to="'/ttt/post/list/0'">
                      <v-icon>mdi-chevron-right</v-icon>
                    </v-btn>
                  </v-card-title>
                  <v-list>
                    <v-list-item v-for="post in recentPosts" :key="post.postId" :to="`/ttt/post/${post.postId}`">
                      <v-list-item-content>
                        <v-list-item-title class="post-title">{{ post.title }}</v-list-item-title>
                        <v-list-item-subtitle class="post-meta">
                          <span class="author">{{ post.authorNickName }}</span>
                          <span class="mx-2">•</span>
                          <span>{{ formatDate(post.createdTime) }}</span>
                          <span class="stats">
                            <span class="ml-2">👀 {{ post.viewCount }}</span>
                            <span class="ml-2">👍 {{ post.likesCount }}</span>
                            <span class="ml-2">💬 {{ post.countOfComment }}</span>
                          </span>
                        </v-list-item-subtitle>
                      </v-list-item-content>
                    </v-list-item>
                  </v-list>
                </v-card>
              </v-col>

              <v-col cols="6"> 
                <v-card class="board-card">
                  <v-card-title class="board-title">
                    TODAY's BEST
                    <v-btn class="ml-auto" :to="'/ttt/post/list/popular'">
                      <v-icon>mdi-chevron-right</v-icon>
                    </v-btn>
                  </v-card-title>
                  <v-list>
                    <v-list-item v-for="post in popularPosts" :key="post.postId" :to="`/ttt/post/${ post.postId }`">
                      <v-list-item-content>
                        <v-list-item-title class="post-title">{{ post.title }}</v-list-item-title>
                        <v-list-item-subtitle class="post-meta">
                          <span class="author">{{ post.authorNickName }}</span>
                          <span class="mx-2">•</span>
                          <span>{{ formatDate(post.createdTime) }}</span>
                          <span class="stats">
                            <span class="ml-2">👀 {{ post.viewCount }}</span>
                            <span class="ml-2">👍 {{ post.likesCount }}</span>
                            <span class="ml-2">💬 {{ post.countOfComment }}</span>
                          </span>
                        </v-list-item-subtitle>
                      </v-list-item-content>
                    </v-list-item>
                  </v-list>
                </v-card>
              </v-col>
            </v-row> 

            <!-- 하단 2개 섹션: 알고리즘 & 취업 게시판 -->
            <v-row class="mt-4">
              <v-col cols="6">
                <v-card class="board-card">
                  <v-card-title class="board-title">
                    TimeToTalk(이제는 말할수 있다.)
                    <v-btn class="ml-auto" :to="'/ttt/post/list/2'">
                      <v-icon>mdi-chevron-right</v-icon>
                    </v-btn>
                  </v-card-title>
                  <v-list>
                    <v-list-item v-for="post in informationPosts" :key="post.postId" :to="`/ttt/post/${post.postId}`">
                      <v-list-item-content>
                        <v-list-item-title class="post-title">{{ post.title }}</v-list-item-title>
                        <v-list-item-subtitle class="post-meta">
                          <span class="author">{{ post.authorNickName }}</span>
                          <span class="mx-2">•</span>
                          <span>{{ formatDate(post.createdTime) }}</span>
                          <span class="stats">
                            <span class="ml-2">👀 {{ post.viewCount }}</span>
                            <span class="ml-2">👍 {{ post.likesCount }}</span>
                            <span class="ml-2">💬 {{ post.countOfComment }}</span>
                          </span>
                        </v-list-item-subtitle>
                      </v-list-item-content>
                    </v-list-item>
                  </v-list>
                </v-card>
              </v-col>

              <v-col cols="6">
                <v-card class="board-card">
                  <v-card-title class="board-title">
                    Q&A
                    <v-btn class="ml-auto" :to="'/ttt/post/list/3'">
                      <v-icon>mdi-chevron-right</v-icon>
                    </v-btn>
                  </v-card-title>
                  <v-list>
                    <v-list-item v-for="post in algorithmPosts" :key="post.postId" :to="`/ttt/post/${post.postId}`">
                      <v-list-item-content>
                        <v-list-item-title class="post-title">{{ post.title }}</v-list-item-title>
                        <v-list-item-subtitle class="post-meta">
                          <span class="author">{{ post.authorNickName }}</span>
                          <span class="mx-2">•</span>
                          <span>{{ formatDate(post.createdTime) }}</span>
                          <span class="stats">
                            <span class="ml-2">👀 {{ post.viewCount }}</span>
                            <span class="ml-2">👍 {{ post.likesCount }}</span>
                            <span class="ml-2">💬 {{ post.countOfComment }}</span>
                          </span>
                        </v-list-item-subtitle>
                      </v-list-item-content>
                    </v-list-item>
                  </v-list>
                </v-card>
              </v-col>
            </v-row>
          </v-col>

          <!-- 오른쪽 배너 광고 섹션 -->
          <v-col cols="2" class="sidebar-col">
            <div class="sticky-sidebar">
              <div class="ad-banner">
                <a href="https://www.inflearn.com/users/1014633/@bradkim" target="_blank">
                  <img :src="require('@/assets/verticalbanner2.png')" alt="" class="banner-img2">
                </a>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </div>
  </div>
</template>

<script>

import axios from 'axios';
import dayjs from 'dayjs';

import 'dayjs/locale/ko';



export default {
  name: 'HomePage',
  
  data() {
    return {
      currentBanner: 0,
      banners: [
        {
          image: require('@/assets/tttad.png'),
          link: 'https://www.inflearn.com/users/1014633/@bradkim',
          bgColor: '#00C853'
        },
        {
          image: require('@/assets/birthdayAdd.png'),  // 두 번째 배너 이미지
          bgColor: '#1976D2'
        },
        {
          image: require('@/assets/kakaohacademy.png'),  // 세 번째 배너 이미지
          bgColor: '#FFC107'
        }
      ],
      topWriters: [],
      recentPosts: [],
      popularPosts: [],
      informationPosts: [],
      algorithmPosts: [],
      activeChats: [],
    }
  },

  async created() {
    // Promise.all을 해야 아래 4개의 함수가 병렬적으로 함께 시작되어 데이터를 불러옴. 그냥 Promise.all없이 실행하면 하나하나씩 함수 실행되면서 Api요청이 순서대로 진행되어 게시판 데이터 불러오는게 늦어진다
    //그래서 여러개의 api요청을 동시에 실행해야할 때, 홈페이지에서 여러 종류의 데이터를 한꺼번에 불러와야할때 보통 사용한다.
    await Promise.all([
      this.fetchRecentPosts(),
      this.fetchPopularPosts(),
      this.fetchInformationPosts(),
      this.fetchAlgorithmPosts(),
      this.topRanker(),
      this.getChatRoom()

    ]);
  },

  methods: {
    formatDate(dateArray) {
            //이거는 createdTime이 배열값으로 들어오는지 확인하는 유효성 검사
            if(!dateArray || dateArray.length < 6 ) return '';
            //자바스크립트가 1월 부터 시작하는 것을 0월부터 인덱스로 인식해서 그걸 처리하는 값
            const formattedDate = dayjs(`${dateArray[0]}-${dateArray[1].toString().padStart(2, '0')}-${dateArray[2].toString().padStart(2, '0')}T${dateArray[3].toString().padStart(2, '0')}:${dateArray[4].toString().padStart(2, '0')}:${dateArray[5].toString().padStart(2, '0')}`);
            //24시간 이내면 몇시간전 이래 표시되고, 하루가 지나면 날짜로 표시됨
            return dayjs().diff(formattedDate,'hour')<24 ? formattedDate.fromNow() : formattedDate.format('YYYY-MM-DD');
        },

    async topRanker(){
          const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/user/rankingfive`)
          this.topWriters = response.data.result;
    },   


    async fetchRecentPosts() {
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/post/findAll?page=0&size=10`);
        this.recentPosts = response.data.result.content.slice(0, 10);
      } catch (error) {
        console.log("최근 게시물 로딩 실패",error);
      }
    },

    async fetchPopularPosts() {
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/post/popular`);
        this.popularPosts = response.data.result
      } catch (error) {
        console.error('인기 게시물 로딩 실패:', error);
      }
    },

    async fetchInformationPosts() {
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/post/category/2?page=0&size=10`);
        this.informationPosts = response.data.result.content.slice(0,10)
      } catch (error) {
        console.error('정보 게시물 로딩 실패:', error);
      }
    },

    async fetchAlgorithmPosts() {
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/post/category/3?page=0&size=10`);
        this.algorithmPosts = response.data.result.content.slice(0,10);
      } catch (error) {
        console.error('알고리즘 게시물 로딩 실패:', error);
      }
    },

    async getChatRoom(){
     const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/chat/room/group/list`);
     this.activeChats = response.data.result.content;
     console.log(this.activeChats)
    },

 

    getMedalColor(index) {
      const colors = {
        1: 'grey lighten-1',    // 은색
        2: 'brown lighten-1',   // 동색
        3: 'blue-grey',         // 4등
        4: 'grey darken-1'      // 5등
      };
      return colors[index] || 'grey';
    },

    getRankColor(index) {
      const colors = {
        0: 'amber darken-2',    // 금색
        1: 'grey lighten-1',    // 은색
        2: 'brown lighten-1',   // 동색
        3: 'blue-grey',         // 4등
        4: 'grey darken-1'      // 5등
      };
      return colors[index] || 'grey';
    }
  }
}
</script>

<style scoped>
.home-wrapper {
  width: 100%;
  background-color: #f5f5fc; /* 연한 보라톤 배경 */
}

/* 🔹 메인 컨텐츠 영역 */
.content-wrapper {
  position: relative;
  min-height: 100vh; /* 최소 높이 설정 (뷰포트 높이와 동일) */
  margin-bottom: 0%; /* 하단 마진 (필요 시 조정) */
  margin-left: 8%;  /* 좌측 여백 추가 */
  margin-right: 8%; /* 우측 여백 추가 */
}

/* 🔹 사이드바 영역 */
.sidebar-col {
  position: relative;
}

/* 🔹 사이드바를 고정 (스크롤 시 따라오게 설정) */
.sticky-sidebar {
  position: -webkit-sticky;
  position: sticky;
  top: 64px; /* 네비게이션 바 높이를 고려하여 위치 조정 */
  height: auto;
}

/* 🔹 배너 스타일 */
.banner-container {
  width: 100%;
  height: 250px;
  overflow: hidden;
  position: relative;
}

.banner-carousel {
  max-width: 80%; /* 🔹 배너 크기를 80%로 조정 */
  margin: 0 auto; /* 가운데 정렬 */
}

.banner-img {
  width: 100%;
  height: 250px;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
}

/* 🔹 Top Writers & 채팅방 카드 스타일 */
.top-writers-card,
.chat-rooms-card {
  width: 100%;
  background-color: #f8f9fa; /* 연한 회색 배경 */
  border: 1px solid #e9ecef; /* 연한 테두리 */
}

/* 🔹 Top Writers 타이틀 스타일 */
.top-writers-title {
  font-size: 1rem;
  padding: 12px 16px;
  background-color: #f8f9fa; /* 연한 회색 배경 */
  border-bottom: 1px solid #e9ecef; /* 하단 테두리 */
}

.ranker-name {
  margin-left: 3px;
  margin-right: 10px;
}

/* 🔹 랭킹 아이템 스타일 */
.writer-item {
  padding: 8px 16px;
}

/* 🔹 게시판 카드 스타일 */
.board-card {
  background: white;
  border-radius: 0px; /* 둥근 모서리 */
  /* box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); 그림자 효과 */
  /* transition: all 0.3s ease-in-out; 부드러운 애니메이션 */
}

/* 🔹 게시판 타이틀 스타일 */
.board-title {
  font-size: 1rem;
  font-weight: bold;
  color: #6200ea; /* 텍스트 색상 */
  padding: 12px 16px;
  border: 1px solid #6200ea; /* ✅ 테두리 색상 적용 */
  background-color: #f5f5fc; /* 연한 보라톤 배경 */

}
.v-list {
  background-color: transparent; /* ✅ 배경색 제거 (원하는 경우 추가 가능) */

}

/* 🔹 버튼 스타일 */
.v-btn {
  font-weight: bold;
  background-color: #f5f5fc; /* 흰색 배경 */
  color: #6200ea; /* 보라색 텍스트 */
  transition: background 0.3s ease-in-out;
  height: 50px;
  width: 10%;
}

/* 🔹 글 목록 제목 스타일 */
.post-title {
  font-size: 0.95rem;
  font-weight: bold;
  color: #333; /* 진한 회색 */
}

.post-meta {
  font-size: 0.85rem;
  color: #666; /* 중간 회색 */
}

.author {
  color: #357abd; /* 블루 계열 색상 */
  font-weight: 500;
}

.stats {
  color: #666;
}

/* 🔹 리스트 아이템 효과 */
.v-list-item {
  transition: background-color 0.2s ease-in-out;
}

.writer-content {
  min-width: 0; /* 긴 닉네임 처리를 위한 설정 */
}

/* 🔹 채팅방 & 랭킹 섹션 */
.chat-rooms-card,
.top-writers-card {
  background: white;
  border-radius: 0px;/* 둥근 모서리 */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* 그림자 효과 */
}

/* 🔹 Top Writers 타이틀 */
.top-writers-title {
  font-size: 1rem;
  font-weight: bold;
  color: #6200ea; /* 텍스트 색상 */
  padding: 12px 16px;
  border: 1px solid #6200ea; /* ✅ 테두리 색상 적용 */
  background-color: transparent; /* ✅ 배경색 제거 (원하는 경우 추가 가능) */
}

/* 🔹 랭킹 배지 스타일 */
.rank-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: 8px;
  padding: 2px;
}

/* 🔹 1위 애니메이션 효과 */
.rank-1 {
  animation: shine 2s infinite;
}

/* 🔹 랭킹 번호 스타일 */
.rank-number {
  font-size: 0.8rem;
  font-weight: bold;
  color: #666;
}

/* 🔹 1위 효과 애니메이션 */
@keyframes shine {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* 🔹 호버 효과 */
.writer-item:hover {
  background-color: rgba(0, 0, 0, 0.03);
  transition: background-color 0.2s ease;
}

/* 🔹 작은 칩 스타일 */
.v-chip.v-size--x-small {
  font-weight: bold;
}

/* 🔹 플레이스홀더 카드 스타일 */
.placeholder-card {
  background-color: #f5f5f5;
  border: 1px dashed #ddd;
}

/* 🔹 4~5위 아이콘 투명도 조정 */
.rank-4 .v-icon,
.rank-5 .v-icon {
  opacity: 0.9;
}

/* 🔹 채팅방 타이틀 */
.chat-rooms-title {
  font-size: 1rem;
  font-weight: bold;
  color: #6200ea; /* 텍스트 색상 */
  padding: 12px 16px;
  border: 1px solid #6200ea; /* ✅ 테두리 색상 적용 */
  background-color: transparent; /* ✅ 배경색 제거 (원하는 경우 추가 가능) */
}

/* 🔹 채팅방 리스트 아이템 */
.chat-room-item {
  padding: 8px 16px;
  transition: background-color 0.2s;
}

.chat-room-item:hover {
  background-color: #e9ecef;
}

/* 🔹 채팅방 제목 스타일 */
.chat-room-title {
  font-size: 0.9rem;
  font-weight: 500;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 🔹 채팅방 정보 스타일 */
.chat-room-info {
  font-size: 0.8rem;
  color: #666;
  margin-top: 2px;
}

.participants {
  display: flex;
  align-items: center;
  font-size: 0.75rem;
}

/* 🔹 광고 배너 */
.ad-banner {
  height: 100%;
  width: 100%;
}

.banner-img2 {
  height: 100%;
  width: 100%;
}

/* 🔹 채팅방 스크롤바 스타일 */
.chat-rooms-card ::-webkit-scrollbar {
  width: 4px;
}

.chat-rooms-card ::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.chat-rooms-card ::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 2px;
}

.chat-rooms-card ::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* 🔹 사이드바 스크롤바 스타일 */
.sticky-sidebar::-webkit-scrollbar {
  width: 4px;
}

.sticky-sidebar::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.sticky-sidebar::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 2px;
}

.sticky-sidebar::-webkit-scrollbar-thumb:hover {
  background: #555;
}


</style>
