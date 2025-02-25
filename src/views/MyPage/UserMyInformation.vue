<template>
  <v-container class="fill-height pa-4" fluid>
    <v-row class="justify-center align-center">
      <!-- 왼쪽 프로필 카드 -->
      <v-col cols="12" md="4" class="d-flex align-center justify-center mb-6 mb-md-0">
        <UserProfileCard
            :avatar="userDetail.avatar"
            :userName="userDetail.nickName"
            :userBio="'짧은 소개글을 여기에 입력하세요.'"
            :selectedMenu="'profile'"
            class="elevation-0"
        />
      </v-col>

      <!-- 오른쪽 카드 (세부 정보) -->
      <v-col cols="12" md="8">
        <v-card class="profile-info-card pa-4" outlined rounded="lg" height="100%">
          <v-card-title class="text-h5 font-weight-bold grey--text text--darken-2 mb-4">
            개인 정보
          </v-card-title>
          <v-card-subtitle class="grey--text mb-6">
            연락 가능한 전화번호 및 이메일 주소를 포함한 개인 정보를 관리하세요.
          </v-card-subtitle>

          <v-row no-gutters>
            <!-- 왼쪽 열 -->
            <v-col cols="12" md="6" class="pr-md-2">
              <v-card
                  class="info-card mb-4 elevation-2"
                  outlined
                  rounded="lg"
                  v-if="Object.keys(userDetail).length"
              >
                <v-card-text class="pa-4">
                  <v-text-field
                      v-model="editData.email"
                      label="Email"
                      @input="checkChanges"
                      dense
                      outlined
                      clearable
                      prepend-inner-icon="mdi-email"
                      class="neon-input"
                      rounded
                  ></v-text-field>
                </v-card-text>
              </v-card>

              <v-card
                  class="info-card mb-4 elevation-2"
                  outlined
                  rounded="lg"
                  v-if="Object.keys(userDetail).length"
              >
                <v-card-text class="pa-4">
                  <v-text-field
                      v-model="editData.nickName"
                      label="닉네임"
                      @input="checkChanges"
                      dense
                      outlined
                      clearable
                      prepend-inner-icon="mdi-account"
                      class="neon-input"
                      rounded
                  ></v-text-field>
                </v-card-text>
              </v-card>

              <v-card
                  class="info-card mb-4 elevation-2"
                  outlined
                  rounded="lg"
                  v-if="Object.keys(userDetail).length"
              >
                <v-card-text class="pa-4">
                  <v-text-field
                      v-model="userDetail.phoneNumber"
                      label="전화번호"
                      disabled
                      dense
                      outlined
                      prepend-inner-icon="mdi-phone"
                      class="readonly-input"
                      rounded
                  ></v-text-field>
                </v-card-text>
              </v-card>
            </v-col>

            <!-- 오른쪽 열 -->
            <v-col cols="12" md="6" class="pl-md-2">
              <v-card
                  class="info-card mb-4 elevation-2"
                  outlined
                  rounded="lg"
                  v-if="Object.keys(userDetail).length"
              >
                <v-card-text class="pa-4">
                  <v-text-field
                      v-model="editData.blogLink"
                      label="블로그 링크"
                      @input="checkChanges"
                      dense
                      outlined
                      clearable
                      prepend-inner-icon="mdi-link"
                      class="neon-input"
                      rounded
                  ></v-text-field>
                </v-card-text>
              </v-card>

              <v-card
                  class="info-card mb-4 elevation-2"
                  outlined
                  rounded="lg"
                  v-if="Object.keys(userDetail).length"
              >
                <v-card-text class="pa-4">
                  <v-text-field
                      v-model="userDetail.batch"
                      label="기수"
                      disabled
                      dense
                      outlined
                      prepend-inner-icon="mdi-numeric"
                      class="readonly-input"
                      rounded
                  ></v-text-field>
                </v-card-text>
              </v-card>

              <v-card
                  class="info-card mb-4 elevation-2"
                  outlined
                  rounded="lg"
                  v-if="Object.keys(userDetail).length"
              >
                <v-card-text class="pa-4">
                  <v-text-field
                      v-model="userDetail.rankingPoint"
                      label="랭킹 포인트"
                      disabled
                      dense
                      outlined
                      prepend-inner-icon="mdi-star"
                      class="readonly-input"
                      rounded
                  ></v-text-field>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <!-- 버튼 그룹 -->
          <v-card-actions class="justify-center pa-4">
            <v-btn color="grey" @click="userDelete" class="neon-btn1 mr-4" rounded large>
              회원탈퇴
            </v-btn>
            <v-btn
                color="purple"
                :disabled="!isEdited"
                @click="userUpdate"
                class="neon-btn2"
                rounded
                large
            >
              수정하기
            </v-btn>
          </v-card-actions>
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
      userDetail: {},
      editData: {
        email: "",
        nickName: "",
        blogLink: "",
      },
      isEdited: false,
    };
  },
  async created() {
    try {
      const response = await axios.get(
          `${process.env.VUE_APP_API_BASE_URL}/user/myInformation`
      );
      console.log("API 응답:", response.data.result);

      if (response.data.result) {
        this.userDetail = response.data.result;
        this.editData.email = this.userDetail.email || "";
        this.editData.nickName = this.userDetail.nickName || "";
        this.editData.blogLink = this.userDetail.blogLink || "";
      } else {
        console.warn("API 응답에 데이터가 없습니다.");
      }
    } catch (error) {
      console.error("Axios 요청 오류:", error);
    }
  },
  methods: {
    checkChanges() {
      this.isEdited =
          this.editData.email !== this.userDetail.email ||
          this.editData.nickName !== this.userDetail.nickName ||
          this.editData.blogLink !== this.userDetail.blogLink;
    },
    async userUpdate() {
      try {
        const response = await axios.patch(
            `${process.env.VUE_APP_API_BASE_URL}/user/updateProfile`,
            this.editData,
            {
              headers: { "Content-Type": "application/json" },
            }
        );
        console.log("수정 성공:", response.data);
        alert("프로필이 성공적으로 수정되었습니다!");
        window.location.reload();
        this.userDetail.email = this.editData.email;
        this.userDetail.nickName = this.editData.nickName;
        this.userDetail.blogLink = this.editData.blogLink;
        this.isEdited = false;
      } catch (error) {
        console.error("수정 실패:", error);
        alert("프로필 수정 중 오류가 발생했습니다.");
      }
    },
    async userDelete() {
      try {
        const confirmDelete = confirm(
            "정말 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다."
        );
        if (!confirmDelete) return;

        const response = await axios.delete(
            `${process.env.VUE_APP_API_BASE_URL}/user/deleteMember`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
        );

        if (response.status === 200) {
          alert("회원 탈퇴가 완료되었습니다.");
          localStorage.clear();
          window.location.href = "/";
        }
      } catch (error) {
        console.error("회원 탈퇴 실패:", error);
        alert("회원 탈퇴 중 오류가 발생했습니다.");
      }
    },
  },
};
</script>

<style scoped>
.fill-height {
  min-height: calc(100vh - 64px);
}

.custom-table .v-text-field {
  margin: 0 !important;
}

.profile-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.readonly-input .v-input__control {
  background-color: #e0e0e0 !important;
  cursor: default !important;
  border-color: #e0e0e0 !important;
}

.neon-btn1 {
  font-size: 1rem !important;
  font-weight: 500;
  transition: all 0.3s ease;
}

.neon-btn1:hover {
  background-color: #ff4040 !important;
  transform: scale(1.05);
  box-shadow: 0 0 15px rgba(255, 64, 64, 0.7);
  color: #ffffff !important;

}

.neon-btn2 {
  font-size: 1rem !important;
  font-weight: 500;
  transition: all 0.3s ease;
}

.neon-btn2:hover {
  background-color: #7c3aed !important;
  transform: scale(1.05);
  box-shadow: 0 0 15px rgba(150, 64, 255, 0.7);
  color: #ffffff !important;
}
</style>
