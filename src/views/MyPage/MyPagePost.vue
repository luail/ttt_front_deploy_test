<template>
  <v-container>
    <v-row justify="center">
      <!-- 왼쪽 프로필 카드 -->
      <v-col cols="12" md="4">
        <UserProfileCard
          :avatar="userDetail.profileImageOfAuthor"
          :userName="userDetail.authorNickName"
          :userBio="'내가 쓴 글 목록입니다.'"
          selectedMenu="post"
        />
      </v-col>

      <!-- 오른쪽 게시글 리스트 -->
      <v-col cols="12" md="8">
        <v-card class="pa-4 post-card">
          <v-card-title class="title-text">📜 내가 작성한 게시글</v-card-title>
          <v-divider class="my-3"></v-divider>

          <v-card-text v-if="postDetail.length">
            <v-row>
              <v-col v-for="myPost in postDetail" :key="myPost.postId" cols="12">
                <v-card class="post-card-item" @click="goToDetailPost(myPost.postId)">
                  <v-card-text>
                    <!-- 게시글 정보 -->
                    <v-row no-gutters class="align-center">
                      <!-- 프로필 이미지 -->
                      <v-col cols="auto">
                        <v-avatar size="40">
                          <img
                            :src="myPost.profileImageOfAuthor || require('@/assets/basicProfileImage.png')"
                            class="profile-img"
                          />
                        </v-avatar>
                      </v-col>
                      <v-col class="user-info">
                        <div class="nickname">{{ myPost.authorNickName }}</div>
                        <div class="date">{{ formatDate(myPost.createdTime) }}</div>
                      </v-col>
                    </v-row>

                    <!-- 제목 -->
                    <v-row no-gutters>
                      <v-col>
                        <h3 class="clickable-title">
                          {{ myPost.title }}
                        </h3>
                      </v-col>
                    </v-row>

                    <!-- 게시글 내용 미리보기 -->
                    <v-row no-gutters>
                      <v-col>
                        <p class="clickable-content">
                          {{ truncatedContent(removeHtmlTags(myPost.contents), 80) }}
                        </p>
                      </v-col>
                    </v-row>

                    <!-- 좋아요 및 댓글 정보 -->
                    <v-row no-gutters class="post-meta mt-2">
                      <v-icon class="mr-1" color="red">mdi-thumb-up</v-icon> {{ myPost.likesCount }}
                      <v-icon class="ml-3 mr-1" color="blue">mdi-comment</v-icon> {{ myPost.countOfComment }}
                    </v-row>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>

          <v-card-text v-else class="text-center text-grey">
            아직 작성한 게시글이 없습니다. ✏️
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from "axios";
import UserProfileCard from "@/components/UserProfileCard.vue";

export default {
  components: {
    UserProfileCard,
  },
  data() {
    return {
      userDetail: {},  // 유저 정보 저장
      postDetail: [],  // 게시글 리스트 저장
    };
  },
  async created() {
    try {
      // 게시글 목록 가져오기
      const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/user/myPostList`);
      this.postDetail = response.data.result;
      console.log("API 응답:", this.postDetail);

      // 유저 정보 가져오기 (게시글 리스트에서 첫 번째 게시글의 유저 정보 활용)
      if (this.postDetail.length > 0) {
        this.userDetail = {
          profileImageOfAuthor: this.postDetail[0].profileImageOfAuthor || "",
          authorNickName: this.postDetail[0].authorNickName || "익명",
        };
      }
    } catch (error) {
      console.error("Axios 요청 오류:", error);
    }
  },
  methods: {
    // 게시물 본문 미리보기
    truncatedContent(text, length) {
      if (!text) return ""; // text가 undefined일 경우 빈 문자열 반환
      return text.length > length ? text.slice(0, length) + "..." : text;
    },
    // HTML 태그 제거 (Quill Editor 등에서 사용)
    removeHtmlTags(text) {
      if (text) {
        const doc = new DOMParser().parseFromString(text, "text/html");
        return doc.body.textContent || ""; // HTML 태그 제거 후 텍스트만 반환
      } else {
        return "";
      }
    },
    goToDetailPost(postId) {
      this.$router.push(`/ttt/post/${postId}`);
    },
    formatDate(dateArray) {
      if (!dateArray || dateArray.length < 6) return "";
      return `${dateArray[0]}-${String(dateArray[1]).padStart(2, "0")}-${String(dateArray[2]).padStart(2, "0")}`;
    }
  },
};
</script>

<style scoped>
/* 제목 스타일 */
.title-text {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 10px;
}

/* 게시글 카드 스타일 */
.post-card {
  border-radius: 12px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
}

/* 개별 게시글 카드 */
.post-card-item {
  cursor: pointer;
  transition: 0.3s ease-in-out;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 15px;
  padding: 16px;
}

.post-card-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(98, 0, 234, 0.3);
}

/* 게시글 리스트 아이템 */
.post-item {
  padding: 16px;
  transition: background-color 0.3s ease-in-out, transform 0.2s ease-in-out;
  border-bottom: 1px solid #eee;
}

.post-item:hover {
  background-color: #f3f3f3;
  transform: translateX(5px);
}

/* 프로필 이미지 */
.profile-img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

/* 사용자 정보 */
.user-info {
  margin-left: 10px;
}

.nickname {
  font-weight: bold;
  font-size: 16px;
}

.date {
  font-size: 13px;
  color: #666;
}

/* 제목 스타일 */
.clickable-title {
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: color 0.2s;
}

.clickable-title:hover {
  color: #6200ea;
  text-decoration: underline;
}

/* 내용 스타일 */
.clickable-content {
  font-size: 14px;
  color: #666;
  cursor: pointer;
  transition: color 0.2s;
}

.clickable-content:hover {
  color: #333;
}

/* 좋아요 및 댓글 정보 */
.post-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: #666;
}

.post-meta i {
  font-size: 16px;
  margin-right: 4px;
}

/* 반응형 설정 */
@media (max-width: 768px) {
  .post-card {
    padding: 10px;
  }
  .clickable-title {
    font-size: 16px;
  }
  .clickable-content {
    font-size: 12px;
  }
  .post-meta {
    font-size: 12px;
  }
}
</style>
