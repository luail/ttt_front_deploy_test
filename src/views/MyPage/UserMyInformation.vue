<template>
    <v-container>
      <v-row>
        <!-- 왼쪽 프로필 카드 (분리된 컴포넌트) -->
        <UserProfileCard
          :avatar="userDetail.avatar"
          :userName="userDetail.nickName"
          :userBio="'짧은 소개글을 여기에 입력하세요.'"
          selectedMenu="profile"
        />
  
        <!-- 오른쪽 카드 -->
        <v-col cols="8">
          <v-card class="pa-4">
            <v-card-text v-if="Object.keys(userDetail).length">
              <v-form ref="form">
                <v-table class="custom-table">
                  <tbody>
                    <tr>
                      <th>phoneNumber</th>
                      <td>
                        <v-text-field
                          class="readonly-field"
                          hide-details
                          style="height: 50px"
                          v-model="userDetail.phoneNumber"
                          readonly
                          dense
                        ></v-text-field>
                      </td>
                    </tr>
                    <tr>
                      <th>email</th>
                      <td>
                        <v-text-field
                          v-model="editData.email"
                          @input="checkChanges"
                          dense
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
                        ></v-text-field>
                      </td>
                    </tr>
                    <tr>
                      <th>기수</th>
                      <td>
                        <v-text-field
                          class="readonly-field"
                          hide-details
                          style="height: 50px"
                          v-model="userDetail.batch"
                          readonly
                          dense
                        ></v-text-field>
                      </td>
                    </tr>
                    <tr>
                      <th>rankingPoint</th>
                      <td>
                        <v-text-field
                          class="readonly-field"
                          hide-details
                          style="height: 50px"
                          v-model="userDetail.rankingPoint"
                          readonly
                          dense
                        ></v-text-field>
                      </td>
                    </tr>
                  </tbody>
                </v-table>
              </v-form>
            </v-card-text>
  
            <!-- 수정 버튼 -->
            <v-card-actions class="justify-end">
              <v-btn color="primary" :disabled="!isEdited" @click="userUpdate"
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
  import UserProfileCard from "@/components/UserProfileCard.vue"; // 새 컴포넌트 import
  
  export default {
    components: {
      UserProfileCard,
    },
    data() {
      return {
        userDetail: {},
        editData: { email: "", nickName: "", blogLink: "" },
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
            { headers: { "Content-Type": "application/json" } }
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
    },
  };
  </script>
  