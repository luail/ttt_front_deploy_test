<template>
  <v-col cols="4">
    <v-card class="pa-4 profile-card" width="300" elevation="6" rounded="lg">
      <!-- 프로필 섹션 -->
      <div class="profile-container d-flex flex-column align-center">
        <!-- 프로필 이미지 (아바타) - 클릭 시 원본 이미지 표시 -->
        <v-avatar size="222" class="mb-4 avatar" @click="showOriginalImage">
          <v-img
              :src="profileImageUrl || defaultImage"
              contain
              style="width: 100%; height: 100%; object-fit: contain; object-position: center;"
              @error="onImageError"
          />
        </v-avatar>
        <!-- 파일 선택 input (숨김) -->
        <input type="file" ref="fileInput" style="display: none" @change="onFileSelected" />

        <!-- 프로필 변경 버튼 -->
        <v-btn
            color="#d4a5f0"
        class="profile-upload-btn mb-4"
        rounded
        small
        @click="selectProfileImage"
        >
        사진 등록
        </v-btn>
        <!-- 사용자 정보 -->
        <div class="profile-info text-center">
          <h3 class="username text-h5 font-weight-bold text-purple">{{ localUserName }}</h3>

        </div>
      </div>

      <v-divider class="my-4" color="#d4a5f0"></v-divider> <!-- 보라색 구분선 -->

      <!-- 메뉴 네비게이션 -->
      <v-list dense>
        <v-list-item
            v-for="item in menuItems"
            :key="item.title"
            @click="navigate(item.route)"
            :class="{ 'selected-menu': selectedMenu === item.route }"
        >
          <v-list-item-title class="text-black text-body-1 font-weight-medium">
            {{ item.title }}
          </v-list-item-title>
        </v-list-item>
      </v-list>

      <!-- 원본 이미지 모달 -->
      <v-dialog v-model="showImageDialog" max-width="800">
        <v-card>
          <v-card-title class="text-h5 grey lighten-2">프로필 이미지 원본</v-card-title>
          <v-card-text class="pa-4">
            <v-img :src="profileImageUrl || defaultImage" contain max-height="600"></v-img>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="#d4a5f0" @click="showImageDialog = false">닫기</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-card>
  </v-col>
</template>

<script>
import axios from "axios";
import defaultProfileImage from "@/assets/basicProfileImage.png"; // 기본 프로필 이미지 import

export default {
  props: {
    avatar: String, // 프로필 이미지 URL
    userName: String, // 사용자 이름
    userBio: String, // 사용자 소개 (선택적)
    selectedMenu: String, // 현재 선택된 메뉴
  },
  data() {
    return {
      localUserName: this.userName || localStorage.getItem("userName") || "로딩 중...", // 로컬스토리지 또는 props에서 이름 불러오기
      profileImageUrl: this.avatar || "https://ttt-image.s3.ap-northeast-2.amazonaws.com/기본이미지.png", // 프로필 이미지 URL
      defaultImage: defaultProfileImage, // 정적 기본 프로필 이미지
      menuItems: [
        { title: "프로필", route: "profile" },
        { title: "내가 쓴 게시글", route: "post" },
        { title: "내가 좋아요 한 게시글", route: "likes" },
      ],
      showImageDialog: false, // 원본 이미지 모달 상태
    };
  },
  watch: {
    userName(newVal) {
      if (newVal) {
        this.localUserName = newVal;
        localStorage.setItem("userName", newVal); // 닉네임을 로컬스토리지에 저장
      }
    },
    avatar(newVal) {
      if (newVal) {
        this.profileImageUrl = newVal;
        localStorage.setItem("profileImageUrl", newVal); // 프로필 이미지도 로컬스토리지에 저장
      }
    },
  },
  mounted() {
    // 로컬스토리지에서 사용자 이름과 프로필 이미지 확인
    if (!this.localUserName || this.localUserName === "로딩 중...") {
      this.fetchUserName();
    }
    const savedProfileImage = localStorage.getItem("profileImageUrl");
    if (savedProfileImage) {
      this.profileImageUrl = savedProfileImage;
    }
  },
  methods: {
    // 유저 닉네임 가져오기
    async fetchUserName() {
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/user/profile`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, // 인증 토큰 추가
          },
        });
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

        if (response.status === 200 && response.data.imageUrl) {
          alert("프로필 이미지가 변경되었습니다!");
          this.profileImageUrl = response.data.imageUrl; // 새 프로필 이미지로 업데이트
          localStorage.setItem("profileImageUrl", response.data.imageUrl); // 로컬스토리지에 저장
          window.location.reload()
        } else {
          alert("이미지는 업로드되었지만, 서버에서 URL을 반환하지 않았습니다.");
        }
      } catch (error) {
        console.error("프로필 이미지 업로드 실패:", error);
        alert("이미지 업로드 중 오류가 발생했습니다.");
      }
    },
    // 이미지 로드 실패 시 기본 이미지로 전환
    onImageError() {
      this.profileImageUrl = this.defaultImage;
      localStorage.setItem("profileImageUrl", this.defaultImage);
    },
    // 원본 이미지 표시
    showOriginalImage() {
      this.showImageDialog = true;
    },
    // 메뉴 네비게이션
    navigate(route) {
      switch (route) {
        case "profile":
          this.$router.push("/ttt/user/myInformation");
          break;
        case "post":
          this.$router.push("/ttt/user/mypagepost");
          break;
        case "likes":
          this.$router.push("/ttt/user/mypagelikes");
          break;
      }
    },
  },
};
</script>

<style scoped>
.profile-card {
  background: #ffffff; /* 깨끗한 흰색 배경 */
  border: 1px solid #e0e0e0; /* 부드러운 회색 테두리 */
  border-radius: 16px; /* 둥근 모서리 */
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); /* 부드러운 그림자 */
  transition: all 0.4s ease; /* 부드러운 전환 */
  height: auto; /* 높이를 자동으로 조정하여 내용이 잘리지 않도록 */
  max-height: 100%; /* 최대 높이 설정 */
  overflow-y: auto; /* 내용이 넘칠 경우 스크롤 가능 */
}

.profile-card:hover {
  transform: translateY(-5px); /* 호버 시 약간 위로 이동 */
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15); /* 더 강한 그림자 */
}

.profile-container {
  text-align: center;
  padding: 16px 0; /* 내용 여백 추가 */
}

.avatar {
  border: 2px solid #d4a5f0; /* 밝은 보라색 테두리 */
  transition: transform 0.3s ease; /* 부드러운 확대 전환 */
  cursor: pointer; /* 클릭 가능함을 나타냄 */
}

.avatar:hover {
  transform: scale(1.05); /* 호버 시 약간 확대 */
}

.profile-upload-btn {
  transition: all 0.3s ease;
}

.profile-upload-btn:hover {
  transform: scale(1.05); /* 버튼 호버 시 약간 확대 */
  box-shadow: 0 0 15px rgba(212, 165, 240, 0.5); /* 밝은 보라색 네온 효과 */
}

.profile-info {
  margin-top: 12px;
}

.username {
  color: #d4a5f0; /* 밝은 보라색 텍스트 */
}

.profile-bio {
  max-width: 100%; /* 소개글 너비 제한 제거 */
  word-wrap: break-word; /* 긴 텍스트 줄바꿈 */
  white-space: normal; /* 텍스트 자동 줄바꿈 */
}

.v-list-item {
  padding: 8px 16px;
  cursor: pointer;
  background-color: #ffffff; /* 흰색 배경 */
  transition: background-color 0.3s ease, color 0.3s ease;
}

.v-list-item:hover {
  background-color: #f5f5f5 !important; /* 밝은 회색 호버 */
  color: #d4a5f0 !important; /* 밝은 보라색 강조 */
}

.selected-menu {
  background-color: rgba(150, 64, 255, 0.22) !important; /* 선택된 메뉴 강조 */
  color: #757575 !important; /* 파란색 텍스트 */
  font-weight: bold !important;
}

.text-grey-lighten-1 {
  color: #b0bec5 !important; /* 밝은 회색 텍스트 유지 */
}
</style>