<template>
    <v-container>
        <v-row>
            <!-- 왼쪽 카드 -->
            <v-col cols="4">
                <v-card class="pa-4">
                    <v-card-title class="text-primary">프로필</v-card-title>
                    <v-card-title class="text-primary">내가 쓴 게시글</v-card-title>
                    <v-card-title class="text-primary">내가 좋아요 한 게시글</v-card-title>
                </v-card>
            </v-col>

            <!-- 오른쪽 카드 -->
            <v-col cols="8">
                <v-card class="pa-4">
                    <!-- 데이터가 로드되었을 때만 테이블 표시 -->
                    <v-card-text v-if="Object.keys(userDetail).length">
                        <v-form ref="form">
                            <v-table class="custom-table">
                                <tbody>
                                    <tr>
                                        <th>phoneNumber</th>
                                        <td>
                                            <v-text-field class="readonly-field"
                                            hide-details
                                            style="height: 50px;" v-model="userDetail.phoneNumber" readonly dense></v-text-field>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>email</th>
                                        <td>
                                            <v-text-field v-model="editData.email" @input="checkChanges" dense></v-text-field>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>nickName</th>
                                        <td>
                                            <v-text-field v-model="editData.nickName" @input="checkChanges" dense></v-text-field>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>blogLink</th>
                                        <td>
                                            <v-text-field v-model="editData.blogLink" @input="checkChanges" dense></v-text-field>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>기수</th>
                                        <td>
                                            <v-text-field class="readonly-field"
                                            hide-details
                                            style="height: 50px;" v-model="userDetail.batch" readonly dense></v-text-field>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>rankingPoint</th>
                                        <td>
                                            <v-text-field class="readonly-field"
                                            hide-details
                                            style="height: 50px;"
                                            v-model="userDetail.rankingPoint" 
                                            readonly dense ></v-text-field>
                                        </td>
                                    </tr>
                                </tbody>
                            </v-table>
                        </v-form>
                    </v-card-text>

                    <!-- 수정 버튼 -->
                    <v-card-actions class="justify-end">
                        <v-btn color="primary" :disabled="!isEdited" @click="userUpdate">수정하기</v-btn>
                    </v-card-actions>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import axios from 'axios';

export default {
    data() {
        return {
            userDetail: {}, // 빈 객체로 초기화
            editData: { email: "", nickName: "", blogLink: "" },
            isEdited: false
        };
    },
    async created() {
        try {
            const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/user/myInformation`);
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
        }
    }
};
</script>


<style scoped>
/* 수정 불가능한 필드 스타일 */
.readonly-field {
    background-color: #f5f5f5 !important; /* 연한 회색 배경 */
    color: #757575 !important; /* 어두운 회색 텍스트 */
    border-radius: 8px; /* 부드러운 모서리 */
    border: 1px solid #ddd !important; /* 연한 테두리 */
    cursor: not-allowed; /* 마우스 포인터 변경 */

}
/* 테이블 커스텀 스타일 */
.custom-table {
  border-radius: 12px; /*모서리 둥글게*/ 
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* 테이블 헤더 스타일 */
thead {
  background-color: #6B29E5;
  color: #ffffff; /* 블루 계열 트렌디한 색상 */
  font-weight: 600;
}

/* 테이블 셀 스타일 */
td {
  padding: 16px;
  font-size: 16px;
  color: #424242;
}

/* 이미지 스타일 */
v-avatar {
  border: 3px solid #5c6bc0;
}
</style>
