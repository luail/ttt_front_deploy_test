<template>
    <v-container fluid>
        <v-row>
            <!-- 사이드바 -->
            <v-col cols="1">
                <v-navigation-drawer permanent class="sidebar" width="180">
                    <v-list>
                        <v-list-item v-for="(c, index) in categoryList" :key="index">
                            <v-list-item-content>
                                <v-list-item-title class="font-weight-bold">{{ c }}</v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                    </v-list>
                </v-navigation-drawer>
            </v-col>

            <!-- 상단 배너 -->
            <v-row>
                 <v-col>
                     <div class="ad-banner">
                      BEYOND SW CAMP와 함께 성장 가능성 있는 개발자로 취업하세요.
                    </div>
                 </v-col>
            </v-row>
           
            <!-- 게시물 리스트 -->
            <v-col cols="11" class="pl-0">
                <!-- 상단 메뉴 -->
                <v-row class="mb-5 align-center">
                    <v-col>
                        <h2 class="text-h4 font-weight-bold">전체 게시판</h2>
                    </v-col>
                    <v-col class="text-right">
                        <v-btn color="primary" class="text-white font-weight-bold" @click="createPost">+ 작성하기</v-btn>
                    </v-col>
                </v-row>

                <!-- 게시글 카드 리스트 -->
                <v-row>
                    <v-col v-for="post in postList" :key="post.postId" cols="12">
                        <v-card class="mb-4 post-card" @click="goToDetailPost(post.postId)">
                            <v-card-text>
                                <v-row no-gutters class="align-center">
                                    <!-- 프로필 이미지 -->
                                    <v-col cols="1" class="d-flex justify-center align-center">
                                        <img 
                                            :src="post.authorImage || require('@/assets/basicProfileImage.png')" 
                                            class="rounded-circle" 
                                            style="width: 60px; height: 60px; object-fit: cover;"
                                        />
                                    </v-col>

                                    <!-- 게시물 내용 -->
                                    <v-col cols="11" class="pl-2">
                                        <!-- 게시물 제목 -->
                                        <div class="text-h5 mt-1">{{ post.title }}</div>
                                        <!-- 작성자 이름 -->
                                        <div class="font-weight-bold text-body-3">{{ post.authorNickName }}</div>
                                        <!-- 게시물 내용 -->
                                        <div class="text-body-2 text--secondary">{{ post.content }}</div>

                                        <!-- 태그 리스트 -->
                                        <div class="mt-3">
                                            <v-chip 
                                                v-for="(tag, i) in post.tags" 
                                                :key="i" 
                                                color="grey lighten-3" 
                                                class="mr-2"
                                            >
                                                {{ tag }}
                                            </v-chip>
                                        </div>

                                        <!-- 게시물 메타정보 (댓글, 좋아요) -->
                                        <div class="mt-4 d-flex align-center">
                                            <v-icon class="mr-2">mdi-thumb-up-outline</v-icon> {{ post.likesCount }}
                                            <v-icon class="ml-5 mr-2">mdi-comment-outline</v-icon> {{ post.countOfComment }}
                                            <div class="ml-auto">{{ formatDate(post.createdTime) }}</div>
                                        </div>
                                    </v-col>
                                </v-row>
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>

                <!-- 페이지네이션 -->
                <v-pagination 
                    v-model="page" 
                    :length="10" 
                    color="primary"
                    class="mt-5"
                ></v-pagination>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import axios from 'axios';

export default {
    data() {
        return {
            postList: [],
            categoryList: [],
            page: 1
        }
    },
    async created() {
        try {
            // 게시글 데이터 불러오기
            const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/ttt/post/findAll`);
            this.postList = response.data.result.content;
            console.log(this.postList)

            // 카테고리 리스트 불러오기
            const sideBarResponse = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/ttt/category/all`);
            this.categoryList = sideBarResponse.data.result;

        } catch (error) {
            console.error('데이터 로드 실패:', error);
        }
    },
    methods: {
        goToDetailPost(postId) {
            this.$router.push(`/ttt/post/${postId}`);
        },
        createPost() {
            this.$router.push('/post/create');
        },
        formatDate(date) {
            return new Date(date).toLocaleDateString('ko-KR');
        }
    }
}
</script>

<style scoped>
.sidebar {
    background-color: #f5f5f5;
    border-right: 1px solid #ccc;
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
  margin: 20px;
  margin-left: 0px; /* 왼쪽 마진 추가 */
  margin-right: 90px; /* 오른쪽 마진 최소화 */
}


.post-card {
    
    margin-left: 140px; /* 왼쪽 마진 추가 */
    margin-right: 0px; /* 오른쪽 마진 최소화 */
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
    border-radius: 25px;
}

.rounded-circle {
    border-radius: 50%;
    border: 2px solid #ccc;
}

.text-right {
    text-align: right;
}

.v-list-item {
    text-align: left;
    padding-left: 20px;
}
</style>
