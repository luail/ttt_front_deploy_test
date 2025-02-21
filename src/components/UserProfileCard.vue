<template>
  <v-col cols="4">
    <v-card class="pa-4" width="300" height="450">
      <!-- 프로필 섹션 -->
      <div class="profile-container">
        <!-- 프로필 이미지 (아바타) -->
        <v-avatar size="200">
          <img :src="avatar || require('@/assets/basicProfileImage.png')" />
        </v-avatar>

        <!-- 사용자 정보 -->
        <div class="profile-info">
          <h3 class="username">{{ localUserName }}</h3>
          <!-- <p class="bio">{{ userBio || "짧은 소개글을 여기에 입력하세요." }}</p> -->
        </div>
      </div>

      <v-divider class="my-4"></v-divider>

      <v-card-title
        class="text-primary"
        :style="{ backgroundColor: selectedMenu === 'profile' ? 'lightgray' : '' }"
        @click="goToMy"
      >
        프로필
      </v-card-title>
      <v-card-title
        class="text-primary"
        :style="{ backgroundColor: selectedMenu === 'post' ? 'lightgray' : '' }"
        @click="goToPost"
      >
        내가 쓴 게시글
      </v-card-title>
      <v-card-title
        class="text-primary"
        :style="{ backgroundColor: selectedMenu === 'likes' ? 'lightgray' : '' }"
        @click="goToLikes"
      >
        내가 좋아요 한 게시글
      </v-card-title>
    </v-card>
  </v-col>
</template>

<script>
import axios from "axios";

export default {
  props: {
    avatar: String,
    userName: String,
    userBio: String,
    selectedMenu: String,
  },
  data() {
    return {
      localUserName: localStorage.getItem("userName") || "로딩 중...", // 로컬스토리지에서 값 불러오기
    };
  },
  watch: {
    userName(newVal) {
      if (newVal) {
        this.localUserName = newVal;
        localStorage.setItem("userName", newVal); // 닉네임을 로컬스토리지에 저장
      }
    },
  },
  mounted() {
    if (!localStorage.getItem("userName")) {
      this.fetchUserName(); // 로컬스토리지에 없으면 API 호출
    }
  },
  methods: {
    async fetchUserName() {
      try {
        const response = await axios.get("/api/user/profile"); // 실제 API 엔드포인트에 맞게 수정
        this.localUserName = response.data.userName;
        localStorage.setItem("userName", response.data.userName); // 닉네임을 로컬스토리지에 저장
      } catch (error) {
        console.error("닉네임 불러오기 실패:", error);
      }
    },
    goToLikes() {
      this.$router.push("/ttt/user/mypagelikes");
    },
    goToPost() {
      this.$router.push("/ttt/user/mypagepost");
    },
    goToMy() {
      this.$router.push("/ttt/user/myInformation");
    },
  },
};
</script>

<style scoped>
/* 프로필 스타일 */
.profile-container {
  text-align: center;
}

.profile-info {
  margin-top: 12px;
}
</style>
