<template>
  <v-dialog v-model="editDialog" max-width="600px" persistent>
    <v-card>
      <v-card-title class="text-center text-h5">프로젝트 수정</v-card-title>
      <v-card-text>
        <v-form ref="form" v-model="valid">
          <v-text-field
              label="기수"
              v-model="editData.batch"
              type="number"
              :rules="[v => v !== null && v !== '' || '기수는 필수 입력값입니다.']"
          ></v-text-field>
          <v-select
              label="프로젝트 유형"
              :items="projectTypes"
              v-model="editData.projectType"
              required
              :rules="[v => !!v || '프로젝트 유형은 필수 입력값입니다.']"
          ></v-select>
          <v-text-field
              label="팀명"
              v-model="editData.teamName"
              required
              :rules="[v => !!v && v.trim() !== '' || '팀명은 필수 입력값입니다.']"
          ></v-text-field>
          <v-text-field
              label="서비스명"
              v-model="editData.serviceName"
              required
              :rules="[v => !!v && v.trim() !== '' || '서비스명은 필수 입력값입니다.']"
          ></v-text-field>
          <v-text-field
              label="링크"
              v-model="editData.link"
          ></v-text-field>
          <v-text-field
              label="프로젝트 주제(도메인)"
              v-model="editData.domain"
              required
              :rules="[v => !!v && v.trim() !== '' || '도메인은 필수 입력값입니다.']"
          ></v-text-field>
          <v-text-field
              label="주요 기능 (콤마로 구분, 비워두면 null)"
              v-model="featuresInput"
              hint="예: 기능1, 기능2, 기능3 (비워두면 기능이 null로 저장됨)"
              persistent-hint
          ></v-text-field>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text color="blue darken-1" @click="closeDialog">취소</v-btn>
        <v-btn text color="blue darken-1" @click="submitEdit" :disabled="!valid">
          수정 완료
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import axios from "axios";

export default {
  name: "ProjectEditDialog",
  props: {
    project: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      editDialog: true,
      valid: false,
      editData: { ...this.project }, // 부모로부터 받은 데이터를 복사
      featuresInput: "", // 콤마 구분 문자열
      projectTypes: ["FRONTEND", "BACKEND", "DEVOPS", "DB", "FINAL"]
    };
  },
  created() {
    // 현재 데이터 표시: 모든 필드 초기화
    this.editData = { ...this.project };
    // batch, link, domain이 null이면 빈 문자열로 설정
    this.editData.batch = this.editData.batch !== null ? this.editData.batch.toString() : "";
    this.editData.link = this.editData.link || "";
    this.editData.domain = this.editData.domain || "";
    // primaryFeatureList 처리: null 또는 빈 배열이면 빈 문자열, 그렇지 않으면 콤마로 구분
    if (this.editData.primaryFeatureList && Array.isArray(this.editData.primaryFeatureList) && this.editData.primaryFeatureList.length > 0) {
      this.featuresInput = this.editData.primaryFeatureList.map(f => f.utilityName || f.featureName).join(", ");
    } else {
      this.featuresInput = ""; // 기능 리스트가 없으면 빈 문자열
    }
  },
  methods: {
    closeDialog() {
      this.editDialog = false;
      this.$emit("close");
    },
    async submitEdit() {
      if (!this.$refs.form.validate()) return;

      // 주요 기능 처리: 빈 문자열이면 null로, 그렇지 않으면 리스트로 변환
      let primaryFeatureSaveReqList = null;
      if (this.featuresInput && this.featuresInput.trim() !== "") {
        const features = this.featuresInput.split(",")
            .map(item => item.trim())
            .filter(item => item !== "");

        primaryFeatureSaveReqList = features.map(utilityName => ({ utilityName }));
      }

      const updateData = {
        batch: this.editData.batch.trim() === "" ? null : parseInt(this.editData.batch, 10),
        projectType: this.editData.projectType,
        teamName: this.editData.teamName.trim(),
        serviceName: this.editData.serviceName.trim(),
        link: this.editData.link.trim() || null,
        domain: this.editData.domain.trim() || null,
        primaryFeatureSaveReqList: primaryFeatureSaveReqList
      };

      console.log("업데이트 데이터:", updateData);

      try {
        const token = localStorage.getItem('token');
        const response = await axios.put(
            `${process.env.VUE_APP_API_BASE_URL}/project/update/${this.editData.id}`,
            updateData,
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
        );
        console.log("수정 응답:", response.data);
        const res = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/project/detail/${this.editData.id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const updatedProject = res.data.result;
        // primaryFeatureList가 null 또는 비배열이면 빈 배열로 설정
        updatedProject.primaryFeatureList = Array.isArray(updatedProject.primaryFeatureList) ? updatedProject.primaryFeatureList : [];
        // utilityName으로 데이터 정리, 빈 값 필터링
        updatedProject.primaryFeatureList = updatedProject.primaryFeatureList.map(f => ({
          utilityName: f.utilityName || f.featureName
        })).filter(f => f.utilityName && f.utilityName.trim() !== "");
        alert("프로젝트 수정이 완료되었습니다.");
        this.$emit("updated", updatedProject);
        this.closeDialog();
      } catch (error) {
        console.error("프로젝트 수정 실패", error.response ? error.response.data : error.message);
        alert("프로젝트 수정에 실패했습니다: " + (error.response ? error.response.data : error.message));
      }
    }
  }
};
</script>

<style scoped>
/* 필요 시 추가 스타일 */
</style>