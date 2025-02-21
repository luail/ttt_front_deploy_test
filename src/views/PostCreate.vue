<template>
  <v-container fluid class="page-container">
    <v-row>
      <!-- 사이드 메뉴 -->
      <v-col cols="1">
        <v-navigation-drawer permanent class="sidebar" width="180">
          <v-list>
            <v-list-item v-for="(c, index) in categoryList" :key="index" @click="selectedBoard(c.categoryId)" class="clickable-item">
              <v-list-item-content>
                <v-list-item-title class="font-weight-bold">{{c.categoryName}}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-navigation-drawer>
      </v-col>

      <!-- 게시물 작성 폼 -->
      <v-col cols="10">
        <v-card class="post-detail">
          <v-card-title>
            <v-container>
              <!-- 카테고리 선택 -->
              <v-select
                v-model="selectedCategoryId"
                :items="beforeCategoryList"
                item-title="categoryName"
                item-value="categoryId"
                label="게시판을 선택하세요"
              />

              <!-- 제목 입력 -->
              <v-text-field v-model="title" label="제목을 입력하세요" outlined></v-text-field>
            </v-container>
          </v-card-title>

          <v-divider></v-divider>

          <!-- 본문 작성 -->
          <v-card-text style="min-height: 500px">
            <quill-editor
              ref="quillEditor"
              :disabled="false"
              :value="content"
              :options="editorOptions"
              @text-change="onEditorChange"
              @ready="onEditorReady"
              @drop="handleImageDrop"
            />
          </v-card-text>

          <!-- 제출 버튼 -->
          <v-card-actions>
            <v-btn color="purple" class="secondary" @click="postCreate()">제출</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from 'axios';
import { QuillEditor } from '@vueup/vue-quill';
import '@vueup/vue-quill/dist/vue-quill.snow.css';
// 최상단에 추가
import hljs from "highlight.js";
import "highlight.js/styles/tomorrow.css";


export default {
  components: {
    QuillEditor,
  },
  data() {
    return {
      beforeCategoryList: [],
      categoryList: [],
      selectedCategoryId: '',
      title: '',
      // contents: '',
      editorInstance: null,
      editorOptions: {
        placeholder: "내용을 입력하세요...",
        modules: {
          toolbar: [
            ['bold', 'italic', 'underline', 'strike'], // 텍스트 스타일
            [{ 'list': 'ordered'}, { 'list': 'bullet' }], // 리스트
            [{ size: ["small", false, "large", "huge"] }],
            [{color:[]},{background:[]}],
            ['link', 'image'], // 링크, 이미지
            [{ 'align': [] }], // 정렬 옵션
            ['clean'] // 포맷 초기화
          ],
          syntax:{
            highlight : (text) => hljs.highlightAuto(text).value
          },
        },
        formats: [
        'bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block',
        'header', 'list', 'bullet', 'script', 'indent', 'direction', 
        'size', 'color', 'background', 'link', 'image', 'align', 'ordered', 'clean'
    ]
      },
      content:"",
      attachments:[],
     
    }
  },
  
  async created() {
    this.contents ="";
    try {
      const sideBarResponse = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/category/all`);
      this.beforeCategoryList= sideBarResponse.data.result;       
      this.categoryList = [{categoryName: "전체게시판", categoryId:0},...this.beforeCategoryList]
    } catch (error) {
      console.error('카테고리 불러오기 실패:', error);
    }
  },

  computed:{
    editor(){
      return this.$refs.quillEditor.quill;
    },
    contentCode(){
      return hljs.highlightAuto(this.content).value;
    },
  },

  methods: {
    // 사이드게시판 이동
    selectedBoard(boardId){  
        this.$router.push(`/ttt/post/list/${boardId}`);
        },

    async postCreate() {
      try {
        let formData = new FormData();
        formData.append("title", this.title);
        formData.append("contents", this.content);
        formData.append("postCategoryId", this.selectedCategoryId);
        console.log(this.title);
        console.log(this.content);
        console.log(this.selectedCategoryId);

        if(this.attachments && this.attachments.length > 0){
          this.attachments.forEach(file=>{
            formData.append("attachments",file);
            console.log(this.file)
          })
        }
       
   
        const response = await axios.post(
          `${process.env.VUE_APP_API_BASE_URL}/post/create`, 
          formData, 
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        console.log("게시물 생성 성공:", response.data);
        this.$router.push(`/ttt/post/list/0`);
      } catch (error) {
        console.log('게시물 생성 실패:', error);
      }
    },
    // 에디터가 준비되었을 때 인스턴스 저장
    onEditorReady(editor){
      this.editorInstance = editor;
      console.log("Quill Editor is ready!", this.editorInstance);
    },
   //에디터 변경시 content에 값 저장
    onEditorChange(){
      if(this.editorInstance){
        this.content = this.editorInstance.root.innerHTML;
      } else{
        console.warn("Editor instance is not ready yet")
      }
    },

    async handleImageDrop(event) {
      // 퀼에디터의 드롭 동작을 인식하기 위해 기본 드롭동작을 막음
      event.preventDefault();
      const file = event.dataTransfer.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("attachments",file);

      try{
       const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/post/drag-image`,formData,
        {headers:{"Content-Type":"multipart/form-data"}}
      );
        console.log(response);
        const imageUrl = response.data.result;
        const editor = this.$refs.quillEditor.getQuill();
        const range = editor.getSelection();
        editor.insertEmbed(range.index,"image",imageUrl);
      
      }catch(error){
        console.log("드래그 이미지업로드 실패",error);
      }
    }
  }
}
</script>

<style scoped>
.page-container {
  margin: 0 30px;
}



.sidebar {
  background-color: #f4f4f4;
  border-right: 1px solid #ccc;
}

.post-detail {
  margin: 20px 0;
  border: 1px solid #ccc;
  border-radius: 10px;
  padding: 20px;
}

/* Quill Editor 스타일 외부 라이브러리이므로 스타일이 적용이안되 브이 딥명령어 이용*/
::v-deep .ql-editor {
  min-height: 800px;
  font-size: 25px;

}

::v-deep .ql-editor img {
  max-width: 100%;  /* 화면을 벗어나지 않도록 설정 */
  height: auto;  /* 비율 유지하면서 자동 조정 */
  display: block;  /* 블록 요소로 변경 (여백 조정) */
  margin: 0 auto;  /* 중앙 정렬 */
}


</style>