<template>
  <v-container>
    <v-row>
      <!-- 왼쪽 프로필 카드 -->
      <UserProfileCard
        :avatar="userDetail.profileImageOfAuthor"
        :userName="userDetail.authorNickName"
        :userBio="'내가 쓴 글 목록입니다.'"
        selectedMenu="post"
      />

      <!-- 오른쪽 게시글 리스트 -->
      <v-col cols="8">
        <v-card class="pa-4" width="820">
          <v-card-text v-if="postDetail.length">
            <v-list>
              <v-list-item v-for="myPost in postDetail" :key="myPost.postUserId">
                <v-list-item-content>
                  <v-list-item-title>{{ myPost.title }}</v-list-item-title>
                  <v-list-item-subtitle>{{ truncatedContent(removeHtmlTags(myPost.contents)) }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card-text>
          <v-card-text v-else>
            게시글이 없습니다.
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
  methods:{
    //게시물 본문 미리보기
    truncatedContent(text, length) {
      if (!text) return ""; // text가 undefined일 경우 빈 문자열 반환
      return text.length > length ? text.slice(0, length) + "..." : text;
    },
       //퀼 편집기로 만들어진 html문자열을 dom객체로 변환하고 텍스트 콘텐츠만 가지고 오는 것
        removeHtmlTags(text){
            if(text){
                const doc = new DOMParser().parseFromString(text,"text/html");
                return doc.body.textContent || ""; //html태그 제거하고 텍스트만 가지고 오는 명령어
            } else{
                return"";
            }
        },
  }
};
</script>

<style scoped>
/* 스타일 추가 가능 */
</style>
