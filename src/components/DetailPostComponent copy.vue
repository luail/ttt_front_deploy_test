<template>
  <v-container fluid class="page-container">
    <!-- 광고 배너 -->
    <v-row>
      <v-col>
        <div class="ad-banner">
          BEYOND SW CAMP와 함께 성장 가능성 있는 개발자로 취업하세요.
        </div>
      </v-col>
    </v-row>

    <v-row>
      <!-- 사이드 메뉴 -->
      <v-col cols="2" class="sidebar">
        <v-list>
          <v-list-item v-for="(item, index) in menuItems" :key="index" @click="navigateTo(item.path)">
            <v-list-item-content>
              <v-list-item-title>{{ item.label }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-col>

      <!-- 게시물 상세 -->
      <v-col cols="10">
        <v-card class="post-detail">
          <v-card-title>
            <div class="post-title">
              <img :src="post.authorImage" class="author-img" alt="프로필" />
              <div>
                <strong>{{ post.authorName }}</strong>
                <span class="author-rank">{{ post.authorRank }}</span>
                <div class="post-meta">
                  {{ post.createdTime }} · 조회수 {{ post.viewCount }}
                </div>
              </div>
            </div>
          </v-card-title>
          <v-card-text class="post-content">
            {{ post.content }}
          </v-card-text>
          <v-card-actions>
            <v-icon class="like-icon">mdi-thumb-up-outline</v-icon>
            <span class="like-count">{{ post.likes }}</span>
          </v-card-actions>
        </v-card>

        <!-- 댓글 입력창 -->
        <div class="comment-section">
          <h4>댓글</h4>
          <v-textarea v-model="newComment" placeholder="댓글을 입력하려면 여기다가 작성해주세요"></v-textarea>
          <v-btn color="primary" class="mt-2" @click="submitComment">댓글 등록</v-btn>

          <!-- 댓글 리스트 -->
          <div v-for="(comment, index) in comments" :key="index" class="comment-item">
            <img :src="comment.authorImage" class="comment-author-img" alt="댓글 프로필" />
            <div class="comment-content">
              <strong>{{ comment.authorName }}</strong>
              <div class="comment-time">{{ comment.createdTime }}</div>
              <div class="comment-text">{{ comment.text }}</div>
            </div>
          </div>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      menuItems: [
        { label: '전체 게시판', path: '/board/all' },
        { label: '11기 게시판', path: '/board/11' },
        { label: '알고리즘 게시판', path: '/board/algorithm' }
      ],
      post: {
        authorImage: '',
        authorName: '',
        authorRank: '',
        createdTime: '',
        viewCount: 0,
        content: '',
        likes: 0
      },
      newComment: '',
      comments: []
    }
  },
  created() {
    this.fetchPostData();
  },
  methods: {
    navigateTo(path) {
      this.$router.push(path);
    },
    submitComment() {
      if (this.newComment.trim() === '') return;
      this.comments.push({
        authorImage: 'https://via.placeholder.com/40',
        authorName: '익명',
        createdTime: '방금 전',
        text: this.newComment
      });
      this.newComment = '';
    },
    async fetchPostData() {
      try {
        const response = await fetch('/api/post/detail');
        const data = await response.json();
        this.post = data.post;
        this.comments = data.comments;
      } catch (error) {
        console.error('Failed to load post data:', error);
      }
    }
  }
}
</script>

<style scoped>
.page-container {
  margin: 0 30px;
}

.ad-banner {
  height: 150px;
  background-color: #4b3f72;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2em;
  font-weight: bold;
  border-radius: 50px;
  margin: 20px 10;
}

.sidebar {
  background-color: #f4f4f4;
  border-right: 1px solid #ccc;
}

.post-detail {
  margin: 20px 0;
  border: 1px solid #ccc;
  border-radius: 10px;
  padding: 60px;
  min-height: 600px;
}

.post-title {
  display: flex;
  align-items: center;
}

.author-img {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  margin-right: 15px;
}

.author-rank {
  font-size: 0.85em;
  color: #888;
}

.post-meta {
  font-size: 0.8em;
  color: #555;
}

.post-content {
  font-size: 1.4em;
  margin-top: 15px;
}

.like-icon {
  color: #888;
  cursor: pointer;
  margin-right: 5px;
}

.like-count {
  font-weight: bold;
  margin-left: 5px;
}

.comment-section {
  margin-top: 30px;
}

.comment-item {
  display: flex;
  margin-top: 20px;
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 15px;
  background-color: #fafafa;
}

.comment-author-img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
}

.comment-content {
  flex: 1;
}

.comment-time {
  font-size: 0.75em;
  color: #888;
}

.comment-text {
  margin-top: 5px;
}
</style>
