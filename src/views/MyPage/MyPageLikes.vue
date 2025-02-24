<template>
  <v-container>
    <v-row>
      <!-- 왼쪽 프로필 카드 (분리된 컴포넌트) -->
      <UserProfileCard
        :avatar="userDetail.avatar"
        :userName="userDetail.nickName"
        :userBio="'내가 좋아요한 글 목록입니다.'"
        selectedMenu="likes"
      />

      <!-- 오른쪽 카드 -->
      <v-col cols="8">
        <v-card class="pa-4">
          <v-card-text v-if="likePost.length">
            <v-form ref="form">
              <v-table class="custom-table">
                <v-list>
                  <v-list-item v-for="myLikePost in likePost" :key="myLikePost.postId">
                    <v-list-item-content>
                      <v-list-item-title>{{ myLikePost.title }}</v-list-item-title>
                      <v-list-item-subtitle>
                        {{ truncatedContent(removeHtmlTags(myLikePost.contents), 100) }}
                      </v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-table>
            </v-form>
          </v-card-text>
          <v-card-text v-else>
            좋아요한 게시글이 없습니다.
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from "axios";
import UserProfileCard from "@/components/UserProfileCard.vue"; // 새 컴포넌트 import

export default {
  components: {
    UserProfileCard,
  },
  data() {
    return {
      userDetail: {},  // 유저 정보 저장
      likePost: [],
    };
  },
  async created() {
    try {
      const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/user/myLikeList`);
      this.likePost = response.data.result.content;

      console.log("저장된 likePost 데이터:", this.likePost);
      // 유저 정보 가져오기 (게시글 리스트에서 첫 번째 게시글의 유저 정보 활용)
      if (this.likePost.length > 0) {
        this.userDetail = {
          profileImageOfAuthor: this.likePost[0].profileImageOfAuthor || "",
          authorNickName: this.likePost[0].authorNickName || "익명",
        };
      }
    } catch (error) {
      console.error("Axios 요청 오류:", error);
    }
  },
  methods: {
    // 게시물 본문 미리보기
    truncatedContent(text, length = 100) {
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
  },
};
</script>
