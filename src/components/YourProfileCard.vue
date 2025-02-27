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
import defaultProfileImage from "@/assets/basicProfileImage.png";

export default {
  props: {
    nickName: String, // 부모 컴포넌트에서 전달받는 닉네임
    selectedMenu: String,
  },
  data() {
    return {
      localUserName: "로딩 중...",
      profileImageUrl: null,
      defaultImage: defaultProfileImage,
      menuItems: [
        { title: "유저 게시글", route: "posts" },
        { title: "유저 프로젝트", route: "projects" },
      ],
      showImageDialog: false,
    };
  },
  watch: {
    // 닉네임이 변경될 때마다 fetchUserProfile 실행
    nickName: {
      immediate: true,
      handler(newNickName) {
        console.log("닉네임 변경 감지:", newNickName); // ✅ 닉네임 변경 감지 로그 추가
        if (newNickName) {
          this.fetchUserProfile();
        }
      },
    },
  },
  mounted() {
    this.localUserName = this.nickName || this.$route.params.nickName;
    console.log("현재 닉네임:", this.localUserName); // ✅ 콘솔로 닉네임 확인
    if (this.localUserName) {
      this.fetchUserProfile();
    }
  },
  methods: {
    async fetchUserProfile() {
      if (!this.localUserName) {
        console.error("❌ 닉네임이 없습니다!");
        return;
      }

      console.log("📡 서버 요청 닉네임:", this.localUserName);

      try {
        const response = await axios.get(
          `${process.env.VUE_APP_API_BASE_URL}/user/yourpage/${encodeURIComponent(this.localUserName)}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        console.log("✅ 서버 응답 데이터:", response.data);

        if (response.data.result) {
          this.localUserName = response.data.result.nickName || "알 수 없음";
          // profileImagePath를 사용하여 이미지 URL 설정
          this.profileImageUrl = response.data.result.profileImagePath 
            ? response.data.result.profileImagePath  // profileImagePath가 이미 전체 URL인 경우
            : this.defaultImage;
          
          console.log("프로필 이미지 URL:", this.profileImageUrl); // 이미지 URL 확인용 로그
        }
      } catch (error) {
        console.error("❌ 프로필 정보 불러오기 실패:", error);
        this.profileImageUrl = this.defaultImage; // 에러 시 기본 이미지로 설정
      }
    },

    navigate(route) {
    console.log(`✅ ${route} 페이지로 이동 중...`);
    
    if (!route) {
      console.error("❌ 오류: 이동할 경로가 정의되지 않았습니다.");
      return;
    }

    // 메뉴에 따라 다른 경로로 이동
    if (route === "posts") {
      this.$router.push(`/ttt/user/posts/${encodeURIComponent(this.localUserName)}`).catch(err => {
        console.error("❌ 게시글 페이지 이동 실패:", err);
      });
    } else if (route === "projects") {
      this.$router.push(`/ttt/project/user/${encodeURIComponent(this.localUserName)}`).catch(err => {
        console.error("❌ 프로젝트 페이지 이동 실패:", err);
      });
    } else {
      console.error("❌ 잘못된 라우트 경로:", route);
    }
  },

    onImageError() {
      console.log("이미지 로드 실패, 기본 이미지로 전환");
      this.profileImageUrl = this.defaultImage;
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