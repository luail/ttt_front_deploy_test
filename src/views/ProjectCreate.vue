<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-text-field v-model="project.batch" type="number" label="기수" outlined></v-text-field>
        <v-text-field v-model="project.teamName" label="팀명" outlined></v-text-field>
        <v-text-field v-model="project.serviceName" label="서비스명" outlined></v-text-field>
        <v-select
            v-model="project.projectType"
            :items="projectTypeOptions"
            label="프로젝트 유형 선택"
            outlined
            dense
            required
        ></v-select>
        <v-text-field v-model="project.link" label="링크" outlined></v-text-field>
        <v-text-field v-model="project.domain" label="프로젝트 주제" outlined></v-text-field>
        <!-- 주요 기능 입력 -->
        <v-text-field
            v-model="featureInput"
            label="주요 기능 (콤마로 구분 / 엔터로 입력)"
            hint="예: 기능1, 기능2, 기능3"
            persistent-hint
            outlined
        ></v-text-field>
        <v-chip-group>
          <v-chip
              v-for="(feature, index) in project.primaryFeatureList"
              :key="index"
              closable
              @click:close="removeFeature(index)"
          >
            {{ feature.utilityName }}
          </v-chip>
        </v-chip-group>
        <v-btn color="primary" class="mt-3" @click="saveProject">저장</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { reactive, ref, watch } from "vue";
import axios from "axios";
import router from "@/router";

export default {
  setup() {
    const project = reactive({
      batch: "",
      teamName: "",
      serviceName: "",
      projectType: "",
      link: "",
      domain: "",
      primaryFeatureList: []
    });
    const projectTypeOptions = ref([]);
    const featureInput = ref("");

    const addFeature = () => {
      if (featureInput.value.trim() === "") return;
      let features = featureInput.value.split(",").map(f => ({ utilityName: f.trim() }));
      project.primaryFeatureList.push(...features);
      featureInput.value = "";
      console.log("✅ [addFeature] primaryFeatureList:", JSON.parse(JSON.stringify(project.primaryFeatureList)));
    };

    const removeFeature = (index) => {
      project.primaryFeatureList.splice(index, 1);
    };

    const fetchProjectTypes = async () => {
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/project/types`);
        // 응답이 CommonDto 형태면 response.data.result, 아니면 response.data 사용
        projectTypeOptions.value = response.data.result || response.data;
      } catch (error) {
        console.error("❌ 프로젝트 유형 불러오기 실패:", error);
      }
    };

    const saveProject = async () => {
      if (!project.projectType) {
        alert("프로젝트 유형을 선택해주세요");
        return;
      }

      // featureInput에 값이 있다면, 저장 전에 primaryFeatureList에 추가
      if (featureInput.value.trim() !== "") {
        const features = featureInput.value.split(",").map(f => ({ utilityName: f.trim() }));
        project.primaryFeatureList.push(...features);
        featureInput.value = ""; // 입력 필드 초기화
      }

      const projectData = {
        batch: project.batch,
        projectType: project.projectType,
        teamName: project.teamName,
        serviceName: project.serviceName,
        link: project.link,
        domain: project.domain,
        primaryFeatureSaveReqList: project.primaryFeatureList
      };

      console.log("🚀 백엔드로 보낼 데이터:", projectData);

      try {
        const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/project/create`, projectData);
        console.log("✅ 프로젝트 생성 성공:", response.data);
        router.push({ path: "/ttt/project/find" }).then(() => {
          window.location.reload();
        });
      } catch (error) {
        console.error("❌ 프로젝트 생성 실패:", error);
        if (error.response && error.response.data && error.response.data.message) {
          console.log(error.response.data.message);
        }
      }
    };

    watch(() => project.primaryFeatureList, (newVal) => {
      console.log("🔄 [watch] primaryFeatureList 변경됨:", JSON.parse(JSON.stringify(newVal)));
    });

    return {
      project,
      projectTypeOptions,
      featureInput,
      addFeature,
      removeFeature,
      saveProject,
      fetchProjectTypes
    };
  },
  async created() {
    await this.fetchProjectTypes();
  }
};
</script>
