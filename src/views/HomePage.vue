<template>
  <div class="home-container">
    <!-- 상단 히어로 섹션 -->
    <section class="hero-section">
      <v-container>
        <div class="hero-content">
          <div class="hero-text">
            <h1>Tic Tak Tok</h1>
            <p class="subtitle">HanHwa Beyond Camp</p>
          </div>
          <div class="hero-stats">
            <div class="stat-item">
              <div class="stat-number">{{ recentPosts.length }}+</div>
              <div class="stat-label">오늘의 게시글</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ topWriters.length }}+</div>
              <div class="stat-label">활동 멤버</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ activeChats.length }}+</div>
              <div class="stat-label">실시간 채팅</div>
            </div>
          </div>
        </div>
      </v-container>
    </section>

    <v-container class="main-content">
      <!-- 카테고리 네비게이션 -->
      <div class="category-section">
        <div class="category-card" v-for="(category, index) in categories" :key="index" @click="goToCategory(category.categoryId)">
          <v-icon size="32" :color="category.color">{{ category.icon }}</v-icon>
          <h3>{{ category.name }}</h3>
          <p>{{ category.description }}</p>
        </div>
      </div>

      <v-row class="mt-6">
        <!-- 좌측 사이드바 -->
        <v-col cols="12" lg="3">
          <div class="sticky-container">
            <!-- Top Writers 카드 -->
            <v-card flat class="mb-4">
              <div class="card-header pa-3">
                <h3 class="text-subtitle-2 font-weight-medium">🏆 Top Writers</h3>
              </div>
              <v-divider></v-divider>
              <v-list dense>
                <v-list-item v-for="(writer, index) in topWriters" :key="index" class="py-1">
                  <v-list-item-title class="text-caption">
                    {{ writer.nickName }}
                    <v-chip x-small :color="getRankColor(index)" dark class="ml-1" label>
                      #{{ index + 1 }}
                    </v-chip>
                  </v-list-item-title>
                  <v-list-item-subtitle class="text-caption">
                    {{ writer.rankingPoint }}p
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-card>

            <!-- Top Batches 카드 -->
            <v-card flat>
              <div class="card-header pa-3">
                <h3 class="text-subtitle-2 font-weight-medium">🎯 Top Batches</h3>
              </div>
              <v-divider></v-divider>
              <v-list dense>
                <v-list-item v-for="(batch, index) in batchRanks" :key="index" class="py-1">
                  <v-list-item-title class="text-caption">
                    {{ batch.batch }}기
                    <v-chip x-small :color="getRankColor(index)" dark class="ml-1" label>
                      #{{ index + 1 }}
                    </v-chip>
                  </v-list-item-title>
                  <v-list-item-subtitle class="text-caption">
                    {{ batch.averageRankingPoint }}p
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-card>
          </div>
        </v-col>

        <!-- 메인 컨텐츠 -->
        <v-col cols="12" lg="9" class="pl-lg-6">
          <!-- 트렌딩 섹션 -->
          <section class="trending-section mb-8">
            <div class="section-header">
              <h2>🔥 트렌딩</h2>
            </div>
            <v-row>
              <v-col v-for="(post, index) in popularPosts.slice(0, 3)" :key="post.postId" cols="12" md="4">
                <v-card 
                  class="trending-card" 
                  elevation="0"
                  :style="{ borderLeft: `4px solid ${getTrendingColor(index)}` }"
                  @click="$router.push(`/ttt/post/${post.postId}`)"
                >
                  <v-card-text>
                    <div class="trending-rank" :style="{ color: getTrendingColor(index) }">#{{ index + 1 }}</div>
                    <h3 class="trending-title text-truncate">{{ post.title }}</h3>
                    <div class="trending-meta">
                      <span class="author">
                        <v-avatar size="20">
                          <v-img 
                            :src="post.profileImageOfAuthor || 'https://ttt-image.s3.ap-northeast-2.amazonaws.com/기본이미지.png'"
                            @error="handleImageError"
                          ></v-img>
                        </v-avatar>
                        {{ post.authorNickName }}
                      </span>
                      <div class="stats mt-2">
                        <v-chip x-small outlined class="mr-2">
                          <v-icon x-small left>mdi-eye</v-icon>
                          {{ post.viewCount }}
                        </v-chip>
                        <v-chip x-small outlined class="mr-2">
                          <v-icon x-small left>mdi-heart</v-icon>
                          {{ post.likesCount }}
                        </v-chip>
                        <v-chip x-small outlined>
                          <v-icon x-small left>mdi-comment</v-icon>
                          {{ post.countOfComment }}
                        </v-chip>
                      </div>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </section>

          <!-- 최신 게시글 -->
          <section>
            <v-row>
              <!-- 전체게시판 섹션 -->
              <v-col cols="12" md="6">
                <div class="board-header">
                  <div class="board-icon-wrapper">
                    <v-icon class="board-icon">mdi-view-dashboard</v-icon>
                  </div>
                  <div class="board-info">
                    <h2 class="board-title cursor-pointer" @click="$router.push('/ttt/post/list/0')">
                      전체게시판
                    </h2>
                    <span class="board-description">모든 게시글을 한눈에</span>
                  </div>
                </div>
                <div class="post-list">
                  <div v-for="post in recentPosts.slice(0, 5)" 
                       :key="post.postId" 
                       class="post-item"
                       @click="$router.push(`/ttt/post/${post.postId}`)">
                    <div class="post-title">{{ post.title }}</div>
                    <div class="post-meta">
                      <span class="author-name">{{ post.authorNickName }}</span>
                      <span class="post-time">{{ formatDate(post.createdTime) }}</span>
                      <div class="post-stats">
                        <span class="stat-item">
                          <v-icon x-small>mdi-eye</v-icon>
                          {{ post.viewCount }}
                        </span>
                        <span class="stat-item">
                          <v-icon x-small>mdi-heart</v-icon>
                          {{ post.likesCount }}
                        </span>
                        <span class="stat-item">
                          <v-icon x-small>mdi-comment</v-icon>
                          {{ post.countOfComment }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </v-col>

              <!-- 자유게시판 섹션 -->
              <v-col cols="12" md="6">
                <div class="board-header">
                  <div class="board-icon-wrapper free">
                    <v-icon class="board-icon">mdi-forum</v-icon>
                  </div>
                  <div class="board-info">
                    <h2 class="board-title cursor-pointer" @click="$router.push('/ttt/post/list/1')">
                      자유게시판
                    </h2>
                    <span class="board-description">자유로운 소통공간</span>
                  </div>
                </div>
                <div class="post-list">
                  <div v-for="post in recentPosts.slice(0, 5)" 
                       :key="post.postId" 
                       class="post-item"
                       @click="$router.push(`/ttt/post/${post.postId}`)">
                    <div class="post-title">{{ post.title }}</div>
                    <div class="post-meta">
                      <span class="author-name">{{ post.authorNickName }}</span>
                      <span class="post-time">{{ formatDate(post.createdTime) }}</span>
                      <div class="post-stats">
                        <span class="stat-item">
                          <v-icon x-small>mdi-eye</v-icon>
                          {{ post.viewCount }}
                        </span>
                        <span class="stat-item">
                          <v-icon x-small>mdi-heart</v-icon>
                          {{ post.likesCount }}
                        </span>
                        <span class="stat-item">
                          <v-icon x-small>mdi-comment</v-icon>
                          {{ post.countOfComment }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </v-col>

              <!-- 정보게시판 섹션 -->
              <v-col cols="12" md="6">
                <div class="board-header">
                  <div class="board-icon-wrapper info">
                    <v-icon class="board-icon">mdi-information</v-icon>
                  </div>
                  <div class="board-info">
                    <h2 class="board-title cursor-pointer" @click="$router.push('/ttt/post/list/2')">
                      정보게시판
                    </h2>
                    <span class="board-description">개발 정보 공유</span>
                  </div>
                </div>
                <div class="post-list">
                  <div v-for="post in recentPosts.slice(0, 5)" 
                       :key="post.postId" 
                       class="post-item"
                       @click="$router.push(`/ttt/post/${post.postId}`)">
                    <div class="post-title">{{ post.title }}</div>
                    <div class="post-meta">
                      <span class="author-name">{{ post.authorNickName }}</span>
                      <span class="post-time">{{ formatDate(post.createdTime) }}</span>
                      <div class="post-stats">
                        <span class="stat-item">
                          <v-icon x-small>mdi-eye</v-icon>
                          {{ post.viewCount }}
                        </span>
                        <span class="stat-item">
                          <v-icon x-small>mdi-heart</v-icon>
                          {{ post.likesCount }}
                        </span>
                        <span class="stat-item">
                          <v-icon x-small>mdi-comment</v-icon>
                          {{ post.countOfComment }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </v-col>

              <!-- 알고리즘 게시판 섹션 -->
              <v-col cols="12" md="6">
                <div class="board-header">
                  <div class="board-icon-wrapper algo">
                    <v-icon class="board-icon">mdi-code-brackets</v-icon>
                  </div>
                  <div class="board-info">
                    <h2 class="board-title cursor-pointer" @click="$router.push('/ttt/post/list/3')">
                      알고리즘
                    </h2>
                    <span class="board-description">알고리즘 문제풀이</span>
                  </div>
                </div>
                <div class="post-list">
                  <div v-for="post in recentPosts.slice(0, 5)" 
                       :key="post.postId" 
                       class="post-item"
                       @click="$router.push(`/ttt/post/${post.postId}`)">
                    <div class="post-title">{{ post.title }}</div>
                    <div class="post-meta">
                      <span class="author-name">{{ post.authorNickName }}</span>
                      <span class="post-time">{{ formatDate(post.createdTime) }}</span>
                      <div class="post-stats">
                        <span class="stat-item">
                          <v-icon x-small>mdi-eye</v-icon>
                          {{ post.viewCount }}
                        </span>
                        <span class="stat-item">
                          <v-icon x-small>mdi-heart</v-icon>
                          {{ post.likesCount }}
                        </span>
                        <span class="stat-item">
                          <v-icon x-small>mdi-comment</v-icon>
                          {{ post.countOfComment }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </v-col>
            </v-row>
          </section>
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
    }
  },

  async created() {
    await Promise.all([
      this.fetchRecentPosts(),
      this.fetchPopularPosts(),
      this.fetchInformationPosts(),
      this.fetchAlgorithmPosts(),
      this.topRanker(),
      this.fetchBatchRanks(),
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
      const colors = ['#FFD700', '#C0C0C0', '#CD7F32'];
      return colors[index] || '#gray';
    },

    goToCategory(categoryId) {
      console.log('카테고리 이동:', categoryId);  // 디버깅용 로그
      if (categoryId !== undefined) {
        this.$router.push(`/ttt/post/list/${categoryId}`).then(() => {
          window.scrollTo(0, 0);  // 페이지 최상단으로 스크롤
        });
      } else {
        console.error('카테고리 ID가 정의되지 않았습니다');
      }
    },

    handleImageError(event) {
      event.target.src = 'https://ttt-image.s3.ap-northeast-2.amazonaws.com/기본이미지.png';
    },

    getTrendingColor(index) {
      const colors = {
        0: '#6366f1',  // 히어로 섹션의 시작 색상
        1: '#7c74f4',  // 중간 색상
        2: '#8b5cf6'   // 히어로 섹션의 끝 색상
      };
      return colors[index] || '#gray';
    }
  }
}
</script>

<style scoped>
.home-container {
  background-color: #fafafa;
}

.hero-section {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  padding: 2rem 0;
  text-align: center;
}

.hero-text h1 {
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  background: linear-gradient(to right, #fff, #e0e0e0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle {
  font-size: 1.5rem;
  opacity: 0.9;
  margin-bottom: 3rem;
}

.hero-stats {
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
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: -3rem;
}

.category-card {
  background: white;
  padding: 1.5rem;
  border-radius: 1rem;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.category-card:hover {
  transform: translateY(-5px);
}

.category-card h3 {
  margin: 1rem 0;
  font-size: 1.2rem;
  font-weight: 600;
}

.category-card p {
  color: #666;
  font-size: 0.9rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
}

.trending-card {
  background-color: #f8f9fa;
  border-radius: 8px;
  transition: transform 0.2s ease;
  cursor: pointer;
}

.trending-card:hover {
  transform: translateY(-4px);
}

.trending-rank {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 8px;
}

.trending-title {
  font-size: 0.95rem;
  font-weight: 500;
  margin-bottom: 8px;
  color: #2c3e50;
}

.trending-meta {
  display: flex;
  flex-direction: column;
}

.author {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #64748b;
  font-size: 0.9rem;
}

.stats {
  display: flex;
  align-items: center;
}

.cursor-pointer {
  cursor: pointer;
}

.cursor-pointer:hover {
  opacity: 0.8;
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

.author-name {
  display: block;
  font-weight: 600;
  color: #1a1a1a;
}

.post-time {
  font-size: 0.8rem;
  color: #666;
}

.post-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
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
  top: 64px;
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
  width: 32px;
  height: 32px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
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
  color: white !important;
  font-size: 18px !important;
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
  padding: 0.5rem 1rem;
  cursor: pointer;
  border-bottom: 1px solid #e0e0e0;
}

.post-item:last-child {
  border-bottom: none;
}

.post-item:hover {
  background-color: #f8f9fa;
}

.post-title {
  font-size: 0.95rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
}

.author-name {
  color: #666;
}

.post-time {
  color: #888;
}

.post-stats {
  display: flex;
  gap: 0.5rem;
  margin-left: auto;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 2rem;
  color: #888;
  font-size: 0.85rem;
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
</style>
