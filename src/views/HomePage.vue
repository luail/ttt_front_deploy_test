<template>
  <div class="home-container">
    <!-- 상단 히어로 섹션 -->
    <section class="hero-section">
      <v-container>
        <div class="hero-content">
          <div class="hero-text">
            <h1 class="logo text-center">
              <span class="highlight">T</span><span class="small-text">ic</span>
              <span class="highlight">T</span><span class="small-text">ak</span>
              <span class="highlight">T</span><span class="small-text">ok</span>
            </h1>
            <p class="subtitle text-h6 mb-6">HanHwa Beyond Camp</p>
          </div>
          <div class="hero-stats">
            <div class="stat-item">
              <div class="stat-number">{{ totalPosts }}+</div>
              <div class="stat-label">지금까지의 게시글</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ totalUsers }}+</div>
              <div class="stat-label">활동하는 멤버</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ totalRooms }}+</div>
              <div class="stat-label">실시간 채팅</div>
            </div>
          </div>
        </div>
      </v-container>
    </section>

    <v-container class="main-content">
      <!-- 카테고리 네비게이션 -->
      <div class="category-section">
        <!-- 전체게시판 -->
        <div class="category-card cursor-pointer" @click="goToCategory(0)">
          <div class="card-content">
            <v-icon size="36" color="#6366f1">mdi-view-dashboard-outline</v-icon>
            <h3>전체게시판</h3>
            <p>모든 게시글 모음</p>
          </div>
        </div>

        <!-- 프로젝트 -->
        <div class="category-card cursor-pointer" @click="$router.push('/ttt/project/find')">
          <div class="card-content">
            <v-icon size="36" color="#22c55e">mdi-rocket-launch-outline</v-icon>
            <h3>프로젝트</h3>
            <p>프로젝트 찾기</p>
          </div>
        </div>

        <!-- 라운지 -->
        <div class="category-card cursor-pointer" @click="$router.push('/ttt/chat/list')">
          <div class="card-content">
            <v-icon size="36" color="#f59e0b">mdi-message-text-outline</v-icon>
            <h3>라운지</h3>
            <p>실시간 채팅</p>
          </div>
        </div>
      </div>

      <v-row>
        <!-- 좌측 사이드바 -->
        <v-col cols="12" lg="3">
          <div class="sticky-container pr-lg-4">
            <!-- Top Writers 카드 -->
            <v-card flat class="mb-5 ranking-card">
              <div class="card-header pa-3">
                <h3 class="text-subtitle-2 font-weight-medium">🏆 Top Writers</h3>
              </div>
              <v-divider></v-divider>
              <div class="ranking-list pa-2">
                <div v-for="(writer, index) in topWriters" :key="index" class="ranking-item">
                  <div class="user-info">
                    <div class="user-name">{{ writer.nickName }}</div>
                    <div class="user-points">{{ writer.rankingPoint }}p</div>
                  </div>
                </div>
              </div>
            </v-card>

            <!-- Top Batches 카드 -->
            <v-card flat class="ranking-card">
              <div class="card-header pa-3">
                <h3 class="text-subtitle-2 font-weight-medium">🎯 Top Batches</h3>
              </div>
              <v-divider></v-divider>
              <div class="ranking-list pa-2">
                <div v-for="(batch, index) in batchRanks" 
                     :key="index" 
                     class="ranking-item"
                     @click="goToBatchProjects(batch.batch)"
                     style="cursor: pointer;">
                  <div class="user-info">
                    <div class="user-name">{{ batch.batch }}기</div>
                    <div class="user-points">{{ batch.averageRankingPoint }}p</div>
                  </div>
                </div>
              </div>
            </v-card>
          </div>
        </v-col>

        <!-- 메인 컨텐츠 영역 -->
        <v-col cols="12" lg="9" class="pl-lg-8">
          <!-- 일일 트렌딩 섹션 -->
          <section class="trending-section mb-8" style="margin-top: -16px;">
            <div class="section-header">
              <h2>🔥 일일 트렌딩</h2>
            </div>
            <div class="trending-container position-relative">
              <!-- 좌우 화살표 버튼 - 평소에는 숨겨져 있음 -->
              <div class="trending-nav-button trending-prev-button" @click.stop="prevTrendingPage">
                <v-icon>mdi-chevron-left</v-icon>
              </div>
              
              <div class="trending-nav-button trending-next-button" @click.stop="nextTrendingPage">
                <v-icon>mdi-chevron-right</v-icon>
              </div>
              
              <v-row>
                <v-col v-for="(post, index) in currentTrendingPosts" 
                       :key="getCurrentIndex(index)" 
                       cols="12" 
                       md="4">
                  <transition name="fade">
                    <v-card 
                      class="trending-card" 
                      elevation="1"
                      :style="{ borderLeft: `4px solid ${getTrendingColor(getCurrentIndex(index))}` }"
                      @click="$router.push(`/ttt/post/${post.postId}`)"
                    >
                      <v-card-text>
                          <div class="trending-header">
                        <div class="rank-category">
                          <div class="trending-rank" :style="{ color: getTrendingColor(getCurrentIndex(index)) }">
                            #{{ getCurrentIndex(index) + 1 }}
                          </div>
                          <span class="category-tag" :class="getCategoryClass(post.categoryId)">
                            {{ post.categoryName }}
                          </span>
                        </div>
                        <div class="trending-title">{{ post.title }}</div>
                      </div>
                        <div class="trending-meta">
                          <div class="author-info">
                            <v-avatar size="24">
                              <v-img 
                                :src="post.authorImage || 'https://ttt-image.s3.ap-northeast-2.amazonaws.com/기본이미지.png'"
                                @error="handleImageError"
                              ></v-img>
                            </v-avatar>
                            <span class="author-name">{{ truncateNickname(post.authorNickName) }}</span>
                          </div>
                          <div class="post-stats">
                            <span class="stat-item">
                              <v-icon size="12">mdi-eye</v-icon> {{ post.viewCount }}
                            </span>
                            <span class="stat-item">
                              <v-icon size="12">mdi-heart</v-icon> {{ post.likesCount }}
                            </span>
                            <span class="stat-item">
                              <v-icon size="12">mdi-comment</v-icon> {{ post.countOfComment }}
                            </span>
                          </div>
                        </div>
                      </v-card-text>
                    </v-card>
                  </transition>
                </v-col>
              </v-row>
              
              <!-- 페이지 인디케이터 -->
              <div class="trending-indicators mt-3 text-center">
                <span 
                  v-for="(_, i) in Math.ceil(trendingPosts.length / 3)" 
                  :key="i"
                  class="indicator-dot"
                  :class="{ active: i === currentTrendingPage }"
                  @click="setTrendingPage(i)"
                ></span>
              </div>
            </div>
          </section>

          <!-- 게시판 섹션들 -->
          <v-row>
            <!-- 전체게시판 섹션 (크게) -->
            <v-col cols="12">
              <div class="board-section">
                <div class="board-header">
                  <div class="board-icon-wrapper">
                    <v-icon class="board-icon">mdi-grid-large</v-icon>
                  </div>
                  <div class="board-info">
                    <h2 class="board-title cursor-pointer" @click="goToCategory(0)">전체게시판</h2>
                    <span class="board-description">모든 게시글을 한눈에</span>
                  </div>
                </div>
                <div class="post-list">
                  <div v-for="post in recentPosts" 
                       :key="post.postId" 
                       class="post-item" 
                       @click="$router.push(`/ttt/post/${post.postId}`)">
                    <div class="user-info">
                      <div class="user-info-left">
                        <v-avatar size="24">
                          <v-img 
                            :src="post.authorImage || 'https://ttt-image.s3.ap-northeast-2.amazonaws.com/기본이미지.png'"
                            @error="handleImageError"
                          ></v-img>
                        </v-avatar>
                        <span class="author-name">{{ post.authorNickName }}</span>
                        <span class="category-tag" :class="getCategoryClass(post.categoryId)">
                          {{ getActualCategoryName(post) }}
                        </span>
                      </div>
                      <div class="post-stats">
                        <span class="stat-item"><v-icon size="12">mdi-eye</v-icon> {{ post.viewCount }}</span>
                        <span class="stat-item"><v-icon size="12">mdi-heart</v-icon> {{ post.likesCount }}</span>
                        <span class="stat-item"><v-icon size="12">mdi-comment</v-icon> {{ post.countOfComment }}</span>
                      </div>
                    </div>
                    <div class="post-title">
                      {{ post.title }}
                      <span class="post-time">· {{ formatDate(post.createdTime) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </v-col>

            <!-- 자유게시판 섹션 -->
            <v-col cols="12">
              <div class="board-section">
                <div class="board-header">
                  <div class="board-icon-wrapper free">
                    <v-icon class="board-icon">mdi-forum-outline</v-icon>
                  </div>
                  <div class="board-info">
                    <h2 class="board-title cursor-pointer" @click="goToCategory(1)">자유게시판</h2>
                    <span class="board-description">자유로운 소통공간</span>
                  </div>
                </div>
                <div class="post-list">
                  <div v-for="post in popularPosts" 
                       :key="post.postId" 
                       class="post-item" 
                       @click="$router.push(`/ttt/post/${post.postId}`)">
                    <div class="user-info">
                      <div class="user-info-left">
                        <v-avatar size="24">
                          <v-img 
                            :src="post.authorImage || 'https://ttt-image.s3.ap-northeast-2.amazonaws.com/기본이미지.png'"
                            @error="handleImageError"
                          ></v-img>
                        </v-avatar>
                        <span class="author-name">{{ post.authorNickName }}</span>
                        <span class="post-time">· {{ formatDate(post.createdTime) }}</span>
                      </div>
                      <div class="post-stats">
                        <span class="stat-item"><v-icon size="12">mdi-eye</v-icon> {{ post.viewCount }}</span>
                        <span class="stat-item"><v-icon size="12">mdi-heart</v-icon> {{ post.likesCount }}</span>
                        <span class="stat-item"><v-icon size="12">mdi-comment</v-icon> {{ post.countOfComment }}</span>
                      </div>
                    </div>
                    <div class="post-title">{{ post.title }}</div>
                  </div>
                </div>
              </div>
            </v-col>

            <!-- 정보게시판 섹션 -->
            <v-col cols="12" md="6">
              <div class="board-section">
                <div class="board-header">
                  <div class="board-icon-wrapper info">
                    <v-icon class="board-icon">mdi-lightbulb-on-outline</v-icon>
                  </div>
                  <div class="board-info">
                    <h2 class="board-title cursor-pointer" @click="goToCategory(2)">정보게시판</h2>
                    <span class="board-description">개발 정보 공유</span>
                  </div>
                </div>
                <div class="post-list">
                  <div v-for="post in informationPosts" 
                       :key="post.postId" 
                       class="post-item" 
                       @click="$router.push(`/ttt/post/${post.postId}`)">
                    <div class="user-info">
                      <div class="user-info-left">
                        <v-avatar size="24">
                          <v-img 
                            :src="post.authorImage || 'https://ttt-image.s3.ap-northeast-2.amazonaws.com/기본이미지.png'"
                            @error="handleImageError"
                          ></v-img>
                        </v-avatar>
                        <span class="author-name">{{ post.authorNickName }}</span>
                        <span class="post-time">· {{ formatDate(post.createdTime) }}</span>
                      </div>
                      <div class="post-stats">
                        <span class="stat-item"><v-icon size="12">mdi-eye</v-icon> {{ post.viewCount }}</span>
                        <span class="stat-item"><v-icon size="12">mdi-heart</v-icon> {{ post.likesCount }}</span>
                        <span class="stat-item"><v-icon size="12">mdi-comment</v-icon> {{ post.countOfComment }}</span>
                      </div>
                    </div>
                    <div class="post-title">{{ post.title }}</div>
                  </div>
                </div>
              </div>
            </v-col>

            <!-- 알고리즘 게시판 섹션 -->
            <v-col cols="12" md="6">
              <div class="board-section">
                <div class="board-header">
                  <div class="board-icon-wrapper algo">
                    <v-icon class="board-icon">mdi-code-brackets</v-icon>
                  </div>
                  <div class="board-info">
                    <h2 class="board-title cursor-pointer" @click="goToCategory(3)">알고리즘</h2>
                    <span class="board-description">알고리즘 문제풀이</span>
                  </div>
                </div>
                <div class="post-list">
                  <div v-for="post in algorithmPosts" 
                       :key="post.postId" 
                       class="post-item" 
                       @click="$router.push(`/ttt/post/${post.postId}`)">
                    <div class="user-info">
                      <div class="user-info-left">
                        <v-avatar size="24">
                          <v-img 
                            :src="post.authorImage || 'https://ttt-image.s3.ap-northeast-2.amazonaws.com/기본이미지.png'"
                            @error="handleImageError"
                          ></v-img>
                        </v-avatar>
                        <span class="author-name">{{ post.authorNickName }}</span>
                        <span class="post-time">· {{ formatDate(post.createdTime) }}</span>
                      </div>
                      <div class="post-stats">
                        <span class="stat-item"><v-icon size="12">mdi-eye</v-icon> {{ post.viewCount }}</span>
                        <span class="stat-item"><v-icon size="12">mdi-heart</v-icon> {{ post.likesCount }}</span>
                        <span class="stat-item"><v-icon size="12">mdi-comment</v-icon> {{ post.countOfComment }}</span>
                      </div>
                    </div>
                    <div class="post-title">{{ post.title }}</div>
                  </div>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-container>
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
      topBatches: [],
      recentPosts: [],
      popularPosts: [],
      informationPosts: [],
      algorithmPosts: [],
      activeChats: [],
      categories: [
        {
          name: '전체게시판',
          icon: 'mdi-view-list',
          color: 'primary',
          description: '모든 게시글 모음',
          categoryId: '0'  // 전체게시판
        },
        {
          name: '자유게시판',
          icon: 'mdi-account-group',
          color: 'success',
          description: '개발자들의 소통 공간',
          categoryId: '1'  // 자유게시판
        },
        {
          name: '정보게시판',
          icon: 'mdi-information',
          color: 'warning',
          description: '개발자 정보 공유',
          categoryId: '2'  // 정보게시판
        },
        {
          name: '알고리즘',
          icon: 'mdi-code-brackets',
          color: 'error',
          description: '알고리즘 문제 해결',
          categoryId: '3'  // 알고리즘 게시판
        }
      ],
      batchRanks: [], // 배치 랭킹 데이터
      totalUsers: 0,  // 전체 사용자 수 추가
      totalPosts: 0,  // 전체 게시글 수 추가
      totalRooms: 0,  // 전체 채팅방 수 추가
      trendingPosts: [],
      currentTrendingPage: 0,
      trendingInterval: null
    }
  },

  computed: {
    currentTrendingPosts() {
      const startIndex = this.currentTrendingPage * 3;
      const endIndex = startIndex + 3;
      return this.trendingPosts.slice(startIndex, endIndex);
    },

    totalTrendingPages() {
      return Math.ceil(this.trendingPosts.length / 3);
    }
  },

  async created() {
    try {
      await this.fetchTrendingPosts(); // 먼저 트렌딩 포스트를 가져오도록 수정
      await Promise.all([
        this.fetchRecentPosts(),
        this.fetchPopularPosts(),
        this.fetchInformationPosts(),
        this.fetchAlgorithmPosts(),
        this.topRanker(),
        this.fetchBatchRanks(),
        this.getChatRoom(),
        this.fetchTotalUsers(),
        this.fetchTotalPosts(),
        this.fetchTotalRooms()
      ]);
    } catch (error) {
      console.error('데이터 로딩 중 오류 발생:', error);
    }
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

    async fetchBatchRanks() {
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/user/batchRank`);
        this.batchRanks = response.data.result;
      } catch (error) {
        console.error('배치 랭크 로딩 실패:', error);
      }
    },

    async fetchRecentPosts() {
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/post/findAll?page=0&size=4`);
        this.recentPosts = response.data.result.content.slice(0, 10);
      } catch (error) {
        console.log("전체 게시물 로딩 실패", error);
      }
    },

    async fetchPopularPosts() {
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/post/category/1?page=0&size=4`);
        this.popularPosts = response.data.result.content.slice(0, 10);
      } catch (error) {
        console.error('자유게시판 게시물 로딩 실패:', error);
      }
    },

    async fetchInformationPosts() {
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/post/category/2?page=0&size=4`);
        this.informationPosts = response.data.result.content.slice(0, 10);
      } catch (error) {
        console.error('정보 게시물 로딩 실패:', error);
      }
    },

    async fetchAlgorithmPosts() {
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/post/category/3?page=0&size=4`);
        this.algorithmPosts = response.data.result.content.slice(0, 10);
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
      const colors = ['#FFD700', '#C0C0C0', '#CD7F32'];
      return colors[index] || '#gray';
    },

    goToCategory(categoryId) {
      this.$router.push(`/ttt/post/list/${categoryId}`);
    },

    handleImageError(event) {
      event.target.src = 'https://ttt-image.s3.ap-northeast-2.amazonaws.com/기본이미지.png';
    },

    getTrendingColor(index) {
      // 모든 순위에 대한 색상 지정
      const colors = {
        0: '#6366f1',  // 1등
        1: '#7c74f4',  // 2등
        2: '#8b5cf6',  // 3등
        3: '#9333ea',  // 4등
        4: '#a855f7',  // 5등
        5: '#bf7af0',  // 6등
        6: '#d277e9',  // 7등
        7: '#e586e3',  // 8등
        8: '#f797dc',  // 9등
        9: '#ffa8d6',  // 10등
        10: '#ffb9d0', // 11등
        11: '#ffcaca'  // 12등
      };
      return colors[index] || '#gray';
    },

    getCurrentIndex(index) {
      return (this.currentTrendingPage * 3) + index;
    },

    startTrendingSlideshow() {
      this.trendingInterval = setInterval(() => {
        this.nextTrendingPage();
      }, 10000);
    },

    resetTrendingInterval() {
      if (this.trendingInterval) {
        clearInterval(this.trendingInterval);
        this.startTrendingSlideshow();
      }
    },

    async fetchTotalUsers() {
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/user/total/user`);
        this.totalUsers = response.data.result;
      } catch (error) {
        console.error('전체 사용자 수 로딩 실패:', error);
      }
    },

    async fetchTotalPosts() {
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/post/total/count`);
        this.totalPosts = response.data.result;
      } catch (error) {
        console.error('전체 게시글 수 로딩 실패:', error);
      }
    },

    async fetchTotalRooms() {
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/chat/total/rooms`);
        this.totalRooms = response.data.result;
      } catch (error) {
        console.error('전체 채팅방 수 로딩 실패:', error);
      }
    },

    async fetchTrendingPosts() {
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/post/popular/like`);
        console.log('트렌딩 포스트 응답:', response.data); // 데이터 확인용
        if (response.data && response.data.result) {
          this.trendingPosts = response.data.result;
          this.startTrendingSlideshow();
        }
      } catch (error) {
        console.error('트렌딩 게시글 로딩 실패:', error);
        this.trendingPosts = [];
      }
    },

    getCategoryName(categoryId) {
      const categories = {
        1: '자유게시판',
        2: '정보게시판',
        3: '알고리즘'
      };
      return categories[categoryId] || '전체게시판';
    },

    getRankGradient(index) {
      const gradients = [
        'linear-gradient(45deg, #FFD700, #FFC107)', // 1등 - 골드
        'linear-gradient(45deg, #C0C0C0, #E0E0E0)', // 2등 - 실버
        'linear-gradient(45deg, #CD7F32, #D2691E)', // 3등 - 브론즈
        'linear-gradient(45deg, #9155FD, #7934F3)', // 4등 - 보라색
        'linear-gradient(45deg, #2979FF, #1565C0)'  // 5등 - 파란색
      ];
      return gradients[index] || 'linear-gradient(45deg, #757575, #9E9E9E)';
    },

    prevTrendingPage() {
      if (this.currentTrendingPage > 0) {
        this.currentTrendingPage--;
      } else {
        this.currentTrendingPage = Math.ceil(this.trendingPosts.length / 3) - 1;
      }
      this.resetTrendingInterval();
    },

    nextTrendingPage() {
      if (this.currentTrendingPage < Math.ceil(this.trendingPosts.length / 3) - 1) {
        this.currentTrendingPage++;
      } else {
        this.currentTrendingPage = 0;
      }
      this.resetTrendingInterval();
    },

    setTrendingPage(page) {
      this.currentTrendingPage = page;
    },

    getCategoryClass(categoryId) {
      const classes = {
        '1': 'free',   // 자유게시판
        '2': 'info',   // 정보게시판
        '3': 'algo',   // 알고리즘
        '0': 'all'     // 전체게시판
      };
      return classes[categoryId] || 'all';
    },

    // 실제 카테고리 이름을 가져오는 함수
    getActualCategoryName(post) {
      // post 객체에 categoryName이 있으면 그것을 사용
      if (post.categoryName) {
        return post.categoryName;
      }
      
      // categoryId로 판단
      return this.getCategoryName(post.categoryId);
    },

    // 닉네임을 6글자로 제한하는 메소드 추가
    truncateNickname(nickname) {
      return nickname.length > 6 ? nickname.slice(0, 6) + '...' : nickname;
    },

    goToBatchProjects(batchNumber) {
      this.$router.push({
        path: '/ttt/project/find',
        query: {
          searchType: 'batch',
          searchKeyword: batchNumber
        }
      });
    }
  },

  mounted() {
    this.startTrendingSlideshow();
    if (this.trendingInterval) {
      clearInterval(this.trendingInterval);
    }
  },
}
</script>

<style scoped>
.home-container {
  background-color: #fafafa;
  padding-bottom: 3rem;
}

.hero-section {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  padding: 2rem 0;
  text-align: center;
}

.hero-text {
  margin-bottom: 1.5rem;
}

.hero-text h1 {
  font-size: 8rem;
  font-weight: 700;
  margin-bottom: 1rem;
  background: linear-gradient(to right, #fff, #e0e0e0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle {
  font-size: 1.8rem !important;
  opacity: 0.9;
  margin-bottom: 1.5rem;
}

.hero-stats {
  margin-top: 1.5rem;
  display: flex;
  justify-content: center;
  gap: 4rem;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: white;
}

.stat-label {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.9);
}

.category-section {
  display: grid;
  grid-template-columns: repeat(3, 280px);
  gap: 2rem;
  margin-top: -3rem;
  margin-bottom: 3rem;
  justify-content: center;
}

.category-card {
  background: white;
  padding: 1rem;
  border-radius: 1rem;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-content {
  width: 100%;
}

.category-card .v-icon {
  font-size: 36px !important;
  height: 36px;
  width: 36px;
  margin-bottom: 0.5rem;
  transition: transform 0.3s ease;
}

.category-card h3 {
  margin-bottom: 0.5rem;
}

.category-card:hover {
  transform: translateY(-5px);
}

.category-card:hover .v-icon {
  transform: scale(1.1);
}

.cursor-pointer {
  cursor: pointer;
}

.section-header {
  padding-top: 0;
  margin-bottom: 1rem;
}

.trending-section {
  margin-top: 0;
}

.trending-container {
  position: relative;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}

.trending-card {
  height: 100%;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
  border-radius: 8px;
}

.trending-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
}

.trending-header {
  margin-bottom: 1rem;
}

.rank-category {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 0.5rem;
}

.category-label {
  font-size: 0.8rem;
  color: #94a3b8;
  padding: 2px 8px;
  border-radius: 4px;
  background-color: #f1f5f9;
}

.trending-rank {
  font-size: 1.2rem;
  font-weight: 600;
}

.trending-title {
  font-size: 1.1rem;
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.trending-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.author-name {
  font-size: 0.9rem;
  color: #1e293b;
  max-width: 100px; /* 최대 너비 설정 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.post-stats {
  display: flex;
  gap: 12px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 2px;
  color: #64748b;
  font-size: 0.75rem;
}

.stat-item .v-icon {
  font-size: 12px !important;
  height: 12px !important;
  width: 12px !important;
}

.post-card {
  background: white;
  border-radius: 1rem;
  margin-bottom: 1rem;
  transition: all 0.3s ease;
}

.post-card:hover {
  transform: translateX(5px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.post-content {
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.post-main {
  flex: 1;
}

.post-header {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.post-info {
  margin-left: 1rem;
}

.post-title {
  margin-left: 0;
  padding-left: 0;
  position: absolute;
  left: 12px;
  top: 45px;
  font-size: 0.85rem;
  font-weight: normal;
  color: #334155;
  line-height: 1.2;
  max-width: calc(100% - 24px);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.2s ease, transform 0.2s ease;
  display: flex;
  align-items: center;
  gap: 4px;
}

.post-time {
  color: #64748b;
  font-size: 0.9rem;
  white-space: nowrap;
}

.post-stats {
  display: flex;
  gap: 0.5rem;
}

.stat-chip {
  background: transparent !important;
}

.sidebar-card {
  background: white;
  border-radius: 1rem;
  overflow: hidden;
}

.card-header {
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
}

.card-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
}

.writer-item, .chat-room-item {
  transition: background-color 0.2s;
}

.writer-item:hover, .chat-room-item:hover {
  background-color: #f8f9fa;
}

.rank-chip {
  margin-left: 0.5rem;
}

.chat-title {
  display: flex;
  align-items: center;
}

@media (max-width: 960px) {
  .hero-text h1 {
    font-size: 2.5rem;
  }
  
  .hero-stats {
    flex-direction: column;
    gap: 2rem;
  }
  
  .category-section {
    margin-top: 0;
  }
}

.sticky-container {
  position: sticky;
  top: 84px; /* 상단 여백 증가 */
  padding-right: 12px;
  height: auto; /* 자동 높이 설정 */
  overflow: visible; /* overflow 제거 */
}

.main-content {
  padding-top: 2rem;
  padding-bottom: 3rem;
}

/* 모바일에서는 사이드바와 콘텐츠 간격 조정 */
@media (max-width: 960px) {
  .sticky-container {
    margin-bottom: 2rem;
    padding-right: 0;
  }
}

/* 호버 효과 추가 */
.v-list-item:hover {
  background-color: rgba(0, 0, 0, 0.03);
  transition: background-color 0.2s ease;
}

.section-header {
  margin-bottom: 0.75rem;
}

.board-header {
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
  gap: 0.75rem;
}

.board-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  transition: transform 0.3s ease;
}

.board-icon-wrapper:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.2);
}

.board-icon-wrapper.free {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
}

.board-icon-wrapper.info {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.board-icon-wrapper.algo {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.board-icon {
  font-size: 24px !important;
  color: white !important;
}

.board-info {
  flex: 1;
}

.board-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin: 0;
  transition: color 0.2s ease;
}

.board-title:hover {
  color: #6366f1;
}

.board-description {
  font-size: 0.85rem;
  color: #666;
  display: block;
  margin-top: 2px;
}

.post-list {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

.post-item {
  position: relative;
  padding: 12px;
  padding-bottom: 35px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  border-bottom: 1px solid #f0f0f0;
  margin-left: 15px;
  margin-right: 15px;
}

.post-item:last-child {
  border-bottom: none;
}

.post-item:hover {
  background-color: #f5f7fa;
  transform: translateX(5px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
  border-left: 2px solid #2563eb;
  padding-left: 15px;
  border-radius: 0 4px 4px 0;
}

.user-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.user-info-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.author-name {
  font-size: 0.9rem;
  color: #1e293b;
}

.post-time {
  color: #64748b;
  font-size: 0.9rem;
}

.post-stats {
  display: flex;
  gap: 8px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 2px;
  color: #64748b;
  font-size: 0.75rem;
}

.post-title {
  margin-left: 0;
  padding-left: 0;
  position: absolute;
  left: 12px;
  top: 45px;
  font-size: 0.85rem;
  font-weight: normal;
  color: #334155;
  line-height: 1.2;
  max-width: calc(100% - 24px);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.2s ease, transform 0.2s ease;
}

.post-item:hover .post-title {
  color: #2563eb;
  transform: translateX(3px);
}

.v-icon {
  font-size: 14px !important;
}

.card-header {
  min-height: 48px;
}

.v-chip {
  height: 18px !important;
  font-size: 0.7rem !important;
}

.logo {
  font-size: 8rem;
  font-weight: bold;
  color: #6200ea;
  margin: 0;
}

.logo .highlight {
  font-size: 8rem;
  font-weight: bold;
  color: white;
}

.logo .small-text {
  font-size: 3.2rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: normal;
}

.category-card .v-icon {
  margin-bottom: 0.5rem;
  transition: transform 0.3s ease;
}

.category-card:hover .v-icon {
  transform: scale(1.1);
}

/* 호버 효과 추가 */
.board-icon-wrapper:hover .board-icon {
  transform: scale(1.1);
  transition: transform 0.3s ease;
}

.board-section {
  margin-bottom: 30px;
}

.ranking-card {
  overflow: visible; /* overflow 제거 */
  box-shadow: 0 2px 6px rgba(0,0,0,0.05) !important;
  background: white;
  margin-bottom: 1rem;
  width: 100%; /* 너비 설정 */
}

.ranking-list {
  padding: 0;
  background: white;
  border-radius: 8px;
  width: 100%; /* 너비 설정 */
}

.ranking-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  margin-bottom: 0;
  background: white;
  transition: all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: relative;
  border-bottom: 1px solid rgba(226, 232, 240, 0.5);
  margin-left: 15px;
  margin-right: 15px;
}

.ranking-item:last-child {
  border-bottom: none;
}

.ranking-item:hover {
  background-color: #f5f7fa;
  transform: translateX(5px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
  border-left: 2px solid #2563eb;
  padding-left: 15px;
  border-radius: 0 4px 4px 0;
}

.user-info {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-name {
  font-weight: 500;
  font-size: 14px;
  color: #334155;
}

.user-points {
  font-size: 13px;
  font-weight: 600;
  color: #475569;
  background: rgba(71, 85, 105, 0.06);
  padding: 3px 10px;
  border-radius: 20px;
  letter-spacing: 0.5px;
}

/* 카드 헤더 스타일 수정 */
.card-header {
  background: white;
}

@media (min-width: 1264px) {
  /* 대형 화면에서만 적용되는 정렬 조정 */
  .trending-section {
    margin-top: -16px; /* 네거티브 마진으로 위로 당김 */
  }
}

/* 트렌딩 컨트롤 버튼 스타일 */
.trending-controls .v-btn {
  background-color: rgba(145, 85, 253, 0.1);
}

.trending-controls .v-btn:hover {
  background-color: rgba(145, 85, 253, 0.2);
}

.trending-controls .v-icon {
  color: #9155FD;
}

/* 인디케이터 스타일 */
.trending-indicators {
  margin-top: 1rem;
}

.indicator-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #e2e8f0;
  margin: 0 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.indicator-dot.active {
  background-color: #9155FD;
  transform: scale(1.2);
}

/* 트렌딩 네비게이션 버튼 스타일 */
.trending-container {
  position: relative;
}

.trending-nav-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.3);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 2;
  opacity: 0;
  transition: opacity 0.3s ease, background-color 0.3s ease;
}

.trending-prev-button {
  left: -10px;
}

.trending-next-button {
  right: -10px;
}

.trending-container:hover .trending-nav-button {
  opacity: 0.7;
}

.trending-nav-button:hover {
  opacity: 1 !important;
  background-color: rgba(0, 0, 0, 0.5);
}

/* 모바일에서는 항상 보이게 설정 (터치 인터페이스 고려) */
@media (max-width: 960px) {
  .trending-nav-button {
    opacity: 0.7;
  }
}

/* 카테고리 태그 스타일 */
.category-tag {
  font-size: 0.8rem;
  padding: 1px 6px;
  margin-left: 8px;
  background-color: #f1f5f9;
  color: #64748b;
  border-radius: 4px;
  white-space: nowrap;
}

/* 카테고리별 스타일 */
.category-tag.free {
  background-color: rgba(240, 253, 244, 0.8);
  color: rgba(34, 197, 94, 0.9);
}

.category-tag.info {
  background-color: rgba(254, 252, 232, 0.8);
  color: rgba(245, 158, 11, 0.9);
}

.category-tag.algo {
  background-color: rgba(254, 242, 242, 0.8);
  color: rgba(239, 68, 68, 0.9);
}

.category-tag.all {
  background-color: rgba(241, 245, 249, 0.8);
  color: rgba(99, 102, 241, 0.9);
}
</style>
