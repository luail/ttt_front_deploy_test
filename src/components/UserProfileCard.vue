<template>
  <v-col cols="4">
    <v-card class="pa-4" width="300" height="500">
      <!-- 프로필 섹션 -->
      <div class="profile-container">
        <!-- 프로필 이미지 (아바타) -->
        <v-avatar size="222" class="avatar">
          <v-img :src="profileImageUrl || defaultImage" contain style="width: 100%; height: 100%; object-fit: contain; object-position: center;" />
        </v-avatar>
        <!-- 파일 선택 input (숨김) -->
        <input type="file" ref="fileInput" style="display: none" @change="onFileSelected" />

        <!-- 프로필 변경 버튼 -->
        <v-btn small class="profile-upload-btn" color="primary" @click="selectProfileImage">
          사진 등록
        </v-btn>
<<<<<<< Updated upstream
        <!-- 사용자 정보 -->
        <div class="profile-info">
          <h3 class="username">{{ localUserName }}</h3>
        </div>
=======
        
>>>>>>> Stashed changes
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
import defaultProfileImage from "@/assets/basicProfileImage.png"; // 기본 프로필 이미지 import

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
      profileImageUrl: this.avatar || "https://ttt-image.s3.ap-northeast-2.amazonaws.com/기본이미지.png", // 기본 프로필 이미지
      defaultImage: defaultProfileImage, // 정적 기본 프로필 이미지
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
    this.fetchUserName(); // 닉네임 API 호출
  }

  // ✅ 새로고침해도 유지되도록 기존 프로필 이미지 URL 불러오기
  const savedProfileImage = localStorage.getItem("profileImageUrl");
  if (savedProfileImage) {
    this.profileImageUrl = savedProfileImage;
  }
},
  methods: {
    // 유저 닉네임 가져오기
    async fetchUserName() {
      try {
        const response = await axios.get("/api/user/profile"); // 실제 API 엔드포인트에 맞게 수정
        this.localUserName = response.data.userName;
        localStorage.setItem("userName", response.data.userName); // 닉네임을 로컬스토리지에 저장
      } catch (error) {
        console.error("닉네임 불러오기 실패:", error);
      }
    },
    // 파일 선택 창 열기
    selectProfileImage() {
      this.$refs.fileInput.click();
    },
    // 파일 선택 시 실행
    onFileSelected(event) {
      const file = event.target.files[0];
      if (!file) return;
      this.uploadProfileImage(file);
    },
    // 이미지 업로드
    async uploadProfileImage(file) {
  const formData = new FormData();
  formData.append("image", file);

  try {
    const response = await axios.post(
      `${process.env.VUE_APP_API_BASE_URL}/user/changeProfileImage`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`, // 인증 토큰 추가
        },
      }
    );

    // 응답 콘솔 확인
    console.log("백엔드 응답:", response.data);

    // 백엔드가 `imageUrl`을 반환하는지 확인
    if (response.status === 200 && response.data.imageUrl) {
      alert("프로필 이미지가 변경되었습니다!");
      this.profileImageUrl = response.data.imageUrl; // 백엔드에서 받은 새 프로필 이미지로 업데이트
      localStorage.setItem("profileImageUrl", response.data.imageUrl); // 로컬스토리지에도 저장
    } else {
      alert("이미지는 업로드되었지만, 서버에서 URL을 반환하지 않았습니다.");
    }
  } catch (error) {
    console.error("프로필 이미지 업로드 실패:", error);
    alert("이미지 업로드 중 오류가 발생했습니다.");
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
  object-position: center;
}
/* 버튼 스타일 */
.profile-info {
  margin-top: 12px;
}
.v-card-title {
  cursor: pointer; /* 마우스 커서를 손가락 모양으로 변경 */
  transition: background-color 0.3s, color 0.3s; /* 부드러운 전환 효과 */
}

.v-card-title:hover {
  background-color: rgba(0, 0, 0, 0.1) !important; /* 살짝 어두운 배경 */
  color: #000 !important; /* 글자 색 변경 */
}
</style>
