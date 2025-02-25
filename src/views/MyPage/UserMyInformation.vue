<template>
  <v-container class="fill-height">
    <v-row class="justify-center align-stretch">
      <!-- 왼쪽 프로필 카드 -->
      <UserProfileCard
          :avatar="userDetail.avatar"
          :userName="userDetail.nickName"
          :userBio="'짧은 소개글을 여기에 입력하세요.'"
          selectedMenu="profile"
          class="elevation-0"
      />

      <!-- 오른쪽 카드 -->
      <v-col cols="8">
        <v-card class="profile-card elevation-0" style="height: 100%">
          <v-card-text v-if="Object.keys(userDetail).length">
            <v-form ref="form">
              <v-table class="custom-table">
                <tbody>
                <!-- 수정 가능한 필드 -->
                <tr>
                  <th>email</th>
                  <td>
                    <v-text-field
                        v-model="editData.email"
                        @input="checkChanges"
                        dense
                        outlined
                        hide-details
                        clearable
                        class="neon-input"
                        style="height: auto"
                    ></v-text-field>
                  </td>
                </tr>
                <tr>
                  <th>nickName</th>
                  <td>
                    <v-text-field
                        v-model="editData.nickName"
                        @input="checkChanges"
                        dense
                        outlined
                        hide-details
                        clearable
                        class="neon-input"
                        style="height: auto"
                    ></v-text-field>
                  </td>
                </tr>
                <tr>
                  <th>blogLink</th>
                  <td>
                    <v-text-field
                        v-model="editData.blogLink"
                        @input="checkChanges"
                        dense
                        outlined
                        hide-details
                        clearable
                        class="neon-input"
                        style="height: auto"
                    ></v-text-field>
                  </td>
                </tr>

                <!-- 읽기 전용 필드 -->
                <tr>
                  <th>phoneNumber</th>
                  <td>
                    <v-text-field
                        v-model="userDetail.phoneNumber"
                        disabled
                        dense
                        outlined
                        hide-details
                        class="readonly-input"
                        style="height: auto"
                    ></v-text-field>
                  </td>
                </tr>
                <tr>
                  <th>기수</th>
                  <td>
                    <v-text-field
                        v-model="userDetail.batch"
                        disabled
                        dense
                        outlined
                        hide-details
                        class="readonly-input"
                        style="height: auto"
                    ></v-text-field>
                  </td>
                </tr>
                <tr>
                  <th>rankingPoint</th>
                  <td>
                    <v-text-field
                        v-model="userDetail.rankingPoint"
                        disabled
                        dense
                        outlined
                        hide-details
                        class="readonly-input"
                        style="height: auto"
                    ></v-text-field>
                  </td>
                </tr>
                </tbody>
              </v-table>
            </v-form>
          </v-card-text>

          <!-- 버튼 그룹 -->
          <v-card-actions class="justify-space-between pa-4">
            <v-btn color="grey" @click="userDelete" class="neon-btn1"
            >회원탈퇴</v-btn
            >
            <v-btn
                color="purple"
                :disabled="!isEdited"
                @click="userUpdate"
                class="neon-btn2"
            >수정하기</v-btn
            >
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
